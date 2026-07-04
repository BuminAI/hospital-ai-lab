// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
const CUSTOM_DOMAIN = '';

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
  integrations: [sitemap()],
});
