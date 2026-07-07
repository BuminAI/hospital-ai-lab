// 병원·의료 AI 뉴스 수집기 (메디칼타임즈 '의료기기·AI' 지면 직접 크롤링)
//
// 메디칼타임즈(medicaltimes.com)의 '의료기기·AI' 섹션(MainCate=4) 목록을
// 직접 읽어, 그중 AI 관련이 분명한 기사만 골라 src/data/news.json에 쌓는다.
// 구글 뉴스 검색은 하루 노출분이 들쭉날쭉하고 무관 기사가 섞여, 매체의
// 해당 지면을 직접 크롤링하는 방식으로 바꿨다.
//
// 누적 정책: 기존 news.json 항목을 지우지 않고 새 기사를 병합한다
// (제목 기준 중복 제거). GitHub Actions가 3시간 간격으로 실행한다 —
// GitHub cron은 수 시간씩 지연될 수 있어(실측: 12~14시간), 하루 1회가
// 아니라 자주 돌리고 "새 기사가 있을 때만" 커밋하는 방식으로 보완한다.
import { readFile, writeFile } from 'node:fs/promises';

const LIST_URL = 'https://www.medicaltimes.com/Main/News/List.html?MainCate=4';
const ARTICLE_URL = (id) =>
  `https://www.medicaltimes.com/Main/News/NewsView.html?ID=${id}`;
const PAGES = 3; // 목록 페이지 수 (최근 며칠치 + 과거 이력 시딩)
const MAX_ITEMS = 500; // 누적 상한 (오래된 것부터, 이 수를 넘을 때만 잘라냄)
const SOURCE = '메디칼타임즈';

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
  return rows;
}

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okPages = 0;
for (let p = 1; p <= PAGES; p++) {
  try {
    collected.push(...(await fetchPage(p)));
    okPages++;
  } catch (e) {
    console.error(`수집 실패 — ${e.message}`);
  }
}

// 한 페이지도 못 읽었으면 기존 news.json을 덮어쓰지 않고 종료
if (okPages === 0) {
  console.error('목록을 한 페이지도 읽지 못했습니다. 기존 news.json을 유지합니다.');
  process.exit(1);
}

// AI 관련 기사만, 직접 링크 형태로 정리
const fresh = collected
  .filter((r) => isAiRelevant(r.title, r.summary))
  .map((r) => ({
    title: r.title,
    link: ARTICLE_URL(r.id),
    source: SOURCE,
    pubDate: r.pubDate,
  }));

// ── 기존 항목과 병합 (누적) ────────────────────────────
let existing = [];
try {
  const prev = JSON.parse(
    await readFile(new URL('../src/data/news.json', import.meta.url), 'utf8')
  );
  if (Array.isArray(prev.items)) existing = prev.items;
} catch {
  // 파일이 없거나 손상 — 새로 시작
}

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
  source: SOURCE,
  items,
};

await writeFile(
  new URL('../src/data/news.json', import.meta.url),
  JSON.stringify(data, null, 2) + '\n',
  'utf8'
);
console.log(
  `수집 완료: 신규 ${fresh.length}건 / 누적 ${items.length}건 (페이지 ${okPages}/${PAGES})`
);
