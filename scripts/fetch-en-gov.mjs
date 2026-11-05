// English edition "new federal documents" collector (2026-11-06; counterpart of fetch-ru-gov.mjs for Russia)
//
// Reads new rules and proposed rules from the Federal Register public API (federalregister.gov/api/v1; no key needed)
// for the agencies that matter to hospital operations (HHS, FDA, CMS, FTC) and keeps those whose title is about
// health privacy, health IT, medical devices, AI, security or payment technology in src/data/en/gov-notices.json.
//   - The U.S. has no single machine-readable feed of grants for hospitals, so the "latest documents" of this edition are
//     newly published RULES AND PROPOSED RULES, not support programs. The screen calls them that.
//   - Only title, document number, date and agency are copied, never the text. The link is the Federal Register page.
//   - If the API cannot be reached or nothing could be read, the existing file is left as it is. If nothing is new, nothing is written.
// ⚠️ The API answers a descriptive User-Agent; a browser-like request with unencoded brackets got a Cloudflare challenge on 2026-11-06.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/en/gov-notices.json', import.meta.url);
const API = 'https://www.federalregister.gov/api/v1/documents.json';
const UA = 'hospital-ai-lab regulation watcher (+https://hospital-ai-lab.com)';
const KEEP_DAYS = 540;
const MAX_ITEMS = 80;

const AGENCIES = [
  ['health-and-human-services-department', 'HHS'],
  ['food-and-drug-administration', 'FDA'],
  ['centers-for-medicare-medicaid-services', 'CMS'],
  ['federal-trade-commission', 'FTC'],
];

// The title must contain one of these words — this drops payment-rate tables and unrelated rules
const TOPIC =
  /health information|privacy|HIPAA|electronic health|health IT|health data|interoperab|artificial intelligence|\bAI\b|medical device|software|digital health|cybersecurity|security standard|information blocking|certification program|prior authorization|telehealth|telemedicine|nondiscrimination|decision support|breach notification|clinical decision/i;
const EXCLUDE = /wage index|payment rates?\b.*(hospice|skilled)|conflict of interest|advisory committee/i;

const TYPE_LABEL = { Rule: 'Final rule', 'Proposed Rule': 'Proposed rule' };

async function get(slug) {
  const q = new URLSearchParams();
  q.append('per_page', '100');
  q.append('order', 'newest');
  q.append('conditions[agencies][]', slug);
  q.append('conditions[type][]', 'RULE');
  q.append('conditions[type][]', 'PRORULE');
  for (const f of ['title', 'type', 'publication_date', 'document_number', 'html_url']) q.append('fields[]', f);
  const res = await fetch(`${API}?${q.toString()}`, {
    headers: { 'user-agent': UA, accept: 'application/json' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  return Array.isArray(d.results) ? d.results : [];
}

let old = { items: [] };
try {
  old = JSON.parse(await readFile(OUT, 'utf8'));
} catch {}

const found = new Map();
let okQueries = 0;
for (const [slug, label] of AGENCIES) {
  try {
    for (const it of await get(slug)) {
      if (!it.document_number || !it.publication_date) continue;
      if (!found.has(it.document_number)) found.set(it.document_number, { it, label });
    }
    okQueries++;
  } catch (e) {
    console.error(`Query failed (${label}): ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 600));
}
if (okQueries === 0) {
  console.error('Could not reach the Federal Register API. Keeping the existing file.');
  process.exit(1);
}

const since = Date.now() - KEEP_DAYS * 86400000;
const merged = new Map((old.items ?? []).map((i) => [i.eoNumber, i]));
let added = 0;
for (const { it, label } of found.values()) {
  const name = String(it.title || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!name || !TOPIC.test(name) || EXCLUDE.test(name)) continue;
  const date = String(it.publication_date).slice(0, 10);
  if (new Date(date).getTime() < since) continue;
  const item = {
    title: name,
    link: it.html_url,
    pubDate: date,
    kind: label,
    status: TYPE_LABEL[it.type] ?? it.type ?? '',
    source: 'federalregister.gov',
    eoNumber: it.document_number,
  };
  if (!merged.has(it.document_number)) added++;
  merged.set(it.document_number, item);
}

const items = [...merged.values()]
  .filter((i) => new Date(i.pubDate).getTime() >= since)
  .sort((a, b) => b.pubDate.localeCompare(a.pubDate))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items) === JSON.stringify(old.items ?? [])) {
  console.log(`No change (${items.length} kept)`);
} else {
  await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n', 'utf8');
  console.log(`New ${added}, total ${items.length}`);
}
