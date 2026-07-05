// 추천 강의 영상 자동 수집기
// 매주 수요일(.github/workflows/update-videos.yml)에 실행되어
// src/data/recommended-videos.json의 자동(source:"auto") 항목을 갱신한다.
// 관리자 페이지에서 수동으로 추가한 항목(source:"manual")은 절대 건드리지 않는다.
//
// 정책 (오너 지정 기준)
//  - 주제: 입문·클로드·병원·의료 (클로드 입문 또는 병원/의료 AI 영상)
//  - 기간: 최근 3개월 이내 / 조회수: 5만 이상 / 한국어 영상만
//  - 자극적·사기성 제목은 제외, 조회수순 상위 5개
//  - 모든 후보는 유튜브 oEmbed로 실제 존재·정확한 제목을 확인한 것만 싣는다
//  - 검색이 실패하면 기존 파일을 그대로 둔다(빈 목록으로 덮어쓰지 않음)
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/recommended-videos.json', import.meta.url);
const TARGET = 5; // 자동 영상 목표 개수
const RECENT_DAYS = 95; // "최근 3개월" 허용치(여유 며칠)
const MIN_VIEWS = 50000; // 조회수 5만 이상

// 입문·클로드·병원·의료 주제의 한국어 검색어
const QUERIES = [
  '클로드 입문',
  '클로드 초보자',
  '클로드 사용법',
  '클로드 코워크',
  '클로드 AI 입문',
  '병원 AI 입문',
  '의료 AI 입문',
  '의료 인공지능 입문',
  '간호 AI 입문',
];

// 최근 업로드를 우선 노출시키기 위한 "올해" 업로드 필터 (3개월은 코드에서 재확인)
const THIS_YEAR = '&sp=EgIIBQ%253D%253D';

// 핵심 주제: 클로드 또는 병원/의료 계열에 반드시 해당해야 한다
const TOPIC = /클로드|claude|병원|의료|간호|보건|헬스케어|의료진|요양/i;
// 자극적·낚시성 제목 제외
const CLICKBAIT =
  /충격|발칵|경악|소름|난리|폭로|또 터|충격적|딸깍\?|인생역전|인생 역전|대박|떼돈|억대|월수입|월 수입|자동\s*수익|시청\s*금지|안 보면 후회|보지\s*마세요|무조건|미쳤|미친|미쳐|상위\s*\d+\s*%|압도적|모르면 손해|이것만 알면|안 보면 손해|\d+\s*배|전부 공개|완전 공개|다 알려|\d+%\s*활용|\d+%는? 모르/;
// 사기·과장 수익형 제목 제외
const SCAM =
  /달러|수익|부자|퇴사|월\s*\d+\s*만|지급|억\s*번|millionaire|make you rich|money|lose thousand|must do now|expert in \d|\$\d/i;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  Cookie: 'CONSENT=YES+cb', // 동의 인터스티셜 회피
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 일시적 실패(429·네트워크)에 대비한 재시도 fetch
async function fetchRetry(url, opts = {}, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, opts);
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(1000 * (i + 1));
  }
  throw lastErr;
}

function daysAgo(pub) {
  const m = /(\d+)\s*(시간|일|주|개월|달|년)/.exec(pub || '');
  if (!m) return 99999;
  const n = Number(m[1]);
  return { 시간: 0, 일: n, 주: n * 7, 개월: n * 30, 달: n * 30, 년: n * 365 }[m[2]];
}

function walkVideos(node, out) {
  if (Array.isArray(node)) {
    for (const v of node) walkVideos(v, out);
  } else if (node && typeof node === 'object') {
    if (node.videoRenderer) {
      const v = node.videoRenderer;
      const title = (v.title?.runs || []).map((r) => r.text).join('');
      const views = Number(
        (v.viewCountText?.simpleText || '').replace(/[^0-9]/g, '') || 0
      );
      const pub = v.publishedTimeText?.simpleText || '';
      const channel = (v.ownerText?.runs || []).map((r) => r.text).join('');
      if (v.videoId && title) out.push({ videoId: v.videoId, title, views, pub, channel });
    }
    for (const k of Object.keys(node)) walkVideos(node[k], out);
  }
}

async function search(query) {
  // gl=KR&hl=ko: 실행 서버(미국 GitHub 러너 등) 위치와 무관하게 한국 지역·한국어
  // 검색 결과를 강제한다. Accept-Language 헤더만으로는 부족하다.
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&gl=KR&hl=ko${THIS_YEAR}`;
  const res = await fetchRetry(url, { headers: HEADERS });
  const html = await res.text();
  const m = /var ytInitialData = (\{.*?\});<\/script>/s.exec(html);
  if (!m) return [];
  const out = [];
  walkVideos(JSON.parse(m[1]), out);
  await sleep(700); // 유튜브 순간 제한 회피
  return out;
}

// oEmbed로 실제 존재 + 정확한 제목 확인
async function verify(videoId) {
  try {
    const res = await fetchRetry(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      {},
      2
    );
    const d = await res.json();
    return d.title || null;
  } catch {
    return null;
  }
}

// 입문·클로드·병원·의료 주제, 최근 3개월, 5만+, 한국어, 비낚시성
async function collect() {
  const seen = new Map();
  for (const q of QUERIES) {
    let items = [];
    try {
      items = await search(q);
    } catch (e) {
      console.error(e.message);
      continue;
    }
    for (const it of items) {
      if (seen.has(it.videoId)) continue;
      if (daysAgo(it.pub) > RECENT_DAYS) continue; // 최근 3개월
      if (it.views < MIN_VIEWS) continue; // 5만 이상
      if (!/[가-힣]/.test(it.title)) continue; // 한국어 영상만
      if (!TOPIC.test(it.title)) continue; // 클로드 또는 병원/의료 주제
      if (CLICKBAIT.test(it.title) || SCAM.test(it.title)) continue;
      seen.set(it.videoId, it);
    }
  }
  return [...seen.values()].sort((a, b) => b.views - a.views); // 조회수순
}

async function main() {
  // 기존 파일에서 수동 항목 보존
  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {}
  const manual = existing.filter((v) => v.source === 'manual');
  const manualIds = new Set(manual.map((v) => v.videoId));

  const candidates = await collect();

  if (candidates.length === 0) {
    console.error('수집된 영상이 없습니다. 기존 목록을 유지합니다.');
    process.exit(1);
  }

  // 검증(oEmbed): 실제 제목을 받아온다. 상위 후보만 확인해 요청을 아낀다.
  const now = new Date().toISOString();
  const ordered = [];
  for (const p of candidates.slice(0, 16)) {
    if (ordered.length >= TARGET) break;
    if (manualIds.has(p.videoId)) continue;
    const title = await verify(p.videoId);
    if (!title) continue; // 삭제·비공개 제외
    // 실제 제목(oEmbed 원제)에도 한글·낚시성·사기성 필터 재적용
    if (!/[가-힣]/.test(title)) continue;
    if (CLICKBAIT.test(title) || SCAM.test(title)) continue;
    ordered.push({ videoId: p.videoId, title: title.trim() });
  }

  const seenAuto = new Set();
  const auto = [];
  for (const v of ordered) {
    if (auto.length >= TARGET) break;
    if (seenAuto.has(v.videoId)) continue;
    seenAuto.add(v.videoId);
    auto.push({
      videoId: v.videoId,
      title: v.title,
      url: `https://www.youtube.com/watch?v=${v.videoId}`,
      source: 'auto',
      addedAt: now,
    });
  }

  if (auto.length === 0) {
    console.error('검증 통과한 자동 영상이 없습니다. 기존 목록을 유지합니다.');
    process.exit(1);
  }

  // 수동 항목을 앞에, 자동 항목을 뒤에
  const final = [...manual, ...auto];
  await writeFile(OUT, JSON.stringify(final, null, 2) + '\n', 'utf8');
  console.log(`저장 완료: 수동 ${manual.length}건 + 자동 ${auto.length}건`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
