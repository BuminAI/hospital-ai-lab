// IndexNow 제출 (2026-09-20 신설, 2026-11-26 '바뀐 주소만 한 번씩'으로 변경).
//
// 배포가 끝난 뒤 **새로 생겼거나 내용이 바뀐** 페이지의 주소를 IndexNow에 알린다. IndexNow는 Bing·Naver·
// Yandex·Seznam·Yep·Amazon이 함께 쓰는 프로토콜이라(https://www.indexnow.org/faq) 한 번 제출하면 참여
// 검색엔진에 모두 전달된다. 네이버 서치어드바이저의 '웹페이지 수집 요청'을 대신하는 것은 아니고, 새 글을
// 더 빨리 발견하게 돕는 보조 신호다. 구글은 IndexNow에 참여하지 않는다.
//
// 왜 바꿨나: 예전에는 '최근 48시간에 바뀐 주소'를 배포 때마다 다시 보냈다. 이 사이트는 수집기 때문에 하루
// 40~50번 배포되므로 같은 주소가 하루에 수십 번 나갔다. IndexNow 안내는 바뀌지 않은 주소를 다시 보내지
// 말라고 한다(https://www.indexnow.org/faq).
//
// - 대상: 라이브 사이트맵의 주소 중, 지난 제출 기록에 없거나(새 페이지) lastmod가 기록보다 **새로운** 것.
//   lastmod는 파일·자료의 마지막 git 커밋 시각이다(src/utils/git-lastmod.mjs).
// - 같은 주소는 MIN_GAP_HOURS 안에 다시 보내지 않는다. 뉴스 목록처럼 하루에도 여러 번 바뀌는 페이지가
//   반복 제출되지 않게 하기 위해서다. 미뤄진 주소는 기록을 갱신하지 않으므로 시간이 지나면 한 번 나간다.
// - 기록: INDEXNOW_STATE 파일({ 주소: { mod, sent } }). deploy.yml이 actions/cache로 배포 사이에 넘긴다.
//   기록이 없으면(처음 실행·캐시 삭제) 전부 다시 보내지 않고, 최근 FIRST_RUN_HOURS 안에 바뀐 주소만 보낸 뒤
//   나머지는 '이미 알린 것'으로 적는다.
// - 제출이 실패하면 그 주소의 기록을 갱신하지 않아 다음 배포에서 다시 대상이 된다.
// - 키: 사이트 루트의 <KEY>.txt 파일(공개 파일이며 비밀이 아니다, public/ 폴더에 있다).
//   제출 전에 그 파일이 실제로 열리는지 확인한다. 실패해도 배포를 막지 않는다(워크플로에서 || echo).
// - INDEXNOW_DRY=1 이면 실제로 보내지 않고 대상만 출력한다(점검용).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const HOST = 'hospital-ai-lab.com';
const KEY = '58e6f77ca4a00c93415149efbc04fc6f';
const SITE = `https://${HOST}`;
const STATE = process.env.INDEXNOW_STATE || '.indexnow-state/state.json';
const DRY = process.env.INDEXNOW_DRY === '1';
const MIN_GAP_HOURS = 12;
const FIRST_RUN_HOURS = 2;
const MAX_URLS = 10000;
const HOUR = 3600 * 1000;

const text = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'hospital-ai-lab-indexnow/1.0' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
};
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const time = (mod) => (mod ? Date.parse(mod) || 0 : 0);

/** 라이브 사이트맵의 { 주소 → lastmod('' 가능) }. 배포 직후 옛 캐시를 읽지 않도록 주소에 시각을 붙인다. */
async function readSitemap() {
  const bust = `?t=${Date.now()}`;
  const pages = new Map();
  for (const sm of locs(await text(`${SITE}/sitemap-index.xml${bust}`))) {
    const xml = await text(`${sm}${bust}`);
    for (const block of xml.split('<url>').slice(1)) {
      const loc = /<loc>([^<]+)<\/loc>/.exec(block)?.[1];
      const mod = /<lastmod>([^<]+)<\/lastmod>/.exec(block)?.[1] || '';
      if (loc && loc.startsWith(SITE)) pages.set(loc, mod);
    }
  }
  return pages;
}

async function loadState() {
  try {
    const data = JSON.parse(await readFile(STATE, 'utf8'));
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

async function saveState(state) {
  await mkdir(dirname(STATE), { recursive: true });
  await writeFile(STATE, JSON.stringify(state), 'utf8');
}

const pages = await readSitemap();
if (pages.size === 0) throw new Error('사이트맵에서 주소를 읽지 못했습니다. 제출하지 않습니다.');
const now = Date.now();
let state = await loadState();
const urlList = [];
let waiting = 0;

if (!state) {
  state = {};
  for (const [url, mod] of pages) {
    if (time(mod) >= now - FIRST_RUN_HOURS * HOUR) urlList.push(url);
    else state[url] = { mod, sent: 0 };
  }
  console.log(`IndexNow: 지난 기록이 없어 새로 만듭니다(최근 ${FIRST_RUN_HOURS}시간에 바뀐 주소만 대상).`);
} else {
  for (const [url, mod] of pages) {
    const prev = state[url];
    // 옛 사이트맵이 잠깐 보여도 다시 보내지 않도록 '더 새로운' lastmod만 바뀐 것으로 친다.
    if (prev && time(mod) <= time(prev.mod)) continue;
    if (prev && now - prev.sent < MIN_GAP_HOURS * HOUR) {
      waiting++;
      continue;
    }
    urlList.push(url);
  }
}

const batch = urlList.slice(0, MAX_URLS);
if (batch.length === 0) {
  console.log(`IndexNow: 새로 바뀐 주소가 없어 제출을 건너뜁니다(전체 ${pages.size}개, ${MIN_GAP_HOURS}시간 대기 중 ${waiting}개).`);
  await saveState(state);
  process.exit(0);
}

if (DRY) {
  console.log(`IndexNow(모의): ${batch.length}개 대상, 대기 ${waiting}개`);
  for (const u of batch.slice(0, 10)) console.log(`  ${u}`);
  for (const url of batch) state[url] = { mod: pages.get(url), sent: now };
  await saveState(state);
  process.exit(0);
}

const keyBody = (await text(`${SITE}/${KEY}.txt`)).trim();
if (keyBody !== KEY) throw new Error('키 파일 내용이 키와 다릅니다. 제출하지 않습니다.');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: batch }),
});
// 200: 접수, 202: 접수(키 검증 대기). 그 밖의 코드는 실패로 본다.
console.log(`IndexNow: ${batch.length}개 주소 제출 → HTTP ${res.status} (전체 ${pages.size}개, 대기 ${waiting}개)`);
if (res.status !== 200 && res.status !== 202) {
  console.log((await res.text()).slice(0, 300));
  await saveState(state); // 보내지 못한 주소는 기록하지 않았으므로 다음 배포에서 다시 대상이 된다.
  process.exit(1);
}
for (const url of batch) state[url] = { mod: pages.get(url), sent: now };
await saveState(state);
