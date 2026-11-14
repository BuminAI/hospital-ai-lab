// Daily check of whether the primary documents the Singapore edition rests on have changed (2026-11-14; counterpart of check-in-laws.mjs)
//
// Singapore has no public "amendment history" API for these guidance documents, so each document is fingerprinted by what the server says about
// the file: Last-Modified, Content-Length and ETag from an HTTP HEAD request, written to src/data/sg/law-watch.json.
//   baseline … the fingerprint at the time the author read the text and wrote the pages (updated by a person)
//   current  … the fingerprint read today
//   changed  … true when the two differ → the footer says "being rechecked"
// ⚠️ It never edits content by itself. A document that cannot be read keeps its previous value (a connection failure is not mistaken for a change).
// ⚠️ A changed fingerprint means the file was replaced, not necessarily that its meaning changed. A person reads it and updates the baseline.
import { readFile, writeFile } from 'node:fs/promises';
import https from 'node:https';

const OUT = new URL('../src/data/sg/law-watch.json', import.meta.url);
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';

const LAWS = [
  { id: 'gl04-r4', name: 'HSA GL-04-R4 Regulatory Guidelines for Software Medical Devices (December 2025)', url: 'https://isomer-user-content.by.gov.sg/409/26808a93-6a7a-4551-8c66-13046c6124c5/gl-04-r4-regulatory-guidelines-for-software-medical-devices---a-life-cycle-approach-(2025-dec)-pub.pdf' },
  { id: 'gl07-r2', name: 'HSA GL-07-R2 Risk Classification of SaMD and Qualification of CDSS (July 2025)', url: 'https://isomer-user-content.by.gov.sg/409/ae814059-a3ff-4ce3-8192-4534a43ddc6f/gl-07-r2-guidelines-risk-classification-samd-cdss-(2025-jul)-pub.pdf' },
  { id: 'gn37-r1', name: 'HSA GN-37-R1 Change Management Program for SaMD (December 2024)', url: 'https://isomer-user-content.by.gov.sg/409/4e8620d9-267f-41f5-adc3-cc35456d3731/gn-37-r1-guidance-on-change-management-program-(cmp)-for-samd-including-machine-learning-enabled-samd.pdf' },
  { id: 'aihgle-2', name: 'MOH AI in Healthcare Guidelines (AIHGle) 2.0 (March 2026)', url: 'https://isomer-user-content.by.gov.sg/3/6636a140-7986-43f6-9861-096333138d59/AIHGle_2.0.pdf' },
  { id: 'pdpc-breach', name: 'PDPC Guide on Managing and Notifying Data Breaches (revised 15 March 2021)', url: 'https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/other-guides/guide-on-managing-and-notifying-data-breaches-under-the-pdpa-15-mar-2021.pdf' },
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
