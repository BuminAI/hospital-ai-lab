/** base 설정(GitHub Pages 하위 경로 등)을 끝 슬래시 없이 정규화한 값. base가 '/'이면 빈 문자열. */
export const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 내부 링크 경로 앞에 base를 붙인다. 예: withBase('/blog/') → '/저장소명/blog/' */
export function withBase(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${normalized}`;
}

/** 현재 pathname에서 base를 떼어낸 사이트 내부 경로를 돌려준다. */
export function stripBase(pathname: string): string {
  const stripped =
    BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return stripped || '/';
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// ── 검색엔진 소유 확인 코드 ──────────────────────────────────
// 각 서비스에서 발급받은 메타태그의 content 값만 넣으면
// 모든 페이지 <head>에 확인용 메타태그가 자동으로 들어간다. 비우면 출력 안 함.
// 예: <meta name="naver-site-verification" content="abc123" /> → 'abc123'
export const NAVER_SITE_VERIFICATION = 'f98a7fd2869d359cbadc089f5403db28d5cadd70';
export const GOOGLE_SITE_VERIFICATION = '5zd4BPyIzNe4dZJnx59GxYhFTkVoNQmcRoIJ9YS_f4Q';

export const SITE_TITLE = '병원 AI 연구소';
export const SITE_TAGLINE = '의료 현장의 문제를 AI로 풉니다.';
export const CONTACT_EMAIL = 'choyj80@naver.com';
export const DISCLAIMER =
  '본 사이트의 콘텐츠는 일반적인 정보 제공과 연구·교육 목적이며, 특정 환자에 대한 의학적 진단이나 조언을 대신하지 않습니다.';
