// 인도네시아어판 의료 AI 뉴스 수집기 (매체 지면 직접 크롤링)
//
// 두 곳에서 수집한다 (2026-09-06 raw HTML 직접 확인):
//   1) detikHealth(health.detik.com) 인덱스 — <article class="list-content__item">
//      블록. 날짜가 d-time 속성에 유닉스 초로 들어 있어 파싱이 정확하다.
//   2) Kompas Health(health.kompas.com) 홈 — class="tren__link" 블록.
//      날짜는 "DD/MM/YYYY, HH:MM WIB"(WIB = UTC+7) 형식이라 직접 변환한다.
//
// ⚠️ 러시아어판(Медвестник·Vademecum)과 달리 이 두 매체는 **AI 전용 지면이
//    없다.** 일반 건강 기사가 대부분이라 한국어판 병원신문처럼 제목으로 AI
//    관련만 다시 걸러야 한다(AI_RE).
//
// ⚠️ 보건부 공식 채널은 쓰지 못했다 — kemkes.go.id 목록은 AJAX로 그려져
//    raw HTML에 기사가 없고, /id/rss는 item이 하나도 없는 빈 껍데기이며,
//    sehatnegeriku.kemkes.go.id는 연결 자체가 안 된다(전부 2026-09-06 실측).
//    공식 발표는 블로그 글을 쓸 때 사람이 직접 확인해 인용한다.
//
// ⚠️ **수확량이 매우 적다는 것을 알고 만들었다(2026-09-06 실측).**
//    인도네시아 매체에는 러시아(Медвестник의 ИИ 태그, Vademecum /ai/)나
//    한국(메디칼타임즈 '의료기기·AI' 지면) 같은 **의료 AI 전담 지면이 없다.**
//    - detik/Kompas 건강 지면 38건 중 AI 관련 0건(그날 기준)
//    - Katadata의 AI 태그 지면은 19건 전부 일반 비즈니스·기술 AI라 의료
//      교집합 0건이었고, 목록 블록에 날짜도 없어 수집원에서 뺐다
//    즉 이 수집기는 "매일 몇 건"이 아니라 "가끔 한 건"을 노린다. 다만
//    SATUSEHAT·전자의무기록·원격의료 같은 말이 AI_RE에 들어 있어, 제도
//    관련 기사가 뜨면 걸린다. 수확이 없는 날이 대부분인 것은 정상이다.
//    수집한 결과는 인도네시아어 블로그의 소재 후보로도 쓴다(예약 작업 1-3단계).
//
// 저작권: 본문을 옮기지 않는다. 제목·링크·매체·발행일만 저장하고 원문으로
// 링크만 건다(한국어·러시아어판과 같은 원칙).
//
// 누적 정책: 기존 src/data/id/news.json 항목을 지우지 않고 새 기사를 병합한다
// (제목 기준 중복 제거). 한 매체가 실패해도 다른 매체 수집은 계속하고, 두
// 매체 모두 한 건도 못 읽었을 때만 기존 파일을 그대로 두고 중단한다.
// (이 저장소는 크롤러 간 공용 유틸을 두지 않는 관례라 decodeEntities·
//  stripTags 등은 다른 수집기에서 그대로 복붙했다.)
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/id/news.json', import.meta.url);
const MAX_ITEMS = 300;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const DETIK_URL = 'https://health.detik.com/indeks';
const DETIK_SOURCE = 'detikHealth';
const KOMPAS_URL = 'https://health.kompas.com/';
const KOMPAS_SOURCE = 'Kompas Health';

// AI·디지털 신호. 두 매체 모두 일반 건강 지면이라 이 조건으로 걸러야 한다.
// 'AI'는 단어 경계를 둬서 'AIDS'·'MAIN' 같은 말에 걸리지 않게 한다.
const AI_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|kecerdasan artifisial|kecerdasan buatan|artificial intelligence|machine learning|pembelajaran mesin|algoritma|digitalisasi|rekam medis elektronik|telemedisin|teknologi digital|big data|chatbot|robotik/i;

// 병원·의료 신호. 두 매체 다 건강 지면이지만 생활 기사도 섞여 들어와,
// 병원 실무와 닿는 것만 남기려고 함께 본다.
const MED_RE =
  /rumah sakit|dokter|pasien|medis|kesehatan|klinik|perawat|diagnosis|kemenkes|BPJS|obat|farmasi|penyakit/i;

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

// XSS 방지: 본문에 태그가 섞여 들어오지 않게 한다(JSON-LD에도 그대로 실리므로).
const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

// 제목 정규화 — 같은 기사가 두 매체에 실릴 때 한 건으로 묶는다.
const normTitle = (t) =>
  (t || '')
    .toLowerCase()
    .replace(/[\s]/g, '')
    .replace(/[""''"'.,!?:;()[\]]/g, '');

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
          'accept-language': 'id-ID,id;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(20000),
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

// ── detikHealth ────────────────────────────────────────
// 블록: <article class="list-content__item"> … </article>
// 제목·링크: <h3 class="media__title"><a href="…">제목</a>
// 날짜: <span d-time="1788613612" …>  ← 유닉스 초
async function fetchDetik() {
  const html = await (await fetchRetry(DETIK_URL)).text();
  const rows = [];
  for (const part of html.split('<article class="list-content__item">').slice(1)) {
    const block = part.split('</article>')[0];
    const titleM = block.match(
      /<h3 class="media__title">[\s\S]*?<a[^>]*href="(https:\/\/health\.detik\.com\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/
    );
    const timeM = block.match(/d-time="(\d+)"/);
    if (!titleM || !timeM) continue;
    const title = stripTags(titleM[2]);
    if (!title) continue;
    const d = new Date(Number(timeM[1]) * 1000);
    if (Number.isNaN(d.getTime())) continue;
    rows.push({ title, link: decodeEntities(titleM[1]), source: DETIK_SOURCE, pubDate: d.toISOString() });
  }
  return rows;
}

// ── Kompas Health ──────────────────────────────────────
// 블록: class="tren__link" href="…"> … <div class="tren__date">DD/MM/YYYY, HH:MM WIB</div>
// 제목은 이미지 alt 속성이 가장 안정적이다(제목 태그가 trenHL__title·tren__title로
// 갈린다 — 2026-09-06 실측).
// ⚠️ 자릿수를 1~2로 열어 둔다. 오늘 실측에서는 "05/09/2026"처럼 0을 채워
//    보내지만, 한 자리("5/9/2026")로 바뀌면 매치가 안 돼 그 기사가 조용히
//    버려진다 — 러시아어판 Vademecum 파서가 실제로 그렇게 매달 1~9일
//    기사를 통째로 놓치고 있었다(2026-09-06 발견·수정). 같은 함정을
//    되풀이하지 않으려고 처음부터 열어 두고 padStart로 보정한다.
const kompasDateToIso = (s) => {
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const [, dd, mm, yyyy, hh, mi] = m;
  // WIB는 UTC+7. 오프셋을 명시해 서버 표준시와 무관하게 같은 값이 나오게 한다.
  const d = new Date(
    `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T${hh.padStart(2, '0')}:${mi}:00+07:00`
  );
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

async function fetchKompas() {
  const html = await (await fetchRetry(KOMPAS_URL)).text();
  const rows = [];
  for (const part of html.split('class="tren__link"').slice(1)) {
    const block = part.slice(0, 2500);
    const linkM = block.match(/^\s*href="(https:\/\/health\.kompas\.com\/read\/[^"]+)"/);
    const titleM = block.match(/<img[^>]*\balt="([^"]+)"/);
    const dateM = block.match(/class="tren__date">([^<]+)</);
    if (!linkM || !titleM || !dateM) continue;
    const title = decodeEntities(titleM[1]);
    const pubDate = kompasDateToIso(dateM[1]);
    if (!title || !pubDate) continue;
    rows.push({ title, link: decodeEntities(linkM[1]), source: KOMPAS_SOURCE, pubDate });
  }
  return rows;
}

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okSources = 0;
for (const [name, fn] of [
  [DETIK_SOURCE, fetchDetik],
  [KOMPAS_SOURCE, fetchKompas],
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
  console.error('모든 수집원을 읽지 못했습니다. 기존 id/news.json을 유지합니다.');
  process.exit(1);
}

const fresh = collected.filter((r) => AI_RE.test(r.title) && MED_RE.test(r.title));

// ── 기존 항목과 병합 (누적) ────────────────────────────
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`id/news.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
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

// 변경이 없으면 파일을 건드리지 않는다 — 커밋·배포를 만들지 않기 위해.
if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 기사 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n',
  'utf8'
);

const by = (s) => items.filter((i) => i.source === s).length;
console.log(
  `수집 완료: AI 관련 판정 ${fresh.length}건 / 누적 ${items.length}건 ` +
    `(detikHealth ${by(DETIK_SOURCE)}건, Kompas Health ${by(KOMPAS_SOURCE)}건)`
);
