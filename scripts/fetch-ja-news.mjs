// 일본어판 의료 AI·医療DX 뉴스 수집기 (2026-09-06 신설)
//
// ⚠️ 일본어판 뉴스는 오랫동안 보류돼 있었다. 처음 조사 때 후생노동성 RSS는
//    재배포가 금지돼 쓸 수 없었고(HANDOFF 5-2 참고), 그 뒤로 손대지 않았다.
//    2026-09-06에 다시 찾아 CBnews의 DX 지면을 확인하고 신설했다.
//
// 수집원 (2026-09-06 실측)
//   1) CBnews(cbnews.jp) 「DX」 지면 — 병원 경영·의료행정 매체의 医療DX 전담
//      지면이다. 주제로 이미 좁혀져 있어 그대로 받는다(한국어판 메디칼타임즈
//      '의료기기·AI' 지면과 같은 성격). 실측 49건, 電子カルテ情報共有·
//      政府が医療・介護分野でAI活用推進へ 같은 기사가 들어온다.
//   2) CBnews 「病院DX」 특집 지면 — 같은 매체의 사례 중심 지면.
//      ⚠️ 이쪽에는 「PR」 표시가 붙은 광고 기사가 섞인다. 제목에 PR이 붙은
//         것은 반드시 뺀다 — 광고를 뉴스로 싣지 않는다.
//
// ⚠️ 쓰지 못한 곳 (2026-09-06 실측, 되살아나면 검토)
//   - 時事メディカル(medical.jiji.com) — 목록은 깔끔하게 파싱되지만 医療·臨床
//     지면 60건 중 AI·DX 교집합이 0건이었다. 임상 질환 뉴스가 대부분이라
//     이 사이트의 주제와 겹치지 않는다.
//   - Yahoo!ニュース 검색·時事メディカル 검색 — 결과가 서버에서 그려지지 않는다.
//   - ミクスOnline·m3.com — 목록에 날짜가 없거나 로그인이 필요하다.
//
// 저작권: 본문을 옮기지 않는다. 제목·링크·매체·발행일만 저장하고 원문으로
// 링크만 건다(다른 언어판과 같은 원칙).
//
// 누적 정책: 기존 src/data/ja/news.json 항목을 지우지 않고 병합한다(제목 기준
// 중복 제거). 한 지면이 실패해도 다른 지면은 계속하고, 전부 실패했을 때만
// 기존 파일을 그대로 두고 중단한다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/ja/news.json', import.meta.url);
const MAX_ITEMS = 300;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const CB_SOURCE = 'CBnews';
const CB_LISTS = [
  'https://www.cbnews.jp/news/category/dx',
  'https://www.cbnews.jp/mgt/hospital-dx/',
];

// 이 지면은 이미 DX 주제라 넓게 받되, 지면 구성이 바뀌어 엉뚱한 기사가
// 섞여 들어오는 것만 막는 최소한의 조건이다.
const TOPIC_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|人工知能|生成AI|機械学習|アルゴリズム|デジタル|DX|電子カルテ|オンライン診療|遠隔診療|ビッグデータ|データ利活用|ICT|システム|情報共有|標準化|マイナ保険証|クラウド|サイバー/;

// ⚠️ 광고 기사 제외. CBnews의 병원DX 특집에는 제목 옆에 「PR」이 붙은
//    스폰서 기사가 섞인다. 광고를 뉴스로 싣지 않는다.
const PR_RE = /(^|\s)PR(\s|$)/;

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

// XSS 방지: 본문에 태그가 섞여 들어오지 않게 한다(JSON-LD에도 그대로 실리므로).
const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

// 제목 정규화 — 같은 기사가 두 지면에 걸릴 때 한 건으로 묶는다.
// 일본어는 낱말 사이에 공백이 없어 공백·문장부호만 지우면 충분하다.
const normTitle = (t) =>
  (t || '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/["'“”‘’.,!?:;()[\]—－・、。，！？：；「」『』（）]/g, '');

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
          'accept-language': 'ja,en;q=0.8',
        },
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = new Error(`${e.message}${e.cause?.code ? ` (${e.cause.code})` : ''}`);
    }
    if (i < tries - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw last;
}

// ── CBnews ─────────────────────────────────────────────
// 카드: <a href="https://www.cbnews.jp/news/entry/20260828083508" class="card">
//         … <h3 class="card__ttl">제목</h3>
//         <p class="delivery-time">2026年08月28日 10:15</p>
//
// ⚠️ 날짜 자릿수를 1~2로 열어 둔다. 지금은 「08月28日」처럼 0을 채워 보내지만,
//    한 자리로 바뀌면 매치가 안 돼 그 기사가 조용히 버려진다 — 러시아어판에서
//    실제로 겪은 사고다(HANDOFF 6절). 처음부터 열어 두고 padStart로 보정한다.
async function fetchCb(listUrl) {
  const html = await (await fetchRetry(listUrl)).text();
  const rows = [];
  for (const part of html.split('/news/entry/').slice(1)) {
    const idM = part.match(/^(\d+)"/);
    if (!idM) continue;
    const block = part.slice(0, 2500);
    const titleM = block.match(/<h3 class="card__ttl">([\s\S]*?)<\/h3>/);
    const dateM = block.match(
      /class="delivery-time">\s*(\d{4})年(\d{1,2})月(\d{1,2})日(?:\s+(\d{1,2}):(\d{2}))?/
    );
    if (!titleM || !dateM) continue;
    const title = stripTags(titleM[1]);
    if (!title || PR_RE.test(title)) continue;
    const hh = (dateM[4] ?? '12').padStart(2, '0');
    const mm = dateM[5] ?? '00';
    const d = new Date(
      `${dateM[1]}-${dateM[2].padStart(2, '0')}-${dateM[3].padStart(2, '0')}T${hh}:${mm}:00+09:00`
    );
    if (Number.isNaN(d.getTime())) continue;
    rows.push({
      title,
      link: `https://www.cbnews.jp/news/entry/${idM[1]}`,
      source: CB_SOURCE,
      pubDate: d.toISOString(),
    });
  }
  return rows;
}

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okSources = 0;

for (const url of CB_LISTS) {
  try {
    const rows = await fetchCb(url);
    const kept = rows.filter((r) => TOPIC_RE.test(r.title));
    collected.push(...kept);
    okSources++;
    console.log(`${CB_SOURCE} ${url.replace('https://www.cbnews.jp', '')}: ${rows.length}건 중 ${kept.length}건 채택`);
  } catch (e) {
    console.error(`${CB_SOURCE} ${url} 수집 실패 — ${e.message}`);
  }
}

if (okSources === 0) {
  console.error('모든 수집원을 읽지 못했습니다. 기존 ja/news.json을 유지합니다.');
  process.exit(1);
}

// ── 기존 항목과 병합 (누적) ────────────────────────────
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`ja/news.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

const seen = new Set();
const items = [...collected, ...existing]
  .filter((it) => {
    const key = normTitle(it.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 기사 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify({ updatedAt: new Date().toISOString(), source: CB_SOURCE, items }, null, 2) + '\n',
  'utf8'
);
console.log(`수집 완료: 누적 ${items.length}건`);
