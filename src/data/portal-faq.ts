// 공공 포털 페이지의 '자주 묻는 질문'과 구조화 데이터(2026-11-26, SEO·AEO·GEO 검수).
//
// 왜 필요한가: 응급실·병원 규모 표는 브라우저에서 자바스크립트로 그려서, 자바스크립트를 실행하지 않는
// 답변 엔진(GPTBot·ClaudeBot·PerplexityBot 등)에는 표가 비어 보인다. 페이지가 무엇을 알려 주는지
// 글자로 적어 두어야 검색·답변에서 근거로 쓰일 수 있다.
//
// ⚠️ 여기의 문장은 화면에 그대로 보이고 FAQPage 구조화 데이터와 같다. 페이지의 수집 방식·계산식이
//    바뀌면 함께 고친다(fetch-er·fetch-beds·fetch-hospitals·fetch-benefit).
export interface PortalFaqItem {
  q: string;
  a: string;
}

export interface PortalMeta {
  path: string;
  name: string;
  description: string;
  basedOn: string;
  faq: PortalFaqItem[];
}

export const PORTAL_PAGES: Record<'er' | 'beds' | 'hospitals' | 'benefit', PortalMeta> = {
  er: {
    path: '/portal/er/',
    name: '전국 응급실 사용현황',
    description:
      '국립중앙의료원 중앙응급의료센터가 공개한 정보를 바탕으로 전국 응급의료기관의 응급실 가용 병상·격리실·분만실·진료 불가 안내를 지자체별로 보여 주는 표입니다.',
    basedOn: 'https://mediboard.nemc.or.kr/',
    faq: [
      {
        q: '전국 응급실 가용 병상은 어떻게 확인하나요?',
        a: '이 페이지에서 시·도와 시·군·구를 고르면 응급의료기관별 응급실 가용 병상, 격리실, 분만실, 진료 불가 안내를 볼 수 있습니다. 원자료는 국립중앙의료원 중앙응급의료센터의 ‘내 손안의 응급실’이 공개한 값입니다.',
      },
      {
        q: '응급실 현황은 얼마나 자주 갱신되나요?',
        a: '약 15분 간격으로 새로 받아 둡니다. 원자료 서버나 수집 환경 사정으로 늦어질 수 있으므로 표 위의 자료 시각을 확인하세요.',
      },
      {
        q: '이 표만 보고 응급실을 골라도 되나요?',
        a: '아닙니다. 값은 각 병원이 입력한 것이라 실제와 다를 수 있습니다. 응급 상황이면 119에 신고하고, 실제 수용 여부는 해당 병원이나 119·응급의료포털에서 확인해야 합니다.',
      },
    ],
  },
  beds: {
    path: '/portal/beds/',
    name: '전국 응급의료기관 병상가동현황',
    description:
      '국립중앙의료원 중앙응급의료센터가 공개한 응급의료기관 정보를 바탕으로, 전국 응급의료기관의 병상수·재원·가동률을 시도·시군구별로 정리한 표입니다.',
    basedOn: 'https://www.data.go.kr/',
    faq: [
      {
        q: '병상 가동률은 어떻게 계산한 값인가요?',
        a: '병상수는 입원실과 중환자실 계열의 기준 병상을 합한 값이고, 재원은 병상수에서 입원실 가용병상수를 뺀 값, 가동률은 재원을 병상수로 나눈 값입니다. 중환자실의 빈 병상은 반영하지 못해 실제보다 높게 나올 수 있습니다.',
      },
      {
        q: '모든 병원이 들어 있나요?',
        a: '아닙니다. 응급의료기관만 포함하며, 입원실 병상 자료가 없는 기관은 표에서 제외합니다.',
      },
      {
        q: '자료 출처와 갱신 주기는 어떻게 되나요?',
        a: '국립중앙의료원 중앙응급의료센터의 응급의료기관 정보(공공데이터포털 OpenAPI)이며, 약 30분 간격으로 새로 받아 둡니다. 표 위의 자료 갱신 시각을 확인하세요.',
      },
    ],
  },
  hospitals: {
    path: '/portal/hospitals/',
    name: '전국 병원 규모·인력 비교',
    description:
      '건강보험심사평가원 공개 자료를 바탕으로 전국 병원급 이상 요양기관의 병상·의사·전문의·인력·시설을 지자체별로 비교하는 표입니다.',
    basedOn: 'https://www.data.go.kr/',
    faq: [
      {
        q: '어떤 병원을 비교할 수 있나요?',
        a: '병원급 이상 요양기관(상급종합·종합병원·병원·요양병원·정신병원·치과병원·한방병원)입니다. 의원과 약국은 포함하지 않습니다.',
      },
      {
        q: '값이 ‘—’인 칸은 무엇인가요?',
        a: '아직 수집되지 않았거나 자료가 없는 칸입니다. 상세 항목은 공공데이터포털 하루 호출 한도 때문에 며칠에 걸쳐 채워지며, ‘0’은 신고된 값이 0이라는 뜻입니다.',
      },
      {
        q: '자료의 출처는 어디인가요?',
        a: '건강보험심사평가원 병원정보서비스·의료기관별상세정보서비스(공공데이터포털 OpenAPI)로, 요양기관이 심사평가원에 신고한 현황입니다.',
      },
    ],
  },
  benefit: {
    path: '/portal/benefit/',
    name: '선별급여·한정급여·평가유예 신의료기술 조회',
    description:
      '보건복지부 고시를 정리한 자료에서 선별급여·한정급여·한시적 비급여(평가유예 신의료기술) 항목을 검색하는 표입니다.',
    basedOn: 'https://www.law.go.kr/',
    faq: [
      {
        q: '선별급여·한정급여·평가유예 신의료기술 항목은 어디서 검색하나요?',
        a: '이 페이지에서 구분과 적용 상태를 고르고 항목명·분류코드·사용처·대상으로 검색할 수 있습니다. 보건복지부 고시를 정리한 자료이며 항목마다 공식 고시 페이지 링크를 답니다.',
      },
      {
        q: '표의 내용을 그대로 업무에 적용해도 되나요?',
        a: '아닙니다. 표 위에 적은 자료 갱신 시각까지 정리한 내용이므로, 실제 적용 전에는 반드시 공식 고시 원문을 확인해야 합니다.',
      },
    ],
  },
};

/** FAQPage + Dataset 구조화 데이터. dateModified 는 알 때만 넣는다(거짓 날짜 금지). */
export function portalSchema(key: keyof typeof PORTAL_PAGES, siteRoot: string, dateModified?: string) {
  const m = PORTAL_PAGES[key];
  const url = `${siteRoot}${m.path}`;
  return [
    {
      '@type': 'Dataset',
      '@id': `${url}#dataset`,
      name: m.name,
      description: m.description,
      url,
      inLanguage: 'ko-KR',
      isAccessibleForFree: true,
      isBasedOn: m.basedOn,
      creator: { '@id': `${siteRoot}/#organization` },
      ...(dateModified ? { dateModified } : {}),
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      inLanguage: 'ko-KR',
      mainEntity: m.faq.map((f, i) => ({
        '@type': 'Question',
        '@id': `${url}#faq-q${i + 1}`,
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
}
