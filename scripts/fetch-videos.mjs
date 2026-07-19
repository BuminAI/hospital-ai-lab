// 추천 강의 영상 자동 수집기
// 매주 월·수·금(.github/workflows/update-videos.yml)에 실행되어
// src/data/recommended-videos.json에 새 영상을 최대 3개까지 "추가"한다.
// 기존 항목(자동·수동 모두)은 지우지 않고 계속 누적한다.
//
// 정책 (오너 지정 기준)
//  - 주제: 입문·클로드·병원·의료 (클로드 입문 또는 병원/의료 AI 영상)
//  - 기간: 최근 3개월 이내 / 조회수: 5만 이상 / 한국어 영상만
//  - 자극적·사기성 제목은 제외, 조회수순 상위에서 새 영상 3개
//  - 모든 후보는 유튜브 oEmbed로 실제 존재·정확한 제목을 확인한 것만 싣는다
//  - 검색이 실패하면 기존 파일을 그대로 둔다(빈 목록으로 덮어쓰지 않음)
//  - 최근 24시간 안에 자동 추가가 있었으면 건너뛴다 — GitHub cron 지연을
//    보완하려고 예약을 여러 개 걸어도(본+예비) 한 주기에 한 번만 추가되도록.
//    (달력 날짜 비교는 예비 실행이 자정을 넘겨 지연되면 뚫리므로 시간 창 사용.
//     월→수 정규 간격은 48시간이라 24시간 창이면 정규 주기는 막히지 않는다.)
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/recommended-videos.json', import.meta.url);
const MAX_NEW = 3; // 실행 1회당 새로 추가할 최대 개수
const MAX_TOTAL = 200; // 누적 상한 (넘으면 가장 오래된 자동 항목부터 정리)
const RECENT_DAYS = 95; // "최근 3개월" 허용치(여유 며칠)
// 조회수 기준: 2026-07-20 오너 지시로 5만 → 2.5만(절반)으로 낮췄다.
// 기존 기준으로는 통과하는 영상이 거의 다 이미 수집돼 새 영상이 나오지
// 않았다(측정: 통과 10건 중 신규 2건, 의료계열 0건).
const MIN_VIEWS = 25000;

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

// 유튜브 업로드 기간 필터(sp)는 쓰지 않는다.
//
// 예전에는 "올해" 필터를 `&sp=EgIIBQ%253D%253D`로 붙였는데, 이 값은 이중
// 인코딩이라 유튜브가 base64 'EgIIBQ=='가 아니라 깨진 값을 받고 있었다.
// 2026-07-20에 이를 발견하고 올바른 인코딩(%3D%3D)으로 고쳐 보니, 필터가
// 실제로 걸리면서 후보군이 오히려 크게 줄었다(같은 검색어로 원본 108건
// → 26건). 지금 문제는 "새 영상이 없는 것"이므로 후보를 좁히는 쪽은
// 역효과다.
//
// 기간 제한은 이 필터가 없어도 지켜진다 — 아래 collect()가 daysAgo()로
// RECENT_DAYS(3개월)를 직접 확인하기 때문이다. 그래서 필터를 떼어 후보를
// 최대한 확보하고, 기간 판정은 코드에 맡긴다.
const THIS_YEAR = '';

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

// 후보를 두 갈래로 모은다.
//  strict — 정식 기준을 모두 통과 (주제·한국어·비낚시 + 기간·조회수)
//  loose  — 주제·한국어·비낚시는 통과했으나 기간이나 조회수 기준에 못 미침
//
// loose는 "기준에 맞는 새 영상이 하나도 없을 때 그중 조회수가 가장 높은
// 1건이라도 건다"는 보충 규칙(2026-07-20 오너 지시)에 쓴다. 주제·한국어·
// 낚시성/사기성 배제는 품질 기준이므로 보충할 때도 절대 풀지 않는다.
async function collect() {
  const strict = new Map();
  const loose = new Map();
  for (const q of QUERIES) {
    let items = [];
    try {
      items = await search(q);
    } catch (e) {
      console.error(e.message);
      continue;
    }
    for (const it of items) {
      if (!/[가-힣]/.test(it.title)) continue; // 한국어 영상만
      if (!TOPIC.test(it.title)) continue; // 클로드 또는 병원/의료 주제
      if (CLICKBAIT.test(it.title) || SCAM.test(it.title)) continue;
      if (!loose.has(it.videoId)) loose.set(it.videoId, it);
      if (daysAgo(it.pub) > RECENT_DAYS) continue; // 최근 3개월
      if (it.views < MIN_VIEWS) continue; // 조회수 하한
      if (!strict.has(it.videoId)) strict.set(it.videoId, it);
    }
  }
  const byViews = (a, b) => b.views - a.views;
  return {
    strict: [...strict.values()].sort(byViews),
    loose: [...loose.values()].sort(byViews),
  };
}

async function main() {
  // 기존 목록 전체를 보존한다 (자동·수동 모두 누적).
  // 파일이 "없는" 경우만 빈 목록으로 시작하고, 파싱 실패(문법 오류 등)는
  // 반드시 중단한다 — 그냥 진행하면 다음 저장에서 기존 항목(수동 포함)이
  // 통째로 사라지기 때문.
  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error(`recommended-videos.json 읽기/파싱 실패 — 기존 파일 보호를 위해 중단: ${e.message}`);
      process.exit(1);
    }
  }
  if (!Array.isArray(existing)) {
    console.error('recommended-videos.json이 배열이 아닙니다 — 기존 파일 보호를 위해 중단.');
    process.exit(1);
  }
  const existingIds = new Set(existing.map((v) => v.videoId));

  // 최근 24시간 안에 자동 추가가 있었으면 종료 — 본·예비 예약이 지연돼
  // 자정을 넘겨 돌아도 한 주기(월/수/금)에 한 번만 추가한다.
  // FORCE_UPDATE=1 (workflow_dispatch의 force 입력)일 때만 이 창을 무시한다
  // — 오너가 "지금 바로 갱신"을 요청한 수동 실행용.
  const lastAuto = existing
    .filter((v) => v.source === 'auto' && v.addedAt)
    .map((v) => Date.parse(v.addedAt))
    .sort((a, b) => b - a)[0];
  if (!process.env.FORCE_UPDATE && lastAuto && Date.now() - lastAuto < 24 * 3600 * 1000) {
    console.log('최근 24시간 내 자동 추가가 있었습니다. 건너뜁니다.');
    return;
  }

  const { strict, loose } = await collect();

  if (loose.length === 0) {
    console.error('수집된 영상이 없습니다. 기존 목록을 유지합니다.');
    process.exit(1);
  }

  // 검증(oEmbed): 실제 존재·공개 여부와 정확한 제목을 확인한다.
  // 이미 목록에 있는 영상은 건너뛰고 새 영상만 고른다.
  const now = new Date().toISOString();
  async function pick(candidates, limit) {
    const out = [];
    for (const p of candidates.slice(0, 24)) {
      if (out.length >= limit) break;
      if (existingIds.has(p.videoId)) continue;
      const title = await verify(p.videoId);
      if (!title) continue; // 삭제·비공개 제외
      // 실제 제목(oEmbed 원제)에도 한글·낚시성·사기성 필터 재적용
      if (!/[가-힣]/.test(title)) continue;
      if (CLICKBAIT.test(title) || SCAM.test(title)) continue;
      out.push({
        videoId: p.videoId,
        title: title.trim(),
        url: `https://www.youtube.com/watch?v=${p.videoId}`,
        source: 'auto',
        addedAt: now,
      });
      existingIds.add(p.videoId);
    }
    return out;
  }

  let fresh = await pick(strict, MAX_NEW);

  // 보충 규칙(오너 지시 2026-07-20): 기준을 통과한 새 영상이 하나도 없으면
  // 기준에 못 미치더라도 후보 중 조회수가 가장 높은 1건을 넣는다.
  // 하루 한 번은 새 링크가 걸리도록 하기 위한 장치다(워크플로가 매일 실행,
  // 24시간 중복 방지 창이 있어 하루 한 번을 넘지 않는다).
  let byFallback = false;
  if (fresh.length === 0) {
    fresh = await pick(loose, 1);
    byFallback = fresh.length > 0;
  }

  if (fresh.length === 0) {
    console.log('추가할 새 영상이 없습니다(후보가 모두 이미 목록에 있음). 기존 목록을 그대로 둡니다.');
    return; // 새 영상이 없는 것은 오류가 아니다 (커밋 생략)
  }

  // 새 영상을 앞에 두고 누적. 상한을 넘으면 가장 오래된 "자동" 항목부터
  // 정리한다 (수동 항목은 절대 지우지 않음).
  let final = [...fresh, ...existing];
  if (final.length > MAX_TOTAL) {
    let overflow = final.length - MAX_TOTAL;
    final = final
      .slice()
      .reverse()
      .filter((v) => {
        if (overflow > 0 && v.source === 'auto') {
          overflow--;
          return false;
        }
        return true;
      })
      .reverse();
  }

  await writeFile(OUT, JSON.stringify(final, null, 2) + '\n', 'utf8');
  console.log(
    `저장 완료: 신규 ${fresh.length}건 추가, 누적 ${final.length}건` +
      (byFallback ? ' (기준 통과분이 없어 조회수 상위 1건으로 보충)' : '')
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
