// 대만어판 정부 지원·공고 수집기 (2026-10-31 신설)
//
// 일본어판의 jGrants(補助金 공개 API)에 해당하는 것이 대만에는 없다. 대신 衛生福利部가
// 누리집 「公告訊息」에 보조(補(捐)助)·계획 공모(徵求)·신청 안내(申請作業須知)·설명회를 직접 올린다.
// 이 목록을 읽어 병원·의료기관이 볼 만한 것만 src/data/tw/gov-notices.json 에 쌓는다.
//
// 수집원
//   1) 衛福部 公告訊息 목록(lp-18-1 …) — 제목·링크·날짜(민국력 115-10-30 = 2026-10-30). 8쪽(약 160건).
//   2) 食藥署 공고 RSS(rssAnnouncement) — 醫療器材 관련만. 食藥署는 해외 IP에 HTTP 544를 줄 수 있어
//      실패해도 다른 수집원은 계속한다.
//
// 이용 조건: 정부 누리집 내용은 「政府資料開放授權條款-第1版」(출처 표시 시 복제·편집·재배포 가능, 衛福部
// 政府網站資料開放宣告 cp-81-155-1 확인)에 따라 쓸 수 있다. 제목·링크·날짜만 저장하고 본문은 옮기지 않는다.
//
// ⚠️ 이 목록은 「공고가 올라온 날」이지 마감일이 아니다. 신청 기간·자격·서류는 반드시 공고 원문에서
//    확인해야 한다(화면에도 그렇게 적는다). 마감일을 제목에서 추측해 넣지 않는다.
//
// 누적 정책: 기존 항목을 지우지 않고 링크 기준으로 병합한다. 하루 여러 번 돌아도 변경이 없으면 쓰지 않는다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/tw/gov-notices.json', import.meta.url);
const MAX_ITEMS = 400;
const MOHW_PAGES = 8;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const mohwUrl = (p) =>
  p === 1 ? 'https://www.mohw.gov.tw/lp-18-1.html' : `https://www.mohw.gov.tw/lp-18-1-${p}-20.html`;

// 이 사이트의 독자(병원 행정·간호)가 볼 만한 공고: 보조·공모·신청 안내·설명회·시범계획
const NOTICE_RE =
  /補\(捐\)助|補助|獎助|獎勵|徵求|徵件|公開徵求|申請作業須知|申請須知|申請簡章|試辦計畫|示範計畫|說明會|研討會|表揚計畫/;
// 개인의 자격·수련 선발이나 명단 공고는 병원 행정의 관심사가 아니다
const NOT_RE = /畢業後|選配|PGY|容量|認定合格|名單|推薦團體|遴選|遴聘/;

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
const strip = (s) => decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

async function get(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, 'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8' },
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) return await res.text();
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = e;
    }
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw last;
}

// 분류 표시(화면의 작은 표시용) — 제목의 낱말로만 정한다
function kindOf(t) {
  if (/補\(捐\)助|補助|獎助|獎勵/.test(t)) return '補助・計畫';
  if (/徵求|徵件|公開徵求/.test(t)) return '公開徵求';
  if (/說明會|研討會/.test(t)) return '說明會・研討會';
  return '申請・公告';
}

async function fetchMohw(page) {
  const html = await get(mohwUrl(page));
  const rows = [];
  for (const m of html.matchAll(
    /<a href="(https:\/\/www\.mohw\.gov\.tw\/cp-[\d-]+\.html)"[^>]*><p>([^<]{4,240})<\/p><time>(\d{3})-(\d{2})-(\d{2})<\/time>/g
  )) {
    const [, link, rawTitle, roc, mo, day] = m;
    const d = new Date(`${Number(roc) + 1911}-${mo}-${day}T12:00:00+08:00`); // 민국 + 1911 = 서기
    const title = strip(rawTitle);
    if (!title || Number.isNaN(d.getTime())) continue;
    rows.push({ title, link, source: '衛生福利部', pubDate: d.toISOString() });
  }
  return rows;
}

// 최신 20건의 담당 부서(DeptName)는 RSS에만 있다 — 링크로 찾아 붙인다.
async function fetchMohwDepts() {
  const xml = await get('https://www.mohw.gov.tw/rss-18-1.html');
  const map = new Map();
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const link = (m[1].match(/<link>([\s\S]*?)<\/link>/) || [])[1]?.trim();
    const dept = (m[1].match(/<DeptName>([\s\S]*?)<\/DeptName>/) || [])[1]?.trim();
    if (link && dept) map.set(link, dept);
  }
  return map;
}

async function fetchFda() {
  const xml = await get('https://www.fda.gov.tw/tc/rssAnnouncement.ashx');
  const rows = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const g = (k) => {
      const r = m[1].match(new RegExp(String.raw`<${k}>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?</${k}>`));
      return r ? r[1].trim() : '';
    };
    const title = strip(g('title'));
    const link = decode(g('link')).replace(/[?&]utm_[^&]*/g, '').replace(/&$/, '').replace(/^http:\/\//, 'https://');
    const d = new Date(g('pubDate'));
    if (!title || !link || Number.isNaN(d.getTime())) continue;
    rows.push({ title, link, source: '食品藥物管理署', pubDate: d.toISOString() });
  }
  return rows;
}

// ── 기존 데이터 ─────────────────────────────────────────
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`gov-notices.json 읽기 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

// ── 수집 ────────────────────────────────────────────────
const collected = [];
let ok = 0;
let mohwRows = 0;
for (let p = 1; p <= MOHW_PAGES; p++) {
  try {
    const rows = await fetchMohw(p);
    mohwRows += rows.length;
    for (const r of rows) if (NOTICE_RE.test(r.title) && !NOT_RE.test(r.title)) collected.push(r);
    ok++;
  } catch (e) {
    console.error(`衛福部 ${p}쪽 수집 실패 — ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 600));
}
console.log(`衛福部 公告訊息: ${mohwRows}건 중 ${collected.length}건 채택`);

try {
  const rows = await fetchFda();
  const kept = rows.filter((r) => /醫療器材/.test(r.title) && !NOT_RE.test(r.title));
  collected.push(...kept);
  ok++;
  console.log(`食藥署 공고: ${rows.length}건 중 ${kept.length}건 채택(醫療器材 관련)`);
} catch (e) {
  console.error(`食藥署 공고 수집 실패 — ${e.message}`);
}

if (ok === 0) {
  console.error('수집원을 하나도 읽지 못했습니다. 기존 gov-notices.json을 유지합니다.');
  process.exit(1);
}

let depts = new Map();
try {
  depts = await fetchMohwDepts();
} catch {
  // 담당 부서 표시는 없어도 된다
}

const byLink = new Map(existing.map((it) => [it.link, it]));
for (const r of collected) {
  const prev = byLink.get(r.link);
  const dept = depts.get(r.link) || prev?.dept || '';
  byLink.set(r.link, { title: r.title, link: r.link, source: r.source, dept, kind: kindOf(r.title), pubDate: r.pubDate });
}
const items = [...byLink.values()]
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 공고 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify({ updatedAt: new Date().toISOString(), source: '衛生福利部·食品藥物管理署', items }, null, 2) + '\n',
  'utf8'
);
console.log(`수집 완료: 누적 ${items.length}건`);
