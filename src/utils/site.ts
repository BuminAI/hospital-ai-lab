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

// ── 방문자 통계 (GoatCounter) ────────────────────────────────
// goatcounter.com 가입 시 정한 코드를 넣으면 전 페이지에 집계 스크립트가 붙고,
// 블로그 카드에 글별 조회수도 표시된다(공개 카운터 API, 인증 불필요).
// 예: 코드가 'hospital-ai-lab'이면 대시보드는 https://hospital-ai-lab.goatcounter.com
// 필수: GoatCounter 사이트 설정에서 "Allow using the visitor counter"를 켜야
// 조회수 API(/counter/*.json)가 동작한다 (기본값은 꺼짐).
export const GOATCOUNTER_CODE = 'hospital-ai-lab';

// ── 회원 기능 (Supabase) ─────────────────────────────────────
// Supabase 프로젝트를 만든 뒤 Project Settings → API의 URL과 anon public 키를 넣는다.
// 비어 있으면 회원가입·로그인·강의노트는 "준비 중"으로 표시된다.
export const SUPABASE_URL = 'https://qasjbbkegjqilrqylvdb.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2piYmtlZ2pxaWxycXlsdmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNDQwMzgsImV4cCI6MjA5ODcyMDAzOH0.s9KhnZjvcIaPxOdiT0yFwcR2VeAXzJMqdLZn0TiQvdg';
// 개인정보 처리방침 버전 (방침 개정 시 날짜 갱신 — 동의 기록에 함께 저장됨)
// 2026-07-11: 휴대폰번호의 이용 목적에 "서비스 관련 중요 안내·알림 전달" 추가
export const PRIVACY_POLICY_VERSION = '2026-07-11';
// 관리자(오너) 이메일 — supabase/setup.sql의 is_admin()과 일치해야 한다
export const ADMIN_EMAIL = 'choyj80@naver.com';
export const GOOGLE_SITE_VERIFICATION = '5zd4BPyIzNe4dZJnx59GxYhFTkVoNQmcRoIJ9YS_f4Q';

export const SITE_TITLE = '병원 AI 연구소';
export const SITE_TAGLINE = '의료 현장의 문제를 AI로 풉니다.';

// 홈 화면 하단에는 "계속 업데이트되고 있습니다 · 마지막 업데이트 {날짜}"만
// 표시한다. 날짜는 마지막 git 커밋에서 빌드 시 자동으로 구한다(index.astro).
// 방문자에게 의미 없는 버전 숫자(v0.9)는 2026-07-12에 뺐다.
export const CONTACT_EMAIL = 'choyj80@naver.com';
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@HospitalAILAB';
export const DISCLAIMER =
  '본 사이트의 콘텐츠는 일반적인 정보 제공과 연구·교육 목적이며, 특정 환자에 대한 의학적 진단이나 조언을 대신하지 않습니다.';
