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

// 보건복지부 '공고' 게시판 RSS.
// GitHub Actions 러너(Azure 미국 대역)에서는 이 도메인에 TCP 연결 자체가
// 안 맺어진다(UND_ERR_CONNECT_TIMEOUT, 2026-07-20 실측). 같은 시각 국내
// PC와 다른 해외 인프라에서는 정상 접속되므로, 클라우드 IP 대역이 차단된
// 것으로 보인다. 접속 경로를 몇 가지 준비해 두고 되는 것을 쓴다.
const MOHW_RSS_CANDIDATES = [
  'https://www.mohw.go.kr/rss/board.es?mid=a10503010100&bid=0003',
  'http://www.mohw.go.kr/rss/board.es?mid=a10503010100&bid=0003',
  'https://mohw.go.kr/rss/board.es?mid=a10503010100&bid=0003',
];
const MOHW_SOURCE = '보건복지부';

const KHIDI_LIST = 'https://www.khidi.or.kr/board?menuId=MENU01108';
const KHIDI_BASE = 'https://www.khidi.or.kr';
const KHIDI_SOURCE = '한국보건산업진흥원';

// ── 대한병원협회 ─────────────────────────────────────
// '협회광장 > 공지사항' 게시판 (2026-07-27 오너 지시로 추가).
//
// ⚠️ '협회공고'(association-notice.do)는 쓰지 않는다 — 10건 전수 확인 결과
//    100%가 협회 자체 입찰공고(인쇄·인테리어·장비 구매)라 병원이 신청할 수
//    있는 지원사업이 하나도 없다. 건강보험공단을 뺀 것과 같은 이유다.
//
// ⚠️ 이 게시판은 상당수가 **보건복지부 공고를 회원 병원에 전달하는 글**이다
//    (실측: 40건 중 공모·모집 4건, 그중 2건이 이미 우리가 복지부에서 직접
//    수집 중인 공고의 재전달). 그래서 두 가지 장치를 뒀다.
//      1) 수집 순서상 **맨 마지막**에 둔다 → 중복 시 원문(복지부)이 채택된다.
//      2) 제목 정규화에서 「」·[] 괄호와 끝의 '안내/공고'를 떼어낸다
//         (`normTitle`) → "…참여 기관 공모"와 "…참여 기관 공모 안내"가 같은
//         글로 인식된다.
const KHA_LIST = 'https://www.kha.or.kr/kha_home/notice_list.do';
const KHA_VIEW = (no) =>
  `https://www.kha.or.kr/kha_home/notice_list.do?mode=view&articleNo=${no}`;
const KHA_SOURCE = '대한병원협회';

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

// 제목 정규화 — 같은 공고가 여러 기관을 거치며 조금씩 다른 제목으로 올라오는
// 것을 한 건으로 묶는다. 대한병원협회가 복지부 공고를 전달하면서 「」를 떼고
// 끝에 '안내'를 붙이는 식이라, 공백만 지우는 예전 방식으로는 중복이 걸러지지
// 않았다(2026-07-27 실측 확인).
//   "2026년도 「거점외상센터 설치지원사업」 참여 기관 공모"
//   "2026년도 거점외상센터 설치지원사업 참여 기관 공모 안내"  → 같은 글로 인식
const normTitle = (t) =>
  (t || '')
    .replace(/[\s ]/g, '')
    .replace(/[「」『』[\]()（）]/g, '')
    .replace(/(안내|공고|알림)+$/, '');

// CDATA는 태그를 지우기 "전에" 벗겨야 한다.
// <![CDATA[제목]]> 전체가 <[^>]+> 패턴에 통째로 걸려 제목이 사라지기
// 때문이다(2026-07-20에 보건복지부 RSS가 0건으로 나오던 원인).
const unwrapCdata = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

// 일시적 실패(네트워크·혼잡)에 대비한 재시도 fetch.
// 실패 원인을 알아볼 수 있게 하위 오류 코드까지 함께 남긴다 — Node의
// 'fetch failed'만으로는 차단인지 타임아웃인지 구분되지 않기 때문이다.
async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'ko-KR,ko;q=0.9',
        },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      const cause = e.cause?.code || e.cause?.message || e.name;
      last = new Error(`${e.message}${cause ? ` (${cause})` : ''}`);
    }
    if (i < tries - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw last;
}

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
// 뒤쪽 항목(의견조회·발령·협조요청·설명회·유공)은 2026-07-27 대한병원협회를
// 넣으면서 추가했다. 이 게시판은 복지부 고시·개정을 회원 병원에 전달하는 글이
// 많은데, 그건 병원이 '신청'할 수 있는 지원사업이 아니다.
const EXCLUDE_RE =
  /채용|공무원|임용|합격자|면접시험|인사발령|행정처분|공시송달|입찰|낙찰|(상임|자문|심사|감정|평가|운영)위원|위촉|정부포상|유공|표창|선정\s*결과|결과\s*공고|지침[^.]{0,20}개정|일부\s*개정|고시\s*개정|의견\s*조회|발령|협조\s*요청|설명회/;

// 채택 조건:
//   1) 제외 대상이 아니고
//   2) 지원사업 성격(공모·모집·신청 등)이 제목에 있고
//   3) 병원·의료 관련일 것 — 단 대한병원협회처럼 게시판 자체가 병원 대상이면
//      3)은 건너뛴다(skipMedCheck). 예: "환자안전 우수사례 공모전"은 병원 대상이
//      분명한데 MED_RE 단어가 하나도 없어 그냥 두면 걸러진다.
const isRelevant = (row) => {
  const { title, summary = '', skipMedCheck = false } = row;
  if (EXCLUDE_RE.test(title)) return false;
  if (!PROGRAM_RE.test(title)) return false;
  if (skipMedCheck) return true;
  return MED_RE.test(`${title} ${summary}`);
};

// ── 보건복지부 (RSS) ───────────────────────────────────
async function fetchMohw() {
  let res, lastErr;
  for (const url of MOHW_RSS_CANDIDATES) {
    try {
      res = await fetchRetry(url, 2);
      if (url !== MOHW_RSS_CANDIDATES[0]) console.log(`  (대체 경로 사용: ${url})`);
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!res) throw lastErr;
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
  const res = await fetchRetry(KHIDI_LIST);
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

// 대한병원협회 공지사항 파싱.
// 한 행이 <div class="tr ...>이고 그 안에
//   <div class="td tb_03"><a href="?mode=view&articleNo=N" ...><span>제목</span></a></div>
//   <div class="td tb_05">2026-07-28</div>
// 구조다. 상세 링크가 상대경로(?mode=view…)라 절대 URL로 다시 만든다.
//
// 이 게시판은 병원 대상이라 의료 관련성(MED_RE)을 따로 보지 않는다(skipMedCheck).
// 대신 고시·개정·의견조회 같은 '전달 공지'가 많아 EXCLUDE_RE 쪽을 더 촘촘히 본다.
async function fetchKha() {
  const res = await fetchRetry(KHA_LIST, 2);
  const html = await res.text();
  const rows = [];
  for (const part of html.split('<div class="tr ').slice(1)) {
    const block = part.slice(0, 3000);
    const idM = block.match(/articleNo=(\d+)/);
    const titleM = block.match(/<span>([\s\S]*?)<\/span>/);
    const dateM = block.match(/tb_05">\s*(\d{4}-\d{2}-\d{2})/);
    if (!idM || !titleM || !dateM) continue;
    const title = stripTags(titleM[1]);
    if (!title) continue;
    const d = new Date(`${dateM[1]}T00:00:00+09:00`);
    if (Number.isNaN(d.getTime())) continue;
    rows.push({
      title,
      link: KHA_VIEW(idM[1]),
      source: KHA_SOURCE,
      summary: '',
      pubDate: d.toISOString(),
      skipMedCheck: true,
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
  // 대한병원협회는 복지부 공고를 전달하는 경우가 많아 **맨 마지막**에 둔다.
  // 아래 dedup이 먼저 나온 것을 채택하므로, 같은 공고면 원문 기관이 남는다.
  [KHA_SOURCE, fetchKha],
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

// skipMedCheck는 판정에만 쓰고 저장 데이터에는 남기지 않는다.
const fresh = collected.filter(isRelevant).map(({ skipMedCheck, ...rest }) => rest);

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
const items = [...fresh, ...existing]
  .filter((it) => {
    const key = normTitle(it.title);
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
    `(보건복지부 ${bySource(MOHW_SOURCE)}건, 진흥원 ${bySource(KHIDI_SOURCE)}건, 병원협회 ${bySource(KHA_SOURCE)}건)`
);
