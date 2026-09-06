// 대만어판 의료 AI 교육·행사 수집기 (2026-09-06 신설)
//
// 병원 종사자가 참석·신청할 수 있는 AI·디지털 관련 연구회(研討會)·포럼(論壇)·
// 워크숍(工作坊)·연수(研習)·전시회(醫療科技展) 소식을 모아
// src/data/tw/events.json에 쌓는다. 본문을 옮기지 않고 원문으로 링크만 건다.
//
// 구조는 한국어판 scripts/fetch-events.mjs와 같은 사고방식이다 —
// 뉴스형 수집원에 **행사 조건을 겹쳐** 거르고, 최초 1회는 이미 쌓인
// 뉴스에서 행사성 기사를 끌어와 시드로 삼는다(그래야 페이지가 비지 않는다).
//
// 수집원
//   1) 中央社(cna.com.tw) 검색 — 행사 지향 검색어를 따로 둔다. 대만어판
//      뉴스 수집기가 쓰는 것과 같은 JSON-LD ItemList 방식이라 안정적이고,
//      기사 URL에 날짜가 박혀 있어 날짜도 정확하다.
//   2) src/data/tw/news.json — 이미 누적된 뉴스에서 행사성 기사를 끌어온다.
//      매번 돌린다(1회성 시드가 아니다). 뉴스 수집기가 새 행사 기사를
//      가져오면 여기에도 자동으로 반영되므로, 같은 기사를 두 번 긁지 않는다.
//
// ⚠️ 수확량이 적다는 것을 알고 만들었다(2026-09-06 실측: 누적 뉴스 95건 중
//    행사성 11건). 대략 **주 1건** 수준을 예상한다. 조건을 넓히려면 EVENT_RE를
//    손보면 되지만, '學會'처럼 단체 이름에 들어가는 말을 넣으면 오탐이 커진다
//    (한국어판이 '학회'를 일부러 뺀 것과 같은 이유).
//
// ⚠️ 지난 행사도 지우지 않는다. 한국어판과 같은 정책이다 — 무엇이 열렸는지
//    보는 것 자체가 참고가 되고, 날짜로 정렬되므로 최신이 위에 온다.
//    다만 화면에서 "지난 행사가 남아 있다"는 것을 반드시 안내한다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/tw/events.json', import.meta.url);
const NEWS = new URL('../src/data/tw/news.json', import.meta.url);
const MAX_ITEMS = 200;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const CNA_SOURCE = '中央社';
// 행사 지향 검색어. 뉴스 수집기의 검색어와 겹치지 않게 행사 낱말을 넣는다.
const CNA_QUERIES = ['智慧醫療 研討會', 'AI醫療 論壇', '醫療科技展', '智慧醫療 工作坊', 'AI 醫療 講座'];

// ── 판정 기준 ──────────────────────────────────────────
// 행사 신호: 참석·신청할 수 있는 자리인가.
// ⚠️ '學會'는 넣지 않는다 — 단체 이름(台灣醫學會 등)에 들어가 오탐이 커진다.
//    한국어판이 '학회'를 뺀 것과 같은 이유.
// ⚠️ '展'을 단독으로 넣지 않는다 — '展示'·'發展'처럼 흔한 말에 걸린다.
//    醫療科技展·博覽會·展覽처럼 낱말 전체로 본다.
const EVENT_RE =
  /研討會|論壇|工作坊|研習|講座|課程|培訓|訓練班|博覽會|展覽|醫療科技展|高峰會|年會|大會|說明會|發表會|開幕|登場|舉辦|報名|招生/;

// AI·디지털 신호 (뉴스 수집기와 같은 기준)
const AI_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|人工智慧|機器學習|深度學習|生成式|大型語言模型|演算法|智慧醫療|數位醫療|電子病歷|遠距醫療|大數據|聊天機器人|智慧照護|醫療科技|數位轉型/;

// 병원·의료 신호
const MED_RE =
  /醫院|醫師|醫生|病患|病人|健保|衛福部|食藥署|醫療|診斷|臨床|醫材|醫療器材|長照|照護|護理|門診|藥師|藥局|病歷|醫學|癌症|失智|急診/;

// 소비자 가전·반려동물 제외 (뉴스 수집기와 같은 규칙)
const NOT_HOSPITAL_RE = /毛孩|寵物|貓咪|狗狗|牙刷|美妝|保養品|健身房|球員|運動員/;

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8216;|&#8217;|&#039;|&#39;|&apos;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim();

const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

const normTitle = (t) =>
  (t || '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/["'“”‘’.,!?:;()[\]—－·、。，！？：；「」『』（）]/g, '');

const isEvent = (t) =>
  EVENT_RE.test(t) && AI_RE.test(t) && MED_RE.test(t) && !NOT_HOSPITAL_RE.test(t);

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
          'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = new Error(`${e.message}${e.cause?.code ? ` (${e.cause.code})` : ''}`);
    }
    if (i < tries - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw last;
}

// ── 中央社 검색 (JSON-LD ItemList) ─────────────────────
// 기사 URL의 앞 8자리가 발행일이다: /news/ahel/202609060012.aspx
async function fetchCna(query) {
  const url = `https://www.cna.com.tw/search/hysearchws.aspx?q=${encodeURIComponent(query)}`;
  const html = await (await fetchRetry(url)).text();
  const rows = [];
  for (const m of html.matchAll(/"@type":"ItemList","itemListElement":(\[[\s\S]*?\])\}/g)) {
    let arr;
    try {
      arr = JSON.parse(m[1]);
    } catch {
      continue;
    }
    for (const it of arr) {
      if (!it?.url || !it?.name) continue;
      const d = String(it.url).match(/\/(\d{4})(\d{2})(\d{2})\d+\.aspx/);
      if (!d) continue;
      const date = new Date(`${d[1]}-${d[2]}-${d[3]}T12:00:00+08:00`);
      if (Number.isNaN(date.getTime())) continue;
      rows.push({
        title: stripTags(String(it.name)),
        link: String(it.url),
        source: CNA_SOURCE,
        pubDate: date.toISOString(),
      });
    }
  }
  return rows;
}

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okSources = 0;

for (const query of CNA_QUERIES) {
  try {
    const rows = await fetchCna(query);
    const kept = rows.filter((r) => isEvent(r.title));
    collected.push(...kept);
    okSources++;
    console.log(`${CNA_SOURCE}/${query}: ${rows.length}건 중 ${kept.length}건 채택`);
  } catch (e) {
    console.error(`${CNA_SOURCE}/${query} 수집 실패 — ${e.message}`);
  }
}

// 이미 쌓인 뉴스에서 행사성 기사를 끌어온다. 실패해도 치명적이지 않다.
try {
  const news = JSON.parse(await readFile(NEWS, 'utf8'));
  const kept = (news.items ?? []).filter((r) => isEvent(r.title));
  collected.push(...kept);
  okSources++;
  console.log(`뉴스 누적분에서: ${(news.items ?? []).length}건 중 ${kept.length}건 행사성`);
} catch (e) {
  console.error(`tw/news.json 읽기 실패 — ${e.message}`);
}

if (okSources === 0) {
  console.error('모든 수집원을 읽지 못했습니다. 기존 tw/events.json을 유지합니다.');
  process.exit(1);
}

// ── 기존 항목과 병합 (누적) ────────────────────────────
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`tw/events.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

const seen = new Set();
const items = [...collected, ...existing]
  .filter((it) => {
    const key = normTitle(it.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 행사 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify({ updatedAt: new Date().toISOString(), source: CNA_SOURCE, items }, null, 2) + '\n',
  'utf8'
);
console.log(`수집 완료: 누적 ${items.length}건`);
