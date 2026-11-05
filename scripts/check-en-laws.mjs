// Daily check of whether the regulations the English edition rests on have been amended (2026-11-06; counterpart of check-ru-laws.mjs)
//
// Reads the eCFR versioner API (https://www.ecfr.gov/api/versioner/v1/versions/title-N.json?part=P), takes the latest amendment date
// among the sections of a part, and writes it to src/data/en/law-watch.json.
//   baseline … the latest amendment date at the time the author read the text and wrote the pages (updated by a person)
//   current  … the value read today
//   changed  … true when the latest amendment date differs from the baseline → the footer says "being rechecked"
// ⚠️ It never edits content by itself. A part that cannot be read keeps its previous value (a connection failure is not mistaken for an amendment).
// ⚠️ The eCFR is updated with a lag. This is not a guarantee that nothing changed; it is a device that notices when an amendment reaches the public database.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/en/law-watch.json', import.meta.url);
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';

const LAWS = [
  { id: '45-160', title: 45, part: 160, name: '45 CFR Part 160 (HIPAA general administrative requirements)' },
  { id: '45-164', title: 45, part: 164, name: '45 CFR Part 164 (HIPAA Security, Breach Notification and Privacy Rules)' },
  { id: '45-170', title: 45, part: 170, name: '45 CFR Part 170 (health IT certification program)' },
  { id: '45-171', title: 45, part: 171, name: '45 CFR Part 171 (information blocking)' },
  { id: '45-92', title: 45, part: 92, name: '45 CFR Part 92 (nondiscrimination in health programs, Section 1557)' },
];

let prev = {};
try {
  const old = JSON.parse(await readFile(OUT, 'utf8'));
  for (const l of old.laws ?? []) prev[l.id] = l;
} catch {}

async function read(law) {
  const url = `https://www.ecfr.gov/api/versioner/v1/versions/title-${law.title}.json?part=${law.part}`;
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: AbortSignal.timeout(45000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  const dates = (d.content_versions ?? []).map((v) => v.amendment_date).filter(Boolean).sort();
  if (dates.length === 0) throw new Error('no amendment dates found');
  return { edition: dates[dates.length - 1], pending: false };
}

const laws = [];
let readOk = 0;
for (const law of LAWS) {
  const p = prev[law.id];
  let cur = p?.current ?? null;
  let lastRead = p?.lastRead ?? null;
  let error = null;
  try {
    const r = await read(law);
    cur = r.edition;
    lastRead = new Date().toISOString();
    readOk++;
  } catch (e) {
    error = String(e.message ?? e);
  }
  const baseline = p?.baseline ?? cur;
  laws.push({
    id: law.id,
    name: law.name,
    baseline,
    baselinePending: false,
    current: cur,
    pending: false,
    changed: Boolean(baseline && cur && baseline !== cur),
    lastRead,
    error,
  });
  await new Promise((r) => setTimeout(r, 800));
}

if (readOk === 0) {
  console.error('No part could be read. law-watch.json is not updated.');
  process.exit(1);
}

await writeFile(OUT, JSON.stringify({ checkedAt: new Date().toISOString(), readOk, total: LAWS.length, laws }, null, 2) + '\n', 'utf8');
for (const l of laws) console.log(`${l.changed ? '★' : ' '} ${l.name} latest amendment ${l.current}${l.error ? ' — ' + l.error : ''}`);
