// 추천 강의 영상 자동 수집기
// 매주 수요일(.github/workflows/update-videos.yml)에 실행되어
// src/data/recommended-videos.json의 자동(source:"auto") 항목을 갱신한다.
// 관리자 페이지에서 수동으로 추가한 항목(source:"manual")은 절대 건드리지 않는다.
//
// 정책
//  1) 키워드(병원·의료·간호·AI 등) 영상: 최근 약 1개월 이내 + 조회수 1만 이상,
//     자극적 제목(충격·발칵 등)은 제외. 조회수순 상위.
//  2) 위 조건을 만족하는 영상이 5개 미만이면, 클로드(Claude) 관련 영상 중
//     조회수 5만 이상을 채운다(사기성 제목 제외).
//  3) 모든 후보는 유튜브 oEmbed로 실제 존재·정확한 제목을 확인한 것만 싣는다.
//  4) 검색이 실패하면 기존 파일을 그대로 둔다(빈 목록으로 덮어쓰지 않음).
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/recommended-videos.json', import.meta.url);
const TARGET = 5; // 자동 영상 목표 개수
const RECENT_DAYS = 32; // "최근 1개월" 허용치(여유 1일)

const KEYWORD_QUERIES = [
  '병원 AI',
  '의료 인공지능',
  '간호 AI',
  '병원 행정 AI',
  '의료 AI 실무',
  '챗GPT 의료',
];
// 한국어 영상을 얻기 위해 한국어 검색어만 사용한다 (독자가 한국 병원 종사자)
const CLAUDE_QUERIES = ['클로드 AI', '클로드 코드', '클로드 코워크', '클로드 인공지능', '클로드 사용법'];

// 최근 1개월 업로드 필터 (YouTube search "이번 달")
const THIS_MONTH = '&sp=EgIIBA%253D%253D';

const MED = /병원|의료|간호|보건|의사|헬스케어|진료|환자|간호사|요양|제약|바이오|의료진|의료법/;
const AI = /AI|인공지능|챗GPT|GPT|머신러닝|딥러닝|생성형|LLM/i;
const CLAUDE = /claude|클로드|anthropic|앤트로픽|앤스로픽/i;
// 자극적·낚시성 제목 제외 (모든 후보에 공통 적용)
const CLICKBAIT =
  /충격|발칵|경악|소름|난리|폭로|또 터|충격적|딸깍\?|인생역전|인생 역전|대박|떼돈|억대|월수입|월 수입|자동\s*수익|시청\s*금지|안 보면 후회|보지\s*마세요|무조건 봐|미쳤|상위\s*\d+\s*%|압도적|모르면 손해|이것만 알면|안 보면 손해/;
// 사기·과장 수익형 제목 제외 (클로드 폴백용)
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

async function search(query, thisMonth) {
  // gl=KR&hl=ko: 실행 서버(미국 GitHub 러너 등) 위치와 무관하게 한국 지역·한국어
  // 검색 결과를 강제한다. Accept-Language 헤더만으로는 부족하다.
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&gl=KR&hl=ko${thisMonth ? THIS_MONTH : ''}`;
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

async function collectKeyword() {
  const seen = new Map();
  for (const q of KEYWORD_QUERIES) {
    let items = [];
    try {
      items = await search(q, true);
    } catch (e) {
      console.error(e.message);
      continue;
    }
    for (const it of items) {
      if (seen.has(it.videoId)) continue;
      if (daysAgo(it.pub) > RECENT_DAYS) continue;
      if (it.views < 10000) continue;
      if (!MED.test(it.title) || !AI.test(it.title)) continue;
      if (CLICKBAIT.test(it.title)) continue;
      seen.set(it.videoId, it);
    }
  }
  return [...seen.values()].sort((a, b) => b.views - a.views);
}

async function collectClaude() {
  const seen = new Map();
  for (const q of CLAUDE_QUERIES) {
    let items = [];
    try {
      items = await search(q, false);
    } catch (e) {
      console.error(e.message);
      continue;
    }
    for (const it of items) {
      if (seen.has(it.videoId)) continue;
      if (it.views < 50000) continue;
      if (!CLAUDE.test(it.title)) continue;
      if (!/[가-힣]/.test(it.title)) continue; // 한국어 영상만
      if (SCAM.test(it.title) || CLICKBAIT.test(it.title)) continue;
      seen.set(it.videoId, it);
    }
  }
  // 최근순 → 조회수순
  return [...seen.values()].sort((a, b) => daysAgo(a.pub) - daysAgo(b.pub) || b.views - a.views);
}

async function main() {
  // 기존 파일에서 수동 항목 보존
  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {}
  const manual = existing.filter((v) => v.source === 'manual');
  const manualIds = new Set(manual.map((v) => v.videoId));

  const keyword = await collectKeyword();
  let claude = [];
  let usedFallback = false;
  if (keyword.length < TARGET) {
    usedFallback = true;
    claude = await collectClaude();
  }

  if (keyword.length === 0 && claude.length === 0) {
    console.error('수집된 영상이 없습니다. 기존 목록을 유지합니다.');
    process.exit(1);
  }

  // 한글 포함 여부로 한국어 영상 판별 (독자가 한국 병원 종사자이므로 우선)
  const hasKo = (s) => /[가-힣]/.test(s);

  // 검증(oEmbed): 실제 제목을 받아온다. 후보 풀은 넉넉히 잡되 과도한 요청은 피한다.
  async function verifyPool(list, limit) {
    const out = [];
    for (const p of list.slice(0, limit)) {
      if (manualIds.has(p.videoId)) continue;
      const title = await verify(p.videoId);
      if (!title) continue; // 삭제·비공개 제외
      // 실제 제목(oEmbed 원제)에도 낚시성·사기성 필터 적용
      if (CLICKBAIT.test(title) || SCAM.test(title)) continue;
      out.push({ videoId: p.videoId, title: title.trim() });
    }
    return out;
  }

  const vKeyword = await verifyPool(keyword, 8); // 키워드 영상은 이미 한국어·의료 관련
  const vClaude = await verifyPool(claude, 14);
  // 클로드 폴백은 실제 제목(oEmbed)에도 한글이 있는 한국어 영상만 채택한다.
  // (외국어 영상은 독자가 이해하기 어려우므로, 5개를 못 채우더라도 넣지 않는다)
  const koClaude = vClaude.filter((v) => hasKo(v.title));

  const now = new Date().toISOString();
  const ordered = [...vKeyword, ...koClaude];
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
  console.log(
    `저장 완료: 수동 ${manual.length}건 + 자동 ${auto.length}건 (폴백 ${usedFallback ? '사용' : '미사용'})`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
