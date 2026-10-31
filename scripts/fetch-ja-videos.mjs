// 일본어판 '다른 채널의 추천 영상' 자동 수집기 (2026-10-31 신설)
//
// 한국어판 fetch-videos.mjs와 같은 방식(유튜브 검색 결과 → oEmbed로 실재 확인)이지만
// 일본어 영상 기준으로 다시 만들었다. src/data/ja/content/videos-local.json 에
// 새 영상을 '추가'만 한다(수동 항목은 지우지 않는다).
//
// 정책
//  - 주제: 일본어로 된 의료·병원 × AI·DX 영상 (제목에 AI 신호와 의료 신호가 모두 있을 것)
//  - 기간: 최근 12개월(일본어 의료 AI 영상은 수가 적어 한국어판 3개월보다 넓게 잡는다)
//  - 조회수: 3,000회 이상
//  - 자극적·낚시성·수익 유도형 제목, 광고(PR) 제외
//  - 설명문(note)은 만들지 않는다 — 영상을 보지 않고 내용을 서술하면 사실 창작이 된다.
//    제목·채널명만 싣고, 화면에는 '자동으로 찾은 영상'임을 밝힌다.
//  - 검색이 실패하면 기존 파일을 그대로 둔다. 24시간 안에 자동 추가가 있었으면 건너뛴다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/ja/content/videos-local.json', import.meta.url);
const MAX_NEW = 2;
const MAX_AUTO = 60; // 자동 추가분 누적 상한(넘으면 오래된 자동 항목부터 정리)
const RECENT_DAYS = 365;
const MIN_VIEWS = 3000;

const QUERIES = [
  '医療AI',
  '病院 AI 活用',
  '看護 AI',
  '医療DX',
  '病院DX',
  '生成AI 医療',
  '電子カルテ AI',
  '医療現場 生成AI',
  '病院 ChatGPT',
  '医療事務 AI',
  '看護師 生成AI',
  '医療 AI 入門',
];

const AI_SIGNAL =
  /(?<![A-Za-z])AI(?![A-Za-z])|人工知能|生成AI|ChatGPT|チャットGPT|Claude|クロード|Gemini|ジェミニ|Copilot|コパイロット|\bLLM\b|機械学習|ディープラーニング|医療DX|病院DX/i;
const MEDICAL = /医療|病院|看護|ヘルスケア|クリニック|診療|薬局|介護|電子カルテ|医師|ドクター|患者|医事|カルテ/;
const CLICKBAIT =
  /衝撃|ヤバ|やばい|激変|絶対|必見|知らないと損|人生(が)?変|稼|副業|月収|儲|爆益|詐欺|炎上|禁断|暴露|閲覧注意|99%|\d+倍|#shorts|PR\b|【PR】|プロモーション/i;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept-Language': 'ja-JP,ja;q=0.9',
  Cookie: 'CONSENT=YES+cb',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, opts = {}, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(25000) });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = e;
    }
    await sleep(1000 * (i + 1));
  }
  throw last;
}

// 「3 日前」「2 か月前」「1 年前」「5 時間前」「3 週間前」
function daysAgo(pub) {
  const m = /(\d+)\s*(分|時間|日|週間|か月|ヶ月|カ月|年)/.exec(pub || '');
  if (!m) return 99999;
  const n = Number(m[1]);
  const unit = m[2];
  if (unit === '分' || unit === '時間') return 0;
  if (unit === '日') return n;
  if (unit === '週間') return n * 7;
  if (unit === '年') return n * 365;
  return n * 30;
}

// 「12,345 回視聴」「1.2万 回視聴」「3億」
function parseViews(text) {
  const t = (text || '').replace(/,/g, '');
  const m = /([\d.]+)\s*(億|万|千)?/.exec(t);
  if (!m) return 0;
  const n = Number(m[1]);
  const mul = { 億: 1e8, 万: 1e4, 千: 1e3 }[m[2]] || 1;
  return Math.round(n * mul);
}

function walkVideos(node, out) {
  if (Array.isArray(node)) {
    for (const v of node) walkVideos(v, out);
  } else if (node && typeof node === 'object') {
    if (node.videoRenderer) {
      const v = node.videoRenderer;
      const title = (v.title?.runs || []).map((r) => r.text).join('');
      const views = parseViews(v.viewCountText?.simpleText || '');
      const pub = v.publishedTimeText?.simpleText || '';
      const channel = (v.ownerText?.runs || []).map((r) => r.text).join('');
      if (v.videoId && title) out.push({ videoId: v.videoId, title, views, pub, channel });
    }
    for (const k of Object.keys(node)) walkVideos(node[k], out);
  }
}

async function search(query) {
  // gl=JP&hl=ja: 실행 서버 위치와 무관하게 일본 지역·일본어 결과를 강제한다.
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&gl=JP&hl=ja`;
  const html = await (await fetchRetry(url, { headers: HEADERS })).text();
  const m = /var ytInitialData = (\{.*?\});<\/script>/s.exec(html);
  if (!m) return [];
  const out = [];
  walkVideos(JSON.parse(m[1]), out);
  await sleep(700);
  return out;
}

async function verify(videoId) {
  try {
    const res = await fetchRetry(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      {},
      2
    );
    const d = await res.json();
    return { title: d.title || null, channel: d.author_name || '' };
  } catch {
    return { title: null, channel: '' };
  }
}

const hasKana = (s) => /[぀-ヿ]/.test(s); // 히라가나·가타카나가 있어야 일본어 영상
// 採用・求人 영상과 태그를 나열한 광고성 제목(' / '이 4번 이상)은 제외한다.
const NOT_EDU = /採用|求める人物|転職|就活|求人|カルチャー|協賛|スポンサー/;
const tagStuffed = (t) => (t.match(/ \/ /g) || []).length >= 4;
const okTitle = (t) =>
  hasKana(t) && AI_SIGNAL.test(t) && MEDICAL.test(t) && !CLICKBAIT.test(t) && !NOT_EDU.test(t) && !tagStuffed(t);

async function main() {
  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT, 'utf8'));
  } catch (e) {
    console.error(`videos-local.json 읽기/파싱 실패 — 중단: ${e.message}`);
    process.exit(1);
  }
  if (!Array.isArray(existing)) {
    console.error('videos-local.json이 배열이 아닙니다 — 중단.');
    process.exit(1);
  }
  const ids = new Set(existing.map((v) => v.videoId));

  const lastAuto = existing
    .filter((v) => v.source === 'auto' && v.addedAt)
    .map((v) => Date.parse(v.addedAt))
    .sort((a, b) => b - a)[0];
  if (!process.env.FORCE_UPDATE && lastAuto && Date.now() - lastAuto < 24 * 3600 * 1000) {
    console.log('최근 24시간 내 자동 추가가 있었습니다. 건너뜁니다.');
    return;
  }

  const cand = new Map();
  let okQueries = 0;
  for (const q of QUERIES) {
    try {
      for (const it of await search(q)) {
        if (!okTitle(it.title)) continue;
        if (daysAgo(it.pub) > RECENT_DAYS || it.views < MIN_VIEWS) continue;
        if (!cand.has(it.videoId)) cand.set(it.videoId, it);
      }
      okQueries++;
    } catch (e) {
      console.error(`검색 실패(${q}): ${e.message}`);
    }
  }
  if (okQueries === 0) {
    console.error('검색이 모두 실패했습니다. 기존 목록을 유지합니다.');
    process.exit(1);
  }

  const sorted = [...cand.values()].sort((a, b) => b.views - a.views);
  const now = new Date().toISOString();
  const fresh = [];
  for (const p of sorted.slice(0, 30)) {
    if (fresh.length >= MAX_NEW) break;
    if (ids.has(p.videoId)) continue;
    const v = await verify(p.videoId);
    if (!v.title || !okTitle(v.title)) continue; // 삭제·비공개·원제 불일치 제외
    fresh.push({
      videoId: p.videoId,
      title: v.title.trim(),
      channel: (v.channel || p.channel).trim(),
      source: 'auto',
      addedAt: now,
    });
    ids.add(p.videoId);
  }

  if (fresh.length === 0) {
    console.log(`추가할 새 영상이 없습니다(후보 ${cand.size}건 모두 기존 목록에 있거나 기준 미달).`);
    return;
  }

  // 새 영상을 맨 앞에 둔다(화면 맨 위에 최신 추가분이 보이도록).
  let final = [...fresh, ...existing];
  const autos = final.filter((v) => v.source === 'auto');
  if (autos.length > MAX_AUTO) {
    const drop = new Set(autos.slice(MAX_AUTO).map((v) => v.videoId));
    final = final.filter((v) => !drop.has(v.videoId));
  }

  await writeFile(OUT, JSON.stringify(final, null, 2) + '\n', 'utf8');
  console.log(`저장 완료: 신규 ${fresh.length}건 추가, 누적 ${final.length}건 (후보 ${cand.size}건)`);
  for (const f of fresh) console.log(`  + ${f.title} / ${f.channel}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
