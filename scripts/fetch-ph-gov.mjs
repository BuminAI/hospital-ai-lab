// Kolektor ng "mga bagong ulat ng ahensya" para sa edisyong Filipino (2026-11-14; katapat ng fetch-sg-gov.mjs para sa Singapore)
//
// Binabasa ang dalawang pahinang bukas sa awtomatikong pagbasa:
//   - PhilHealth — Balita   https://www.philhealth.gov.ph/news/        (petsa MM-DD-YYYY + pamagat + link)
//   - WHO Philippines — Balita   https://www.who.int/philippines/news   (ang petsa ay nasa URL: DD-MM-YYYY-slug)
// at iniimbak ang lahat sa src/data/ph/gov-notices.json. Pamagat, petsa at link lamang ang kinokopya — hindi ang teksto.
// ⚠️ Ang mga site ng DOH, FDA Philippines, National Privacy Commission at DICT ay nagbabalik ng HTTP 403 sa automated na request (2026-11-14).
//    Huwag lampasan; magdagdag ng pinagmulan lamang kapag sumasagot ito sa payak at nakikilalang request.
// Kapag hindi mabasa ang pahina o walang makuhang aytem, hindi ginagalaw ang umiiral na file. Kapag walang bago, walang isinusulat.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/ph/gov-notices.json', import.meta.url);
const UA = 'Mozilla/5.0 (compatible; hospital-ai-lab regulation watcher; +https://hospital-ai-lab.com)';
const MAX_ITEMS = 120;

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&rsquo;|&#8217;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function getHtml(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(45000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const rows = [];
const problems = [];

// PhilHealth
try {
  const html = await getHtml('https://www.philhealth.gov.ph/news/');
  for (const m of html.matchAll(/<span>\s*(\d{2})-(\d{2})-(\d{4})\s*<\/span>\s*<a href="([^"]+)">([\s\S]*?)<\/a>/g)) {
    const [, mm, dd, yyyy, href, t] = m;
    const title = decode(t);
    if (!title) continue;
    const link = new URL(href, 'https://www.philhealth.gov.ph/news/').href;
    rows.push({ title, link, pubDate: `${yyyy}-${mm}-${dd}`, kind: 'PhilHealth', status: 'Balita' });
  }
} catch (e) {
  problems.push(`PhilHealth: ${e.message}`);
}

// WHO Philippines
try {
  const html = await getHtml('https://www.who.int/philippines/news');
  const seen = new Set();
  for (const m of html.matchAll(/<a[^>]*href="(\/philippines\/news\/detail\/(\d{2})-(\d{2})-(\d{4})-[^"]+)"[^>]*aria-label="([^"]+)"/g)) {
    const [, href, dd, mm, yyyy, label] = m;
    if (seen.has(href)) continue;
    seen.add(href);
    rows.push({ title: decode(label), link: `https://www.who.int${href}`, pubDate: `${yyyy}-${mm}-${dd}`, kind: 'WHO Philippines', status: 'Balita' });
  }
} catch (e) {
  problems.push(`WHO Philippines: ${e.message}`);
}
for (const p of problems) console.error(`${p} — nilaktawan.`);
if (!rows.length) {
  console.error('Walang makuhang aytem — hindi ginagalaw ang umiiral na file.');
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

const seen = new Set();
const items = [...rows, ...existing]
  .filter((it) => {
    if (!it.link || seen.has(it.link)) return false;
    seen.add(it.link);
    return true;
  })
  .sort((a, b) => b.pubDate.localeCompare(a.pubDate))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items.map((i) => i.link)) === JSON.stringify(existing.map((i) => i.link))) {
  console.log(`Walang bago (${items.length} ang nakalista).`);
  process.exit(0);
}
await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n');
console.log(`Naidagdag/na-update: ${items.length} aytem (${rows.length} nabasa ngayon).`);
