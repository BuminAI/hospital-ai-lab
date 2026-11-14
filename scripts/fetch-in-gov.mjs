// English edition (India) "new regulator notices" collector (2026-11-07; counterpart of fetch-en-gov.mjs for the U.S.)
//
// Reads the public notices that CDSCO (Central Drugs Standard Control Organisation) posts at
//   https://cdsco.gov.in/opencms/opencms/en/Notifications/Public-Notices/
// and keeps the ones whose title is about medical devices, in vitro diagnostics, software or AI in src/data/in/gov-notices.json.
//   - India has no single machine-readable feed of grants or rules for hospitals, so the "latest documents" of this edition are
//     CDSCO notices about devices and software. The screen says so.
//   - Only the title, the release date and the link to the notice PDF are copied — never the text.
//   - If the page cannot be read or has no parseable rows, the existing file is left as it is. If nothing is new, nothing is written.
// ⚠️ Other Indian government sites (meity.gov.in, pib.gov.in, indiacode.nic.in, mohfw.gov.in, abdm.gov.in) refuse automated
//    requests (HTTP 403 on 2026-11-07). Do not work around that; add a source only after it answers a plain, identified request.
import { readFile, writeFile } from 'node:fs/promises';
import https from 'node:https';

const OUT = new URL('../src/data/in/gov-notices.json', import.meta.url);
const PAGE = 'https://cdsco.gov.in/opencms/opencms/en/Notifications/Public-Notices/';
const ORIGIN = 'https://cdsco.gov.in';
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';
const KEEP_DAYS = 730;
const MAX_ITEMS = 400; // 2026-11-14: 광폭 수집기와 같은 상한

// The title must contain one of these words — public notices are mostly about drugs and cosmetics, which this site does not cover.
const TOPIC = /medical device|\bMDR\b|in vitro|\bIVD\b|software|artificial intelligence|\bAI\b|digital|cyber|data protection|SaMD|device software|diagnostic/i;
const EXCLUDE = /cosmetic|misleading or false claims|raw materials|compounding authority|solvents|pharmacopoe/i;

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const decode = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// node's built-in fetch gives up after 10 s while connecting; cdsco.gov.in takes about 7-10 s to accept a connection from abroad
// (on 2026-11-07 it answered over IPv6 only; IPv4 timed out), so the page is read with https.get, trying both families with a
// long per-attempt timeout. GitHub's runners may only have IPv4: then this collector fails and keeps the existing file.
const getHtml = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'user-agent': UA, accept: 'text/html' }, autoSelectFamily: true, autoSelectFamilyAttemptTimeout: 15000, timeout: 60000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });

async function readPage() {
  // The connection is slow and sometimes times out, so try up to four times before giving up.
  let html = '';
  let lastErr;
  for (let i = 0; i < 4 && !html; i += 1) {
    try {
      html = await getHtml(PAGE);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  if (!html) throw lastErr;
  const rows = [];
  for (const tr of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []) {
    const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    if (cells.length < 4) continue;
    const title = decode(cells[1]);
    const dm = decode(cells[2]).match(/^(\d{4})-([A-Za-z]{3})-(\d{1,2})$/);
    const href = (cells[3].match(/href=['"]([^'"]+)['"]/) || [])[1];
    if (!title || !dm || !href || !(dm[2] in MONTHS)) continue;
    const d = new Date(Date.UTC(Number(dm[1]), MONTHS[dm[2]], Number(dm[3])));
    const link = new URL(href.replace(/&amp;/g, '&'), ORIGIN).href;
    const num = (link.match(/num_id=([^&]+)/) || [])[1] || '';
    rows.push({ title, link, pubDate: d.toISOString().slice(0, 10), kind: 'CDSCO', status: 'Public notice', source: 'cdsco.gov.in', eoNumber: num });
  }
  return rows;
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

let rows;
try {
  rows = await readPage();
} catch (e) {
  console.error(`CDSCO public notices could not be read — keeping the existing file: ${e.message}`);
  process.exit(1);
}
if (!rows.length) {
  console.error('No parseable rows (the page layout may have changed) — keeping the existing file.');
  process.exit(1);
}

const cutoff = Date.now() - KEEP_DAYS * 86400000;
const seen = new Set();
const items = [...rows.filter((r) => TOPIC.test(r.title) && !EXCLUDE.test(r.title)), ...existing]
  .filter((it) => {
    const key = it.link;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return new Date(it.pubDate).getTime() >= cutoff;
  })
  .sort((a, b) => (a.pubDate < b.pubDate ? 1 : a.pubDate > b.pubDate ? -1 : 0))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`No change: ${items.length} kept (${rows.length} rows read)`);
  process.exit(0);
}
await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n', 'utf8');
console.log(`Saved ${items.length} CDSCO notices (${rows.length} rows read)`);
