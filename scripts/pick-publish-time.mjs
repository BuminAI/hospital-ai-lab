// 글 공개 시각 고르기 (2026-10-13 신설)
//
//   node scripts/pick-publish-time.mjs <ko|ja|ru|id|tw>
//   → 2026-10-13T14:47:00+09:00   (이 값을 글 frontmatter의 pubDate에 그대로 쓴다)
//
// 정해진 시각에 5개 언어판이 한꺼번에 올라오지 않도록, 그 언어판 독자의 낮 시간대
// (현지 09:10~21:40) 안에서 분 단위로 무작위 시각을 고른다. 이 값은 '거짓 시각'이 아니라
// **실제 공개 시각**이다 — src/content.config.ts가 이 시각이 지나기 전에는 글을 사이트에서
// 빼 두고, 그 시각 뒤의 첫 배포에서 공개한다(.github/workflows/scheduled-publish.yml이
// 30분 간격으로 배포를 깨운다). 그래서 구조화 데이터의 datePublished가 사실과 어긋나지 않는다.
//
// 규칙
//  - 지금부터 최소 25분 뒤여야 한다(커밋·배포 시간을 벌고, '이미 지난 시각'이 되지 않게).
//  - 오늘 현지 창에 30분 이상 남아 있지 않으면 다음 날 창에서 고른다.
//  - 같은 날 여러 번 호출해도 서로 독립적으로 고른다(언어판별로 한 번씩 부른다).
//
// 옵션: --now <ISO>  테스트용 현재 시각.   --seed <정수>  재현 가능한 난수.
const ZONES = {
  ko: { offsetMin: 9 * 60, label: '+09:00' }, // 서울
  ja: { offsetMin: 9 * 60, label: '+09:00' }, // 도쿄
  tw: { offsetMin: 8 * 60, label: '+08:00' }, // 타이베이
  id: { offsetMin: 7 * 60, label: '+07:00' }, // 자카르타(WIB)
  ru: { offsetMin: 3 * 60, label: '+03:00' }, // 모스크바
};
const WINDOW_START_MIN = 9 * 60 + 10;
const WINDOW_END_MIN = 21 * 60 + 40;
const MIN_LEAD_MS = 25 * 60 * 1000;
const MIN_ROOM_MS = 30 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const args = process.argv.slice(2);
const loc = args.find((a) => !a.startsWith('--'));
if (!loc || !ZONES[loc]) {
  console.error('사용법: node scripts/pick-publish-time.mjs <ko|ja|ru|id|tw> [--now ISO] [--seed N]');
  process.exit(2);
}
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const now = opt('--now') ? new Date(opt('--now')).getTime() : Date.now();
if (!Number.isFinite(now)) {
  console.error('--now 값을 해석할 수 없습니다.');
  process.exit(2);
}

// 시드가 있으면 mulberry32, 없으면 Math.random
let rand = Math.random;
if (opt('--seed') !== undefined) {
  let a = Number(opt('--seed')) >>> 0;
  rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const { offsetMin, label } = ZONES[loc];
const offsetMs = offsetMin * 60 * 1000;
// 현지 자정(UTC ms)
const localMidnight = (utcMs) => Math.floor((utcMs + offsetMs) / DAY) * DAY - offsetMs;

let picked = null;
for (let d = 0; d < 3 && picked === null; d++) {
  const base = localMidnight(now) + d * DAY;
  const start = base + WINDOW_START_MIN * 60 * 1000;
  const end = base + WINDOW_END_MIN * 60 * 1000;
  const earliest = Math.max(start, now + MIN_LEAD_MS);
  if (end - earliest >= MIN_ROOM_MS) {
    const t = earliest + rand() * (end - earliest);
    picked = Math.floor(t / 60000) * 60000; // 분 단위로 내림
  }
}
if (picked === null) {
  console.error('공개 시각을 고르지 못했습니다.');
  process.exit(1);
}

const local = new Date(picked + offsetMs).toISOString().slice(0, 19); // 현지 벽시계 시각
console.log(`${local}${label}`);
