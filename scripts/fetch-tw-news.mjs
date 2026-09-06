// 대만어판(정체자) 의료 AI 뉴스 수집기 (2026-09-06 신설)
//
// 세 곳에서 모은다. 인도네시아어판과 같은 사고방식이다 — 주제로 이미 좁혀진
// 지면은 그대로 받고, 넓은 지면은 제목으로 다시 거른다.
//   1) 科技新報(technews.tw) — 워드프레스 REST API를 공개한다. 'AI 人工智慧'
//      분류(id 19819)를 읽고 **병원·의료 조건으로 다시 거른다.** 이 분류는
//      하루 25건쯤 쏟아지는 일반 기술 지면이라 거르지 않으면 소비자 가전
//      기사가 그대로 들어온다(실측: 100건 중 의료 5건, 그나마 반려동물
//      급식기·전동칫솔 같은 것이 섞였다).
//   2) 中央社(cna.com.tw) — 국영 통신사. **검색 페이지**를 쓴다. 검색 결과가
//      서버에서 그려지고 JSON-LD의 ItemList로 제목·링크를 한 번에 100건씩
//      내보내서, HTML 정규식보다 안정적으로 읽힌다. 기사 URL
//      (/news/ahel/20260906xxxx.aspx)에 날짜가 박혀 있어 날짜도 정확하다.
//      ⚠️ 처음에는 지면 목록(/list/ahel.aspx)을 읽었는데 최신 20건만 나와서
//         의료 AI 교집합이 0건이었다. 검색으로 바꾸니 바로 잡혔다.
//   3) 健康醫療網(healthnews.com.tw) — 의료 전문 매체. 분류가 질환별이라
//      AI 전용 지면이 없어 목록에서 제목으로 거른다. 목록에 날짜가 없어
//      **걸린 기사만** 본문 페이지의 article:published_time을 읽는다
//      (전부 받지 않는다 — 요청 수를 아끼려고).
//
// ⚠️ 環球生技(gbimonthly.com)에는 '智慧醫療' 태그 지면이 있어 가장 잘 맞았지만,
//    태그 페이지가 이 환경과 GitHub 러너 양쪽에서 계속 HTTP 500을 준다
//    (2026-09-06 실측). 되살아나면 수집원에 넣을 것.
//
// ⚠️ 衛福部(mohw.gov.tw) 보도자료는 목록 페이지가 최신 글을 노출하지 않아
//    (2016년 날짜만 잡힌다) 자동 수집에 쓰지 못했다.
//
// 저작권: 본문을 옮기지 않는다. 제목·링크·매체·발행일만 저장하고 원문으로
// 링크만 건다(다른 언어판과 같은 원칙).
//
// 누적 정책: 기존 src/data/tw/news.json 항목을 지우지 않고 병합한다(제목 기준
// 중복 제거). 한 곳이 실패해도 나머지는 계속하고, 전부 실패했을 때만 기존
// 파일을 그대로 두고 중단한다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/tw/news.json', import.meta.url);
const MAX_ITEMS = 300;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const TN_SOURCE = '科技新報';
const TN_AI_CATEGORY = 19819; // 'AI 人工智慧'
const TN_PAGES = 3; // 100건×3 ≈ 최근 2주(이 분류는 갱신이 매우 잦다)

const CNA_SOURCE = '中央社';
// 검색어로 주제를 좁힌다. 지면 목록과 달리 과거 기사까지 100건씩 돌려준다.
const CNA_QUERIES = ['AI醫療', '智慧醫療', '電子病歷', '遠距醫療', 'AI 醫院'];

const HN_SOURCE = '健康醫療網';
const HN_LIST = 'https://www.healthnews.com.tw/';
const HN_MAX_DATE_LOOKUPS = 8; // 날짜를 받으러 본문까지 여는 최대 건수

// AI·디지털 신호
const AI_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|人工智慧|機器學習|深度學習|生成式|大型語言模型|演算法|智慧醫療|數位醫療|電子病歷|遠距醫療|大數據|聊天機器人|智慧照護|醫療科技|數位轉型/;

// 병원·의료 신호. 넓은 지면(科技新報·中央社)에만 함께 적용한다.
const MED_RE =
  /醫院|醫師|醫生|病患|病人|健保|衛福部|食藥署|醫療|診斷|臨床|醫材|醫療器材|長照|照護|護理|門診|藥師|藥局|病歷|醫學|癌症|失智|急診/;

// ⚠️ 소비자 가전·반려동물 기사를 걸러낸다. 科技新報의 AI 분류에는 '毛孩 健康'
//    (반려동물 건강), 'AI 攝影牙刷'(전동칫솔) 같은 기사가 섞여 있는데, MED_RE의
//    '健康'·'照護'에 걸려 통과해 버린다. 병원 실무자용 사이트에 실릴 내용이
//    아니라 명시적으로 뺀다(2026-09-06 실측으로 확인하고 넣은 규칙).
const NOT_HOSPITAL_RE = /毛孩|寵物|貓咪|狗狗|牙刷|美妝|保養品|健身房|球員|運動員/;

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8216;|&#8217;|&#039;|&#39;|&apos;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .trim();

// XSS 방지: 본문에 태그가 섞여 들어오지 않게 한다(JSON-LD에도 그대로 실리므로).
const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

// 제목 정규화 — 같은 기사가 여러 곳에 걸릴 때 한 건으로 묶는다.
// 중국어는 낱말 사이에 공백이 없어 공백·문장부호만 지우면 충분하다.
const normTitle = (t) =>
  (t || '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/["'“”‘’.,!?:;()[\]—－·、。，！？：；「」『』（）]/g, '');

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'text/html,application/xhtml+xml,application/json,*/*;q=0.8',
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

// ── 科技新報 (워드프레스 REST API) ─────────────────────
async function fetchTechnews() {
  const rows = [];
  for (let page = 1; page <= TN_PAGES; page++) {
    const url =
      `https://technews.tw/wp-json/wp/v2/posts?categories=${TN_AI_CATEGORY}` +
      `&per_page=100&page=${page}&_fields=date_gmt,link,title`;
    let arr;
    try {
      arr = await (await fetchRetry(url)).json();
    } catch (e) {
      // 마지막 페이지를 넘어가면 400을 준다 — 첫 페이지가 아니면 조용히 멈춘다.
      if (page === 1) throw e;
      break;
    }
    if (!Array.isArray(arr) || arr.length === 0) break;
    for (const p of arr) {
      const title = stripTags(p?.title?.rendered ?? '');
      const d = new Date(`${p?.date_gmt}Z`);
      if (!title || !p?.link || Number.isNaN(d.getTime())) continue;
      rows.push({ title, link: p.link, source: TN_SOURCE, pubDate: d.toISOString() });
    }
  }
  return rows;
}

// ── 中央社 (검색 결과의 JSON-LD ItemList) ──────────────
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
      continue; // 목록이 아닌 다른 ItemList(빵부스러기 등)는 건너뛴다
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

// ── 健康醫療網 (목록에서 제목·링크, 날짜는 걸린 것만 본문에서) ──
async function fetchHealthnewsTitles() {
  const html = await (await fetchRetry(HN_LIST)).text();
  const seen = new Set();
  const rows = [];
  for (const m of html.matchAll(
    /<a href="(https:\/\/www\.healthnews\.com\.tw\/article\/(\d+))"[^>]*>\s*([^<]{6,90})</g
  )) {
    if (seen.has(m[2])) continue;
    seen.add(m[2]);
    const title = decodeEntities(m[3].replace(/\s+/g, ' ')).replace(/\.{2,}$/, '').trim();
    if (!/[一-鿿]/.test(title)) continue;
    rows.push({ title, link: m[1], source: HN_SOURCE });
  }
  return rows;
}

// 본문 페이지의 article:published_time을 읽는다. 못 읽으면 null을 돌려주고,
// 부르는 쪽에서 그 기사를 버린다 — 발행일을 지어내지 않는다.
async function fetchHealthnewsDate(link) {
  try {
    const html = await (await fetchRetry(link, 2)).text();
    const m = html.match(/article:published_time"\s+content="([^"]+)"/);
    if (!m) return null;
    const d = new Date(m[1]);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okSources = 0;

try {
  const rows = await fetchTechnews();
  const kept = rows.filter(
    (r) => AI_RE.test(r.title) && MED_RE.test(r.title) && !NOT_HOSPITAL_RE.test(r.title)
  );
  collected.push(...kept);
  okSources++;
  console.log(`${TN_SOURCE}: ${rows.length}건 중 ${kept.length}건 채택`);
} catch (e) {
  console.error(`${TN_SOURCE} 수집 실패 — ${e.message}`);
}

for (const query of CNA_QUERIES) {
  try {
    const rows = await fetchCna(query);
    // 검색어가 주제를 좁혀 주지만, 검색 결과에는 "AI 서버 출하" 같은 산업
    // 기사도 섞여 들어온다. 제목으로 한 번 더 거른다.
    const kept = rows.filter(
      (r) => AI_RE.test(r.title) && MED_RE.test(r.title) && !NOT_HOSPITAL_RE.test(r.title)
    );
    collected.push(...kept);
    okSources++;
    console.log(`${CNA_SOURCE}/${query}: ${rows.length}건 중 ${kept.length}건 채택`);
  } catch (e) {
    console.error(`${CNA_SOURCE}/${query} 수집 실패 — ${e.message}`);
  }
}

try {
  const rows = await fetchHealthnewsTitles();
  // 의료 전문 매체라 의료 조건은 걸지 않는다(모든 기사가 의료다).
  const hit = rows.filter((r) => AI_RE.test(r.title) && !NOT_HOSPITAL_RE.test(r.title));
  okSources++;
  let dated = 0;
  for (const r of hit.slice(0, HN_MAX_DATE_LOOKUPS)) {
    const pubDate = await fetchHealthnewsDate(r.link);
    if (!pubDate) continue; // 발행일을 확인 못 하면 싣지 않는다
    collected.push({ ...r, pubDate });
    dated++;
  }
  console.log(`${HN_SOURCE}: ${rows.length}건 중 ${hit.length}건 해당, 발행일 확인 ${dated}건`);
} catch (e) {
  console.error(`${HN_SOURCE} 수집 실패 — ${e.message}`);
}

if (okSources === 0) {
  console.error('모든 수집원을 읽지 못했습니다. 기존 tw/news.json을 유지합니다.');
  process.exit(1);
}

// ── 기존 항목과 병합 (누적) ────────────────────────────
// 파일이 "없는" 경우만 빈 목록으로 시작한다. 파싱 실패(손상)는 중단 —
// 그대로 진행하면 누적 이력이 최근 수집분만으로 리셋되기 때문.
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`tw/news.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
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

// 변경이 없으면 파일을 건드리지 않는다 — 커밋·배포를 만들지 않기 위해.
if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 기사 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      source: `${TN_SOURCE}·${CNA_SOURCE}·${HN_SOURCE}`,
      items,
    },
    null,
    2
  ) + '\n',
  'utf8'
);

const by = (s) => items.filter((i) => i.source === s).length;
console.log(
  `수집 완료: 누적 ${items.length}건 ` +
    `(${TN_SOURCE} ${by(TN_SOURCE)}건, ${CNA_SOURCE} ${by(CNA_SOURCE)}건, ${HN_SOURCE} ${by(HN_SOURCE)}건)`
);
