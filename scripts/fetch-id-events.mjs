// 인도네시아어판 의료 AI·디지털 교육·행사 수집기 (2026-09-06 신설)
//
// 병원 종사자가 신청할 수 있는 교육(pelatihan)·워크숍(workshop)·세미나·
// 웨비나 소식을 모아 src/data/id/events.json에 쌓는다.
// 본문을 옮기지 않고 원문으로 링크만 건다.
//
// 수집원 (2026-09-06 확대)
//   1) PERSI 행사 분류 — 682 Info Pelatihan, 338 Event News.
//      분류 자체가 교육·행사라 **주제만 맞으면 채택**한다.
//   2) PERSI 일반 분류 — 683 Berita Kanal PERSI, 1 Berita Persi.
//      여기는 행사가 아닌 기사가 대부분이라 **주제 + 행사 조건을 함께** 본다.
//      실측(2026-09-06): 683은 100건 중 6건, 1은 100건 중 2건이 통과했고
//      전부 실제 웨비나·워크숍이었다("700 RS Ikuti Webinar Implementasi AI").
//   3) 보건부(Kemenkes) 보도자료 — 2026-09-07 추가.
//      `/id/category/rilis-berita` 목록을 읽는다. 46KB에 최신 12건.
//      ⚠️ 2026-09-06에 "Kemenkes는 클라이언트 렌더링이라 못 쓴다"고 적어
//      두었는데 **틀린 판단이었다.** `/id/berita`가 404라서 빈 페이지를
//      받은 것을 SPA로 오인했다. 실제로는 Yii 기반 서버 렌더링이고,
//      브라우저로 홈에서 링크를 따라가 올바른 경로를 찾았다.
//      ⚠️ `?page=` 파라미터는 무시된다(어느 쪽수든 같은 12건). 그래서
//      이력은 못 긁고 최신만 본다 — 하루 3회 돌며 쌓이는 구조라 괜찮다.
//      과거분이 필요하면 아래 KEMKES_BACKFILL 참고.
//   4) PORMIKI(의무기록·보건정보 전문가협회) — 2026-09-07 추가.
//      워드프레스 REST API. 글 수가 적지만(2026-09-07 기준 13건)
//      **전자의무기록·코딩 교육을 직접 주최하는 단체**라 이 사이트
//      독자와 정확히 겹친다.
//   5) src/data/id/news.json — 이미 누적된 뉴스에서 행사성 기사를 끌어온다.
//      대만어판 수집기가 tw/news.json에 하는 것과 같은 방식이다.
//      뉴스 수집기가 새 행사 기사를 가져오면 여기에 자동 반영되므로
//      같은 글을 두 번 긁지 않는다.
//
// ⚠️ 과거분 채우기: `KEMKES_BACKFILL=1 node scripts/fetch-id-events.mjs`
//    로 돌리면 목록 대신 Kemenkes RSS 전체(7,919건·33MB)를 읽는다.
//    평소에는 절대 켜지 말 것 — 33MB를 하루 세 번 받을 이유가 없다.
//    2026-09-07에 한 번 돌려 과거 행사 4건을 채웠다.
//
// ⚠️ 필터를 좁게 잡았다. PERSI 교육은 대부분 감염관리(IPCN)·환자안전·CSSD·
//    재무처럼 **디지털과 무관한 일반 병원 교육**이다. 넓게 잡으면(예: 'data'·
//    'teknologi'·'informasi' 같은 흔한 낱말) 100건 중 44건이 통과하는데 실제로
//    맞는 것은 그중 일부뿐이었다. 그래서 전자의무기록(RME)·코딩(iDRG·INA-CBG)·
//    SATUSEHAT·AI처럼 **주제를 특정하는 말**만 본다.
//    실측(2026-09-06): 682·338 100건 중 12건 통과, 전부 실제로 관련 있는 교육이었다.
//
// ⚠️ 시험했다가 **안 쓴 수집원**(다시 시험하느라 시간 쓰지 말 것, 2026-09-07):
//    · detik.com 검색 — 파싱은 잘 된다(article.list-content__item, d-time
//      유닉스 타임스탬프). 그런데 검색어 6개 55건에서 조건 통과 0건이었다.
//      인도네시아 언론은 디지털 의료를 다루면서도 **표제에 행사 낱말을
//      거의 안 쓴다.** 대만 中央社가 통했던 방식이 여기서는 안 통한다.
//    · Eventbrite 인도네시아 — JSON-LD Event가 깔끔하게 나오는데(쪽당 17~19건)
//      웰니스 리트릿·일반 AI 창업 워크숍이라 병원 실무와 안 맞는다.
//    · Kemenkes 행사 캘린더(`/id/agenda-kegiatan/all`) — fullcalendar 인데
//      내용이 '세계 간질의 날' 같은 **기념일**이라 교육·행사가 아니다.
//    · kompas 검색·tempo(403)·komdigi(403)·loket.com(Event 마크업 없음)·
//      arssi.or.id·perdalin.org·asklin.or.id(응답 없음)·IAKMI(REST 미개방)·
//      lms.kemkes.go.id(403)·plataransehat(응답 없음).
//    · SNS(인스타그램·X·페이스북) — 로그인·유료 API를 요구하고 자동 수집이
//      약관에 어긋난다. 우회하지 않는다.
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
const NEWS = new URL('../src/data/id/news.json', import.meta.url);

// 분류마다 조건이 다르다 — [분류 번호, 이름, 행사 조건도 함께 볼 것인가]
const PERSI_CATEGORIES = [
  ['682', 'Info Pelatihan', false],
  ['338', 'Event News', false],
  ['683', 'Berita Kanal PERSI', true],
  ['1', 'Berita Persi', true],
];
const persiApi = (cat) =>
  `https://www.persi.or.id/wp-json/wp/v2/posts?per_page=100&categories=${cat}&_fields=date_gmt,link,title`;

const KEMKES_SOURCE = 'Kemenkes';
const KEMKES_LIST = 'https://www.kemkes.go.id/id/category/rilis-berita';
const KEMKES_RSS = 'https://www.kemkes.go.id/id/rss/article/rilis-berita';
const KEMKES_BACKFILL = process.env.KEMKES_BACKFILL === '1';

const PORMIKI_SOURCE = 'PORMIKI';
const PORMIKI_API =
  'https://www.pormiki.or.id/wp-json/wp/v2/posts?per_page=100&_fields=date_gmt,link,title';

// 주제를 특정하는 말만 본다. 흔한 낱말(data·teknologi·informasi 단독)은 넣지 않는다.
const TOPIC_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|kecerdasan buatan|kecerdasan artifisial|digital|digitalisasi|rekam medis elektronik|(?<![A-Za-z])RME(?![A-Za-z])|satusehat|telemedisin|sistem informasi|(?<![A-Za-z])iDRG(?![A-Za-z])|INA[- ]?CBG|koding|health technology assessment|(?<![A-Za-z])HTA(?![A-Za-z])|siber|teknologi informasi/i;

// 행사 신호 — '참석·신청할 수 있는 자리'인가.
// ⚠️ 'gelar'는 'menggelar/digelar'(개최하다)로 쓰이므로 낱말 경계를 두지 않으면
//    'gelar akademik'(학위) 같은 말에도 걸린다. 어간 형태만 본다.
const EVENT_RE =
  /pelatihan|workshop|seminar|webinar|lokakarya|simposium|kongres|konferensi|pameran|expo|forum|sosialisasi|bimbingan teknis|bimtek|digelar|menggelar|menyelenggarakan|diselenggarakan|pendaftaran|call for/i;

// 정부 보도자료용 — **모이는 자리**만 본다.
// EVENT_RE 와 달리 'luncurkan'(출시)·'resmikan'(준공)을 일부러 뺐다.
// 보건부 보도자료의 대부분이 그 두 낱말이라 넣으면 참석할 수 없는
// 제도 발표가 교육·행사 목록에 섞인다(2026-09-07 실측: 넣으면 16건,
// 빼면 4건인데 뺀 4건이 전부 실제로 모이는 자리였다).
const GATHERING_RE =
  /pelatihan|workshop|seminar|webinar|lokakarya|simposium|kongres|konferensi|pameran|forum|sosialisasi|bimbingan teknis|bimtek|rakerkesnas|rakernas|munas|pertemuan|hackathon/i;

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

// timeoutMs — 기본 25초로 충분하지만 Kemenkes 과거분 RSS는 33MB라 모자란다.
async function fetchRetry(url, tries = 3, timeoutMs = 25000) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept: 'application/json,*/*;q=0.8', 'accept-language': 'id-ID,id;q=0.9' },
        signal: AbortSignal.timeout(timeoutMs),
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
async function fetchPersi(cat) {
  const rows = await (await fetchRetry(persiApi(cat))).json();
  if (!Array.isArray(rows)) throw new Error('예상과 다른 응답(배열이 아님)');
  return rows
    .map((p) => {
      const title = stripTags(p?.title?.rendered ?? '');
      const d = new Date(`${p?.date_gmt}Z`);
      if (!title || !p?.link || Number.isNaN(d.getTime())) return null;
      return { title, link: p.link, source: PERSI_SOURCE, pubDate: d.toISOString() };
    })
    .filter(Boolean);
}

// ── Kemenkes 보도자료 ────────────────────────────────
// 목록 카드 한 장이 이 모양이다(공백은 줄바꿈으로 들어온다):
//   <a href="/id/<slug>" class="link"> … <h4 class="text-20">제목</h4>
//   … <time datetime="2026-09-01">
// 제목이 <a> 안 깊숙이 있어서 링크→제목→날짜를 한 정규식으로 잇는다.
async function fetchKemkesList() {
  const html = await (await fetchRetry(KEMKES_LIST)).text();
  const rows = [];
  for (const m of html.matchAll(
    /href="(\/id\/[a-z0-9][a-z0-9-]{14,})"[^>]*class="link"[\s\S]{0,600}?<h4[^>]*>([\s\S]*?)<\/h4>[\s\S]{0,300}?<time datetime="(\d{4}-\d{2}-\d{2})"/g
  )) {
    const title = stripTags(m[2]);
    const d = new Date(`${m[3]}T12:00:00+07:00`);
    if (!title || Number.isNaN(d.getTime())) continue;
    rows.push({
      title,
      link: 'https://www.kemkes.go.id' + m[1],
      source: KEMKES_SOURCE,
      pubDate: d.toISOString(),
    });
  }
  return rows;
}

// 과거분 채우기 전용. 33MB라 평소에는 쓰지 않는다(머리말 참고).
async function fetchKemkesRss() {
  const xml = await (await fetchRetry(KEMKES_RSS, 2, 180000)).text();
  const rows = [];
  for (const block of xml.split('<item>').slice(1)) {
    const t = block.match(/<title>([\s\S]*?)<\/title>/);
    const l = block.match(/<link>([\s\S]*?)<\/link>/);
    const p = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    if (!t || !l) continue;
    const title = stripTags(t[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'));
    const link = stripTags(l[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'));
    const d = p ? new Date(stripTags(p[1])) : null;
    if (!title || !link || !d || Number.isNaN(d.getTime())) continue;
    rows.push({ title, link, source: KEMKES_SOURCE, pubDate: d.toISOString() });
  }
  return rows;
}

// ── PORMIKI (워드프레스 REST API) ──────────────────────
async function fetchPormiki() {
  const rows = await (await fetchRetry(PORMIKI_API)).json();
  if (!Array.isArray(rows)) throw new Error('예상과 다른 응답(배열이 아님)');
  return rows
    .map((p) => {
      const title = stripTags(p?.title?.rendered ?? '');
      const d = new Date(`${p?.date_gmt}Z`);
      if (!title || !p?.link || Number.isNaN(d.getTime())) return null;
      return { title, link: p.link, source: PORMIKI_SOURCE, pubDate: d.toISOString() };
    })
    .filter(Boolean);
}

const collected = [];
let okSources = 0;

for (const [cat, name, needEvent] of PERSI_CATEGORIES) {
  try {
    const rows = await fetchPersi(cat);
    const kept = rows.filter(
      (r) => TOPIC_RE.test(r.title) && (!needEvent || EVENT_RE.test(r.title))
    );
    collected.push(...kept);
    okSources++;
    console.log(
      `${PERSI_SOURCE}/${name}: ${rows.length}건 중 ${kept.length}건 채택` +
        (needEvent ? ' (주제+행사)' : ' (주제)')
    );
  } catch (e) {
    console.error(`${PERSI_SOURCE}/${name} 수집 실패 — ${e.message}`);
  }
}

// 보건부 보도자료 — 정부가 직접 내는 공지라 협회 소식과 겹치지 않는다.
// 여기는 행사가 아닌 발표가 대부분이라 **주제 + 모이는 자리** 둘 다 본다.
try {
  const rows = KEMKES_BACKFILL ? await fetchKemkesRss() : await fetchKemkesList();
  const kept = rows.filter((r) => TOPIC_RE.test(r.title) && GATHERING_RE.test(r.title));
  collected.push(...kept);
  okSources++;
  console.log(
    `${KEMKES_SOURCE}${KEMKES_BACKFILL ? '(과거분)' : ''}: ${rows.length}건 중 ${kept.length}건 채택 (주제+모이는 자리)`
  );
} catch (e) {
  console.error(`${KEMKES_SOURCE} 수집 실패 — ${e.message}`);
}

// PORMIKI — 의무기록·보건정보 전문가협회. 교육을 직접 주최한다.
try {
  const rows = await fetchPormiki();
  const kept = rows.filter((r) => TOPIC_RE.test(r.title) && EVENT_RE.test(r.title));
  collected.push(...kept);
  okSources++;
  console.log(`${PORMIKI_SOURCE}: ${rows.length}건 중 ${kept.length}건 채택 (주제+행사)`);
} catch (e) {
  console.error(`${PORMIKI_SOURCE} 수집 실패 — ${e.message}`);
}

// 이미 쌓인 뉴스에서 행사성 기사를 끌어온다. 실패해도 치명적이지 않다.
// 여기는 뉴스라 반드시 행사 조건까지 본다.
try {
  const news = JSON.parse(await readFile(NEWS, 'utf8'));
  const rows = news.items ?? [];
  const kept = rows.filter((r) => TOPIC_RE.test(r.title) && EVENT_RE.test(r.title));
  collected.push(...kept);
  okSources++;
  console.log(`뉴스 누적분에서: ${rows.length}건 중 ${kept.length}건 행사성`);
} catch (e) {
  console.error(`id/news.json 읽기 실패 — ${e.message}`);
}

if (okSources === 0) {
  console.error('모든 수집원을 읽지 못했습니다. 기존 id/events.json을 유지합니다.');
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
  JSON.stringify({ updatedAt: new Date().toISOString(), source: `${PERSI_SOURCE}·${KEMKES_SOURCE}·${PORMIKI_SOURCE}`, items }, null, 2) + '\n',
  'utf8'
);
console.log(`수집 완료: 누적 ${items.length}건`);
