export type ResearchIconName = 'chart' | 'scale' | 'shield' | 'clipboard';

export interface ResearchArea {
  title: string;
  /** 홈 카드용 요약 (한 문장) */
  short: string;
  /** 연구 페이지용 전체 설명 (briefing.md 원문) */
  full: string;
  icon: ResearchIconName;
}

export const researchAreas: ResearchArea[] = [
  {
    title: '병원 운영 데이터 분석과 AI',
    short:
      '병원 기획 업무 경험을 바탕으로, 진료·행정 데이터에서 의사결정에 필요한 신호를 뽑아내는 방법을 연구합니다.',
    full: '병원 기획 업무 경험을 바탕으로, 진료·행정 데이터에서 의사결정에 필요한 신호를 뽑아내는 방법을 연구합니다. 통계적 근거 없이 도입되는 AI 도구의 위험성도 함께 짚습니다.',
    icon: 'chart',
  },
  {
    title: '의료 자원 배분의 경제학적 접근',
    short: '경제학적 관점에서 병원의 인력·병상·예산 배분 문제를 데이터로 분석합니다.',
    full: '경제학적 관점에서 병원의 인력·병상·예산 배분 문제를 데이터로 분석합니다. AI 기반 예측 모델이 실제 자원 배분 결정에 어떻게 기여할 수 있는지 살펴봅니다.',
    icon: 'scale',
  },
  {
    title: '통계적 타당성과 의료 AI',
    short: '의료 AI 모델의 통계적 타당성을 검증하는 방법을 연구합니다.',
    full: '의료 AI 모델의 통계적 타당성을 검증하는 방법을 연구합니다. 그럴듯해 보이지만 통계적으로 취약한 AI 활용 사례를 짚어내는 것도 이 분야의 중요한 역할입니다.',
    icon: 'shield',
  },
  {
    title: '병원 기획자를 위한 AI 활용법',
    short:
      '병원 기획·행정 담당자가 실무에서 바로 쓸 수 있는 AI 도구와 활용법을 정리합니다.',
    full: '임상 데이터 과학이 아닌, 병원 기획·행정 담당자가 실무에서 바로 쓸 수 있는 AI 도구와 활용법을 정리합니다.',
    icon: 'clipboard',
  },
];
