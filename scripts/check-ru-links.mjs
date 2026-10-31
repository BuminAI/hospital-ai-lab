// 러시아어판 출처 링크 매일 확인 (2026-10-31 신설, check-tw-links.mjs를 인도네시아판 경로로 옮김)
//
// 러시아어판 페이지·글·데이터에 적힌 외부 링크에 실제로 접속해 결과를 src/data/ru/link-health.json 에 쓴다.
// 러시아어판 푸터에 「Автоматическая проверка ссылок на источники」 날짜로 표시된다.
//
// 판정
//   ok      … 2xx/3xx (416은 Range가 맞지 않을 뿐 페이지는 있으므로 ok)
//   dead    … 404/410(페이지가 없어짐). 사람이 다시 볼 대상
//   unknown … 그 밖(403·429·5xx·타임아웃). 해외 GitHub 실행기에서의 접속을 정부 사이트가 막는 일이
//             있으므로 '링크 끊김'으로 단정하지 않는다(메모리: 403/해외 차단을 죽은 링크로 오판 금지).
//
// 자동 수집 목록(news.json·events.json·gov-notices.json·videos-local.json·ai-digest.json)은 대상이 아니다.
// 출처를 사람이 쓴 것이 아니라 수집할 때마다 바뀌기 때문이다.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const OUT = join(ROOT, 'src/data/ru/link-health.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab ru link checker';

async function walk(dir, exts, out = []) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

const SKIP_FILES = /(news|events|gov-notices|videos-local|link-health|ai-digest|law-watch)\.json$/;
const files = [
  ...(await walk(join(ROOT, 'src/content/blog-ru'), ['.md'])),
  ...(await walk(join(ROOT, 'src/pages/ru'), ['.astro'])),
  ...(await walk(join(ROOT, 'src/data/ru'), ['.json', '.ts'])),
  join(ROOT, 'src/i18n/ru.json'),
].filter((f) => !SKIP_FILES.test(f));

// URL 추출. `const X = 'https://…'` 같은 상수를 `${X}/path` 형태로 쓰는 페이지도 처리한다.
const urlsByFile = new Map();
for (const f of files) {
  let t;
  try {
    t = await readFile(f, 'utf8');
  } catch {
    continue;
  }
  const consts = {};
  for (const m of t.matchAll(/const\s+(\w+)\s*=\s*['"`](https?:\/\/[^'"`$]+)['"`]/g)) consts[m[1]] = m[2];
  t = t.replace(/\$\{(\w+)\}/g, (all, k) => consts[k] ?? all);
  const found = new Set();
  for (const m of t.matchAll(/https?:\/\/[^\s"'<>)\]\\`｜」）、。,;]+/g)) {
    let u = m[0].replace(/[.:]+$/, '');
    if (/\$\{|\{|\}/.test(u)) continue;
    if (/hospital-ai-lab\.com|localhost|fonts\.(googleapis|gstatic)|schema\.org|w3\.org|youtube\.com\/watch|img\.youtube\.com/.test(u)) continue;
    found.add(u);
  }
  if (found.size) urlsByFile.set(relative(ROOT, f).split(sep).join('/'), found);
}

const all = new Map(); // url -> files[]
for (const [f, set] of urlsByFile) for (const u of set) (all.get(u) ?? all.set(u, []).get(u)).push(f);

async function check(url) {
  const opts = (method) => ({
    method,
    redirect: 'follow',
    headers: { 'user-agent': UA, accept: '*/*', range: 'bytes=0-0' },
    signal: AbortSignal.timeout(20000),
  });
  try {
    let res = await fetch(url, opts('HEAD'));
    // 사이트에 따라 HEAD만 404/403/405를 돌려주기도 한다. 실패하면 반드시 GET으로 다시 확인한 뒤 판정한다.
    if (!(res.status >= 200 && res.status < 400)) res = await fetch(url, opts('GET'));
    return res.status;
  } catch (e) {
    try {
      const res = await fetch(url, opts('GET'));
      return res.status;
    } catch {
      return 0;
    }
  }
}

const urls = [...all.keys()];
const results = new Map();
let idx = 0;
async function worker() {
  while (idx < urls.length) {
    const u = urls[idx++];
    results.set(u, await check(u));
    await new Promise((r) => setTimeout(r, 150));
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

let ok = 0;
const unknownList = [];
const dead = [];
for (const [u, s] of results) {
  // 416은 Range 지정이 맞지 않는다는 뜻일 뿐 페이지는 존재한다
  if ((s >= 200 && s < 400) || s === 416) ok++;
  else if (s === 404 || s === 410) dead.push({ url: u, status: s, files: all.get(u).slice(0, 5) });
  else unknownList.push({ url: u, status: s });
}
const unknown = unknownList.length;

// 전부 확인 불가(실행기가 통째로 차단됨)면 데이터를 덮어쓰지 않는다
if (urls.length > 0 && ok === 0) {
  console.error('한 건도 확인하지 못했습니다(접속 자체가 막혔을 수 있음). link-health.json 을 갱신하지 않습니다.');
  process.exit(1);
}

const data = {
  checkedAt: new Date().toISOString(),
  total: urls.length,
  ok,
  unknown,
  unknownList,
  dead,
};
await writeFile(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`출처 링크 확인: ${urls.length}건 / 정상 ${ok} / 확인 불가 ${unknown} / 페이지 없음 ${dead.length}`);
for (const d of dead) console.log(`  ✗ ${d.status} ${d.url} (${d.files.join(', ')})`);
