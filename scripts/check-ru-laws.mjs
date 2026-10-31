// 러시아어판 근거 법령의 개정 여부를 매일 확인한다 (2026-10-31 신설, check-tw-laws/check-id-laws에 대응)
//
// КонсультантПлюс 공개 판의 문서 첫 화면에서 「(ред. от dd.mm.yyyy)」와 「Подготовлена редакция документа с изменениями,
// не вступившими в силу」(미시행 개정판 준비) 표시를 읽어 src/data/ru/law-watch.json 에 쓴다.
//   baseline … 본 연구소가 조문을 읽고 페이지를 쓴 시점의 최종 개정일·미시행 표시(사람이 갱신)
//   current  … 오늘 확인한 값
//   changed  … 개정일이 baseline 과 다르거나, 미시행 개정판 표시가 새로 생겼으면 true → 푸터에 「재확인 중」
// ⚠️ 내용을 자동으로 고치지 않는다. 읽지 못한 법령은 지난 값을 그대로 둔다(접속 실패를 개정으로 오판하지 않는다).
// ⚠️ КонсультантПлюс 본문 갱신에는 시차가 있다 — '개정이 없다'는 보증이 아니라 '공개 법령 DB에 개정이 올라오면 알아챈다'는 장치다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/ru/law-watch.json', import.meta.url);
const UA = 'Mozilla/5.0 (compatible; hospital-ai-lab ru law watcher)';

const C = 'https://www.consultant.ru/document/cons_doc_';
// 문서 첫 화면 제목엔 개정일이 없는 법령이 있어, 조문 한 곳(개정일 표기가 있는 페이지)을 대표로 읽는다.
const LAWS = [
  { id: 'LAW_61801', name: 'Федеральный закон № 152-ФЗ «О персональных данных»', url: C + 'LAW_61801/cbf4e15b7c330f9372e876cdf2bc928bad7950ef/' },
  { id: 'LAW_121895', name: 'Федеральный закон № 323-ФЗ «Об основах охраны здоровья граждан»', url: C + 'LAW_121895/9f906d460f9454a8a0d290738d9fc2798c1e865a/' },
  { id: 'LAW_34661', name: 'КоАП РФ (ст. 13.11)', url: C + 'LAW_34661/' },
  { id: 'LAW_220885', name: 'Федеральный закон № 187-ФЗ «О безопасности КИИ»', url: C + 'LAW_220885/c5051782233acca771e9adb35b47d3fb82c9ff1c/' },
  { id: 'LAW_507869', name: 'Приказ ФСТЭК России № 117', url: C + 'LAW_507869/' },
];

let prev = {};
try {
  const old = JSON.parse(await readFile(OUT, 'utf8'));
  for (const l of old.laws ?? []) prev[l.id] = l;
} catch {}

async function read(law) {
  const res = await fetch(law.url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const ed = (title.match(/ред\.\s*от\s*(\d{2}\.\d{2}\.\d{4})/) || text.match(/ред\.\s*от\s*(\d{2}\.\d{2}\.\d{4})/) || [])[1];
  if (!ed) throw new Error('дата редакции не найдена');
  const pending = /Подготовлена редакция документа с изменениями, не вступившими в силу/.test(text);
  const [d, m, y] = ed.split('.');
  return { edition: `${y}-${m}-${d}`, pending };
}

const laws = [];
let readOk = 0;
for (const law of LAWS) {
  const p = prev[law.id];
  let cur = p?.current ?? null;
  let pending = p?.pending ?? false;
  let lastRead = p?.lastRead ?? null;
  let error = null;
  try {
    const r = await read(law);
    cur = r.edition;
    pending = r.pending;
    lastRead = new Date().toISOString();
    readOk++;
  } catch (e) {
    error = String(e.message ?? e);
  }
  const baseline = p?.baseline ?? cur;
  const baselinePending = p?.baselinePending ?? pending;
  laws.push({
    id: law.id,
    name: law.name,
    baseline,
    baselinePending,
    current: cur,
    pending,
    changed: Boolean(baseline && cur && baseline !== cur) || (pending && !baselinePending),
    lastRead,
    error,
  });
  await new Promise((r) => setTimeout(r, 1200));
}

if (readOk === 0) {
  console.error('Ни один закон не прочитан. law-watch.json не обновляется.');
  process.exit(1);
}

await writeFile(OUT, JSON.stringify({ checkedAt: new Date().toISOString(), readOk, total: LAWS.length, laws }, null, 2) + '\n', 'utf8');
for (const l of laws) console.log(`${l.changed ? '★' : ' '} ${l.name} ред. ${l.current}${l.pending ? ' (+ не вступившая в силу)' : ''}${l.error ? ' — ' + l.error : ''}`);
