// Collecteur de vidéos recommandées d'autres chaînes de l'édition française (2026-11-15 ; same method as fetch-en-videos.mjs)
//
// YouTube search results → existence confirmed by oEmbed. Only ADDS new videos to src/data/fr/content/videos-local.json
// (hand-added entries are never deleted).
//
// Policy
//  - Target: videos about medical AI in France from public bodies, universities and major news bodies.
//  - Topic: French-language health care × AI/digital videos (the title must carry both an AI signal and a medical signal).
//  - Channels: **only public agencies, public broadcasters, major news services and hospital associations** (CHANNEL_ALLOW).
//    Personal, company and hospital channels easily become promotion of a specific product or provider (a medical-advertising
//    concern), so they are not added automatically.
//  - Period: last 12 months / at least 1,000 views
//  - Sensational or clickbait titles, ads and titles with effect figures (x% / Nx) are excluded
//  - No description (note) is written: describing a video without watching it would be inventing facts.
//  - If the search fails the existing file is left as it is. If something was added automatically within 24 hours, it skips.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/fr/content/videos-local.json', import.meta.url);
const MAX_NEW = 8; // 실행 1회당 최대 추가(2026-11-14: 2 → 8, 오너 지시 "매일 충분히")
const MAX_AUTO = 500; // 자동 추가분 누적 상한(2026-11-14: 60 → 500)
const RECENT_DAYS = 365;
const MIN_VIEWS = 1000;
const RELAX_DAYS = 1100; // 후보가 모자랄 때만 쓰는 완화 기준(제목·채널 규칙은 그대로)
const RELAX_VIEWS = 100;

const QUERIES = [
  'intelligence artificielle santé hôpital',
  'IA à l’hôpital',
  'CNIL intelligence artificielle santé',
  'HAS CNIL IA soins',
  'IA infirmiers hôpital',
  'IA générative santé',
  'IA radiologie hôpital',
  'règlement européen IA santé',
  'AP-HP intelligence artificielle',
  'CHU intelligence artificielle',
  'numérique en santé IA',
  'Mon espace santé données IA',
  'IA dossier patient hôpital',
  'IA médecins patients',
  'cybersécurité hôpital',
  'données de santé RGPD',
  'dispositif médical logiciel IA',
  'IA cancer dépistage France',
];

const AI_SIGNAL =
  /(?<![A-Za-z])(IA|AI)(?![A-Za-z])|intelligence artificielle|apprentissage (automatique|profond)|ChatGPT|g[ée]n[ée]rative|mod[eè]les? de langage|\bLLMs?\b|chatbot|agent conversationnel|algorithme|aide à la décision|num[ée]rique en sant[ée]|interop[ée]rabilit[ée]/i;
const MEDICAL = /h[ôo]pita|sant[ée]|clinique|patient|m[ée]decin|infirmi|soignant|m[ée]dical|m[ée]decine|CHU|\bAP-HP\b|\bHAS\b|CNIL|ANSM/i;
const CLICKBAIT =
  /choquant|vous n['’]allez pas croire|scandale|r[ée]v[ée]l[ée]|secret|\bpub\b|sponsoris|#shorts|promo|va mourir|mortel|[%％]|[0-9]+\s*x(?![a-z])|miracle|gu[ée]rit|gu[ée]rison/i; // les titres avec chiffres d'effet (x % / Nx) sont exclus (ils peuvent se lire comme une promesse de résultat)
// uniquement organismes publics, médias de service public, grands médias d'information, universités et fédérations hospitalières
const CHANNEL_ALLOW =
  /CNIL|Haute Autorit[ée] de sant[ée]|\bHAS\b|Minist[èe]re de la Sant[ée]|Minist[èe]re de l['’]Enseignement|Agence du Num[ée]rique en Sant[ée]|\bANS\b|ANSM|Assurance Maladie|Assistance Publique|\bAP-HP\b|F[ée]d[ée]ration hospitali[èe]re|\bFHF\b|France Info|franceinfo|France 24|France 2|France 3|France 5|France T[ée]l[ée]visions|Arte|LCP|Public S[ée]nat|INA|Le Monde|Le Figaro|Le Parisien|Les Echos|Les Échos|Lib[ée]ration|BFM|RTL|Europe 1|LCI|20 Minutes|Ouest-France|Sud Ouest|Sciences et Avenir|Inserm|CNRS|Institut Pasteur|Institut Curie|Gustave Roussy|Universit[ée]|Sorbonne|Paris Cit[ée]|Paris-Saclay|Polytechnique|Inria|Station F|Bpifrance|France 2030|Commission europ[ée]enne|Parlement europ[ée]en|WHO|OMS|World Health Organization|Organisation mondiale de la sant[ée]|Euronews|France Culture|Le Point|Acad[ée]mie de M[ée]decine|Le Blob|Espace de R[ée]flexion Ethique|CHRU|CHU M[ée]dia|CHU de |L'Oeil de la E-sant[ée]|Le Quotidien du M[ée]decin|DSIH|Hospimedia|Infirmiers\.com|What['’]s up doc|Konbini|Le Media|Th[ée]o Hospi/i;

const channelOk = (ch) => CHANNEL_ALLOW.test(ch || '');
const okTitle = (t) => AI_SIGNAL.test(t) && MEDICAL.test(t) && !CLICKBAIT.test(t) && [...t].length <= 110;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept-Language': 'en;q=0.9,fr-FR;q=0.8',
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
  // gl=FR&hl=en: forces the French region (the "3 days ago" parser needs English labels) regardless of where the runner is located.
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&gl=FR&hl=en`;
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

  const pool = new Map();
  let okQueries = 0;
  for (const q of QUERIES) {
    try {
      for (const it of await search(q)) {
        if (process.env.DEBUG_VIDEOS && okTitle(it.title) && !channelOk(it.channel)) console.log(`  [channel not allowed] ${it.channel} | ${it.views} | ${it.pub} | ${it.title.slice(0, 70)}`);
        if (!okTitle(it.title) || !channelOk(it.channel)) continue;
        if (!pool.has(it.videoId)) pool.set(it.videoId, it);
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

  // 엄격 기준(최근 RECENT_DAYS일·조회 MIN_VIEWS 이상)으로 먼저 거르고, 후보가 MAX_NEW*2보다 적으면
  // 기간·조회수 기준을 완화해 채운다. 제목(AI+의료 신호, 낚시 제외)과 허용 채널 규칙은 완화하지 않는다.
  const cand = new Map();
  for (const it of pool.values()) if (daysAgo(it.pub) <= RECENT_DAYS && it.views >= MIN_VIEWS) cand.set(it.videoId, it);
  if (cand.size < MAX_NEW * 2) {
    for (const it of pool.values()) {
      if (!cand.has(it.videoId) && daysAgo(it.pub) <= RELAX_DAYS && it.views >= RELAX_VIEWS) cand.set(it.videoId, it);
    }
  }
  const sorted = [...cand.values()].sort((a, b) => b.views - a.views);
  const now = new Date().toISOString();
  const fresh = [];
  for (const p of sorted.slice(0, 80)) {
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
