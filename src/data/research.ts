export type ResearchIconName = 'chart' | 'book' | 'users' | 'clipboard';

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
    full: '병원 기획 업무 경험을 바탕으로, 진료·행정 데이터에서 의사결정에 필요한 신호를 뽑아내는 방법을 연구합니다. 충분한 근거 없이 도입되는 AI 도구의 위험성도 함께 짚습니다.',
    icon: 'chart',
  },
  {
    title: '병원 AI 교육',
    short:
      '코딩 배경이 없는 병원 행정·간호 실무자가 AI를 판단하는 눈을 기르도록 강의노트와 영상으로 돕습니다.',
    full: '코딩 배경이 없는 병원 행정·간호 실무자를 대상으로, AI 도입을 판단할 수 있는 최소한의 지식을 강의노트와 영상 강의로 전합니다. 제작 기술이 아니라 제안서를 읽고 질문하는 능력을 기르는 데 초점을 둡니다.',
    icon: 'book',
  },
  {
    title: 'AI 연구 협업',
    short:
      '병원 현장의 실무자, 다양한 분야의 연구자들과 함께 의료 AI 연구를 넓혀갈 협업을 찾습니다.',
    full: '병원 현장의 행정·간호 실무자, 다양한 분야의 연구자들과 함께 의료 AI 연구를 확장할 협업을 찾습니다. 현장의 문제의식과 연구가 만나는 지점에서 새로운 질문을 함께 만들어가고자 합니다.',
    icon: 'users',
  },
  {
    title: '병원 기획자를 위한 AI 활용법',
    short:
      '병원 기획·행정 담당자가 실무에서 바로 쓸 수 있는 AI 도구와 활용법을 정리합니다.',
    full: '임상 데이터 과학이 아닌, 병원 기획·행정 담당자가 실무에서 바로 쓸 수 있는 AI 도구와 활용법을 정리합니다.',
    icon: 'clipboard',
  },
];
