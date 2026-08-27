// 글별 OG 이미지 자동 생성 (/og/<글 id>.png)
//
// 카톡·슬랙·X에 글을 공유할 때 뜨는 미리보기 이미지를 글마다 따로 만든다.
// 예전에는 전 페이지가 public/og-default.png 하나를 썼다. (2026-07-27 오너 승인으로 도입)
//
// ⚠️ 오너가 준 SEO 작업지시서의 예제 코드를 그대로 쓰면 안 된다. 네 군데가 이 저장소에서
//    깨진다 — 아래 (1)~(4). 나중에 이 파일을 고칠 때 되돌리지 말 것.
//
// (1) 키는 `slug`가 아니라 `post.id`
//     content.config.ts가 Astro 5의 glob 로더를 쓰는데, glob 로더는 엔트리에 `slug`를
//     만들지 않고 `id`만 만든다. 지시서대로 `slug`를 키로 쓰면 전 글이 `undefined` 키로
//     뭉개져 /og/undefined.png 한 장만 생기고, 모든 글이 같은 이미지를 가리킨다.
//     타입 검사를 안 하므로 **빌드는 성공하고 조용히 망가진다** — 가장 위험한 종류의 버그다.
//     blog/[id].astro도 이미 post.id를 라우트 키로 쓴다.
//
// (2) 초안(draft) 글은 제외
//     getCollection에 필터를 주지 않으면 미발행 글의 제목·설명이 공개 PNG로 새어 나간다.
//
// (3) 폰트를 반드시 지정
//     astro-og-canvas 기본 폰트는 원격 latin 서브셋이라 **한글이 두부(□)로 나온다**.
//     사이트가 이미 자체 호스팅 중인 Pretendard를 넘긴다. 원격 폰트에 의존하지 않게 되어
//     GitHub Actions 빌드가 외부 네트워크와 무관해지는 이점도 있다.
//
// (4) 로고는 public/logo.png가 아니다
//     그 파일은 이 저장소에 없다. 없는 경로를 주면 ENOENT 예외로 **빌드가 죽는다**.
//     실재하는 apple-touch-icon.png를 쓴다.
import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', ({ data }) => !data.draft);

const pages = Object.fromEntries(
  posts.map((post) => [
    post.id,
    { title: post.data.title, description: post.data.description },
  ])
);

// ⚠️ (5) `OGImageRoute`는 async 함수라 **await가 필수**다.
//     지시서 예제에는 await가 없는데, 그러면 Promise를 구조분해해 getStaticPaths가
//     undefined가 되고 빌드가 `GetStaticPathsRequired` 오류로 죽는다.
export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  param: 'route',
  getImageOptions: (_path, page: { title: string; description: string }) => ({
    title: page.title,
    description: page.description,
    logo: { path: './public/apple-touch-icon.png', size: [72] },
    // 사이트 기본 배색(짙은 남색 계열)과 톤을 맞춘다
    bgGradient: [
      [14, 20, 29],
      [20, 30, 45],
    ],
    border: { color: [80, 140, 200], width: 12, side: 'inline-start' },
    padding: 60,
    font: {
      title: { size: 56, weight: 'Bold', color: [255, 255, 255], lineHeight: 1.3 },
      description: { size: 26, color: [190, 200, 215], lineHeight: 1.5 },
    },
    // 통짜 Pretendard 파일. 2026-08-27에 public/fonts/ 에서 src/assets/fonts/ 로
    // 옮겼다 — 웹페이지는 이제 동적 서브셋(public/fonts/pretendard-subset/)만 쓰고
    // 이 파일은 OG 이미지를 만들 때만 필요하다. public/ 에 두면 아무도 안 받는
    // 2MB 파일이 배포본에 그대로 실려 나간다. 빌드 때만 읽히므로 배포에는 없다.
    fonts: ['./src/assets/fonts/PretendardVariable.woff2'],
  }),
});
