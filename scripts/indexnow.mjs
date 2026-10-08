// IndexNow 제출 (2026-09-20 신설).
//
// 배포가 끝난 뒤 최근 바뀐 페이지의 주소를 IndexNow에 알린다. IndexNow는 Bing·Naver·Yandex·
// Seznam·Yep·Amazon이 함께 쓰는 프로토콜이라(https://www.indexnow.org/faq) 한 번 제출하면
// 참여 검색엔진에 모두 전달된다. 네이버 서치어드바이저의 '웹페이지 수집 요청'을 대신하는
// 것은 아니고, 새 글을 더 빨리 발견하게 돕는 보조 신호다. 구글은 IndexNow에 참여하지 않는다.
//
// - 대상: 라이브 사이트맵(sitemap-index.xml → 언어판별 사이트맵)에서 lastmod가 최근
//   WINDOW_HOURS시간 안인 주소. 사이트맵의 lastmod는 파일별 마지막 git 커밋 시각이다.
// - 키: 사이트 루트의 <KEY>.txt 파일(공개 파일이며 비밀이 아니다, public/ 폴더에 있다).
//   제출 전에 그 파일이 실제로 열리는지 확인한다.
// - 실패해도 배포를 막지 않는다(워크플로에서 || true). 네트워크가 잠깐 안 되면 다음 배포 때
//   같은 주소가 다시 대상이 된다.
const HOST = 'hospital-ai-lab.com';
const KEY = '58e6f77ca4a00c93415149efbc04fc6f';
const WINDOW_HOURS = 48;
const SITE = `https://${HOST}`;

const text = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'hospital-ai-lab-indexnow/1.0' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
};
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const keyBody = (await text(`${SITE}/${KEY}.txt`)).trim();
if (keyBody !== KEY) throw new Error('키 파일 내용이 키와 다릅니다. 제출하지 않습니다.');

const cutoff = Date.now() - WINDOW_HOURS * 3600 * 1000;
const urls = new Set();
for (const sm of locs(await text(`${SITE}/sitemap-index.xml`))) {
  const xml = await text(sm);
  for (const block of xml.split('<url>').slice(1)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(block)?.[1];
    const mod = /<lastmod>([^<]+)<\/lastmod>/.exec(block)?.[1];
    if (loc && mod && new Date(mod).getTime() >= cutoff && loc.startsWith(SITE)) urls.add(loc);
  }
}
const urlList = [...urls].slice(0, 10000);
if (urlList.length === 0) {
  console.log('IndexNow: 최근 바뀐 주소가 없어 제출을 건너뜁니다.');
  process.exit(0);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
// 200: 접수, 202: 접수(키 검증 대기). 그 밖의 코드는 실패로 본다.
console.log(`IndexNow: ${urlList.length}개 주소 제출 → HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) {
  console.log((await res.text()).slice(0, 300));
  process.exit(1);
}
