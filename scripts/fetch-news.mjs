// 병원·보건·의료 AI 뉴스 수집기
// 구글 뉴스 RSS 검색 결과에서 최근 24시간 기사를 모아 src/data/news.json으로 저장한다.
// GitHub Actions(.github/workflows/update-news.yml)가 매일 KST 07:00에 실행한다.
import { writeFile } from 'node:fs/promises';

const QUERIES = [
  '병원 AI when:1d',
  '의료 인공지능 when:1d',
  '의료 AI when:1d',
  '보건 인공지능 when:1d',
  '간호 AI when:1d',
  '헬스케어 AI when:1d',
];

const MAX_ITEMS = 30;
const WINDOW_HOURS = 24;

// 구글 뉴스 검색이 느슨하게 매칭한 무관 기사를 거르는 제목 필터:
// 의료 계열 키워드와 AI 계열 키워드가 제목에 모두 있어야 통과한다.
const MEDICAL_RE =
  /병원|의료|보건|간호|헬스케어|바이오헬스|제약|진료|환자|식약처|의학|메디컬|요양|신약|임상|질병|건강보험|심평원|EMR|의사|치과|한의/i;
const AI_RE = /AI|인공지능|머신러닝|딥러닝|생성형|챗GPT|GPT|LLM|디지털헬스|디지털 헬스/i;

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1]) : '';
}

async function fetchQuery(q) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`;
  const res = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (hospital-ai-lab news fetcher)' },
  });
  if (!res.ok) throw new Error(`"${q}" 요청 실패: HTTP ${res.status}`);
  const xml = await res.text();
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const title = pick(block, 'title');
    const link = pick(block, 'link');
    const pubDate = pick(block, 'pubDate');
    const source = pick(block, 'source');
    if (title && link && pubDate) {
      items.push({ title, link, source, pubDate: new Date(pubDate).toISOString() });
    }
  }
  return items;
}

const now = new Date();
const from = new Date(now.getTime() - WINDOW_HOURS * 60 * 60 * 1000);

const all = [];
let okCount = 0;
for (const q of QUERIES) {
  try {
    all.push(...(await fetchQuery(q)));
    okCount++;
  } catch (e) {
    console.error(`수집 실패 — ${e.message}`);
  }
}

// 전 쿼리 실패 시 기존 news.json을 덮어쓰지 않도록 실패 종료
if (okCount === 0) {
  console.error('모든 쿼리가 실패했습니다. 기존 news.json을 유지합니다.');
  process.exit(1);
}

const seen = new Set();
const items = all
  // 수집 기간: 실행 시각 기준 직전 24시간
  .filter((it) => {
    const d = new Date(it.pubDate);
    return d >= from && d <= now;
  })
  // 구글 뉴스 제목 꼬리(" - 언론사") 제거
  .map((it) => ({
    ...it,
    title:
      it.source && it.title.endsWith(` - ${it.source}`)
        ? it.title.slice(0, -(it.source.length + 3)).trim()
        : it.title,
  }))
  // 제목 기준 중복 제거 (여러 쿼리에 같은 기사가 걸리는 경우)
  .filter((it) => {
    const key = it.title.replace(/\s+/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  // 관련성 필터: 의료 키워드 + AI 키워드가 제목에 모두 있어야 함
  .filter((it) => MEDICAL_RE.test(it.title) && AI_RE.test(it.title))
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

const data = {
  updatedAt: now.toISOString(),
  windowFrom: from.toISOString(),
  windowTo: now.toISOString(),
  items,
};

await writeFile(
  new URL('../src/data/news.json', import.meta.url),
  JSON.stringify(data, null, 2) + '\n',
  'utf8'
);
console.log(`수집 완료: ${items.length}건 (쿼리 ${okCount}/${QUERIES.length} 성공)`);
