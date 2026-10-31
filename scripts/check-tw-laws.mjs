// 대만어판 근거 법령의 개정 여부를 매일 확인한다 (2026-10-31 신설)
//
// 대만어판 페이지·글이 근거로 삼는 법령 11건을 全國法規資料庫(law.moj.gov.tw)에서 읽어
// 「현재 시행본의 수정(또는 공포)일」을 src/data/tw/law-watch.json 에 쓴다.
//   baseline … 본 연구소가 조문을 직접 읽고 페이지를 쓴 시점의 수정일(사람이 갱신)
//   current  … 오늘 확인한 수정일
//   changed  … current 가 baseline 과 다르면 true → 푸터에 「법령 개정 확인 중」으로 표시
// ⚠️ 내용을 자동으로 고치지 않는다. 개정이 감지되면 사람이 조문을 다시 읽고 페이지를 고친 뒤
//    baseline 을 current 로 올린다(그때까지 푸터에 개정 사실이 노출된다).
// ⚠️ 접속이 막혀 읽지 못한 법령은 지난 값을 그대로 둔다(접속 실패를 개정으로 오판하지 않는다).
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const OUT = join(ROOT, 'src/data/tw/law-watch.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab tw law watcher';

// 최초 baseline: 2026-10-31 법규자료고에서 직접 읽은 값
const LAWS = [
  { pcode: 'I0050021', name: '個人資料保護法', baseline: '2025-11-11' },
  { pcode: 'L0020121', name: '醫療機構電子病歷製作及管理辦法', baseline: '2022-07-18' },
  { pcode: 'L0030106', name: '醫療器材管理法', baseline: '2020-01-15' },
  { pcode: 'L0030120', name: '醫療器材分類分級管理辦法', baseline: '2023-08-22' },
  { pcode: 'L0020021', name: '醫療法', baseline: '2026-09-23' },
  { pcode: 'L0020197', name: '通訊診察治療辦法', baseline: '2024-01-22' },
  { pcode: 'L0020227', name: '醫療事故預防及爭議處理法', baseline: '2022-06-22' },
  { pcode: 'A0030297', name: '資通安全管理法', baseline: '2025-09-24' },
  { pcode: 'A0030305', name: '資通安全事件通報應變及演練辦法', baseline: '2026-01-05' },
  { pcode: 'A0030304', name: '資通安全責任等級分級辦法', baseline: '2026-01-07' },
  { pcode: 'H0160093', name: '人工智慧基本法', baseline: '2026-01-14' },
];

let prev = {};
try {
  const old = JSON.parse(await readFile(OUT, 'utf8'));
  for (const l of old.laws ?? []) prev[l.pcode] = l;
} catch {}

function rocToIso(y, m, d) {
  return `${Number(y) + 1911}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

async function read(pcode) {
  const res = await fetch(`https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=${pcode}`, {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  const at = text.indexOf('法規名稱');
  if (at < 0) throw new Error('頁面格式不符');
  const head = text.slice(at, at + 400);
  // 修正日期 > 公布日期(한 번도 개정되지 않은 법은 公布日期만 있다)
  const m = head.match(/(修正日期|公布日期)\s*[：:]\s*民國\s*(\d+)\s*年\s*(\d+)\s*月\s*(\d+)\s*日/);
  if (!m) throw new Error('日期格式不符');
  if (/廢止日期/.test(head)) throw new Error('法規已廢止');
  return { kind: m[1], iso: rocToIso(m[2], m[3], m[4]) };
}

const laws = [];
let readOk = 0;
for (const law of LAWS) {
  const p = prev[law.pcode];
  const baseline = p?.baseline ?? law.baseline; // baseline 은 사람이 올릴 때까지 유지
  let current = p?.current ?? law.baseline;
  let checked = p?.lastRead ?? null;
  let error = null;
  try {
    const r = await read(law.pcode);
    current = r.iso;
    checked = new Date().toISOString();
    readOk++;
  } catch (e) {
    error = String(e.message ?? e);
  }
  laws.push({ pcode: law.pcode, name: law.name, baseline, current, changed: current !== baseline, lastRead: checked, error });
  await new Promise((r) => setTimeout(r, 800));
}

if (readOk === 0) {
  console.error('한 건도 읽지 못했습니다(접속이 막혔을 수 있음). law-watch.json 을 갱신하지 않습니다.');
  process.exit(1);
}

const data = { checkedAt: new Date().toISOString(), readOk, total: LAWS.length, laws };
await writeFile(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
for (const l of laws) console.log(`${l.changed ? '★改正 ' : '      '}${l.name} ${l.baseline} → ${l.current}${l.error ? ' (読めず: ' + l.error + ')' : ''}`);
