// English edition (Singapore) "new guidance documents" collector (2026-11-14; counterpart of fetch-in-gov.mjs for India)
//
// Reads the medical-device guidance documents that HSA (Health Sciences Authority) lists at
//   https://www.hsa.gov.sg/medical-devices/guidance-documents
// and keeps the ones whose title is about software, AI, machine learning, telehealth or cybersecurity in src/data/sg/gov-notices.json.
//   - Only the title, a date and the link to the PDF are copied — never the text.
//   - The page lists no publication date. The date is taken from the title when it carries one, e.g. "(2025 Dec)", and otherwise
//     it is the day this collector first saw the document, which is what the screen shows ("first listed").
//   - MOH documents (AIHGle) are kept by hand in the same file; this script never removes them.
//   - If the page cannot be read or has no parseable links, the existing file is left as it is. If nothing is new, nothing is written.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/sg/gov-notices.json', import.meta.url);
const PAGE = 'https://www.hsa.gov.sg/medical-devices/guidance-documents';
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';
const TOPIC = /software|artificial intelligence|machine learning|\bAI\b|SaMD|CDSS|telehealth|cyber|change management/i;
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const res = await fetch(PAGE, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(45000) }).catch((e) => {
  console.error(`HSA guidance page could not be read — keeping the existing file: ${e.message}`);
  process.exit(1);
});
if (!res.ok) {
  console.error(`HSA guidance page returned HTTP ${res.status} — keeping the existing file.`);
  process.exit(1);
}
const html = await res.text();

const rows = [];
for (const m of html.matchAll(/<a[^>]*href="(https:\/\/isomer-user-content\.by\.gov\.sg\/409\/[^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/g)) {
  let title = decode(m[2]).replace(/\s*\[PDF[^\]]*\].*$/i, '').replace(/\s+PUB$/i, '').trim();
  if (!title || !TOPIC.test(title)) continue;
  let pub = null;
  const dm = title.match(/\((\d{4})\s+([A-Za-z]{3})[a-z]*\)/);
  if (dm && dm[2].toLowerCase() in MONTHS) pub = new Date(Date.UTC(Number(dm[1]), MONTHS[dm[2].toLowerCase()], 1)).toISOString().slice(0, 10);
  rows.push({ title, link: m[1], dated: pub });
}
if (!rows.length) {
  console.error('No parseable document links (the page layout may have changed) — keeping the existing file.');
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
const today = new Date().toISOString().slice(0, 10);
const fresh = rows
  .filter((r) => !known.has(r.link))
  // A revision of a document already listed (same code such as GL-04) should not be treated as unrelated: it is simply a new link.
  .map((r) => ({ title: r.title, link: r.link, pubDate: r.dated ?? today, kind: 'HSA', status: r.dated ? 'Guidance' : 'Guidance (first listed)' }));

if (!fresh.length) {
  console.log('No new HSA guidance documents.');
  process.exit(0);
}
const items = [...fresh, ...existing].sort((a, b) => b.pubDate.localeCompare(a.pubDate)).slice(0, 80);
await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n');
console.log(`Added ${fresh.length} new HSA guidance document(s).`);
