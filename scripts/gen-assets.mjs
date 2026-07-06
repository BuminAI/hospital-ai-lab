// 브랜드 정적 이미지 생성기 (로컬 1회용 도구, CI 아님)
//   node scripts/gen-assets.mjs
// favicon.svg의 파란 배경 + 흰 십자 모티프를 확장해
//   - public/og-default.png (1200x630, 소셜 공유 대표 이미지)
//   - public/apple-touch-icon.png (180x180, iOS 홈 화면)
//   - public/favicon-32.png (32x32, PNG 파비콘 폴백)
// 를 만든다. sharp(라이브러리)는 이미 설치되어 있어 새 의존성이 없다.
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

await sharp(Buffer.from(ogSvg)).png().toFile('public/og-default.png');
await sharp('public/favicon.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp('public/favicon.svg').resize(32, 32).png().toFile('public/favicon-32.png');

for (const f of ['public/og-default.png', 'public/apple-touch-icon.png', 'public/favicon-32.png']) {
  const m = await sharp(f).metadata();
  console.log(`${f}: ${m.width}x${m.height}`);
}
