// Edisyong Filipino: kolektor ng "mga inirerekomendang video mula sa ibang channel" (2026-11-14; same method as fetch-en-videos.mjs)
//
// YouTube search results → existence confirmed by oEmbed. Only ADDS new videos to src/data/ph/content/videos-local.json
// (hand-added entries are never deleted).
//
// Policy
//  - Target: videos about medical AI sa Pilipinas mula sa mga pampubliko, gobyerno at malalaking news body.
//  - Topic: English-language health care × AI/digital videos (the title must carry both an AI signal and a medical signal).
//  - Channels: **only public agencies, public broadcasters, major news services and hospital associations** (CHANNEL_ALLOW).
//    Personal, company and hospital channels easily become promotion of a specific product or provider (a medical-advertising
//    concern), so they are not added automatically.
//  - Period: last 12 months / at least 1,000 views
//  - Sensational or clickbait titles, ads and titles with effect figures (x% / Nx) are excluded
//  - No description (note) is written: describing a video without watching it would be inventing facts.
//  - If the search fails the existing file is left as it is. If something was added automatically within 24 hours, it skips.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/ph/content/videos-local.json', import.meta.url);
const MAX_NEW = Number(process.env.PH_MAX_NEW) || 2;
const MAX_AUTO = 60;
const RECENT_DAYS = 1500; // Mas kaunti ang bidyong PH tungkol sa AI sa kalusugan; 3 taon ang saklaw
const MIN_VIEWS = 50;

const QUERIES = [
  'artificial intelligence healthcare Philippines',
  'AI in Philippine hospitals',
  'DOH Philippines artificial intelligence',
  'AI telemedicine Philippines',
  'AI sa kalusugan Pilipinas',
  'artificial intelligence sa ospital',
  'AI doktor nurse Pilipinas',
  'GMA News AI health',
  'ABS-CBN News AI health',
  'Rappler AI healthcare Philippines',
  'Inquirer AI health Philippines',
  'PhilHealth digital health AI',
  'AI health data privacy Philippines',
  'generative AI healthcare Philippines',
  'Philippines AI health policy',
  'UP Manila AI health',
  'AI sa ospital Pilipinas',
  'artificial intelligence Pinoy doctors',
  'DOH AI tuberculosis detection',
  'PhilHealth AI claims fraud',
  'AI Readiness Assessment Philippines UNESCO health',
  'telehealth Philippines DOH',
  'ChatGPT health advice Filipino',
  'AI mental health chatbot Philippines',
  'AI nurses Philippines',
  'digital health Philippines',
];

const AI_SIGNAL =
  /(?<![A-Za-z])AI(?![A-Za-z])|artificial intelligence|machine learning|ChatGPT|generative|large language model|\bLLMs?\b|chatbot|algorithm|clinical decision support|health IT|interoperab/i;
const MEDICAL = /hospital|health ?care|clinic|patient|physician|doctor|nurse|nursing|medical|medicine|DOH|PhilHealth|telemedicine|kalusugan|mental health|health|ospital|doktor/i;
const CLICKBAIT =
  /shocking|you won'?t believe|scandal|exposed|secret|\bad\b|sponsored|#shorts|discount|will die|deadly|[%％]|[0-9]+\s*x(?![a-z])|miracle|cure[sd]?\b/i; // titles with effect figures (x% / Nx) are excluded too (they can read as a guarantee of results)
// only public agencies, public broadcasters, major news services and hospital associations
const CHANNEL_ALLOW =
  /Department of Health Philippines|\bDOH\b|PhilHealth|WHO Philippines|\bDICT\b|\bDOST\b|\bPIA\b|Philippine Information Agency|PTV|ABS-CBN|TeleRadyo|GMA|24 Oras|Unang Hirit|CNN Philippines|Rappler|INQUIRER|Inquirer|News5|One News PH|UNTV|Philstar|Manila Bulletin|TV5|Philippine News Agency|\bPNA\b|BusinessWorld|University of the Philippines|\bUP \b|Senate of the Philippines|House of Representatives of the Philippines/i;

const channelOk = (ch) => CHANNEL_ALLOW.test(ch || '');
const PH_SIGNAL = /Philippine|Filipino|\bPH\b|Pilipinas|Pinoy|DOH|PhilHealth|Manila|GMA|ABS-CBN|PTV|UNTV|One News|Rappler|INQUIRER|News5|TV5|BusinessWorld|Philstar|Unang Balita|kalusugan|ospital|doktor|\bmga\b|\bng\b|\bang\b/i;
const okTitle = (t) => AI_SIGNAL.test(t) && MEDICAL.test(t) && PH_SIGNAL.test(t) && !CLICKBAIT.test(t) && [...t].length <= 110;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept-Language': 'en-PH,en;q=0.9',
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

// "3 days ago" / "2mo ago" / "1y ago" / "5 hours ago" / "3w ago" (YouTube shows both long and abbreviated forms with hl=en)
function daysAgo(pub) {
  const m = /(\d+)\s*(minutes?|min|hours?|hr|h|days?|d|weeks?|w|months?|mo|years?|yr|y)\b/i.exec(pub || '');
  if (!m) return 99999;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  if (u.startsWith('min') || u.startsWith('h')) return 0;
  if (u.startsWith('d')) return n;
  if (u.startsWith('w')) return n * 7;
  if (u.startsWith('y')) return n * 365;
  return n * 30; // months
}

// "3,048 views" / "72K views" / "1.2M views"
function parseViews(text) {
  const t = (text || '').toLowerCase().replace(/ /g, ' ');
  const m = /([\d.,]+)\s*([kmb])?\s*views?/.exec(t);
  if (!m) return 0;
  const num = Number(m[1].replace(/,/g, ''));
  const mul = { k: 1e3, m: 1e6, b: 1e9 }[m[2]] || 1;
  return Math.round(num * mul);
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
  // gl=PH&hl=en: nagpapatupad ng rehiyong Pilipinas and English results regardless of where the runner is located.
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&gl=PH&hl=en`;
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
      const found = await search(q);
      let passed = 0;
      for (const it of found) {
        if (!okTitle(it.title) || !channelOk(it.channel)) continue;
        if (daysAgo(it.pub) > RECENT_DAYS || it.views < MIN_VIEWS) continue;
        passed++;
        if (!cand.has(it.videoId)) cand.set(it.videoId, it);
      }
      if (process.env.DEBUG_VIDEOS) {
        console.log(`  ${q}: ${found.length} found / ${passed} passed`);
        for (const it of found.slice(0, 4)) console.log(`      title=${okTitle(it.title)} ch=${channelOk(it.channel)} pub=[${it.pub}] days=${daysAgo(it.pub)} views=${it.views} | ${it.channel} | ${it.title.slice(0, 50)}`);
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
    const nt = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (fresh.some((x) => x.title.toLowerCase().replace(/[^a-z0-9]+/g, '') === nt)) continue;
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
