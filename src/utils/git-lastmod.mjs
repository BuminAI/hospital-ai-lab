// 페이지별 "실제 마지막 수정일"을 git에서 구한다. (2026-08-12 신설)
//
// 쓰는 곳이 둘이라 공용 모듈로 뒀다.
//   1) astro.config.mjs — 사이트맵의 lastmod
//   2) JaLayout.astro   — 일본어판 화면의 「更新日」 표시와 WebPage.dateModified
//
// 왜 필요한가: 예전에는 두 곳 모두 빌드 시각(`new Date()`)을 썼다. 이 사이트는
// 뉴스 자동 수집으로 하루에도 수십 번 배포되므로, 몇 달째 그대로인 페이지까지
// 매번 "오늘 수정됨"이 됐다. 화면에 보이는 날짜가 사실과 다르고(사실 검증 원칙
// 위반), 검색엔진은 lastmod가 실제와 어긋나는 사이트의 값을 아예 무시한다.
//
// ⚠️ .mjs인 이유: astro.config.mjs에서 import해야 하는데 그쪽은 TypeScript를
//    거치지 않는다. .ts로 바꾸지 말 것.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// 자동 수집 목록 페이지는 .astro가 아니라 데이터 JSON이 바뀔 때 내용이 달라진다.
const VOLATILE_DATA_SOURCES = {
  '/news': 'src/data/news.json',
  '/gov-support': 'src/data/gov-programs.json',
  '/events': 'src/data/events.json',
  '/youtube': 'src/data/recommended-videos.json',
  '/ja/subsidies': 'src/data/ja/subsidies.json',
};

// 동적 라우트(`[no].astro` 등)는 URL에서 파일명을 유추할 수 없다. 또 목록
// 페이지는 자기 .astro가 아니라 **나열하는 대상**이 바뀔 때 내용이 달라진다
// (글이 한 편 늘면 /blog/ 화면도 바뀐다). git log는 폴더 경로에도 동작한다.
const DYNAMIC_ROUTE_SOURCES = [
  { pattern: /^\/tips\/\d+$/, file: 'src/data/tips.ts' },
  { pattern: /^\/blog$/, file: 'src/content/blog' },
  { pattern: /^\/blog\/category(\/[^/]+)?$/, file: 'src/content/blog' },
];

const cache = new Map();

/** 파일·폴더의 마지막 커밋 시각(Date). 추적되지 않거나 git이 없으면 undefined. */
export function gitLastModified(file) {
  if (cache.has(file)) return cache.get(file);
  let result;
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    result = out ? new Date(out) : undefined;
  } catch {
    // git이 없는 빌드 환경이거나 아직 커밋되지 않은 파일.
    // 거짓 날짜를 채우느니 undefined를 돌려주고 호출부가 판단하게 한다.
    result = undefined;
  }
  cache.set(file, result);
  return result;
}

/** 사이트 내부 경로를 저장소 안의 원본 파일로 되짚는다. 못 찾으면 undefined. */
export function sourceFileForPath(pathname, base = '/') {
  let path = pathname;
  if (base && base !== '/' && path.startsWith(base)) path = path.slice(base.length);
  path = `/${path.replace(/^\/+|\/+$/g, '')}`;

  if (VOLATILE_DATA_SOURCES[path]) return VOLATILE_DATA_SOURCES[path];

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const md = `src/content/blog/${blogMatch[1]}.md`;
    if (existsSync(md)) return md;
  }

  const dynamic = DYNAMIC_ROUTE_SOURCES.find((r) => r.pattern.test(path));
  if (dynamic) return dynamic.file;

  if (path === '/') return 'src/pages/index.astro';

  return [`src/pages${path}.astro`, `src/pages${path}/index.astro`].find((c) =>
    existsSync(c)
  );
}

/** 경로에 대응하는 실제 수정일(Date). 알 수 없으면 undefined. */
export function lastModifiedForPath(pathname, base = '/') {
  const file = sourceFileForPath(pathname, base);
  return file ? gitLastModified(file) : undefined;
}
