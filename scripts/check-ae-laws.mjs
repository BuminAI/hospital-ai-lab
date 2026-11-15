// Daily check of whether the primary documents the UAE edition rests on have changed (2026-11-15; counterpart of check-sg-laws.mjs)
//
// The Abu Dhabi DoH and Dubai DHA publish these documents as files with no public "amendment history" API, so each document is fingerprinted by what the server says about
// the file: Last-Modified, Content-Length and ETag from an HTTP HEAD request, written to src/data/ae/law-watch.json.
//   baseline … the fingerprint at the time the author read the text and wrote the pages (updated by a person)
//   current  … the fingerprint read today
//   changed  … true when the two differ → the footer says "being rechecked"
// ⚠️ It never edits content by itself. A document that cannot be read keeps its previous value (a connection failure is not mistaken for a change).
// ⚠️ A changed fingerprint means the file was replaced, not necessarily that its meaning changed. A person reads it and updates the baseline.
import { readFile, writeFile } from 'node:fs/promises';
import https from 'node:https';

const OUT = new URL('../src/data/ae/law-watch.json', import.meta.url);
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';

const LAWS = [
  { id: 'doh-ai', name: 'Abu Dhabi DoH Policy on Use of Artificial Intelligence (Policy/AI/0.9, 2018)', url: 'https://www.doh.gov.ae/-/media/E9C1470A575146B18015DEBE57E47F8D.ashx' },
  { id: 'dha-ai', name: 'Dubai Health Authority policy Artificial Intelligence in the Healthcare (DHA/HISHD/PP-09)', url: 'https://www.dha.gov.ae/uploads/082022/Artificial%20Intelligence%20Policy20228457.pdf' },
  { id: 'doh-dpgs', name: 'DoH Digital Products Governance Standard (March 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/24032026--Digital-Products-Governance-Standard.ashx' },
  { id: 'doh-data-access', name: 'DoH Data Access Standard (January 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/11126_Data_Access_Standard.ashx' },
  { id: 'doh-dsii', name: 'DoH Data Sharing, Integration and Interoperability Standard (December 2025)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/Data-Sharing-Integration-and-Interoperability-Standard.ashx' },
  { id: 'doh-retention', name: 'DoH Data Storage and Retention Standard (December 2025)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Data-Storage-and-Retention_Standard.ashx' },
  { id: 'doh-analytics', name: 'DoH Analytics and Reporting Standard (April 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/070426Analytics-and-Reporting-Standard.ashx' },
  { id: 'doh-mdr', name: 'DoH Standard on Medical Device Reporting v2 (July 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/18826-Medical-Device-Reporting-Standard-MDR.ashx' },
  { id: 'doh-cyber', name: 'DoH Medical Device Cybersecurity in Healthcare Facilities Guideline (November 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/Medical-Device-Cybersecurity-in-healthcare-facilities-Guideline301026.ashx' },
  { id: 'doh-hie', name: 'DoH Policy on the Abu Dhabi Health Information Exchange (2020)', url: 'https://www.doh.gov.ae/-/media/A78104416DF2440E89AC90FB75F11055.ashx' },
];

let prev = {};
try {
  const old = JSON.parse(await readFile(OUT, 'utf8'));
  for (const l of old.laws ?? []) prev[l.id] = l;
} catch {}

// Some of these servers refuse HEAD (CDSCO answered 403, ICMR 405), so the file is requested with a one-byte Range and only the
// headers are used; the connection is dropped right after.
const head = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'user-agent': UA, range: 'bytes=0-0' }, autoSelectFamily: true, autoSelectFamilyAttemptTimeout: 15000, timeout: 60000 },
      (res) => {
        const h = { ...res.headers };
        res.destroy();
        if (res.statusCode !== 200 && res.statusCode !== 206) return reject(new Error(`HTTP ${res.statusCode}`));
        const total = (String(h['content-range'] ?? '').match(/\/(\d+)$/) || [])[1];
        if (total) h['content-length'] = total; // 206: the real file size is after the slash
        resolve(h);
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });

async function read(law) {
  let last;
  for (let i = 0; i < 3; i += 1) {
    try {
      const h = await head(law.url);
      const fp = [h['last-modified'] ?? '', h['content-length'] ?? '', h.etag ?? ''].join(' | ');
      if (!h['content-length'] && !h['last-modified'] && !h.etag) throw new Error('server sent no length, date or etag');
      return fp;
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw last;
}

const laws = [];
let readOk = 0;
for (const law of LAWS) {
  const p = prev[law.id];
  let cur = p?.current ?? null;
  let lastRead = p?.lastRead ?? null;
  let error = null;
  try {
    cur = await read(law);
    lastRead = new Date().toISOString();
    readOk++;
  } catch (e) {
    error = String(e.message ?? e);
  }
  const baseline = p?.baseline ?? cur;
  laws.push({
    id: law.id,
    name: law.name,
    url: law.url,
    baseline,
    baselinePending: false,
    current: cur,
    pending: false,
    changed: Boolean(baseline && cur && baseline !== cur),
    lastRead,
    error,
  });
}

if (readOk === 0) {
  console.error('No document could be read. law-watch.json is not updated.');
  process.exit(1);
}

await writeFile(OUT, JSON.stringify({ checkedAt: new Date().toISOString(), readOk, total: LAWS.length, laws }, null, 2) + '\n', 'utf8');
for (const l of laws) console.log(`${l.changed ? '★' : ' '} ${l.name} — ${l.current ?? 'not read'}${l.error ? ' — ' + l.error : ''}`);
