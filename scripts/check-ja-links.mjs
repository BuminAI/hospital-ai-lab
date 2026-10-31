// 日本語版の出典リンク 毎日確認 (2026-10-31 新設)
//
// 日本語版のページ・記事・データに書かれた外部リンクに実際にアクセスし、結果を
// src/data/ja/link-health.json に書く。日本語版のフッターに「出典リンクの自動確認日」として出る。
//
// 判定
//   ok      … 2xx/3xx
//   dead    … 404/410(ページが無くなった)。人が見直す対象
//   unknown … それ以外(403・429・5xx・タイムアウト)。海外のGitHub実行機からの接続を
//             省庁サイトが断ることがあるため、これを「リンク切れ」と決めつけない
//             (メモリ: 403/海外ブロックを死んだリンクと誤判定しない)。
//
// 自動収集の一覧(news.json・subsidies.json・videos-local.json)は対象外。
// これらは出典を人が書いたものではなく、収集のたびに入れ替わるため。
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const OUT = join(ROOT, 'src/data/ja/link-health.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) hospital-ai-lab link checker';

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

const SKIP_FILES = /(news|subsidies|subsidy-notes|videos-local|link-health)\.json$/;
const files = [
  ...(await walk(join(ROOT, 'src/content/blog-ja'), ['.md'])),
  ...(await walk(join(ROOT, 'src/pages/ja'), ['.astro'])),
  ...(await walk(join(ROOT, 'src/data/ja'), ['.json', '.ts'])),
  join(ROOT, 'src/i18n/ja.json'),
].filter((f) => !SKIP_FILES.test(f));

// URL の取り出し。`const MHLW = 'https://…'` のような定数を、`${MHLW}/path` の形で使うページにも対応する。
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
    // HEAD は サイトによって 404/403/405 を返すことがある(CBnews は実在する記事でも HEAD だけ 404 になる)。
    // 失敗したら必ず GET でもう一度確かめてから判定する。
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
  // 416 は「Range の指定が合わない」という意味で、ページ自体は存在している(PMDA がこの応答を返す)
  if ((s >= 200 && s < 400) || s === 416) ok++;
  else if (s === 404 || s === 410) dead.push({ url: u, status: s, files: all.get(u).slice(0, 5) });
  else unknownList.push({ url: u, status: s });
}
const unknown = unknownList.length;

// 直前の結果が「全件 unknown」(実行機が丸ごと遮断された)ならデータを上書きしない
if (urls.length > 0 && ok === 0) {
  console.error('1件も確認できませんでした(接続自体が遮断された可能性)。link-health.json を更新しません。');
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
console.log(`出典リンク確認: ${urls.length}件 / 正常 ${ok} / 確認不可 ${unknown} / 見つからない ${dead.length}`);
for (const d of dead) console.log(`  ✗ ${d.status} ${d.url} (${d.files.join(', ')})`);
