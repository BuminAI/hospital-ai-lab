// English edition (India) medical AI news collector — public RSS feeds, AI-related items only (2026-11-07)
//
// Three Indian health-sector publications publish plain RSS feeds that answered without a bot challenge on 2026-11-07:
//   1) ET HealthWorld   https://health.economictimes.indiatimes.com/rss/topstories
//   2) Express Healthcare   https://www.expresshealthcare.in/feed/
//   3) Medical Dialogues   https://medicaldialogues.in/feed
// (Business Standard returned "Access Denied" for its RSS, so it is not used — do not work around that.)
// None of the feeds is AI-only, so items are kept only when the headline or the summary mentions AI
// (the same idea as the Korean edition's selection of AI-related items from Hospital Newspaper).
//
// Accumulation: existing src/data/in/news.json items are kept and new items merged (de-duplicated by title).
// A failing feed does not stop the others; only when no feed could be read is the existing file left untouched.
// We copy only the headline, date and link — never the article text.
import { readFile, writeFile } from 'node:fs/promises';

const UA = 'hospital-ai-lab news fetcher (+https://hospital-ai-lab.com)';
const MAX_ITEMS = 300;

const FEEDS = [
  { source: 'ET HealthWorld', url: 'https://health.economictimes.indiatimes.com/rss/topstories' },
  { source: 'Express Healthcare', url: 'https://www.expresshealthcare.in/feed/' },
  { source: 'Medical Dialogues', url: 'https://medicaldialogues.in/feed' },
];

// "AI" is matched case-sensitively as a whole word so that "said", "air" etc. do not match.
const AI_WORD = /\bAI\b|\bA\.I\.|artificial intelligence|machine learning|generative|large language model|\bLLMs?\b|chatbot|agentic/i;
const AI_STRICT = /\bAI\b/;
const isAi = (t) => AI_STRICT.test(t) || AI_WORD.test(t);

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
    .replace(/&apos;/g, "'")
    .trim();
}
// XSS guard: no tags may slip in (the title also goes into JSON-LD).
const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

async function readFeed({ source, url }) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/rss+xml, application/xml, text/xml' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const rows = [];
  for (const block of xml.split(/<item[\s>]/).slice(1)) {
    const tag = (name) => (block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1] || '';
    const title = stripTags(tag('title'));
    const link = decodeEntities(tag('link')).split('?')[0].trim();
    const desc = stripTags(tag('description'));
    const d = new Date(decodeEntities(tag('pubDate')));
    if (!title || !/^https?:\/\//.test(link) || Number.isNaN(d.getTime())) continue;
    if (!isAi(`${title} ${desc}`)) continue;
    rows.push({ title, link, source, pubDate: d.toISOString() });
  }
  return rows;
}

let existing = [];
try {
  const prev = JSON.parse(await readFile(new URL('../src/data/in/news.json', import.meta.url), 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`in/news.json could not be read — stopping to protect the accumulated history: ${e.message}`);
    process.exit(1);
  }
}

const collected = [];
const ok = {};
for (const f of FEEDS) {
  try {
    collected.push(...(await readFeed(f)));
    ok[f.source] = true;
  } catch (e) {
    ok[f.source] = false;
    console.error(`${f.source} failed — ${e.message}`);
  }
}
if (!Object.values(ok).some(Boolean)) {
  console.error('No feed could be read. Keeping the existing in/news.json.');
  process.exit(1);
}

const now = new Date();
const seen = new Set();
const norm = (t) => (t || '').toLowerCase().replace(/\s+/g, '');
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

await writeFile(
  new URL('../src/data/in/news.json', import.meta.url),
  JSON.stringify({ updatedAt: now.toISOString(), source: FEEDS.map((f) => f.source).join(' · '), items }, null, 2) + '\n',
  'utf8'
);
console.log(`Collected: ${collected.length} new candidates / ${items.length} accumulated (${FEEDS.map((f) => `${f.source} ${ok[f.source] ? 'ok' : 'FAILED'}`).join(', ')})`);
