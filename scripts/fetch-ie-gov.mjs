// English edition (Ireland) "HIQA news and publications" collector (2026-11-15; counterpart of fetch-ae-gov.mjs for the UAE edition)
//
// Reads HIQA's public RSS feed of news and publications (the 10 most recent items):
//   https://www.hiqa.ie/rss.xml
// and keeps them in src/data/ie/gov-notices.json, which the "HIQA news" page (/ie/calendar/) shows.
//   - Only the title, the date and the link are copied — never the text.
//   - Items about AI, data, information, digital health or devices are tagged "AI, data & digital"; the rest are kept as "HIQA publication"
//     so the page is never empty. Staff and board profile pages (links outside /reports-and-publications/ and /hiqa-news-updates/) are skipped.
//   - The date is the feed's pubDate. It is not a compliance deadline (see the page text).
//   - The feed holds only 10 items (the public news listing, two pages, is read too), so the file accumulates: existing items are never deleted (cap 80).
//   - If the feed cannot be read or has no items, the existing file is left as it is. If nothing is new, nothing is written.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/ie/gov-notices.json', import.meta.url);
const FEED = 'https://www.hiqa.ie/rss.xml';
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';
const TOPIC = /artificial intelligence|\bAI\b|digital|\bdata\b|information|technology|EHDS|health data|cyber|e-?health|medical device|software/i;

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
  console.error(`HIQA feed could not be read — keeping the existing file: ${lastErr}`);
  process.exit(1);
}
if (!res.ok) {
  console.error(`HIQA feed returned HTTP ${res.status} — keeping the existing file.`);
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
  if (!title || !/^https:\/\/www\.hiqa\.ie\/(reports-and-publications|hiqa-news-updates)\//.test(link) || Number.isNaN(d.getTime())) continue;
  rows.push({ title, link, pubDate: d.toISOString().slice(0, 10) });
}
// HIQA's RSS feed holds only 10 items, so the public news listing (two pages) is read too. A failure here is not fatal.
for (const page of [0, 1]) {
  try {
    const r = await fetch(`https://www.hiqa.ie/hiqa-news-updates${page ? `?page=${page}` : ''}`, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(45000) });
    if (!r.ok) continue;
    const html = await r.text();
    for (const m of html.matchAll(/<h2>\s*<a href="(\/hiqa-news-updates\/[^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<time datetime="([^"]+)"/g)) {
      const link = `https://www.hiqa.ie${m[1]}`;
      const d = new Date(m[3]);
      const title = decode(m[2]);
      if (!title || Number.isNaN(d.getTime()) || rows.some((x) => x.link === link)) continue;
      rows.push({ title, link, pubDate: d.toISOString().slice(0, 10) });
    }
  } catch {}
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
    kind: TOPIC.test(r.title) ? 'AI, data & digital' : 'HIQA publication',
    status: 'HIQA',
  }));

if (!fresh.length) {
  console.log('No new HIQA items.');
  process.exit(0);
}
const items = [...fresh, ...existing].sort((a, b) => b.pubDate.localeCompare(a.pubDate)).slice(0, 80);
await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n');
console.log(`Added ${fresh.length} new HIQA item(s).`);
