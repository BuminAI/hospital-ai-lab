// 병원·의료 AI 교육·행사 수집기
//
// 병원 종사자가 참석·신청할 수 있는 AI·디지털 관련 교육, 세미나, 컨퍼런스,
// 학술대회, 박람회 소식을 모아 src/data/events.json에 쌓는다.
// 본문을 옮기지 않고 원문으로 링크만 건다.
//
// 수집원 (전부 이미 다른 수집기로 크롤링 가능성이 검증된 곳)
//   1) 메디칼타임즈 — '의료기기·AI'(MainCate=4)와 '학술'(MainCate=6) 지면
//   2) 병원신문 — 전체 기사 목록
//   3) 대한병원협회 — 공지사항(설명회·교육 안내가 올라온다)
//   4) 한국보건산업진흥원 — 사업공고(교육훈련·연수 과정)
//
// ⚠️ 수확량이 적다는 것을 알고 만들었다 (2026-07-27 실측)
//   누적 뉴스 103건 중 행사성 4건, 메디칼타임즈 3개 지면 135건 중 AI 행사 0건.
//   대략 **주 1건** 수준이다. 그래서 두 가지를 뒀다.
//     - 최초 1회 `src/data/news.json`의 기존 누적분에서 행사 기사를 끌어와 시드로 삼는다
//       (그래야 페이지가 비어 있지 않다).
//     - 이후에는 이 수집기가 매일 돌며 스스로 누적한다.
//   기준을 넓히려면 AI_RE를 손보면 된다(지금도 디지털·데이터·스마트를 포함한다).
//
// ⚠️ 병원신문은 페이지 넘김과 검색이 모두 서버에서 무시된다(항상 최신 20건).
//   그래서 과거분을 소급 수집할 수 없고, 매일 돌면서 쌓는 수밖에 없다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/events.json', import.meta.url);
const NEWS = new URL('../src/data/news.json', import.meta.url);
const MAX_ITEMS = 200;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab event fetcher';

// ── 판정 기준 ──────────────────────────────────────────
// 행사 신호: 참석·신청할 수 있는 자리인가
// '개최'까지 넣은 이유: 국내 매체가 행사를 "○○학회, 학회 개최…"처럼 쓰는 경우가
// 많아 빼면 실제 행사를 놓친다. 다만 '학회'만 단독으로 넣으면 단체 이름
// (디지털헬스학회 등)에 걸려 오탐이 커지므로 넣지 않았다.
// 실측(누적 뉴스 103건): 엄격 2건 → '개최' 추가 3건, 오탐 0건.
const EVENT_RE =
  /교육|세미나|컨퍼런스|콘퍼런스|학술대회|심포지엄|워크숍|워크샵|포럼|설명회|강좌|연수|아카데미|박람회|전시회|웨비나|공청회|토론회|간담회|개최/;

// AI·디지털 신호. 이 사이트 주제와 맞는 행사만 남긴다.
const AI_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|인공지능|디지털|데이터|스마트|생성형|챗지피티|챗GPT|머신러닝|딥러닝|헬스케어|의료정보|빅데이터|디지털치료|정밀의료|원격의료/;

// 병원·의료 신호. 뉴스 수집기가 이미 의료 매체만 보므로 보조 조건이다.
const MED_RE =
  /병원|의료|보건|진료|간호|의사|약국|한의|치과|의료기관|요양|바이오|헬스|임상|제약|환자|의학|의료진/;

// 행사가 아닌 것 — 수상·인사·부고·단순 실적 기사가 '개최' 같은 말로 섞여 든다.
const EXCLUDE_RE =
  /수상|선정됐|선정되|임명|취임|위촉|부고|별세|기부|후원금|협약 ?체결|MOU|채용|입찰|낙찰|모집공고 ?마감/;

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

const stripTags = (s) =>
  decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

const isEvent = (title) =>
  !EXCLUDE_RE.test(title) &&
  EVENT_RE.test(title) &&
  AI_RE.test(title) &&
  MED_RE.test(title);

// 제목 정규화 — 같은 행사가 여러 매체에 실릴 때 한 건으로 묶는다.
const normTitle = (t) =>
  (t || '')
    .replace(/[\s ]/g, '')
    .replace(/[「」『』[\]()（）'"'"]/g, '')
    .replace(/(안내|공고|알림|개최)+$/, '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, tries = 2) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
          'accept-language': 'ko-KR,ko;q=0.9',
        },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = new Error(`${e.message}${e.cause?.code ? ` (${e.cause.code})` : ''}`);
    }
    if (i < tries - 1) await sleep(1500 * (i + 1));
  }
  throw last;
}

const kstToIso = (s) => {
  const d = new Date(`${s.trim().replace(' ', 'T')}+09:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// ── 메디칼타임즈 (의료기기·AI + 학술 지면) ─────────────
async function fetchMedicalTimes() {
  const rows = [];
  for (const cate of [4, 6]) {
    for (let p = 1; p <= 3; p++) {
      const url = `https://www.medicaltimes.com/Main/News/List.html?MainCate=${cate}${p > 1 ? `&page=${p}` : ''}`;
      try {
        const html = await (await fetchRetry(url)).text();
        for (const part of html.split(/<article class="newsList_cont\b/).slice(1)) {
          const block = part.split('</article>')[0];
          const idM = block.match(/NewsView\.html\?ID=(\d+)/);
          const titleM = block.match(/headLine">([\s\S]*?)<\/h4>/);
          const dateM = block.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
          if (!idM || !titleM || !dateM) continue;
          const pubDate = kstToIso(dateM[1]);
          if (!pubDate) continue;
          rows.push({
            title: stripTags(titleM[1]),
            link: `https://www.medicaltimes.com/Main/News/NewsView.html?ID=${idM[1]}`,
            source: '메디칼타임즈',
            pubDate,
          });
        }
      } catch (e) {
        console.error(`  메디칼타임즈 ${cate}지면 ${p}p 실패 — ${e.message}`);
      }
      await sleep(400);
    }
  }
  return rows;
}

// ── 병원신문 ───────────────────────────────────────────
// 페이지 넘김·검색이 서버에서 무시돼 최신 1페이지만 읽는다(매일 돌며 누적).
async function fetchKhanews() {
  const html = await (await fetchRetry('https://www.khanews.com/news/articleList.html?page=1')).text();
  const rows = [];
  for (const part of html.split('<div class="table-row">').slice(1)) {
    const block = part.split('</div>\n</div>')[0].slice(0, 2000);
    const idM = block.match(/articleView\.html\?idxno=(\d+)/);
    const titleM = block.match(/class="links"[^>]*>\s*<strong>([\s\S]*?)<\/strong>/);
    const dateM = block.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
    if (!idM || !titleM || !dateM) continue;
    const pubDate = kstToIso(dateM[1]);
    if (!pubDate) continue;
    rows.push({
      title: stripTags(titleM[1]),
      link: `https://www.khanews.com/news/articleView.html?idxno=${idM[1]}`,
      source: '병원신문',
      pubDate,
    });
  }
  return rows;
}

// ── 대한병원협회 공지사항 ──────────────────────────────
async function fetchKha() {
  const html = await (await fetchRetry('https://www.kha.or.kr/kha_home/notice_list.do')).text();
  const rows = [];
  for (const part of html.split('<div class="tr ').slice(1)) {
    const block = part.slice(0, 3000);
    const idM = block.match(/articleNo=(\d+)/);
    const titleM = block.match(/<span>([\s\S]*?)<\/span>/);
    const dateM = block.match(/tb_05">\s*(\d{4}-\d{2}-\d{2})/);
    if (!idM || !titleM || !dateM) continue;
    const pubDate = kstToIso(`${dateM[1]} 00:00:00`);
    if (!pubDate) continue;
    rows.push({
      title: stripTags(titleM[1]),
      link: `https://www.kha.or.kr/kha_home/notice_list.do?mode=view&articleNo=${idM[1]}`,
      source: '대한병원협회',
      pubDate,
    });
  }
  return rows;
}

// ── 한국보건산업진흥원 사업공고 ────────────────────────
async function fetchKhidi() {
  const html = await (await fetchRetry('https://www.khidi.or.kr/board?menuId=MENU01108')).text();
  const rows = [];
  for (const part of html.split('<tr>').slice(1)) {
    const linkM = part.match(/href="(\/board\/view\?[^"]+)"/);
    const titleM = part.match(/title="([^"]+)"/);
    const dateM = part.match(/(20\d{2}-\d{2}-\d{2})/);
    if (!linkM || !titleM || !dateM) continue;
    const pubDate = kstToIso(`${dateM[1]} 00:00:00`);
    if (!pubDate) continue;
    rows.push({
      title: decode(titleM[1]),
      link: 'https://www.khidi.or.kr' + decode(linkM[1]),
      source: '한국보건산업진흥원',
      pubDate,
    });
  }
  return rows;
}

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okSources = 0;
for (const [name, fn] of [
  ['메디칼타임즈', fetchMedicalTimes],
  ['병원신문', fetchKhanews],
  ['대한병원협회', fetchKha],
  ['한국보건산업진흥원', fetchKhidi],
]) {
  try {
    const rows = await fn();
    collected.push(...rows);
    okSources++;
    console.log(`${name}: ${rows.length}건 읽음`);
  } catch (e) {
    console.error(`${name} 수집 실패 — ${e.message}`);
  }
}

if (okSources === 0) {
  console.error('모든 수집원을 읽지 못했습니다. 기존 events.json을 유지합니다.');
  process.exit(1);
}

const fresh = collected.filter((r) => isEvent(r.title));

// ── 기존 항목 + 뉴스 시드와 병합 ───────────────────────
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`events.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

// 최초 1회: 이미 몇 주치가 쌓여 있는 news.json에서 행사 기사를 끌어온다.
// (이 수집기는 하루 1회라 과거분을 스스로 채울 수 없다.)
let seeded = 0;
if (existing.length === 0) {
  try {
    const news = JSON.parse(await readFile(NEWS, 'utf8'));
    for (const it of news.items || []) {
      if (!isEvent(it.title)) continue;
      collected.push(it);
      fresh.push({ title: it.title, link: it.link, source: it.source, pubDate: it.pubDate });
      seeded++;
    }
  } catch {
    // 뉴스 파일을 못 읽어도 치명적이지 않다 — 시드 없이 시작한다.
  }
}

const seen = new Set();
const items = [...fresh, ...existing]
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
  JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n',
  'utf8'
);

const by = (s) => items.filter((i) => i.source === s).length;
console.log(
  `수집 완료: 누적 ${items.length}건` +
    (seeded ? ` (뉴스 누적분에서 ${seeded}건 시드)` : '') +
    ` — 메디칼타임즈 ${by('메디칼타임즈')} · 병원신문 ${by('병원신문')} · 병원협회 ${by('대한병원협회')} · 진흥원 ${by('한국보건산업진흥원')}`
);
