// Collecteur de secours des actualités IA médicales de l'édition française — flux RSS publics, éléments IA et santé seulement (2026-11-15)
//
// Médias français dont les flux RSS publics ont répondu sans contrôle anti-robot le 2026-11-15 :
//   Le Quotidien du Médecin, Le Quotidien du Pharmacien, Infirmiers.com, DSIH.
// (Les flux de la HAS, de Légifrance et des Échos ont répondu HTTP 403 aux requêtes automatiques — ne pas les contourner.
//  La plupart des articles arrivent par le collecteur large (Google Actualités et flux de médias), voir scripts/wide-sources.mjs.)
// Les flux ne sont pas tous spécialisés en santé : un élément n'est retenu que si le titre ou le résumé mentionne l'IA ET un terme de santé.
//
// Accumulation: existing src/data/fr/news.json items are kept and new items merged (de-duplicated by title).
// A failing feed does not stop the others; only when no feed could be read is the existing file left untouched.
// We copy only the headline, date and link — never the article text.
import { keepRecent } from './lib/retention.mjs';
import { readFile, writeFile } from 'node:fs/promises';

const UA = 'hospital-ai-lab news fetcher (+https://hospital-ai-lab.com)';
const MAX_ITEMS = 1000; // 2026-11-14: 광폭 수집기(wide-collect)와 같은 상한

const FEEDS = [
  { source: 'Le Quotidien du Médecin', url: 'https://www.lequotidiendumedecin.fr/rss.xml' },
  { source: 'Le Quotidien du Pharmacien', url: 'https://www.lequotidiendupharmacien.fr/rss.xml' },
  { source: 'Infirmiers.com', url: 'https://www.infirmiers.com/rss.xml' },
  { source: 'DSIH', url: 'https://www.dsih.fr/rss' },
];
const HEALTH = /sant[ée]|h[ôo]pita|clinique|patient|m[ée]decin|soignant|infirmi|m[ée]dical|m[ée]dicament|\bCHU\b|\bHAS\b|ANSM|pharmaci|cancer|diagnosti/i;

// « IA » est cherché comme mot entier, sensible à la casse, pour ne pas confondre avec d'autres mots.
const AI_WORD = /intelligence artificielle|apprentissage (automatique|profond)|IA g[ée]n[ée]rative|grand(s)? mod[eè]les? de langage|\bLLMs?\b|agent(s)? conversationnel|chatbot|\bChatGPT\b/i;
const AI_STRICT = /(?<![A-Za-z])(IA|AI)(?![A-Za-z])/;
const isAi = (t) => (AI_STRICT.test(t) || AI_WORD.test(t)) && HEALTH.test(t);

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
  const prev = JSON.parse(await readFile(new URL('../src/data/fr/news.json', import.meta.url), 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`fr/news.json could not be read — stopping to protect the accumulated history: ${e.message}`);
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
// 최근 한 달 치 뉴스만 보관한다(scripts/lib/retention.mjs, 2026-11-26 오너 지시)
const items = keepRecent([...collected, ...existing])
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
  new URL('../src/data/fr/news.json', import.meta.url),
  JSON.stringify({ updatedAt: now.toISOString(), source: FEEDS.map((f) => f.source).join(' · '), items }, null, 2) + '\n',
  'utf8'
);
console.log(`Collected: ${collected.length} new candidates / ${items.length} accumulated (${FEEDS.map((f) => `${f.source} ${ok[f.source] ? 'ok' : 'FAILED'}`).join(', ')})`);
