// 예약 발행 시각이 지났는데 아직 사이트에 안 뜬 글이 있는지 확인한다 (2026-10-13 신설).
//
// .github/workflows/scheduled-publish.yml이 30분 간격으로 부른다. 결과는
//   - 표준 출력에 사람이 읽을 수 있는 목록,
//   - GITHUB_OUTPUT에 `due=true|false`
// 로 남긴다. due=true면 워크플로가 deploy.yml을 깨워 글을 공개한다.
//
// 판정: pubDate가 지금보다 과거이고(최근 7일 이내), 실제 사이트의 그 글 주소가 404인 글.
//   '라이브 주소를 직접 본다'는 점이 핵심이다 — 마지막 배포 시각을 추정하는 방식은
//   크론 지연·배포 실패에 약하지만, 실제로 뜨지 않았다면 언제든 다시 깨운다.
//
// 로컬 확인: node scripts/publish-due.mjs [--site https://hospital-ai-lab.com]
import { readdirSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const siteIdx = args.indexOf('--site');
const SITE = (siteIdx >= 0 ? args[siteIdx + 1] : 'https://hospital-ai-lab.com').replace(/\/$/, '');

const LOCALES = [
  { dir: 'src/content/blog', prefix: '' },
  { dir: 'src/content/blog-ja', prefix: '/ja' },
  { dir: 'src/content/blog-ru', prefix: '/ru' },
  { dir: 'src/content/blog-id', prefix: '/id' },
  { dir: 'src/content/blog-tw', prefix: '/tw' },
];
const LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
const now = Date.now();

function frontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_]\w*):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

const candidates = [];
for (const { dir, prefix } of LOCALES) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) continue;
  for (const f of readdirSync(abs)) {
    if (!f.endsWith('.md')) continue;
    const fm = frontmatter(readFileSync(join(abs, f), 'utf8'));
    if (!fm || fm.draft === 'true' || !fm.pubDate) continue;
    const t = new Date(fm.pubDate).getTime();
    if (!Number.isFinite(t) || t > now || now - t > LOOKBACK_MS) continue;
    const id = f.replace(/\.md$/, '');
    candidates.push({ id, url: `${SITE}${prefix}/blog/${id}/`, pubDate: fm.pubDate });
  }
}

const due = [];
for (const c of candidates) {
  try {
    // 캐시된 404를 피하려고 매번 다른 쿼리를 붙인다(정적 파일 서버는 쿼리를 무시한다).
    const res = await fetch(`${c.url}?_=${now}`, { method: 'HEAD', redirect: 'follow' });
    if (res.status === 404) due.push(c);
  } catch (e) {
    console.log(`확인 실패(건너뜀): ${c.url} — ${e.message}`);
  }
}

console.log(`최근 7일 공개 대상 ${candidates.length}편 중 아직 안 뜬 글 ${due.length}편`);
for (const d of due) console.log(`  - ${d.pubDate}  ${d.url}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `due=${due.length > 0 ? 'true' : 'false'}\n`);
}
