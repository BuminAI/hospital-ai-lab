// 대만어판 '다른 채널의 추천 영상' 자동 수집기 (2026-10-31 신설)
//
// 일본어판 fetch-ja-videos.mjs와 같은 방식(유튜브 검색 결과 → oEmbed로 실재 확인)이되, 대만 기준이다.
// src/data/tw/content/videos-local.json 에 새 영상을 '추가'만 한다(수동 항목은 지우지 않는다).
//
// 정책
//  - 주제: 정체자(번체) 중국어로 된 의료·병원 × AI·디지털 영상 (제목에 AI 신호와 의료 신호가 모두 있을 것)
//  - 채널: **공적 기관·공영방송·통신사·탐사 비영리 매체만**(CHANNEL_ALLOW). 개인·기업·병원 채널은
//    특정 제품·의료기관 홍보가 되기 쉬워(의료광고 관점) 자동으로 싣지 않는다. 대만 언론은 정치 성향이
//    갈려 있어, 공영(公視)·통신사(中央社)·정부 기관 위주로 좁게 잡는다.
//  - 기간: 최근 12개월 / 조회수 1,000회 이상
//  - 자극적·낚시성·불안 조장 제목, 광고 제외. 간체자 제목 제외
//  - 설명문(note)은 만들지 않는다 — 영상을 보지 않고 내용을 서술하면 사실 창작이 된다.
//  - 검색이 실패하면 기존 파일을 그대로 둔다. 24시간 안에 자동 추가가 있었으면 건너뛴다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/tw/content/videos-local.json', import.meta.url);
const MAX_NEW = 2;
const MAX_AUTO = 60;
const RECENT_DAYS = 365;
const MIN_VIEWS = 1000;

const QUERIES = [
  '智慧醫療',
  '醫療 AI',
  'AI 醫院',
  '醫院 資安',
  '電子病歷',
  '健保 數位',
  '生成式AI 醫療',
  '護理 AI',
  '醫療器材 AI',
  '遠距醫療',
];

const AI_SIGNAL =
  /(?<![A-Za-z])AI(?![A-Za-z])|人工智慧|生成式|ChatGPT|Gemini|Claude|Copilot|大型語言模型|智慧醫療|數位醫療|電子病歷|資安|個資/i;
const MEDICAL = /醫療|醫院|醫師|護理|健保|長照|病歷|診所|病患|病人|醫材|醫療器材|藥局|醫學|健康存摺/;
const CLICKBAIT =
  /震驚|驚人|爆紅|秒殺|賺錢|副業|內幕|曝光|害命|喪命|致命|恐怖|慘|崩潰|暴雷|必看|不看會後悔|#shorts|PR|業配|廣告|[%％]|[0-9]+\s*倍/i; // 효과 수치(○%·○倍)가 든 제목도 뺀다(효과 보장으로 읽힐 수 있음)
// 공적 기관·공영·통신사·탐사 비영리 매체만
const CHANNEL_ALLOW =
  /衛生福利部|衛福部|疾病管制署|食品藥物管理署|國民健康署|全民健康保險署|健保署|國家衛生研究院|數位發展部|國家科學及技術委員會|公視|公共電視|PNN|中央通訊社|CNA|報導者|台視新聞|華視新聞|TVBS NEWS/i;
const channelOk = (ch) => CHANNEL_ALLOW.test(ch || '');
// 간체자 표지(제목에 하나라도 있으면 정체자 영상이 아니다)
const SIMPLIFIED = /[医药疗术网软务护险诊录实验际]/;
const isTraditional = (t) => /[一-鿿]/.test(t) && !SIMPLIFIED.test(t);
const okTitle = (t) => isTraditional(t) && AI_SIGNAL.test(t) && MEDICAL.test(t) && !CLICKBAIT.test(t) && [...t].length <= 80;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept-Language': 'zh-TW,zh;q=0.9',
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

// 「3 天前」「2 個月前」「1 年前」「5 小時前」「3 週前」「1 週前」
function daysAgo(pub) {
  const m = /(\d+)\s*(分鐘|小時|天|週|周|個月|年)/.exec(pub || '');
  if (!m) return 99999;
  const n = Number(m[1]);
  const u = m[2];
  if (u === '分鐘' || u === '小時') return 0;
  if (u === '天') return n;
  if (u === '週' || u === '周') return n * 7;
  if (u === '年') return n * 365;
  return n * 30;
}

// 「觀看次數：3,048次」「72,048次」「1.2萬次」
function parseViews(text) {
  const t = (text || '').replace(/,/g, '');
  const m = /([\d.]+)\s*(億|萬|千)?/.exec(t);
  if (!m) return 0;
  const mul = { 億: 1e8, 萬: 1e4, 千: 1e3 }[m[2]] || 1;
  return Math.round(Number(m[1]) * mul);
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
  // gl=TW&hl=zh-TW: 실행 서버 위치와 무관하게 대만 지역·정체자 결과를 강제한다.
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&gl=TW&hl=zh-TW`;
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
        if (!okTitle(it.title) || !channelOk(it.channel)) continue;
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
    if (!v.title || !okTitle(v.title) || !channelOk(v.channel || p.channel)) continue; // 삭제·비공개·원제 불일치·허용 외 채널 제외
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
