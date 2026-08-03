// 일본 보조금·조성금 수집기 (jGrants 공개 API — 디지털청)
//
// 일본 의료기관이 신청할 수 있는 **모집 중인** 보조금을 모아
// src/data/ja/subsidies.json에 쌓는다. 본문은 옮기지 않고 공식 상세 페이지로
// 링크만 건다(저작권·정확성 모두 원문이 기준).
//
// ── API 사용법 (2026-07-31 실측으로 확인한 것) ─────────────
//   GET https://api.jgrants-portal.go.jp/exp/v1/public/subsidies
//   ⚠️ keyword·sort·order·acceptance **4개가 전부 필수**다. 하나라도 빠지면
//      400 Bad Request가 나고, 응답 본문에 이유가 안 적혀 있어 원인 찾기가 어렵다.
//      (작업지시서 예제 코드는 acceptance만 넣고 sort/order를 빼서 400이 났다.)
//   ⚠️ keyword는 2글자 이상.
//   ⚠️ 목록 API에 "전건 조회" 파라미터가 없다. 그래서 포괄 키워드를 순회하며
//      id로 중복 제거해 실질 전량을 모은다.
//   ⚠️ 상세는 v1·v2 둘 다 200이지만 목록 v2는 404다. 여기서는 v1으로 통일한다.
//
// 응답 필드: id, name(보조금 코드), title, subsidy_max_limit, subsidy_rate,
//            acceptance_start_datetime, acceptance_end_datetime,
//            target_area_search, target_number_of_employees, institution_name,
//            front_subsidy_detail_page_url(상세에만)
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const OUT = new URL('../src/data/ja/subsidies.json', import.meta.url);
const BASE = 'https://api.jgrants-portal.go.jp/exp/v1/public';
const MAX_ITEMS = 300;

// ⚠️ 외부 API에서 온 문자열은 그대로 믿지 않는다(보안).
//    공모 제목에 '<' 나 '</script>' 같은 글자가 한 번이라도 섞여 들어오면,
//    그 값이 /ja/subsidies/ 의 구조화 데이터(JSON-LD)에 실려 나가고,
//    이 수집기는 GitHub Actions가 자동 커밋·자동 배포하므로 사람 손을 전혀
//    거치지 않고 방문자 브라우저까지 도달한다.
//    (레이아웃(JaLayout.astro)에도 이스케이프를 넣어 두었지만, 애초에
//     저장하지 않는 것이 한 겹 더 안전하다.)
//    제어문자 제거 → '<' 제거 → 공백 정리 → 길이 제한.
const cleanText = (v, max = 300) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, ' ')
    .replace(/</g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

/** 링크는 http(s) 절대 주소만 통과시킨다. 아니면 빈 문자열을 돌려준다. */
const cleanUrl = (v) => {
  const s = cleanText(v, 500);
  return /^https?:\/\//i.test(s) ? s : '';
};

// 의료·병원 관련 보조금을 폭넓게 건지는 키워드.
// jGrants는 키워드가 제목·본문 어디에든 걸리면 반환하므로, 여기서 넓게 받고
// 아래 isRelevant()로 좁힌다.
const KEYWORDS = [
  '医療',
  '病院',
  '診療所',
  'クリニック',
  '介護',
  '看護',
  '電子カルテ',
  '医療DX',
  'デジタル化',
  'AI導入',
];

// 의료기관과 무관한 보조금을 걸러낸다.
// jGrants 키워드 검색은 '医療' 한 글자만 스쳐도 잡히기 때문에(예: 제조업
// 지원사업의 '의료기기 부품' 언급) 제목·대상 업종을 함께 본다.
const MED_RE =
  /医療|病院|診療所|クリニック|歯科|薬局|介護|看護|保健|ヘルスケア|医師|医療機関|診療|health|medical/i;

// 보조금 성격이 아닌 것(융자·세제 안내 등)은 제외
const EXCLUDE_RE = /融資|貸付|税制|入札|職員採用/;

const UA = 'hospital-ai-lab.com subsidy fetcher (contact: choyj80@naver.com)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': UA },
        signal: AbortSignal.timeout(25000),
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

async function fetchByKeyword(keyword) {
  const u = new URL(`${BASE}/subsidies`);
  u.searchParams.set('keyword', keyword);
  u.searchParams.set('sort', 'acceptance_end_datetime');
  u.searchParams.set('order', 'ASC');
  u.searchParams.set('acceptance', '1'); // 모집 중만
  const res = await fetchRetry(u.toString());
  const json = await res.json();
  return Array.isArray(json.result) ? json.result : [];
}

const isRelevant = (row) => {
  const text = `${row.title ?? ''} ${row.target_area_search ?? ''}`;
  if (EXCLUDE_RE.test(text)) return false;
  return MED_RE.test(text);
};

// ── 수집 ──────────────────────────────────────────────
const seen = new Map();
let okKeywords = 0;
for (const kw of KEYWORDS) {
  try {
    const rows = await fetchByKeyword(kw);
    let added = 0;
    for (const r of rows) {
      if (!r.id || seen.has(r.id)) continue;
      seen.set(r.id, r);
      added++;
    }
    okKeywords++;
    console.log(`  ${kw}: ${rows.length}건 (신규 ${added})`);
  } catch (e) {
    console.error(`  ${kw} 실패 — ${e.message}`);
  }
  await sleep(400); // rate limit 예의
}

if (okKeywords === 0) {
  console.error('jGrants API를 한 번도 읽지 못했습니다. 기존 파일을 유지합니다.');
  process.exit(1);
}

const relevant = [...seen.values()].filter(isRelevant);
console.log(`전체 ${seen.size}건 → 의료 관련 ${relevant.length}건`);

// 상세를 받아 공식 페이지 URL과 보조율을 채운다.
// 목록 API에는 front_subsidy_detail_page_url이 없어서 상세를 한 번 더 부른다.
// 건수가 많지 않아(수십 건) 부담이 크지 않다.
const items = [];
for (const r of relevant) {
  let detail = {};
  try {
    const res = await fetchRetry(`${BASE}/subsidies/id/${r.id}`, 2);
    const json = await res.json();
    detail = (Array.isArray(json.result) ? json.result[0] : json.result) ?? {};
  } catch (e) {
    console.error(`  상세 실패(${r.id}) — ${e.message}`);
  }
  const id = cleanText(r.id, 100);
  items.push({
    id,
    title: cleanText(r.title),
    // 공식 상세 페이지. 못 받았으면 jGrants 표준 주소로 조립한다.
    // (받은 주소가 http(s) 절대 주소가 아니면 믿지 않고 표준 주소를 쓴다)
    link:
      cleanUrl(detail.front_subsidy_detail_page_url) ||
      `https://www.jgrants-portal.go.jp/subsidy/${encodeURIComponent(id)}`,
    // ⚠️ institution_name은 기관명이 아니라 사업명 변형이다
    //    (예: '医療機関におけるAI技術活用促進事業1'). 실시기관으로 표기하면
    //    사실 오류가 되므로 쓰지 않는다. 대신 실제로 쓸모 있는 '용도'를 담는다.
    usePurpose: cleanText(detail.use_purpose, 600),
    catchPhrase: cleanText(detail.subsidy_catch_phrase),
    maxLimit: r.subsidy_max_limit ?? detail.subsidy_max_limit ?? null,
    rate: cleanText(detail.subsidy_rate, 200),
    area: cleanText(r.target_area_search ?? detail.target_area_search, 200),
    startDate: r.acceptance_start_datetime ?? null,
    endDate: r.acceptance_end_datetime ?? null,
  });
  await sleep(250);
}

// 마감 임박 순으로 정렬(마감일 없는 것은 뒤로)
items.sort((a, b) => {
  if (!a.endDate) return 1;
  if (!b.endDate) return -1;
  return new Date(a.endDate) - new Date(b.endDate);
});

const finalItems = items.slice(0, MAX_ITEMS);

// ── 저장 (변경 없으면 파일을 건드리지 않는다) ──────────
let prevItems = null;
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  prevItems = prev.items ?? null;
} catch {
  // 파일이 없으면 처음 생성하는 것이다.
}

if (prevItems && JSON.stringify(prevItems) === JSON.stringify(finalItems)) {
  console.log(`변경 없음: ${finalItems.length}건 유지`);
  process.exit(0);
}

await mkdir(new URL('../src/data/ja/', import.meta.url), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ updatedAt: new Date().toISOString(), items: finalItems }, null, 2) + '\n',
  'utf8'
);
console.log(`저장 완료: ${finalItems.length}건`);
