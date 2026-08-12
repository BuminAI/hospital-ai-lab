// @ts-check
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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

// ─────────────────────────────────────────────────────────────────────────────
// 사이트맵 lastmod — 페이지별 실제 수정일 (2026-08-12)
//
// 왜 고쳤나: 예전에는 모든 URL에 `lastmod: new Date()`(빌드 시각)를 넣었다.
// 이 사이트는 뉴스 수집으로 하루에도 수십 번 배포되므로, 몇 달째 그대로인
// 페이지까지 매번 "방금 수정됨"으로 보고됐다. 검색엔진은 lastmod가 실제와
// 어긋나는 사이트의 값을 신뢰하지 않고 무시해 버린다 — 정말 새 글이 올라와도
// 재크롤 신호가 먹히지 않게 된다는 뜻이다. 그래서 URL을 원본 파일로 되짚어
// git의 마지막 커밋 시각을 쓴다.
//
// 자동 수집 목록 페이지(/news/ 등)는 .astro 파일이 아니라 데이터 JSON이
// 바뀔 때 내용이 달라지므로 그 JSON의 커밋 시각을 본다.
// ─────────────────────────────────────────────────────────────────────────────
const VOLATILE_DATA_SOURCES = {
  '/news': 'src/data/news.json',
  '/gov-support': 'src/data/gov-programs.json',
  '/events': 'src/data/events.json',
  '/youtube': 'src/data/recommended-videos.json',
  '/ja/subsidies': 'src/data/ja/subsidies.json',
};

// 동적 라우트(`[no].astro` 등)는 URL에서 파일명을 그대로 유추할 수 없다.
// 또 목록 페이지는 자기 .astro 파일이 아니라 **나열하는 대상**이 바뀔 때
// 내용이 달라진다(글이 한 편 늘면 /blog/ 화면도 바뀐다). 그래서 둘 다
// 실제 내용의 출처가 되는 파일·폴더를 수정일의 근거로 삼는다.
// (git log는 폴더 경로에도 그대로 동작한다.)
const DYNAMIC_ROUTE_SOURCES = [
  { pattern: /^\/tips\/\d+$/, file: 'src/data/tips.ts' },
  { pattern: /^\/blog$/, file: 'src/content/blog' },
  { pattern: /^\/blog\/category(\/[^/]+)?$/, file: 'src/content/blog' },
];

const gitDateCache = new Map();

function gitLastModified(file) {
  if (gitDateCache.has(file)) return gitDateCache.get(file);
  let result;
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    result = out ? new Date(out) : undefined;
  } catch {
    // git이 없거나(내려받은 tarball 빌드 등) 파일이 추적되지 않는 경우.
    // lastmod를 거짓으로 채우느니 생략하는 편이 낫다.
    result = undefined;
  }
  gitDateCache.set(file, result);
  return result;
}

/** 사이트맵 URL을 저장소 안의 원본 파일 경로로 되짚는다. 못 찾으면 undefined. */
function sourceFileForUrl(url) {
  let path;
  try {
    path = new URL(url).pathname;
  } catch {
    return undefined;
  }
  // base(하위 경로)와 앞뒤 슬래시를 떼어 사이트 내부 경로만 남긴다.
  if (base !== '/' && path.startsWith(base)) path = path.slice(base.length);
  path = `/${path.replace(/^\/+|\/+$/g, '')}`;

  if (VOLATILE_DATA_SOURCES[path]) return VOLATILE_DATA_SOURCES[path];

  // 블로그 글은 마크다운 원문이 곧 내용이다.
  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const md = `src/content/blog/${blogMatch[1]}.md`;
    if (existsSync(md)) return md;
  }

  const dynamic = DYNAMIC_ROUTE_SOURCES.find((r) => r.pattern.test(path));
  if (dynamic) return dynamic.file;

  if (path === '/') return 'src/pages/index.astro';

  // 나머지 고정 페이지는 대응하는 .astro 파일을 찾는다.
  const candidates = [`src/pages${path}.astro`, `src/pages${path}/index.astro`];
  return candidates.find((c) => existsSync(c));
}

export default defineConfig({
  site,
  base,
  // ── 다국어 (2026-07-31 일본어판 추가) ──────────────────
  // ⚠️ prefixDefaultLocale: false 가 핵심이다. 이게 true면 기존 한국어 URL이
  //    전부 /ko/ 아래로 밀려나 지금까지 쌓은 검색 자산이 통째로 날아간다.
  //    한국어는 루트(/about/)에 그대로 두고, 일본어만 /ja/ 하위에 새로 만든다.
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'ja'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // 페이지별 실제 수정일을 넣는다(위 gitLastModified 주석 참고).
      // 되짚을 원본 파일을 못 찾은 URL은 lastmod 없이 내보낸다 — 거짓 날짜보다 낫다.
      serialize(item) {
        const source = sourceFileForUrl(item.url);
        const lastmod = source ? gitLastModified(source) : undefined;
        if (lastmod) item.lastmod = lastmod.toISOString();
        else delete item.lastmod;
        return item;
      },
      // 사이트맵에 언어 대응 관계를 넣어 구글이 ko/ja를 같은 페이지의
      // 다른 언어판으로 인식하게 한다(hreflang과 짝을 이룬다).
      i18n: {
        defaultLocale: 'ko',
        locales: { ko: 'ko-KR', ja: 'ja-JP' },
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
