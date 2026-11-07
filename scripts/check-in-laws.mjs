// Daily check of whether the primary documents the India edition rests on have changed (2026-11-07; counterpart of check-en-laws.mjs)
//
// India has no public "amendment history" API like the U.S. eCFR, so each document is fingerprinted by what the server says about
// the file: Last-Modified, Content-Length and ETag from an HTTP HEAD request, written to src/data/in/law-watch.json.
//   baseline … the fingerprint at the time the author read the text and wrote the pages (updated by a person)
//   current  … the fingerprint read today
//   changed  … true when the two differ → the footer says "being rechecked"
// ⚠️ It never edits content by itself. A document that cannot be read keeps its previous value (a connection failure is not mistaken for a change).
// ⚠️ A changed fingerprint means the file was replaced, not necessarily that its meaning changed. A person reads it and updates the baseline.
// ⚠️ cdsco.gov.in is slow to connect from abroad and on 2026-11-07 answered over IPv6 only; GitHub's runners may only have IPv4, in which
//    case the CDSCO documents are reported as "could not be read" and keep their previous value.
import { readFile, writeFile } from 'node:fs/promises';
import https from 'node:https';

const OUT = new URL('../src/data/in/law-watch.json', import.meta.url);
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';

const LAWS = [
  { id: 'mdr-2017', name: 'Medical Devices Rules, 2017 (CDSCO PDF)', url: 'https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/m_device/Medical%20Devices%20Rules,%202017.pdf' },
  { id: 'mdsw-guidance', name: 'CDSCO Guidance Document on Medical Device Software (CDSCO/MD/GD/MDSW/01/2026)', url: 'https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Guidance-document-on-Medical-Device-Software-under-MDR-2017.pdf' },
  { id: 'dpdp-act', name: 'Digital Personal Data Protection Act, 2023 (Gazette copy hosted by PRS)', url: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Digital_Personal_Data_Protection_Act,_2023.pdf' },
  { id: 'icmr-ai', name: 'ICMR Ethical Guidelines for AI in Biomedical Research and Healthcare (2023)', url: 'https://www.icmr.gov.in/icmrobject/uploads/Guidelines/1724842648_ethical_guidelines_application_artificial_intelligence_biomed_rsrch_2023.pdf' },
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
