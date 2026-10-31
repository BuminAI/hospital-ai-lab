// 러시아어판 '새 법령' 수집기 (2026-10-31 신설, 인도네시아어판 fetch-id-gov.mjs에 대응)
//
// 공식 법령공표 포털(publication.pravo.gov.ru) 공개 API에서 보건부·보건감독청·FSTEC·로스콤나드조르가 서명한 새 문서를 읽어
// 병원 실무와 관련된 것(개인정보·의료·정보보호·전자문서·의료기기 등)만 src/data/ru/gov-notices.json 에 쌓는다.
//   - 러시아에는 일본 jGrants처럼 병원이 신청하는 지원사업을 기계가 읽을 수 있게 모은 단일 공개 소스가 없다.
//     그래서 이 판의 '최신 공고'는 지원사업이 아니라 **새로 공표된 법령**이다. 화면에서도 그렇게 부른다.
//   - 제목·번호·일자·서명 기관만 옮기고 본문은 옮기지 않는다. 링크는 공식 공표 페이지다.
//   - 접속이 막히거나 한 건도 못 읽으면 기존 파일을 그대로 둔다. 새 항목이 없으면 쓰지 않는다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/ru/gov-notices.json', import.meta.url);
const API = 'http://publication.pravo.gov.ru/api/Documents';
const UA = 'Mozilla/5.0 (compatible; hospital-ai-lab ru regulation watcher)';
const KEEP_DAYS = 540;
const MAX_ITEMS = 80;

const AUTHORITIES = [
  ['a2b99d08-29c7-4a3f-901a-d1a7174428f8', 'Минздрав России'],
  ['64887f61-c77e-41ee-80d6-162eddeef1b8', 'Росздравнадзор'],
  ['18ac48dc-f1d9-4947-ab29-e243f1023b1f', 'ФСТЭК России'],
  ['bc7a65a3-80ef-4c88-8214-3ec5b29f9997', 'Роскомнадзор'],
];

// 제목에 이 낱말이 있어야 채택 — 인사·상훈·일반 보건 규정을 거른다
const TOPIC =
  /персональн|информац|электронн|цифров|искусственн|медицинск[а-я]+ изделi|медицинск[а-я]+ документ|медицинск[а-я]+ информац|телемедицин|единой государственной информационной|защит[а-я]+ информации|критическ[а-я]+ информационн|обезличиван|регистраци[а-я]+ медицинск|программн/i;
const EXCLUDE = /наград|почетн|почётн|аттестац[а-я]+ экспертов|конкурс|квалификационн/i;

async function get(id, page) {
  const url = `${API}?index=${page}&pageSize=30&SignatoryAuthorityId=${id}`;
  const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  return Array.isArray(d.items) ? d.items : [];
}

let old = { items: [] };
try {
  old = JSON.parse(await readFile(OUT, 'utf8'));
} catch {}

const found = new Map();
let okQueries = 0;
for (const [id, label] of AUTHORITIES) {
  try {
    for (const page of [1, 2]) {
      for (const it of await get(id, page)) {
        if (!it.eoNumber || !it.documentDate) continue;
        found.set(it.eoNumber, { it, label });
      }
      await new Promise((r) => setTimeout(r, 600));
    }
    okQueries++;
  } catch (e) {
    console.error(`조회 실패(${label}): ${e.message}`);
  }
}
if (okQueries === 0) {
  console.error('공표 포털에 접속하지 못했습니다. 기존 파일을 유지합니다.');
  process.exit(1);
}

const since = Date.now() - KEEP_DAYS * 86400000;
const merged = new Map(old.items.map((i) => [i.eoNumber, i]));
let added = 0;
for (const { it, label } of found.values()) {
  const name = String(it.complexName || it.title || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!name || !TOPIC.test(name) || EXCLUDE.test(name)) continue;
  const date = String(it.documentDate).slice(0, 10);
  if (new Date(date).getTime() < since) continue;
  const item = {
    title: name,
    link: `http://publication.pravo.gov.ru/document/${it.eoNumber}`,
    pubDate: date,
    kind: label,
    status: it.jdRegNumber ? `Минюст № ${it.jdRegNumber}` : '',
    source: 'publication.pravo.gov.ru',
    eoNumber: it.eoNumber,
  };
  if (!merged.has(it.eoNumber)) added++;
  merged.set(it.eoNumber, item);
}

const items = [...merged.values()]
  .filter((i) => new Date(i.pubDate).getTime() >= since)
  .sort((a, b) => b.pubDate.localeCompare(a.pubDate))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items) === JSON.stringify(old.items ?? [])) {
  console.log(`변경 없음 (누적 ${items.length}건)`);
} else {
  await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + '\n', 'utf8');
  console.log(`신규 ${added}건, 누적 ${items.length}건`);
}
