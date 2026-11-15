// Collecteur des actualités de la CNIL pour l'édition française (2026-11-15 ; pendant de fetch-ie-gov.mjs pour l'Irlande)
//
// Lit le flux RSS public des actualités de la CNIL (les 10 éléments les plus récents) :
//   https://www.cnil.fr/fr/rss.xml
// et les range dans src/data/fr/gov-notices.json, que la page « Actualités CNIL » (/fr/calendar/) affiche.
//   - Seuls le titre, la date et le lien sont copiés — jamais le texte.
//   - Les titres sur l'IA, la santé, les données de santé ou le numérique en santé sont étiquetés « IA, santé et données » ; les autres sont gardés
//     sous « Actualité CNIL » pour que la page ne soit jamais vide.
//   - La date est le pubDate du flux. Ce n'est pas une échéance de conformité (voir le texte de la page).
//   - Le flux ne compte que 10 éléments : le fichier s'accumule, les éléments existants ne sont jamais supprimés (plafond 80).
//   - Si le flux est illisible ou vide, le fichier existant reste intact. S'il n'y a rien de nouveau, rien n'est écrit.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/fr/gov-notices.json', import.meta.url);
const FEED = 'https://www.cnil.fr/fr/rss.xml';
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';
const TOPIC = /intelligence artificielle|(?<![A-Za-z])IA(?![A-Za-z])|sant[ée]|donn[ée]es de sant|num[ée]rique en sant|m[ée]dical|h[ôo]pita|dispositif|cyber|violation/i;

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

let res = null;
let lastErr = '';
for (let attempt = 0; attempt < 4 && !res; attempt++) {
  if (attempt) await new Promise((r) => setTimeout(r, 4000 * attempt));
  res = await fetch(FEED, { headers: { 'user-agent': UA, accept: 'application/rss+xml,text/xml,*/*' }, signal: AbortSignal.timeout(45000) }).catch((e) => {
    lastErr = `${e.message} ${e.cause?.code ?? ''}`.trim();
    return null;
  });
}
if (!res) {
  console.error(`CNIL feed could not be read — keeping the existing file: ${lastErr}`);
  process.exit(1);
}
if (!res.ok) {
  console.error(`CNIL feed returned HTTP ${res.status} — keeping the existing file.`);
  process.exit(1);
}
const xml = await res.text();

const rows = [];
for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
  const block = m[1];
  const get = (tag) => {
    const x = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return x ? decode(x[1]) : '';
  };
  const title = get('title');
  const link = get('link');
  const d = new Date(get('pubDate'));
  if (!title || !/^https:\/\/www\.cnil\.fr\//.test(link) || Number.isNaN(d.getTime())) continue;
  rows.push({ title, link, pubDate: d.toISOString().slice(0, 10) });
}
if (!rows.length) {
  console.error('No parseable items (the feed layout may have changed) — keeping the existing file.');
  process.exit(1);
}

let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`gov-notices.json could not be read — stopping to protect the accumulated history: ${e.message}`);
    process.exit(1);
  }
}

const known = new Set(existing.map((it) => it.link));
const fresh = rows
  .filter((r) => !known.has(r.link))
  .map((r) => ({
    title: r.title,
    link: r.link,
    pubDate: r.pubDate,
    kind: TOPIC.test(r.title) ? 'IA, santé et données' : 'Actualité CNIL',
    status: 'CNIL',
  }));

if (!fresh.length) {
  console.log('Aucune nouveauté CNIL.');
  process.exit(0);
}
const items = [...fresh, ...existing].sort((a, b) => b.pubDate.localeCompare(a.pubDate)).slice(0, 80);
await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n');
console.log(`Added ${fresh.length} nouveauté(s) CNIL.`);
