// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { lastModifiedForPath } from './src/utils/git-lastmod.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// 배포 주소(site / base) 설정
//
// 1) GitHub Pages 임시 주소(https://아이디.github.io/저장소명)로 운영하는 동안:
//    아무것도 수정할 필요가 없습니다. GitHub Actions가 저장소 이름을 읽어
//    site와 base를 자동으로 계산합니다. (로컬에서는 base가 '/'로 동작)
//
// 2) 나중에 커스텀 도메인을 연결하면:
//    아래 CUSTOM_DOMAIN 한 줄만 도메인으로 바꿔주세요. base는 자동으로 '/'가
//    되어 경로·CSS가 깨지지 않습니다.
//    예: const CUSTOM_DOMAIN = 'https://hospital-ai-lab.example.com';
// ─────────────────────────────────────────────────────────────────────────────
const CUSTOM_DOMAIN = 'https://hospital-ai-lab.com';

function resolveSiteAndBase() {
  if (CUSTOM_DOMAIN) {
    return { site: CUSTOM_DOMAIN, base: '/' };
  }

  // GitHub Actions 빌드 환경에서는 GITHUB_REPOSITORY가 "아이디/저장소명" 형태로 주어진다.
  const repoEnv = process.env.GITHUB_REPOSITORY;
  if (repoEnv) {
    const [owner, repo] = repoEnv.split('/');
    // Pages 호스트명은 소문자. base 경로는 저장소 이름 대소문자를 그대로 따른다.
    const host = `https://${owner.toLowerCase()}.github.io`;
    // "아이디.github.io" 저장소(사용자 페이지)는 하위 경로 없이 서비스된다.
    if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
      return { site: host, base: '/' };
    }
    return { site: host, base: `/${repo}` };
  }

  // 로컬 개발·미리보기
  return { site: 'http://localhost:4321', base: '/' };
}

const { site, base } = resolveSiteAndBase();


export default defineConfig({
  site,
  base,
  // ── 다국어 (2026-07-31 일본어판, 2026-08-12 러시아어판 추가) ──
  // ⚠️ prefixDefaultLocale: false 가 핵심이다. 이게 true면 기존 한국어 URL이
  //    전부 /ko/ 아래로 밀려나 지금까지 쌓은 검색 자산이 통째로 날아간다.
  //    한국어는 루트(/about/)에 그대로 두고, 일본어는 /ja/, 러시아어는 /ru/
  //    하위에 새로 만든다.
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'ja', 'ru'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // 페이지별 실제 수정일을 넣는다(src/utils/git-lastmod.mjs 참고).
      // 빌드 시각을 쓰면 뉴스 수집 배포마다 전 페이지가 "방금 수정됨"이 되어
      // 검색엔진이 lastmod 자체를 무시하게 된다.
      // 되짚을 원본 파일을 못 찾은 URL은 lastmod 없이 내보낸다 — 거짓 날짜보다 낫다.
      serialize(item) {
        let lastmod;
        try {
          lastmod = lastModifiedForPath(new URL(item.url).pathname, base);
        } catch {
          lastmod = undefined;
        }
        if (lastmod) item.lastmod = lastmod.toISOString();
        else delete item.lastmod;
        return item;
      },
      // 사이트맵에 언어 대응 관계를 넣어 구글이 ko/ja/ru를 같은 페이지의
      // 다른 언어판으로 인식하게 한다(hreflang과 짝을 이룬다).
      i18n: {
        defaultLocale: 'ko',
        locales: { ko: 'ko-KR', ja: 'ja-JP', ru: 'ru-RU' },
      },
      // 관리자·가입·로그인 페이지는 검색엔진 사이트맵에서 제외.
      // ai-apps는 비공개 처리(2026-07-21 오너 지시) — 메뉴·홈에서 내리고
      // 검색엔진에도 노출하지 않는다(페이지 자체는 직접 링크로 접근 가능).
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/signup') &&
        !page.includes('/login') &&
        !page.includes('/unsubscribe') &&
        !page.includes('/ai-apps'),
    }),
  ],
});
