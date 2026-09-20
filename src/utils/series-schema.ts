import { growth } from '../i18n/growth';
import { IN_LANGUAGE, postHref, seriesHref, type Loc } from './locale';
import type { ResolvedSeries } from './series';

// 연재 시리즈 페이지의 CollectionPage JSON-LD (다섯 언어판 공용).
// 화면에 보이는 목록만 마크업한다. 항목은 우리 사이트의 글이라 url을 그대로 싣는다.
export const siteRoot = (site: URL | undefined) =>
  site ? site.href.replace(/\/$/, '') : 'https://hospital-ai-lab.com';

const websiteId = (root: string, loc: Loc) => `${root}/#website${loc === 'ko' ? '' : `-${loc}`}`;

export function seriesIndexDescription(loc: Loc) {
  return growth[loc].hub.metaDescription;
}

export function seriesDetailDescription(loc: Loc, s: ResolvedSeries) {
  return `${s.description} ${growth[loc].detail.metaSuffix(s.posts.length)}`;
}

export function seriesIndexSchema(loc: Loc, list: ResolvedSeries[], site: URL | undefined) {
  const root = siteRoot(site);
  const url = `${root}${seriesHref(loc)}`;
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name: growth[loc].hub.title,
    description: seriesIndexDescription(loc),
    inLanguage: IN_LANGUAGE[loc],
    isPartOf: { '@id': websiteId(root, loc) },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: list.length,
      itemListElement: list.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.title,
        url: `${root}${seriesHref(loc, s.slug)}`,
      })),
    },
  };
}

export function seriesDetailSchema(loc: Loc, s: ResolvedSeries, site: URL | undefined) {
  const root = siteRoot(site);
  const url = `${root}${seriesHref(loc, s.slug)}`;
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name: s.title,
    description: seriesDetailDescription(loc, s),
    inLanguage: IN_LANGUAGE[loc],
    isPartOf: { '@id': websiteId(root, loc) },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: s.posts.length,
      itemListElement: s.posts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.data.title,
        url: `${root}${postHref(loc, p.id)}`,
      })),
    },
  };
}
