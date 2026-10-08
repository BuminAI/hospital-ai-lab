// 언어판별 사이트맵 생성 (2026-09-07 신설)
//
// 왜 필요한가:
//   구글 서치 콘솔에 이 사이트가 **URL 접두어 속성으로 여러 개** 등록돼 있다
//   (`https://hospital-ai-lab.com/`, `.../ja/`, `.../ru/`). 접두어 속성은 그
//   경로 아래 데이터만 보여 주고, 사이트맵도 그 경로 아래 있는 것만 받는다.
//   그런데 이 사이트는 사이트맵이 루트에 하나뿐이라 `/ja/sitemap-index.xml`,
//   `/ru/sitemap-index.xml` 제출이 **2026-08-13부터 계속 404**였다
//   (서치 콘솔 화면에 "가져올 수 없음 / 발견된 페이지 0"으로 남아 있었다).
//
//   루트 사이트맵 하나로도 색인 자체는 된다(실제로 112페이지가 성공적으로
//   읽혔다). 언어별 사이트맵은 **판별 색인 현황을 따로 보기 위한 것**이다.
//
// ⚠️ 루트 사이트맵과 구조·규칙을 일부러 똑같이 맞춘다.
//    - 제외 규칙(admin·login 등)이 다르면 두 사이트맵이 서로 다른 말을 한다.
//    - lastmod도 같은 git 기반 계산을 쓴다(빌드 시각을 쓰면 안 된다 —
//      src/utils/git-lastmod.mjs 머리말 참고).
// ⚠️ hreflang은 **넣지 않는다.** 루트 사이트맵에서 뺀 것과 같은 이유다
//    (astro.config.mjs의 i18n 옵션 주석 참고).
// ⚠️ 새 언어판을 만들면 LOCALES에 추가할 것.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const SITEMAP_LOCALES = ['ja', 'ru', 'id', 'tw'];

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * 언어판별 sitemap-index.xml + sitemap-0.xml 을 dist 안에 쓴다.
 *
 * @param {object} opts
 * @param {URL} opts.dir            빌드 산출물 디렉터리 (astro:build:done의 dir)
 * @param {{pathname: string}[]} opts.pages  빌드된 페이지 목록
 * @param {string} opts.site        사이트 주소 (끝 슬래시 포함/미포함 무관)
 * @param {string} opts.base        base 경로
 * @param {(p: string) => boolean} opts.filter  루트 사이트맵과 **같은** 제외 규칙
 * @param {(pathname: string, base: string) => Date|undefined} opts.lastmodFor
 * @returns {Promise<Record<string, number>>} 언어별 URL 수
 */
export async function writeLocaleSitemaps({ dir, pages, site, base, filter, lastmodFor }) {
  const root = site.replace(/\/$/, '');
  const basePath = base === '/' ? '' : base.replace(/\/$/, '');
  const counts = {};

  for (const locale of SITEMAP_LOCALES) {
    // pages의 pathname은 base를 뺀 상대 경로다(예: 'ja/faq/').
    const urls = pages
      .map((p) => `/${String(p.pathname).replace(/^\//, '')}`)
      .filter((p) => p === `/${locale}/` || p.startsWith(`/${locale}/`))
      .filter((p) => filter(p))
      .sort();

    counts[locale] = urls.length;
    if (urls.length === 0) continue;

    const entries = urls
      .map((p) => {
        const loc = `${root}${basePath}${p.endsWith('/') ? p : `${p}/`}`;
        let lastmod;
        try {
          lastmod = lastmodFor(`${basePath}${p}`, base);
        } catch {
          lastmod = undefined;
        }
        return (
          `<url><loc>${esc(loc)}</loc>` +
          (lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : '') +
          `</url>`
        );
      })
      .join('');

    const urlset =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;

    // 색인 파일의 lastmod는 그 안에 든 URL 중 가장 최근 값을 쓴다.
    const newest = urls
      .map((p) => {
        try {
          return lastmodFor(`${basePath}${p}`, base);
        } catch {
          return undefined;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b - a)[0];

    const indexXml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      `<sitemap><loc>${esc(`${root}${basePath}/${locale}/sitemap-0.xml`)}</loc>` +
      (newest ? `<lastmod>${newest.toISOString()}</lastmod>` : '') +
      `</sitemap></sitemapindex>`;

    const outDir = join(dir.pathname.replace(/^\/([A-Za-z]:)/, '$1'), locale);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'sitemap-0.xml'), urlset, 'utf8');
    await writeFile(join(outDir, 'sitemap-index.xml'), indexXml, 'utf8');
  }

  return counts;
}

/** Astro 통합으로 감싼 형태. astro.config.mjs에서 integrations에 넣는다. */
export function localeSitemaps({ site, base, filter, lastmodFor }) {
  return {
    name: 'locale-sitemaps',
    hooks: {
      'astro:build:done': async ({ dir, pages, logger }) => {
        const counts = await writeLocaleSitemaps({ dir, pages, site, base, filter, lastmodFor });
        const summary = Object.entries(counts)
          .map(([l, n]) => `${l}:${n}`)
          .join(' ');
        logger.info(`언어판별 사이트맵 생성 (${summary})`);
      },
    },
  };
}
