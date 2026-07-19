// 병원·의료 AI 뉴스 수집기 (매체 지면 직접 크롤링)
//
// 두 매체에서 AI 관련이 분명한 기사만 골라 src/data/news.json에 쌓는다.
//   1) 메디칼타임즈(medicaltimes.com) '의료기기·AI' 섹션(MainCate=4)
//   2) 병원신문(khanews.com) 전체 기사 목록 — 이 매체에는 AI 전용 지면이
//      없어 전체 목록을 읽고 같은 AI 필터로 거른다 (2026-07-20 오너 지시)
// 구글 뉴스 검색은 하루 노출분이 들쭉날쭉하고 무관 기사가 섞여, 매체의
// 해당 지면을 직접 크롤링하는 방식으로 바꿨다.
//
// 누적 정책: 기존 news.json 항목을 지우지 않고 새 기사를 병합한다
// (제목 기준 중복 제거). GitHub Actions가 3시간 간격으로 실행한다 —
// GitHub cron은 수 시간씩 지연될 수 있어(실측: 12~14시간), 하루 1회가
// 아니라 자주 돌리고 "새 기사가 있을 때만" 커밋하는 방식으로 보완한다.
//
// 한 매체가 실패해도 다른 매체 수집은 계속한다. 두 매체 모두 한 건도 읽지
// 못한 경우에만 기존 파일을 그대로 두고 중단한다.
import { readFile, writeFile } from 'node:fs/promises';

const LIST_URL = 'https://www.medicaltimes.com/Main/News/List.html?MainCate=4';
const ARTICLE_URL = (id) =>
  `https://www.medicaltimes.com/Main/News/NewsView.html?ID=${id}`;
const PAGES = 3; // 목록 페이지 수 (최근 며칠치 + 과거 이력 시딩)
const MAX_ITEMS = 500; // 누적 상한 (오래된 것부터, 이 수를 넘을 때만 잘라냄)
const SOURCE = '메디칼타임즈';

// ── 병원신문 ──────────────────────────────────────────
// 전체 기사 목록(섹션 구분 없음)을 최신순으로 읽는다.
// 페이지 넘김은 하지 않는다 — 이 사이트는 page 파라미터를 줘도(공식
// 페이지네이션 링크 형식인 page=N&total=...&box_idxno= 까지 포함해도)
// 서버가 항상 1페이지를 돌려준다(2026-07-20 확인). 1페이지가 최근 4~5일치
// 약 20건을 담고 있고 이 워크플로는 1시간 간격으로 도므로, 새 기사를
// 놓칠 여지는 없다.
const KH_PAGES = 1;
const KH_LIST_URL = (page) =>
  `https://www.khanews.com/news/articleList.html?page=${page}`;
const KH_ARTICLE_URL = (id) =>
  `https://www.khanews.com/news/articleView.html?idxno=${id}`;
const KH_SOURCE = '병원신문';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab news fetcher';

// AI 관련성 판정용. 곁가지로 스친 언급(사진 출처 'AI 생성' 등)을 걸러내기 위해,
// 제목에 AI 신호가 있거나 본문 요약에 AI 언급이 2회 이상일 때만 채택한다.
const AI_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|인공지능|머신러닝|딥러닝|생성형|\bLLM\b|CDSS|디지털치료제|디지털 ?헬스케어|영상 ?판독|판독 ?보조|신약개발/g;

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

const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

// 사진 출처 등 곁가지 AI 언급 제거 후 매칭에 사용
const denoise = (s) => s.replace(/\(?\s*사진\s*=\s*AI[^)]*\)?/g, '');

function isAiRelevant(title, summary) {
  AI_RE.lastIndex = 0;
  if (AI_RE.test(title)) return true;
  const matches = denoise(summary).match(AI_RE);
  return !!matches && matches.length >= 2;
}

// KST 문자열("2026-07-06 17:55:24")을 ISO(UTC)로 변환
function kstToIso(s) {
  const iso = s.trim().replace(' ', 'T') + '+09:00';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// 지면 상단 헤드라인 영역(listTop_wrap)의 기사를 파싱한다.
// 이 영역은 newsListWrap 위에 있고 <article class="listTop_mainNews">·
// <article class="listTop_imgNews">로 구성되며, 여기 걸린 기사는 아래
// 일반 목록(newsList_cont)에 중복해서 나오지 않는다. 즉 이 영역을 읽지
// 않으면 그 기사는 영영 수집되지 않는다. (2026-07-20 확인 — 최신 기사가
// 나흘째 누락되던 원인이었다.)
// 다만 이 영역에는 날짜가 표시되지 않으므로, 날짜는 본문 페이지에서
// 따로 읽어 온다(fetchArticleMeta).
function parseTopRows(html) {
  const start = html.indexOf('listTop_wrap');
  if (start < 0) return [];
  const end = html.indexOf('newsListWrap');
  const region = html.slice(start, end > start ? end : undefined);
  const rows = [];
  for (const part of region.split(/<article class="listTop_/).slice(1)) {
    const block = part.split('</article>')[0];
    const idM = block.match(/NewsView\.html\?ID=(\d+)/);
    const titleM = block.match(/headLine[^>]*>([\s\S]*?)<\/h4>/);
    if (!idM || !titleM) continue;
    const title = stripTags(titleM[1]);
    if (!title) continue;
    rows.push({ id: idM[1], title });
  }
  return rows;
}

// 본문 페이지에서 발행일과 요약을 읽는다.
// 발행일은 페이지에 박혀 있는 JSON의 "Publish_date" 값을 쓴다(목록의
// 날짜 표기와 같은 KST 기준). 요약은 og:description을 쓴다 — AI 관련성
// 판정에 제목만으로는 부족할 때가 있기 때문이다.
async function fetchArticleMeta(id) {
  const res = await fetch(ARTICLE_URL(id), {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab news fetcher',
    },
  });
  if (!res.ok) throw new Error(`본문 요청 실패(ID ${id}): HTTP ${res.status}`);
  const html = await res.text();
  const dateM = html.match(
    /"Publish_date":"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/
  );
  if (!dateM) throw new Error(`발행일을 찾지 못함(ID ${id})`);
  const pubDate = kstToIso(dateM[1]);
  if (!pubDate) throw new Error(`발행일 형식 이상(ID ${id}): ${dateM[1]}`);
  const summM = html.match(/<meta property="og:description" content="([^"]*)"/);
  return { pubDate, summary: summM ? decodeEntities(summM[1]) : '' };
}

async function fetchPage(page) {
  const url = page > 1 ? `${LIST_URL}&page=${page}` : LIST_URL;
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab news fetcher',
    },
  });
  if (!res.ok) throw new Error(`목록 요청 실패(page ${page}): HTTP ${res.status}`);
  const html = await res.text();
  const start = html.indexOf('newsListWrap');
  const region = start >= 0 ? html.slice(start) : html;
  const rows = [];
  // 각 기사는 <article class="newsList_cont ..."> 로 시작하고, 그 블록의
  // 첫 <a href=".../NewsView.html?ID=N"> 가 이 기사의 링크다. (기사 링크가
  // 이미지 div를 감싸므로, 이미지 마커로 자르면 ID가 어긋난다 — 반드시
  // article 블록 단위로 파싱한다.)
  for (const part of region.split(/<article class="newsList_cont\b/).slice(1)) {
    const block = part.split('</article>')[0];
    const idM = block.match(/NewsView\.html\?ID=(\d+)/);
    const titleM = block.match(/headLine">([\s\S]*?)<\/h4>/);
    const dateM = block.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
    const summM = block.match(/list_txt">([\s\S]*?)<\/div>/);
    if (!idM || !titleM || !dateM) continue;
    const pubDate = kstToIso(dateM[1]);
    if (!pubDate) continue;
    rows.push({
      id: idM[1],
      title: stripTags(titleM[1]),
      summary: summM ? stripTags(summM[1]) : '',
      pubDate,
    });
  }
  return { rows, topRows: parseTopRows(html) };
}

// 병원신문 목록 파싱.
// 각 기사는 <div class="table-row"> 블록이고, 그 안에
//   <a href="/news/articleView.html?idxno=N" class="links"><strong>제목</strong></a>
//   <div class="list-dated ...">병원신문 | 2026-07-20 06:00</div>
// 형태다. 목록에 요약문이 없어서 AI 관련성은 제목으로만 판정한다
// (메디칼타임즈의 "제목에 AI 신호가 있으면 채택"과 같은 기준).
async function fetchKhPage(page) {
  const res = await fetch(KH_LIST_URL(page), { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`병원신문 목록 실패(page ${page}): HTTP ${res.status}`);
  const html = await res.text();
  const rows = [];
  for (const part of html.split('<div class="table-row">').slice(1)) {
    const block = part.split('</div>\n</div>')[0].slice(0, 2000);
    const idM = block.match(/articleView\.html\?idxno=(\d+)/);
    const titleM = block.match(/class="links"[^>]*>\s*<strong>([\s\S]*?)<\/strong>/);
    const dateM = block.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
    if (!idM || !titleM || !dateM) continue;
    const pubDate = kstToIso(dateM[1]);
    if (!pubDate) continue;
    const title = stripTags(titleM[1]);
    if (!title) continue;
    rows.push({
      title,
      link: KH_ARTICLE_URL(idM[1]),
      source: KH_SOURCE,
      summary: '', // 목록에 요약이 없다 — 제목으로만 판정
      pubDate,
    });
  }
  return rows;
}

// ── 기존 목록 읽기 ─────────────────────────────────────
// 파일이 "없는" 경우만 빈 목록으로 시작한다. 파싱 실패(손상)는 중단 —
// 그대로 진행하면 누적 이력이 최근 수집분만으로 리셋되기 때문.
// (상단 헤드라인 기사의 본문을 불필요하게 다시 받지 않으려면 이미
//  수집한 기사 목록을 먼저 알아야 하므로 수집보다 앞에 둔다.)
let existing = [];
try {
  const prev = JSON.parse(
    await readFile(new URL('../src/data/news.json', import.meta.url), 'utf8')
  );
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`news.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

const knownIds = new Set(
  existing
    .map((it) => (it.link || '').match(/ID=(\d+)/))
    .filter(Boolean)
    .map((m) => m[1])
);

// ── 수집 ──────────────────────────────────────────────
const collected = [];
const topSeen = new Map();
let okPages = 0;
for (let p = 1; p <= PAGES; p++) {
  try {
    const { rows, topRows } = await fetchPage(p);
    collected.push(...rows);
    for (const t of topRows) if (!topSeen.has(t.id)) topSeen.set(t.id, t);
    okPages++;
  } catch (e) {
    console.error(`수집 실패 — ${e.message}`);
  }
}

// 병원신문 수집 (한 매체가 실패해도 다른 매체는 계속한다)
let khPages = 0;
for (let p = 1; p <= KH_PAGES; p++) {
  try {
    collected.push(...(await fetchKhPage(p)));
    khPages++;
  } catch (e) {
    console.error(`병원신문 수집 실패 — ${e.message}`);
  }
}

// 두 매체 모두 한 페이지도 못 읽었으면 기존 news.json을 덮어쓰지 않고 종료
if (okPages === 0 && khPages === 0) {
  console.error('두 매체 모두 목록을 읽지 못했습니다. 기존 news.json을 유지합니다.');
  process.exit(1);
}

// 상단 헤드라인 기사 중 아직 수집하지 않은 것만 본문을 읽어 날짜를 채운다.
// 한 건이 실패해도 나머지 수집을 멈추지 않는다.
let topAdded = 0;
for (const t of topSeen.values()) {
  if (knownIds.has(t.id)) continue;
  try {
    const meta = await fetchArticleMeta(t.id);
    collected.push({ id: t.id, title: t.title, ...meta });
    topAdded++;
  } catch (e) {
    console.error(`상단 기사 건너뜀 — ${e.message}`);
  }
}

// AI 관련 기사만, 직접 링크 형태로 정리
// 매체별로 link·source가 이미 붙어 있으면 그대로 쓰고, 메디칼타임즈 항목은
// id로 링크를 만든다.
const fresh = collected
  .filter((r) => isAiRelevant(r.title, r.summary))
  .map((r) => ({
    title: r.title,
    link: r.link || ARTICLE_URL(r.id),
    source: r.source || SOURCE,
    pubDate: r.pubDate,
  }));

// ── 기존 항목과 병합 (누적) ────────────────────────────
const now = new Date();
const seen = new Set();
const norm = (t) => (t || '').replace(/\s+/g, '');
// 새 기사(직접 링크)를 앞에 두어, 같은 제목이면 새 항목이 채택되도록 한다
const items = [...fresh, ...existing]
  .filter((it) => {
    const key = norm(it.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

// 목록이 그대로면 파일을 건드리지 않는다 — 이 스크립트는 하루 여러 번
// 돌기 때문에(GitHub cron 지연 대비), 변경 없는 실행이 커밋·배포를
// 만들지 않도록 여기서 조용히 끝낸다.
if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 기사 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

const data = {
  updatedAt: now.toISOString(),
  source: `${SOURCE}·${KH_SOURCE}`,
  items,
};

await writeFile(
  new URL('../src/data/news.json', import.meta.url),
  JSON.stringify(data, null, 2) + '\n',
  'utf8'
);
const bySource = (s) => items.filter((i) => i.source === s).length;
console.log(
  `수집 완료: 신규 ${fresh.length}건 / 누적 ${items.length}건 ` +
    `(메디칼타임즈 ${bySource(SOURCE)}건·페이지 ${okPages}/${PAGES}·상단 ${topAdded}건 보충, ` +
    `병원신문 ${bySource(KH_SOURCE)}건·페이지 ${khPages}/${KH_PAGES})`
);
