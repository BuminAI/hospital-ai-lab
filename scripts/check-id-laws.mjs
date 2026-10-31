// 인도네시아어판 근거 규정의 상태 변화를 매일 확인한다 (2026-10-31 신설, 대만어판 check-tw-laws.mjs에 대응)
//
// 인도네시아어판이 근거로 삼는 규정의 JDIH Kemenkes 문서 페이지를 읽어 아래 두 가지를 본다.
//   · 효력 상태(Status): Berlaku / Tidak Berlaku
//   · 관계 규정: 이 규정을 바꾸거나(Diubah/Mengubah) 폐지하는(Dicabut/Mencabut) 규정, 시행규정(Peraturan Pelaksanaan)
// 이 둘을 합친 '지문'을 baseline(본 연구소가 조문을 읽고 페이지를 쓴 시점)과 비교한다.
// 달라지면 changed=true → 푸터에 「재확인 중」으로 표시한다.
// ⚠️ 내용을 자동으로 고치지 않는다. 사람이 새 규정을 읽고 페이지를 고친 뒤 baseline 을 올린다.
// ⚠️ 읽지 못한 규정은 지난 값을 그대로 둔다(접속 실패를 개정으로 오판하지 않는다).
// ⚠️ 한계: JDIH의 관계 규정 표는 사람이 입력하므로 새 개정이 반영되기까지 시차가 있다. 이 감시는
//    '개정이 없다'는 보증이 아니라 '공식 법령 DB에 개정이 올라오면 알아챈다'는 장치다.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const OUT = new URL('../src/data/id/law-watch.json', import.meta.url);
const UA = 'Mozilla/5.0 (compatible; hospital-ai-lab id law watcher)';

const LAWS = [
  { slug: 'undang-undang-nomor-17-tahun-2023', name: 'UU 17/2023 tentang Kesehatan' },
  { slug: 'peraturan-pemerintah-nomor-28-tahun-2024', name: 'PP 28/2024 (pelaksanaan UU Kesehatan)' },
  { slug: 'peraturan-menteri-kesehatan-nomor-24-tahun-2022', name: 'Permenkes 24/2022 tentang Rekam Medis' },
  { slug: 'keputusan-menteri-kesehatan-republik-indonesia-nomor-hk0107menkes9512026', name: 'Kepmenkes HK.01.07/MENKES/951/2026 (izin edar alat kesehatan berbasis perangkat lunak)' },
];

let prev = {};
try {
  const old = JSON.parse(await readFile(OUT, 'utf8'));
  for (const l of old.laws ?? []) prev[l.slug] = l;
} catch {}

const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

async function read(slug) {
  const res = await fetch(`https://jdih.kemkes.go.id/documents/${slug}`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const lines = text(await res.text());
  const i = lines.indexOf('Judul');
  if (i < 0) throw new Error('페이지 형식 불일치');
  const title = lines[i + 1] ?? '';
  const si = lines.indexOf('Status', i);
  const status = si >= 0 ? lines[si + 1] : '';
  if (!status) throw new Error('상태 없음');
  // 관계 규정: 'Peraturan Terkait' ~ 'Unduh via QR Code' 사이 + Mencabut/Diubah 블록
  const rel = [];
  const start = lines.lastIndexOf('Peraturan Terkait');
  const end = lines.findIndex((l, k) => k > start && /^Unduh via QR Code/.test(l));
  if (start >= 0 && end > start) rel.push(...lines.slice(start, end));
  const sig = createHash('sha1').update(JSON.stringify({ status, rel })).digest('hex').slice(0, 12);
  return { title, status, sig, relCount: rel.filter((l) => l !== '-').length };
}

const laws = [];
let readOk = 0;
for (const law of LAWS) {
  const p = prev[law.slug];
  let cur = p?.current ?? null;
  let status = p?.status ?? null;
  let lastRead = p?.lastRead ?? null;
  let error = null;
  try {
    const r = await read(law.slug);
    cur = r.sig;
    status = r.status;
    lastRead = new Date().toISOString();
    readOk++;
  } catch (e) {
    error = String(e.message ?? e);
  }
  const baseline = p?.baseline ?? cur; // 최초 실행 값이 baseline. 이후는 사람이 올릴 때까지 유지
  laws.push({
    slug: law.slug,
    name: law.name,
    status,
    baseline,
    current: cur,
    changed: Boolean(baseline && cur && baseline !== cur) || (status && status !== 'Berlaku'),
    lastRead,
    error,
  });
  await new Promise((r) => setTimeout(r, 1200));
}

if (readOk === 0) {
  console.error('한 건도 읽지 못했습니다. law-watch.json 을 갱신하지 않습니다.');
  process.exit(1);
}

await writeFile(OUT, JSON.stringify({ checkedAt: new Date().toISOString(), readOk, total: LAWS.length, laws }, null, 2) + '\n', 'utf8');
for (const l of laws) console.log(`${l.changed ? '★変化 ' : '      '}${l.name} [${l.status}]${l.error ? ' 읽지 못함: ' + l.error : ''}`);
