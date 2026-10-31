// 인도네시아어판 '최신 규정' 수집기 (2026-10-31 신설, 대만어판 fetch-tw-gov.mjs에 대응)
//
// 보건부(Kemenkes) 법령정보시스템 JDIH(jdih.kemkes.go.id)의 문서 목록에서, 병원 실무와 관련된
// 디지털·전자의무기록·원격의료·의료기기 규정만 골라 src/data/id/gov-notices.json 에 쌓는다.
//   - 인도네시아에는 일본 jGrants나 한국 보건복지부 공고처럼 병원이 신청할 수 있는 지원사업을
//     기계가 읽을 수 있게 모아 둔 공개 소스가 없다(gov-support.json _comment 참고). 그래서 이 판의
//     '최신 공고'는 지원사업이 아니라 **새로 나온 규정**이다. 화면에서도 그렇게 부른다.
//   - 검색(search=)은 본문까지 섞여 맞기 때문에, 제목에 주제어가 있는 것만 채택한다.
//   - 제목·번호·날짜·유형·효력 상태(Berlaku/Tidak Berlaku)만 옮기고 본문은 옮기지 않는다.
//   - 접속이 막히거나 한 건도 못 읽으면 기존 파일을 그대로 둔다. 새 항목이 없으면 쓰지 않는다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/id/gov-notices.json', import.meta.url);
const BASE = 'https://jdih.kemkes.go.id/documents';
const UA = 'Mozilla/5.0 (compatible; hospital-ai-lab id regulation watcher)';
const KEEP_DAYS = 540;
const MAX_ITEMS = 80;

const QUERIES = [
  'rekam medis',
  'SATUSEHAT',
  'sistem informasi',
  'digital',
  'elektronik',
  'telemedisin',
  'kecerdasan buatan',
  'alat kesehatan',
  'perangkat lunak',
  'data kesehatan',
  'keamanan siber',
  'rumah sakit',
];

// 제목(설명)에 이 낱말이 있어야 채택 — 일반 인사·교육 규정을 거른다
const TOPIC =
  /rekam medis|elektronik|digital|satusehat|telemedis|telekesehatan|kecerdasan buatan|artifisial|sistem informasi|perangkat lunak|alat kesehatan|data kesehatan|interoperabilitas|transformasi kesehatan|keamanan siber|pelindungan data|teknologi kesehatan|teknologi informasi|izin edar|pembelajaran daring/i;
const EXCLUDE = /penganugerahan|penghargaan|arsiparis/i;

const MONTH = { jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, agu: 8, aug: 8, ags: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12 };

function parseDate(s) {
  const m = s.trim().match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (!m) return null;
  const mo = MONTH[m[2].toLowerCase()];
  if (!mo) return null;
  return `${m[3]}-${String(mo).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
}

const strip = (h) =>
  h
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function parseCards(html) {
  const out = [];
  const parts = html.split('<div class="group relative bg-white border').slice(1);
  for (const p of parts) {
    const badges = [...p.matchAll(/rounded-full text-xs font-semibold[^>]*>([^<]+)</g)].map((m) => m[1].trim());
    const link = p.match(/href="(https:\/\/jdih\.kemkes\.go\.id\/documents\/[a-z0-9-]+)"/);
    const name = p.match(/<a[^>]+href="https:\/\/jdih\.kemkes\.go\.id\/documents\/[a-z0-9-]+"[^>]*>([^<]+)</);
    const date = p.match(/<span>(\d{1,2}\s+[A-Za-z]{3,}\s+\d{4})<\/span>/);
    const desc = p.match(/-webkit-box-orient:vertical;overflow:hidden;">([\s\S]*?)<\/p>/);
    if (!link || !name || !date) continue;
    const iso = parseDate(date[1]);
    if (!iso) continue;
    out.push({
      link: link[1],
      name: strip(name[1]),
      desc: desc ? strip(desc[1]) : '',
      pubDate: iso,
      kind: badges[0] ?? '',
      status: badges[1] ?? '',
    });
  }
  return out;
}

async function get(q, page = 1) {
  const res = await fetch(`${BASE}?search=${encodeURIComponent(q)}&page=${page}`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseCards(await res.text());
}

let old = { items: [] };
try {
  old = JSON.parse(await readFile(OUT, 'utf8'));
} catch {}

const found = new Map();
let okQueries = 0;
for (const q of QUERIES) {
  try {
    for (const page of [1, 2]) {
      const cards = await get(q, page);
      for (const c of cards) found.set(c.link, c);
      await new Promise((r) => setTimeout(r, 800));
    }
    okQueries++;
  } catch (e) {
    console.error(`검색 실패(${q}): ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 1500));
}
if (okQueries === 0) {
  console.error('JDIH에 접속하지 못했습니다. 기존 파일을 유지합니다.');
  process.exit(1);
}

const since = Date.now() - KEEP_DAYS * 86400000;
const merged = new Map(old.items.map((i) => [i.link, i]));
let added = 0;
for (const c of found.values()) {
  const text = `${c.name} ${c.desc}`;
  if (!TOPIC.test(text) || EXCLUDE.test(text)) continue;
  if (new Date(c.pubDate).getTime() < since) continue;
  const item = {
    title: c.desc && c.desc.length > c.name.length ? c.desc : c.name,
    link: c.link,
    pubDate: c.pubDate,
    kind: c.kind,
    status: c.status,
    source: 'JDIH Kemenkes',
  };
  if (!merged.has(c.link)) added++;
  merged.set(c.link, item); // 효력 상태가 바뀌면 갱신
}

const items = [...merged.values()]
  .filter((i) => new Date(i.pubDate).getTime() >= since)
  .sort((a, b) => b.pubDate.localeCompare(a.pubDate))
  .slice(0, MAX_ITEMS);

const before = JSON.stringify(old.items ?? []);
if (JSON.stringify(items) === before) {
  console.log(`변경 없음 (누적 ${items.length}건)`);
} else {
  await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n', 'utf8');
  console.log(`신규 ${added}건, 누적 ${items.length}건`);
}
