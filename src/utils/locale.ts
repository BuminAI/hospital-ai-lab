// 언어판 공통 설정 (2026-09-20 신설).
// 연재 시리즈·점검표·구독 안내처럼 다섯 언어판이 같이 쓰는 컴포넌트가 언어별 차이를
// 한곳에서 읽도록 모았다. 새 언어판을 만들면 여기에 한 줄씩 더한다.
import { withBase } from './site';

export type Loc = 'ko' | 'ja' | 'ru' | 'id' | 'tw';
export const ALL_LOCALES: Loc[] = ['ko', 'ja', 'ru', 'id', 'tw'];

/** src/content.config.ts의 컬렉션 이름 */
export const COLLECTION = { ko: 'blog', ja: 'blogJa', ru: 'blogRu', id: 'blogId', tw: 'blogTw' } as const;

export const PREFIX: Record<Loc, string> = { ko: '', ja: '/ja', ru: '/ru', id: '/id', tw: '/tw' };
export const IN_LANGUAGE: Record<Loc, string> = {
  ko: 'ko-KR',
  ja: 'ja-JP',
  ru: 'ru-RU',
  id: 'id-ID',
  tw: 'zh-TW',
};

export const postHref = (loc: Loc, id: string) => withBase(`${PREFIX[loc]}/blog/${id}/`);
export const seriesHref = (loc: Loc, slug?: string) =>
  withBase(`${PREFIX[loc]}/series/${slug ? `${slug}/` : ''}`);
export const rssHref = (loc: Loc) => withBase(`${PREFIX[loc]}/rss.xml`);

export const dateFormatter = (loc: Loc) =>
  new Intl.DateTimeFormat(IN_LANGUAGE[loc], { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * 공용 컴포넌트가 쓰는 색 변수(--c-*)를 그 언어판의 디자인 토큰에 이어 준다.
 *
 * ⚠️ 언어판마다 토큰 이름이 다르다(한국어판 --color-*, 나머지 --ja-*·--ru-*·--id-*·--tw-*).
 *    컴포넌트가 한국어판 변수를 그대로 쓰면 다른 언어판에서 색이 엉뚱하게 나온다
 *    (실제로 있었던 사고 — 메모리 locale-css-class-prefix-trap). 그래서 컴포넌트는
 *    --c-* 만 쓰고, 어느 토큰에 이을지는 여기서만 정한다.
 */
export function tokenStyle(loc: Loc): string {
  if (loc === 'ko') {
    return [
      '--c-primary:var(--color-primary)',
      '--c-soft:var(--color-primary-soft)',
      '--c-ring:var(--color-primary-border)',
      '--c-border:var(--color-border)',
      '--c-surface:var(--color-surface)',
      '--c-surface2:var(--color-surface-2)',
      '--c-text:var(--color-text)',
      '--c-heading:var(--color-heading)',
      '--c-muted:var(--color-muted)',
      '--c-bg:var(--color-bg)',
      '--c-btn-bg:var(--color-primary)',
      '--c-btn-fg:#fff',
      '--c-radius:var(--radius)',
    ].join(';');
  }
  const p = `--${loc}`;
  return [
    `--c-primary:var(${p}-primary)`,
    `--c-soft:var(${p}-surface)`,
    `--c-ring:var(${p}-border)`,
    `--c-border:var(${p}-border)`,
    `--c-surface:var(${p}-surface)`,
    `--c-surface2:var(${p}-surface-2)`,
    `--c-text:var(${p}-text)`,
    `--c-heading:var(${p}-text)`,
    `--c-muted:var(${p}-text-sub)`,
    `--c-bg:var(${p}-base)`,
    `--c-btn-bg:var(${p}-btn-bg)`,
    `--c-btn-fg:var(${p}-btn-fg)`,
    '--c-radius:6px',
  ].join(';');
}
