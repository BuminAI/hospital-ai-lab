// 정부 지원사업 수집기 (병원·의료 분야)
//
// 병원 종사자에게 쓸모 있는 정부·공공기관 지원사업 공고를 모아
// src/data/gov-programs.json에 쌓는다. 본문을 옮기지 않고 원문으로
// 링크만 건다(저작권·정확성 모두 원문이 기준).
//
// 수집원 (2026-07-20 기준, 각각 실제 접속해 구조 확인함)
//   1) 보건복지부 '공고' 게시판 — RSS 제공(가장 안정적)
//   2) 한국보건산업진흥원(KHIDI) '사업공고' 게시판 — HTML 목록
//
// 넣지 않은 곳과 이유
//   - 국민건강보험공단: 공개 게시판이 '입찰공고'(공단이 물품을 사는 공고)와
//     '채용'뿐이라 병원 대상 지원사업이 아니다.
//   - 각 시도 자치단체: 17개 사이트 구조가 제각각이라 개별 파서가 필요하다.
//     기업마당·공공데이터포털 오픈API가 중앙·지방을 한 번에 제공하지만
//     회원가입 후 인증키 발급이 필요해(오너 계정) 지금은 넣지 않았다.
//
// 누적 정책: 기존 항목을 지우지 않고 병합한다(제목 기준 중복 제거).
// 공고는 마감이 있으므로 페이지에서 등록일을 함께 보여주고, 오래된 항목은
// MAX_ITEMS를 넘을 때만 오래된 순으로 잘라낸다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/gov-programs.json', import.meta.url);
const MAX_ITEMS = 200;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab gov-program fetcher';

const MOHW_RSS =
  'https://www.mohw.go.kr/rss/board.es?mid=a10503010100&bid=0003';
const MOHW_SOURCE = '보건복지부';

const KHIDI_LIST = 'https://www.khidi.or.kr/board?menuId=MENU01108';
const KHIDI_BASE = 'https://www.khidi.or.kr';
const KHIDI_SOURCE = '한국보건산업진흥원';

// 병원·의료 관련성 판정.
// 보건복지부 공고 게시판에는 아동·노인복지·기초생활 등 병원과 무관한
// 공고도 많이 올라온다. 이 사이트 독자(병원 행정·간호)에게 쓸모 있는
// 것만 남기기 위해 제목·요약에서 의료 신호를 확인한다.
const MED_RE =
  /병원|의료|보건소|보건의료|진료|간호|의사|약국|한의|치과|의료기관|요양기관|요양병원|바이오헬스|의료기기|디지털\s?헬스|헬스케어|감염|응급|외상|재활|임상|신약|제약|건강검진|의료인/;

// 지원사업 성격 신호(공모·모집·지원 등). 단순 행정처분 공시나 인사 공고를
// 걸러내기 위해 함께 확인한다.
const PROGRAM_RE =
  /공모|모집|지원사업|지원 사업|지원계획|선정|신청|접수|참여기관|참여 기관|시범사업|육성|공고/;

// CDATA는 태그를 지우기 "전에" 벗겨야 한다.
// <![CDATA[제목]]> 전체가 <[^>]+> 패턴에 통째로 걸려 제목이 사라지기
// 때문이다(2026-07-20에 보건복지부 RSS가 0건으로 나오던 원인).
const unwrapCdata = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

const decode = (s) =>
  s
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

const stripTags = (s) =>
  decode(unwrapCdata(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

// 같은 게시판에 올라오지만 '지원사업'이 아닌 것들을 제외한다.
// 직원 채용·공무원 임용, 위원 위촉, 입찰·계약, 시상(정부포상), 이미 끝난
// 선정결과 발표, 지침·고시 개정 등은 병원이 신청할 수 있는 사업이 아니다.
const EXCLUDE_RE =
  /채용|공무원|임용|합격자|면접시험|인사발령|행정처분|공시송달|입찰|낙찰|(상임|자문|심사|감정|평가|운영)위원|위촉|정부포상|유공자|표창|선정\s*결과|결과\s*공고|지침[^.]{0,20}개정|일부\s*개정|고시\s*개정/;

const isRelevant = (title, summary = '') => {
  if (EXCLUDE_RE.test(title)) return false;
  const text = `${title} ${summary}`;
  return MED_RE.test(text) && PROGRAM_RE.test(title);
};

// ── 보건복지부 (RSS) ───────────────────────────────────
async function fetchMohw() {
  const res = await fetch(MOHW_RSS, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`보건복지부 RSS 실패: HTTP ${res.status}`);
  const xml = await res.text();
  const rows = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const title = stripTags((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
    const link = decode((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '');
    const summary = stripTags(
      (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || ''
    );
    const pub = (block.match(/<pubDate>([^<]*)<\/pubDate>/) || [])[1];
    if (!title || !link || !pub) continue;
    const d = new Date(pub);
    if (Number.isNaN(d.getTime())) continue;
    rows.push({
      title,
      link,
      source: MOHW_SOURCE,
      summary: summary.slice(0, 200),
      pubDate: d.toISOString(),
    });
  }
  return rows;
}

// ── 한국보건산업진흥원 (HTML 목록) ─────────────────────
// 표 한 행이 <tr>이고, 제목은 링크의 title 속성, 등록일은 YYYY-MM-DD.
// 목록에 요약이 없어 제목만으로 판정한다.
async function fetchKhidi() {
  const res = await fetch(KHIDI_LIST, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`KHIDI 목록 실패: HTTP ${res.status}`);
  const html = await res.text();
  const rows = [];
  for (const part of html.split('<tr>').slice(1)) {
    const linkM = part.match(/href="(\/board\/view\?[^"]+)"/);
    const titleM = part.match(/title="([^"]+)"/);
    const dateM = part.match(/(20\d{2}-\d{2}-\d{2})/);
    if (!linkM || !titleM || !dateM) continue;
    const d = new Date(`${dateM[1]}T00:00:00+09:00`);
    if (Number.isNaN(d.getTime())) continue;
    rows.push({
      title: decode(titleM[1]),
      link: KHIDI_BASE + decode(linkM[1]),
      source: KHIDI_SOURCE,
      summary: '',
      pubDate: d.toISOString(),
    });
  }
  return rows;
}

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okSources = 0;
for (const [name, fn] of [
  [MOHW_SOURCE, fetchMohw],
  [KHIDI_SOURCE, fetchKhidi],
]) {
  try {
    const rows = await fn();
    collected.push(...rows);
    okSources++;
    console.log(`${name}: ${rows.length}건 읽음`);
  } catch (e) {
    console.error(`${name} 수집 실패 — ${e.message}`);
  }
}

// 모든 수집원이 실패하면 기존 파일을 지키고 중단한다.
if (okSources === 0) {
  console.error('모든 수집원을 읽지 못했습니다. 기존 gov-programs.json을 유지합니다.');
  process.exit(1);
}

const fresh = collected.filter((r) => isRelevant(r.title, r.summary));

// ── 기존 항목과 병합 (누적) ────────────────────────────
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`gov-programs.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

const seen = new Set();
const norm = (t) => (t || '').replace(/\s+/g, '');
const items = [...fresh, ...existing]
  .filter((it) => {
    const key = norm(it.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

// 변경이 없으면 파일을 건드리지 않는다 — 커밋·배포를 만들지 않기 위해.
if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 공고 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify(
    { updatedAt: new Date().toISOString(), items },
    null,
    2
  ) + '\n',
  'utf8'
);

const bySource = (s) => items.filter((i) => i.source === s).length;
console.log(
  `수집 완료: 신규 판정 ${fresh.length}건 / 누적 ${items.length}건 ` +
    `(보건복지부 ${bySource(MOHW_SOURCE)}건, 진흥원 ${bySource(KHIDI_SOURCE)}건)`
);
