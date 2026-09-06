// 인도네시아어판 의료 AI·디지털 교육·행사 수집기 (2026-09-06 신설)
//
// 병원 종사자가 신청할 수 있는 교육(pelatihan)·워크숍(workshop)·세미나·
// 웨비나 소식을 모아 src/data/id/events.json에 쌓는다.
// 본문을 옮기지 않고 원문으로 링크만 건다.
//
// 수집원
//   PERSI(인도네시아병원협회) 워드프레스 REST API의 두 분류
//     - 682 Info Pelatihan (교육 안내)
//     - 338 Event News (행사 소식)
//   뉴스 수집기(fetch-id-news.mjs)가 쓰는 API와 같은 곳이라 이미 검증돼 있고,
//   날짜·제목·링크를 JSON으로 정확히 받는다.
//
// ⚠️ 필터를 좁게 잡았다. PERSI 교육은 대부분 감염관리(IPCN)·환자안전·CSSD·
//    재무처럼 **디지털과 무관한 일반 병원 교육**이다. 넓게 잡으면(예: 'data'·
//    'teknologi'·'informasi' 같은 흔한 낱말) 100건 중 44건이 통과하는데 실제로
//    맞는 것은 그중 일부뿐이었다. 그래서 전자의무기록(RME)·코딩(iDRG·INA-CBG)·
//    SATUSEHAT·AI처럼 **주제를 특정하는 말**만 본다.
//    실측(2026-09-06): 100건 중 12건 통과, 전부 실제로 관련 있는 교육이었다.
//
// ⚠️ 이 목록은 '신청 가능한 교육 목록'이 아니라 '협회가 올린 교육 안내'다.
//    지난 교육도 남고, 정원·마감은 여기서 알 수 없다. 화면에서 그 사실을
//    반드시 밝힌다(대만어판 events와 같은 원칙).
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/id/events.json', import.meta.url);
const MAX_ITEMS = 200;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const PERSI_SOURCE = 'PERSI';
// 682 = Info Pelatihan, 338 = Event News
const PERSI_API =
  'https://www.persi.or.id/wp-json/wp/v2/posts?per_page=100&categories=682,338&_fields=date_gmt,link,title';

// 주제를 특정하는 말만 본다. 흔한 낱말(data·teknologi·informasi 단독)은 넣지 않는다.
const TOPIC_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|kecerdasan buatan|kecerdasan artifisial|digital|digitalisasi|rekam medis elektronik|(?<![A-Za-z])RME(?![A-Za-z])|satusehat|telemedisin|sistem informasi|(?<![A-Za-z])iDRG(?![A-Za-z])|INA[- ]?CBG|koding|health technology assessment|(?<![A-Za-z])HTA(?![A-Za-z])|siber|teknologi informasi/i;

const decodeEntities = (s) =>
  s
    .replace(/&amp;|&#038;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;|&#039;|&#39;|&apos;/g, "'")
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .trim();

const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

const normTitle = (t) =>
  (t || '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/["'“”‘’.,!?:;()[\]-]/g, '');

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept: 'application/json,*/*;q=0.8', 'accept-language': 'id-ID,id;q=0.9' },
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

// date_gmt는 타임존 표기가 없는 UTC 시각이라 'Z'를 붙여 해석한다.
let collected = [];
let ok = false;
try {
  const rows = await (await fetchRetry(PERSI_API)).json();
  if (!Array.isArray(rows)) throw new Error('예상과 다른 응답(배열이 아님)');
  const mapped = rows
    .map((p) => {
      const title = stripTags(p?.title?.rendered ?? '');
      const d = new Date(`${p?.date_gmt}Z`);
      if (!title || !p?.link || Number.isNaN(d.getTime())) return null;
      return { title, link: p.link, source: PERSI_SOURCE, pubDate: d.toISOString() };
    })
    .filter(Boolean);
  collected = mapped.filter((r) => TOPIC_RE.test(r.title));
  ok = true;
  console.log(`${PERSI_SOURCE}: ${mapped.length}건 중 ${collected.length}건 채택`);
} catch (e) {
  console.error(`${PERSI_SOURCE} 수집 실패 — ${e.message}`);
}

if (!ok) {
  console.error('수집원을 읽지 못했습니다. 기존 id/events.json을 유지합니다.');
  process.exit(1);
}

let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`id/events.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
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
  console.log(`변경 없음: 새 항목 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify({ updatedAt: new Date().toISOString(), source: PERSI_SOURCE, items }, null, 2) + '\n',
  'utf8'
);
console.log(`수집 완료: 누적 ${items.length}건`);
