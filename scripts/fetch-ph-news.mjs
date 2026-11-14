// Kolektor ng balita sa medical AI para sa edisyong Filipino — mga pampublikong RSS feed, AI lamang (2026-11-14)
//
// Mga pinagmulan (RSS na sumagot nang walang bot challenge noong 2026-11-14):
//   1) Google News RSS (mga paghahanap tungkol sa AI at kalusugan sa Pilipinas) — nagbibigay ng headline mula sa maraming pahayagang Pilipino
//   2) Rappler (teknolohiya)   https://www.rappler.com/technology/feed/
//   3) Philstar (headlines)    https://www.philstar.com/rss/headlines
//   4) BusinessWorld           https://www.bworldonline.com/feed/
// (Hindi nabuksan ang RSS ng Inquirer, Manila Bulletin at BusinessMirror — HTTP 403; huwag lampasan ito.)
// Walang AI-lamang na feed, kaya pinapanatili lamang ang aytem kung ang headline o buod ay nagbabanggit ng AI.
//
// Pag-iipon: pinapanatili ang mga umiiral na aytem sa src/data/ph/news.json at idinaragdag ang mga bago (de-dupe ayon sa pamagat).
// Hindi pinapatigil ng isang pumalyang feed ang iba. Headline, petsa at link lamang ang kinokopya namin — hindi ang teksto ng artikulo.
import { readFile, writeFile } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (compatible; hospital-ai-lab news fetcher; +https://hospital-ai-lab.com)';
const MAX_ITEMS = 300;
const gnews = (q) => ({ source: 'Google News', url: `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:365d')}&hl=en-PH&gl=PH&ceid=PH:en`, google: true });
const MODE = process.argv[2] === 'digest' ? 'digest' : 'news';
const FEEDS_NEWS = [
  gnews('artificial intelligence hospital Philippines'),
  gnews('AI healthcare Philippines'),
  gnews('AI DOH Philippines health'),
  gnews('telemedicine AI Philippines'),
  gnews('PhilHealth artificial intelligence'),
  gnews('National Privacy Commission artificial intelligence'),
  gnews('AI medical Filipino doctors nurses'),
  { source: 'Rappler', url: 'https://www.rappler.com/technology/feed/' },
  { source: 'Philstar', url: 'https://www.philstar.com/rss/headlines' },
  { source: 'BusinessWorld', url: 'https://www.bworldonline.com/feed/' },
];
// AI digest: pangkalahatang balita sa AI sa Pilipinas (patakaran, regulasyon, pag-aampon) — hindi lang medisina.
const FEEDS_DIGEST = [
  gnews('Philippines artificial intelligence policy'),
  gnews('Philippines AI regulation law Congress Senate'),
  gnews('Philippines AI National AI Council executive order'),
  gnews('DICT DOST DTI artificial intelligence Philippines'),
  gnews('Philippines AI data privacy security'),
  gnews('Philippines AI adoption companies government'),
  { source: 'Rappler', url: 'https://www.rappler.com/technology/feed/' },
  { source: 'Philstar', url: 'https://www.philstar.com/rss/headlines' },
  { source: 'BusinessWorld', url: 'https://www.bworldonline.com/feed/' },
];
const FEEDS = MODE === 'digest' ? FEEDS_DIGEST : FEEDS_NEWS;
const PH = /Philippine|Filipino|\bPH\b|Manila|DICT|DOST|DTI\b|Marcos|Congress|Senate|Pinoy|Pilipinas|Mindanao|Cebu|Davao|PBBM|DOH|PhilHealth/i;
const NOISE = /celebrity|showbiz|concert|basketball|PBA\b|\bNBA\b|boxing|horoscope|lottery|giveaway|iPhone|Samsung Galaxy|crypto|bitcoin|casino/i;

const AI_WORD = /\bAI\b|\bA\.I\.|artificial intelligence|machine learning|generative|large language model|\bLLMs?\b|chatbot|agentic|ChatGPT/i;
const HEALTH = /health|hospital|clinic|patient|medical|nurse|nursing|doctor|DOH|PhilHealth|telemedicine|pharmac|disease|medicine|care\b|privacy|data protection|NPC\b|FDA/i;
const isAi = (t) => (MODE === 'digest' ? AI_WORD.test(t) && PH.test(t) && !NOISE.test(t) : AI_WORD.test(t) && HEALTH.test(t) && PH.test(t) && !NOISE.test(t));

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&apos;/g, "'");
}
// XSS guard: walang tag na makalulusot (pumapasok din ang pamagat sa JSON-LD).
const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();

async function readFeed({ source, url, google }) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/rss+xml, application/xml, text/xml' }, signal: AbortSignal.timeout(45000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const rows = [];
  for (const block of xml.split(/<item[\s>]/).slice(1)) {
    const tag = (name) => (block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1] || '';
    let title = stripTags(tag('title'));
    let src = source;
    if (google) {
      // Ang pamagat ng Google News ay "Headline - Pahayagan"; kunin ang pahayagan mula sa <source>.
      const s = stripTags(tag('source'));
      if (s) {
        src = s;
        if (title.endsWith(' - ' + s)) title = title.slice(0, -(' - ' + s).length).trim();
      }
    }
    const link = decodeEntities(tag('link')).trim();
    const desc = google ? '' : stripTags(tag('description'));
    const d = new Date(decodeEntities(tag('pubDate')));
    if (!title || !/^https?:\/\//.test(link) || Number.isNaN(d.getTime())) continue;
    if (!isAi(`${title} ${desc} ${src}`)) continue;
    rows.push({ title, link: google ? link : link.split('?')[0], source: src, pubDate: d.toISOString() });
  }
  return rows;
}

const OUT = new URL(MODE === 'digest' ? '../src/data/ph/ai-digest.json' : '../src/data/ph/news.json', import.meta.url);
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`news.json could not be read — stopping to protect the accumulated history: ${e.message}`);
    process.exit(1);
  }
}

const collected = [];
const ok = {};
for (const f of FEEDS) {
  const key = f.google ? `Google News (${decodeURIComponent(f.url.split('q=')[1].split('&')[0]).replace(' when:365d', '')})` : f.source;
  try {
    collected.push(...(await readFeed(f)));
    ok[key] = true;
  } catch (e) {
    ok[key] = false;
    console.error(`${key} failed — ${e.message}`);
  }
}
if (!Object.values(ok).some(Boolean)) {
  console.error('No feed could be read. Keeping the existing news.json.');
  process.exit(1);
}

const now = new Date();
const seen = new Set();
const norm = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const items = [...collected, ...existing]
  .filter((it) => {
    const key = norm(it.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`No change: finished with no new items (${items.length} kept)`);
  process.exit(0);
}
const sources = [...new Set(items.map((i) => i.source))].slice(0, 12).join(' · ');
await writeFile(OUT, JSON.stringify({ updatedAt: now.toISOString(), source: sources || 'Google News · Rappler · Philstar · BusinessWorld', items }, null, 2) + '\n', 'utf8');
console.log(`Collected: ${collected.length} new candidates / ${items.length} accumulated`);
for (const [k, v] of Object.entries(ok)) console.log(`  ${k}: ${v ? 'ok' : 'FAILED'}`);
