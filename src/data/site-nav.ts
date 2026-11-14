// 한국어판 메뉴의 단일 출처 (2026-11-14, 오너 지시: 메뉴와 메인 화면이 따로 놀지 않게).
// 상단 메뉴(BaseLayout)와 홈의 '전체 메뉴' 구역(index.astro)이 이 목록 하나에서 만들어진다.
// 메뉴를 추가·삭제하면 홈에도 자동으로 같이 반영된다.
export interface SiteNavItem {
  href: string;
  label: string;
  /** 홈 '전체 메뉴' 카드에 보이는 한 줄 설명 */
  desc: string;
}

export const siteNav: SiteNavItem[] = [
  { href: '/', label: '홈', desc: '' },
  { href: '/about/', label: '소개', desc: '연구소가 무엇을 왜 하는지, 연구 분야와 운영 원칙' },
  { href: '/blog/', label: '블로그', desc: '논문 리뷰·AI 도구·칼럼·소식' },
  { href: '/news/', label: 'AI 뉴스', desc: '메디칼타임즈·병원신문의 의료 AI 기사 모음' },
  { href: '/gov-support/', label: '정부 지원사업', desc: '병원이 확인할 정부 지원사업과 보도자료' },
  { href: '/events/', label: 'AI 교육·행사', desc: '의료 AI 교육과정·행사 소식' },
  { href: '/notes/', label: '강의노트', desc: '강의를 글로 풀어 정리한 노트' },
  { href: '/youtube/', label: '추천 영상', desc: '의료 AI를 쉽게 보여 주는 강의 영상' },
  { href: '/tips/', label: '실무 팁', desc: '오늘 바로 써 보는 AI 활용 요령' },
  { href: '/guide/', label: '입문 가이드', desc: '처음 시작하는 분을 위한 의료 AI 안내' },
  { href: '/series/', label: '연재 시리즈', desc: '주제별로 이어 읽는 글 묶음' },
  { href: '/glossary/', label: '의료 AI 용어 사전', desc: '어려운 용어를 쉬운 말로 풀이' },
  { href: '/faq/', label: '자주 묻는 질문', desc: '의료 AI 도입과 활용에 대한 질문과 답' },
  { href: '/checklist/', label: 'AI 도입 체크리스트', desc: '제안서·도입 검토 때 쓰는 점검표' },
  { href: '/ai-judge/', label: 'AI 프로그램 심사', desc: 'AI 프로그램을 병원 눈높이로 점검해 보기' },
];
