// 브랜드 정적 이미지 생성기 (로컬 1회용 도구, CI 아님)
//   node scripts/gen-assets.mjs
// favicon.svg의 파란 배경 + 흰 십자 모티프를 확장해
//   - public/og-default.png (1200x630, 소셜 공유 대표 이미지)
//   - public/apple-touch-icon.png (180x180, iOS 홈 화면)
//   - public/favicon-32.png (32x32, PNG 파비콘 폴백)
// 를 만든다. sharp(라이브러리)는 이미 설치되어 있어 새 의존성이 없다.
import fs from 'node:fs';
import sharp from 'sharp';

const BLUE = '#0B5394';
const BLUE_DARK = '#084070';
// favicon.svg의 십자 경로(64 viewBox 기준)
const CROSS = 'M27 16h10v11h11v10H37v11H27V37H16V27h11z';

const KFONT = "Malgun Gothic, 'Apple SD Gothic Neo', sans-serif";

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${BLUE_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- 로고 타일: 흰 라운드 사각 + 파란 십자 -->
  <rect x="100" y="120" width="120" height="120" rx="28" fill="#ffffff"/>
  <g transform="translate(128,148) scale(1.0)">
    <path d="${CROSS}" fill="${BLUE}"/>
  </g>
  <text x="100" y="380" font-family="${KFONT}" font-size="92" font-weight="700" fill="#ffffff" letter-spacing="-2">병원 AI 연구소</text>
  <text x="103" y="450" font-family="${KFONT}" font-size="40" font-weight="400" fill="#ffffff" fill-opacity="0.88">의료 현장의 문제를 AI로 풉니다.</text>
  <line x1="103" y1="520" x2="1100" y2="520" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
  <text x="103" y="565" font-family="${KFONT}" font-size="30" font-weight="400" fill="#ffffff" fill-opacity="0.72">병원 행정·간호 실무자를 위한 의료 AI 연구소 · hospital-ai-lab.com</text>
</svg>`;

// `node scripts/gen-assets.mjs icons` 로 부르면 아래 아이콘 묶음(2026-10-21 추가분)만 만든다.
// 기존 og-default.png를 건드리지 않고 새 아이콘만 다시 뽑을 때 쓴다.
// (og-default.png는 SVG 글자를 시스템 글꼴로 그려서, 글꼴이 다른 컴퓨터에서 돌리면 모양이 달라진다.)
const iconsOnly = process.argv.includes('icons');

if (!iconsOnly) {
  await sharp(Buffer.from(ogSvg)).png().toFile('public/og-default.png');
  await sharp('public/favicon.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp('public/favicon.svg').resize(32, 32).png().toFile('public/favicon-32.png');
}

// ── 검색엔진용 아이콘 (2026-10-21) ──
//   - logo-512.png  : Organization 구조화 데이터의 logo. 구글은 로고를 정사각 이미지로 받는다
//                     (112px 이상). 그전에는 1200x630 소셜 공유 이미지를 logo로 내보냈다.
//   - favicon-48.png: 구글 파비콘 권장 크기(48의 배수).
//   - favicon.ico   : 헤드의 <link rel="icon">을 읽지 않고 /favicon.ico를 곧장 요청하는
//                     크롤러·브라우저용(없으면 요청마다 404). PNG를 담은 ICO(16/32/48px).
await sharp('public/favicon.svg').resize(512, 512).png().toFile('public/logo-512.png');
await sharp('public/favicon.svg').resize(48, 48).png().toFile('public/favicon-48.png');

const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(
  icoSizes.map((s) => sharp('public/favicon.svg').resize(s, s).png().toBuffer())
);
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type: icon
icoHeader.writeUInt16LE(icoSizes.length, 4);
let icoOffset = 6 + 16 * icoSizes.length;
const icoEntries = icoPngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i], 0); // width
  e.writeUInt8(icoSizes[i], 1); // height
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(icoOffset, 12);
  icoOffset += png.length;
  return e;
});
fs.writeFileSync('public/favicon.ico', Buffer.concat([icoHeader, ...icoEntries, ...icoPngs]));

for (const f of [
  'public/og-default.png',
  'public/apple-touch-icon.png',
  'public/favicon-32.png',
  'public/favicon-48.png',
  'public/logo-512.png',
]) {
  const m = await sharp(f).metadata();
  console.log(`${f}: ${m.width}x${m.height}`);
}
console.log(`public/favicon.ico: ${fs.statSync('public/favicon.ico').size} bytes (${icoSizes.join('/')}px)`);
