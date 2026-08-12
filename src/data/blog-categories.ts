// 블로그 카테고리 ↔ URL 슬러그 매핑 + 분류별 소개문.
// blog/index.astro(필터 버튼)와 blog/category/[slug].astro(분류별 아카이브 페이지)가
// 함께 쓴다. 슬러그는 한 번 정하면 외부 링크·색인이 걸리므로 바꾸지 않는다.
//
// '소식'의 슬러그를 'news'가 아니라 'notice'로 한 이유: /news/(AI 뉴스 자동수집
// 목록, 다른 콘텐츠)와 겹치면 혼동된다.
export interface BlogCategory {
  label: '논문리뷰' | 'AI도구' | '칼럼' | '소식';
  slug: string;
  description: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    label: '논문리뷰',
    slug: 'paper-review',
    description: '의료 AI 관련 연구·논문을 병원 행정·간호 실무자가 이해할 수 있는 말로 풀어 리뷰합니다.',
  },
  {
    label: 'AI도구',
    slug: 'ai-tools',
    description: '병원 업무에 바로 활용할 수 있는 AI 도구와 실제 사례를 정리합니다.',
  },
  {
    label: '칼럼',
    slug: 'column',
    description: '의료 AI 규제·개인정보·저작권 등 병원 현장에서 마주치는 주제를 다룹니다.',
  },
  {
    label: '소식',
    slug: 'notice',
    description: '병원 AI 연구소의 소식과 의료 AI 관련 제도 변화를 전합니다.',
  },
];

export function categoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export function slugByLabel(label: string): string | undefined {
  return BLOG_CATEGORIES.find((c) => c.label === label)?.slug;
}
