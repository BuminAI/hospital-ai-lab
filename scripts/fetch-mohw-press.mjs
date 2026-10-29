// 보건복지부 보도자료 수집기
//
// 보건복지부 누리집 '보도자료' 게시판(bid=0027)의 RSS(robots.txt에서 허용된 경로)로
// 최신 목록을 읽고, 각 게시물 상세 페이지에서 첨부파일(PDF·hwpx)을 내려받아
// public/press/mohw/ 에 저장한다. 목록 정보는 src/data/press.json 에 쌓는다.
//
// 저작권: 게시물마다 공공누리 유형이 붙는다. 유형 1(출처표시)·3(변경금지)만 파일을
// 내려받아 우리 사이트에서 제공하고, 상업적 이용이 막힌 유형 2·4나 표시가 없는
// 게시물은 원문 링크만 건다. 파일은 가공하지 않고 원본 그대로 둔다(유형 3 준수).
//
// 누적 정책: 최근 MAX_ITEMS건만 유지하고, 밀려난 게시물의 파일은 함께 지운다.
// 변경이 없으면 아무것도 쓰지 않는다(워크플로가 자주 돌아도 불필요한 커밋 방지).
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';

const BASE = 'https://www.mohw.go.kr';
const RSS_URL = `${BASE}/rss/board.es?mid=a10503000000&bid=0027`;
const VIEW_URL = (no) => `${BASE}/board.es?mid=a10503010100&bid=0027&act=view&list_no=${no}`;
const DOWN_URL = (no, seq) => `${BASE}/boardDownload.es?bid=0027&list_no=${no}&seq=${seq}`;
const MAX_ITEMS = 40;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const FILE_DIR = new URL('../public/press/mohw/', import.meta.url);
const DATA_FILE = new URL('../src/data/press.json', import.meta.url);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab press fetcher';

// 첨부 가운데 이 확장자만 받는다. 확장자마다 본문 파일 1개씩(PDF·hwpx 모두).
const WANT = ['pdf', 'hwpx'];
const AI_RE = /(?<![A-Za-z])AI(?![A-Za-z])|인공지능|생성형|디지털 ?헬스|디지털 ?치료|의료 ?데이터|CDSS/;

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
const text = (s) => decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res;
}

function kstToIso(s) {
  const d = new Date(s.trim().replace(' ', 'T') + ':00+09:00');
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// 상세 페이지 → 제목·작성일·담당부서·공공누리 유형·첨부 목록
function parseView(html) {
  const title = text((html.match(/<h2 class="title"[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '');
  const dateM = html.match(/<strong>작성일<\/strong>[\s\S]*?<span>(\d{4}-\d{2}-\d{2} \d{2}:\d{2})<\/span>/);
  const deptM = html.match(/<strong>담당부서<\/strong>[\s\S]*?<span>([^<]*)<\/span>/);
  const licM = html.match(/alt="공공누리 (\d)유형"/);
  const files = [];
  for (const li of html.split('<li>').slice(1)) {
    const nameM = li.match(/alt="[^"]*첨부파일"\s*\/>\s*([^\n<]+?)\s*\n/);
    const seqM = li.match(/boardDownload\.es\?bid=0027&amp;list_no=\d+&amp;seq=(\d+)/);
    if (!nameM || !seqM) continue;
    const name = decode(nameM[1]);
    const ext = (name.split('.').pop() || '').toLowerCase();
    const sizeM = li.match(/\(\s*([\d.]+)\s*(KB|MB)/);
    files.push({ name, ext, seq: Number(seqM[1]), kb: sizeM ? Number(sizeM[1]) * (sizeM[2] === 'MB' ? 1024 : 1) : 0 });
  }
  return {
    title,
    pubDate: dateM ? kstToIso(dateM[1]) : null,
    dept: deptM ? decode(deptM[1]) : '',
    license: licM ? Number(licM[1]) : 0,
    files,
  };
}

// 같은 확장자 중 첫 번째(보통 본문)만 고른다. 별첨은 파일 이름에 '(별첨)'·'붙임'이 붙는다.
function pickFiles(files) {
  const out = [];
  for (const ext of WANT) {
    const list = files.filter((f) => f.ext === ext);
    const main = list.find((f) => !/^\s*[\[(]?\s*(별첨|붙임|참고)/.test(f.name)) || list[0];
    if (main) out.push(main);
  }
  return out;
}

// ── 기존 데이터 ─────────────────────────────────────────
let existing = [];
try {
  const prev = JSON.parse(await readFile(DATA_FILE, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`press.json 읽기 실패 — 중단: ${e.message}`);
    process.exit(1);
  }
}
const known = new Map(existing.map((it) => [it.id, it]));

// ── 목록 ────────────────────────────────────────────────
let ids;
try {
  const xml = await (await get(RSS_URL)).text();
  ids = [...xml.matchAll(/list_no=(\d+)/g)].map((m) => m[1]);
  ids = [...new Set(ids)];
} catch (e) {
  console.error(`목록 수집 실패 — 기존 데이터 유지: ${e.message}`);
  process.exit(1);
}
if (ids.length === 0) {
  console.error('RSS에서 게시물을 찾지 못했습니다. 기존 데이터를 유지합니다.');
  process.exit(1);
}

// ── 신규 게시물 처리 ────────────────────────────────────
await mkdir(FILE_DIR, { recursive: true });
const fresh = [];
for (const id of ids) {
  if (known.has(id)) continue;
  try {
    const v = parseView(await (await get(VIEW_URL(id))).text());
    if (!v.title || !v.pubDate) throw new Error('제목/작성일을 읽지 못함');
    const saved = [];
    if (v.license === 1 || v.license === 3) {
      for (const f of pickFiles(v.files)) {
        if (f.kb * 1024 > MAX_FILE_BYTES) continue;
        const res = await get(DOWN_URL(id, f.seq));
        const buf = Buffer.from(await res.arrayBuffer());
        const okMagic = f.ext === 'pdf' ? buf.subarray(0, 4).toString() === '%PDF' : buf.subarray(0, 2).toString() === 'PK';
        if (!okMagic || buf.length > MAX_FILE_BYTES) {
          console.error(`파일 건너뜀(형식 이상): ${id}/${f.seq}`);
          continue;
        }
        const rel = `${id}.${f.ext}`;
        await writeFile(new URL(rel, FILE_DIR), buf);
        saved.push({ ext: f.ext, name: f.name, path: `/press/mohw/${rel}`, bytes: buf.length });
      }
    }
    fresh.push({
      id,
      title: v.title,
      pubDate: v.pubDate,
      dept: v.dept,
      license: v.license,
      ai: AI_RE.test(v.title),
      link: `${BASE}/board.es?mid=a10503000000&bid=0027&list_no=${id}&act=view`,
      files: saved,
    });
  } catch (e) {
    console.error(`게시물 건너뜀(${id}): ${e.message}`);
  }
}

if (fresh.length === 0) {
  console.log(`변경 없음: 신규 게시물 없음 (누적 ${existing.length}건 유지)`);
  process.exit(0);
}

const items = [...fresh, ...existing]
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

// 목록에서 밀려난 게시물의 파일 정리
const keep = new Set(items.flatMap((it) => it.files.map((f) => f.path.split('/').pop())));
for (const name of await readdir(FILE_DIR)) {
  if (!keep.has(name)) await rm(new URL(name, FILE_DIR), { force: true });
}

await writeFile(
  DATA_FILE,
  JSON.stringify({ updatedAt: new Date().toISOString(), source: '보건복지부 보도자료', items }, null, 2) + '\n',
  'utf8'
);
const nFiles = fresh.reduce((n, it) => n + it.files.length, 0);
console.log(`수집 완료: 신규 ${fresh.length}건(파일 ${nFiles}개) / 누적 ${items.length}건`);
