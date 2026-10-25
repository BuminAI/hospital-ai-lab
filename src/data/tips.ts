/** 실무 팁 — 카드 목록(/tips/)과 상세 페이지(/tips/1/)가 함께 쓰는 데이터. */
export interface TipLink {
  /** 이름 안에서 링크가 될 조각 (예: 'Otter · Fathom'의 'Otter') */
  label: string;
  url: string;
}

export interface TipItem {
  /** 굵게 표시되는 이름. links가 있으면 링크로 그려진다 */
  name: string | null;
  desc: string;
  /** 공식 사이트 링크. 이름 조각 수와 순서가 정확히 일치한다 */
  links?: TipLink[];
}

export interface TipGroup {
  /** 항목이 여러 묶음으로 나뉠 때만 쓰는 소제목 */
  label?: string;
  items: TipItem[];
}

/** 한 가지 팁을 이야기처럼 풀어 쓰는 단락(목록형 groups 대신 쓴다). */
export interface TipStory {
  heading: string;
  /** 문단들 */
  paragraphs: string[];
  /** 그대로 복사해 쓰는 문장(있으면 상자로 보인다) */
  copy?: string;
}

export interface Tip {
  /** 주소가 되는 번호 (/tips/1/) */
  no: number;
  /** 카드에 크게 보이는 제목 */
  title: string;
  /** 카드 제목 아래 한 줄 */
  hook: string;
  /** 상세 페이지 제목 (원문 제목 그대로) */
  fullTitle: string;
  /** 목록형 항목. story가 있으면 쓰지 않는다(빈 배열) */
  groups: TipGroup[];
  /** 이야기형 본문(2026-10-25 이후 새 팁은 이 형식으로 한 번에 하나씩 올린다) */
  story?: TipStory[];
  /** 근거 출처 — 사실 주장마다 달아 둔다 */
  sources?: TipLink[];
  /** 출처를 마지막으로 확인한 날 */
  checked?: string;
}

export const tips: Tip[] = [
  {
    no: 1,
    title: 'AI에게 "모른다"고 말할 허락을 주세요',
    hook: '문장 하나로 그럴듯한 거짓 답을 줄입니다',
    fullTitle: 'AI가 아는 척하지 못하게 하는 한 문장',
    groups: [],
    story: [
      {
        heading: 'AI는 왜 없는 내용도 있다고 말할까요',
        paragraphs: [
          '제안서 PDF를 올리고 "보안 인증은 뭐가 있어?"라고 물었는데, 제안서에 없는 인증 이름이 그럴듯하게 나온 적이 있다면 이 팁이 필요합니다.',
          'AI가 이렇게 아는 척하는 데는 이유가 있습니다. 한 연구팀은 지금의 AI가 학습과 평가를 거치면서 "모르겠다"고 답하는 것보다 찍어서라도 답하는 쪽이 유리해지는 구조에 놓여 있다고 설명합니다. 시험에서 비워 두면 0점이고 찍으면 맞을 수도 있는 것과 같습니다.',
        ],
      },
      {
        heading: '해법은 한 문장입니다',
        paragraphs: [
          '질문 끝에 "모르면 모른다고 말해도 된다"는 허락을 적어 주면 됩니다. Anthropic(Claude를 만든 회사)의 공식 안내서는 이렇게 AI에게 불확실함을 인정해도 된다고 분명히 알려 주는 것이 잘못된 정보를 크게 줄여 준다고 소개합니다.',
          '아래 문장을 질문 맨 끝에 그대로 붙여 넣으세요.',
        ],
        copy: '문서에 없는 내용은 추측하지 말고 "문서에서 확인되지 않음"이라고 써 주세요.',
      },
      {
        heading: '문서가 길 때는 한 가지만 더',
        paragraphs: [
          '긴 문서를 맡길 때는 결론을 바로 달라고 하지 말고, 먼저 근거가 되는 문장을 원문 그대로 뽑게 하세요. 같은 안내서가 긴 문서에서 권하는 방법입니다. 뽑아 둔 문장만으로 분석하게 하면 문서에 없는 말을 끼워 넣기 어려워지고, 나중에 원문과 맞는지 눈으로 확인하기도 쉽습니다.',
          '제안서를 검토할 때는 이렇게 두 단계로 시키면 됩니다.',
        ],
        copy: '1) 아래 제안서에서 성능 수치와 개인정보 보호에 관한 문장을 원문 그대로 뽑아 번호를 붙여 주세요. 없으면 "해당 문장 없음"이라고 써 주세요. 2) 뽑은 문장만 근거로 도입 전에 확인할 점 세 가지를 정리해 주세요.',
      },
      {
        heading: '꼭 알아 둘 점',
        paragraphs: [
          '이 방법은 거짓 답을 줄여 줄 뿐 없애 주지는 못합니다. 안내서도 중요한 판단에는 반드시 직접 확인하라고 적고 있습니다. 예산이 걸린 숫자나 계약 조건은 AI가 뽑아 준 문장이 원문에 실제로 있는지 한 번 찾아보세요.',
          '환자 이름이나 진료 기록처럼 개인을 알아볼 수 있는 정보는 AI 서비스에 넣지 마세요. 병원의 정보보호 지침을 먼저 확인하는 것이 순서입니다.',
        ],
      },
    ],
    sources: [
      { label: 'Anthropic, 환각 줄이기 안내서(공식 문서)', url: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations' },
      { label: 'Kalai 외, 「Why Language Models Hallucinate」(arXiv, 2025-09)', url: 'https://arxiv.org/abs/2509.04664' },
    ],
    checked: '2026-10-25',
  },
];
