// 러시아어판 의료 AI 뉴스 수집기 (매체 지면 직접 크롤링)
//
// 두 매체의 "인공지능(ИИ)" 전용 지면에서만 수집한다 — 한국어판(메디칼타임즈·
// 병원신문)과 달리 두 매체 모두 AI 전용 지면이 있어, 병원신문처럼 전체
// 목록을 제목으로 다시 거를 필요가 없었다(2026-08-13 raw HTML 직접 확인).
//   1) Медвестник(medvestnik.ru) "искусственный интеллект" 태그 페이지
//   2) Vademecum(vademec.ru) "/ai/" 전용 섹션
//
// 누적 정책: 기존 src/data/ru/news.json 항목을 지우지 않고 새 기사를 병합한다
// (제목 기준 중복 제거). 한 매체가 실패해도 다른 매체 수집은 계속하고,
// 두 매체 모두 한 건도 못 읽었을 때만 기존 파일을 그대로 두고 중단한다.
// (이 저장소는 크롤러 간 공용 유틸을 두지 않는 관례라 fetch-news.mjs의
//  decodeEntities·stripTags 등을 그대로 복붙했다.)
import { readFile, writeFile } from 'node:fs/promises';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab news fetcher';
const MAX_ITEMS = 300;

const MV_URL = 'https://medvestnik.ru/content/tags/19780.html';
const MV_SOURCE = 'Медвестник';
const VD_URL = 'https://www.vademec.ru/ai/';
const VD_SOURCE = 'Vademecum';

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// XSS 방지: 본문에 태그가 섞여 들어오지 않게 한다(JSON-LD에도 그대로 실리므로).
const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

// ── Медвестник: "11 авг, 2026" 형식의 러시아어 월 축약형을 ISO로 변환 ──
const RU_MONTHS = {
  янв: '01', фев: '02', мар: '03', апр: '04', май: '05', июн: '06',
  июл: '07', авг: '08', сен: '09', окт: '10', ноя: '11', дек: '12',
};
function mvDateToIso(s) {
  const m = s.trim().match(/(\d{1,2})\s+([а-я]+),?\s+(\d{4})/i);
  if (!m) return null;
  const mon = RU_MONTHS[m[2].toLowerCase().slice(0, 3)];
  if (!mon) return null;
  const day = m[1].padStart(2, '0');
  // 시각 정보가 없어 정오(모스크바 UTC+3)로 채운다 — 순서 정렬용이라
  // 정밀할 필요는 없지만, 날짜가 하루 밀리지 않도록 UTC 자정은 피한다.
  const d = new Date(`${m[3]}-${mon}-${day}T12:00:00+03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// ── Vademecum: "11.08.2026" / "4.09.2026" 형식을 ISO로 변환 ──
//
// ⚠️ 2026-09-06 버그 수정: 예전 정규식이 `(\d{2})\.(\d{2})`로 **일·월을 두
//    자리로 강제**해서, 하루가 한 자리인 날짜("4.09.2026")가 매치되지 않아
//    그 기사가 조용히 버려졌다. 매달 1~9일 기사가 통째로 빠지고 있었고,
//    수집 로그에는 오류가 남지 않아 한동안 드러나지 않았다(실측: 8/30 이후
//    9월 기사가 하나도 안 들어옴). 자릿수를 1~2로 풀고 padStart로 보정한다.
function vdDateToIso(s) {
  const m = s.trim().match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) return null;
  const day = m[1].padStart(2, '0');
  const mon = m[2].padStart(2, '0');
  const d = new Date(`${m[3]}-${mon}-${day}T12:00:00+03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Медвестник 파싱. 각 기사는 <a class="c-basic-announce ..." href="..."> 로
// 시작하는 블록이다(2026-08-13 raw HTML 직접 확인 — 정규식 파싱에 적합함을
// 확인했다). 블록은 </a>로 끝난다.
async function fetchMedvestnik() {
  const res = await fetch(MV_URL, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`Медвестник 목록 요청 실패: HTTP ${res.status}`);
  const html = await res.text();
  const rows = [];
  for (const part of html.split('<a class="c-basic-announce').slice(1)) {
    const block = part.split('</a>')[0];
    const hrefM = block.match(/href="(\/content\/(?:articles|news)\/[^"]+\.html)"/);
    const titleM = block.match(/class="ui header heading">([\s\S]*?)<\/h3/);
    const dateM = block.match(/class="date">([^<]+)<\/div>/);
    if (!hrefM || !titleM || !dateM) continue;
    const pubDate = mvDateToIso(dateM[1]);
    if (!pubDate) continue;
    const title = stripTags(titleM[1]);
    if (!title) continue;
    rows.push({
      title,
      link: `https://medvestnik.ru${hrefM[1]}`,
      source: MV_SOURCE,
      pubDate,
    });
  }
  return rows;
}

// Vademecum 파싱. 각 기사는 <a class="news-block" href="..."> 로 시작하는
// 블록이다. 블록은 다음 <a class="news-block" 직전(또는 문서 끝)까지다.
async function fetchVademecum() {
  const res = await fetch(VD_URL, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`Vademecum 목록 요청 실패: HTTP ${res.status}`);
  const html = await res.text();
  const rows = [];
  for (const part of html.split('<a class="news-block"').slice(1)) {
    const hrefM = part.match(/href="([^"]+)"/);
    const titleM = part.match(/class="news-block__title">([\s\S]*?)<\/h4>/);
    const dateM = part.match(/class="news-block__date">([^<]+)</);
    if (!hrefM || !titleM || !dateM) continue;
    const pubDate = vdDateToIso(dateM[1]);
    if (!pubDate) continue;
    const title = stripTags(titleM[1]);
    if (!title) continue;
    const href = hrefM[1].startsWith('http') ? hrefM[1] : `https://www.vademec.ru${hrefM[1]}`;
    rows.push({ title, link: href, source: VD_SOURCE, pubDate });
  }
  return rows;
}

// ── 기존 목록 읽기 ─────────────────────────────────────
// 파일이 "없는" 경우만 빈 목록으로 시작한다. 파싱 실패(손상)는 중단 —
// 그대로 진행하면 누적 이력이 최근 수집분만으로 리셋되기 때문.
let existing = [];
try {
  const prev = JSON.parse(
    await readFile(new URL('../src/data/ru/news.json', import.meta.url), 'utf8')
  );
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`ru/news.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

// ── 수집 (한 매체가 실패해도 다른 매체는 계속한다) ──────
const collected = [];
let mvOk = false;
try {
  collected.push(...(await fetchMedvestnik()));
  mvOk = true;
} catch (e) {
  console.error(`Медвестник 수집 실패 — ${e.message}`);
}

let vdOk = false;
try {
  collected.push(...(await fetchVademecum()));
  vdOk = true;
} catch (e) {
  console.error(`Vademecum 수집 실패 — ${e.message}`);
}

if (!mvOk && !vdOk) {
  console.error('두 매체 모두 목록을 읽지 못했습니다. 기존 ru/news.json을 유지합니다.');
  process.exit(1);
}

const fresh = collected.map((r) => ({
  title: r.title,
  link: r.link,
  source: r.source,
  pubDate: r.pubDate,
}));

// ── 기존 항목과 병합 (누적) ────────────────────────────
const now = new Date();
const seen = new Set();
const norm = (t) => (t || '').replace(/\s+/g, '');
// 새 기사를 앞에 두어, 같은 제목이면 새 항목이 채택되도록 한다
const items = [...fresh, ...existing]
  .filter((it) => {
    const key = norm(it.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

// 목록이 그대로면 파일을 건드리지 않는다 — 불필요한 커밋·배포 방지.
if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 기사 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

const data = {
  updatedAt: now.toISOString(),
  source: `${MV_SOURCE}·${VD_SOURCE}`,
  items,
};

await writeFile(
  new URL('../src/data/ru/news.json', import.meta.url),
  JSON.stringify(data, null, 2) + '\n',
  'utf8'
);
const bySource = (s) => items.filter((i) => i.source === s).length;
console.log(
  `수집 완료: 신규 ${fresh.length}건 / 누적 ${items.length}건 ` +
    `(${MV_SOURCE} ${bySource(MV_SOURCE)}건${mvOk ? '' : ' ·실패'}, ` +
    `${VD_SOURCE} ${bySource(VD_SOURCE)}건${vdOk ? '' : ' ·실패'})`
);
