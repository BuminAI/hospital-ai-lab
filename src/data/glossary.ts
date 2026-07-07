export type GlossaryCategory = '성능지표' | '규제·인증' | '기술·모델' | '데이터·개인정보' | '도입·운영';

export interface GlossaryTerm {
  term: string;
  reading?: string;
  category: GlossaryCategory;
  definition: string;
  whyMatters: string;
  source?: string;
}

export const glossaryCategories: GlossaryCategory[] = [
  '성능지표',
  '규제·인증',
  '기술·모델',
  '데이터·개인정보',
  '도입·운영',
];

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: '민감도',
    reading: 'Sensitivity, 재현율(Recall)로도 불림',
    category: '성능지표',
    definition:
      "실제로 질환이 있는 사람을 AI가 '양성'으로 올바르게 찾아내는 비율입니다. 민감도가 낮으면 병이 있는데도 놓치는 경우(위음성)가 늘어납니다.",
    whyMatters:
      "암·패혈증처럼 놓치면 위험이 큰 질환의 선별 도구를 검토할 때 가장 먼저 봐야 하는 숫자입니다. 제안서에 '정확도 95%'만 있고 민감도가 없으면 놓침 위험을 알 수 없으므로 반드시 별도로 확인하도록 질문해야 합니다.",
    source: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2781307',
  },
  {
    term: '특이도',
    reading: 'Specificity',
    category: '성능지표',
    definition:
      "질환이 없는 사람을 AI가 '음성'으로 올바르게 판정하는 비율입니다. 특이도가 낮으면 정상인데도 양성으로 나오는 경우(위양성)가 늘어납니다.",
    whyMatters:
      '특이도가 낮은 도구는 불필요한 추가 검사와 알림을 양산해 간호 현장의 알림 피로와 병원의 검사 비용을 키웁니다. 민감도와 항상 짝으로 확인해 도입 시 업무량·비용 영향을 가늠해야 합니다.',
    source: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2781307',
  },
  {
    term: 'AUROC / AUC',
    reading: 'Area Under the ROC Curve, 곡선하면적',
    category: '성능지표',
    definition:
      '민감도와 특이도의 여러 판정 기준(임계값) 조합을 하나의 곡선(ROC)으로 그린 뒤 그 아래 면적을 0~1 사이 숫자로 나타낸 종합 성능 지표입니다. 1에 가까울수록 판별력이 좋고, 0.5는 동전 던지기 수준을 뜻합니다.',
    whyMatters:
      "제안서의 성능을 한 숫자로 비교할 때 가장 많이 등장합니다. 개발사 자체 시험에서 높게 나온 값이 우리 병원 환자군에서는 떨어질 수 있으므로(예: 한 상용 패혈증 예측 모델이 외부검증에서 AUROC 0.63으로 하락한 사례) '어떤 환자에서, 누가 검증했는지'를 함께 물어야 합니다.",
    source: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2781307',
  },
  {
    term: '정밀도',
    reading: 'Precision, 양성예측도(PPV)와 유사 개념',
    category: '성능지표',
    definition:
      "AI가 '양성'이라고 판정한 것 중 실제로 질환이 있는 비율입니다. 정밀도가 낮으면 양성 알림 대부분이 헛경보가 됩니다.",
    whyMatters:
      '질환 자체가 드문 상황(유병률이 낮은 병원 환경)에서는 AUROC가 높아도 정밀도가 낮게 나올 수 있습니다. 알림을 실제로 처리하는 간호 현장의 부담을 판단하려면 이 지표를 확인하는 것이 현실적입니다.',
    source: 'https://www.mfds.go.kr/brd/m_1056/view.do?seq=28&itm_seq_1=0&itm_seq_2=0&multi_itm_seq=0&page=1',
  },
  {
    term: '위양성 / 위음성',
    reading: 'False Positive / False Negative',
    category: '성능지표',
    definition:
      '위양성은 질환이 없는데 있다고 잘못 판정한 경우, 위음성은 질환이 있는데 없다고 놓친 경우입니다. 모든 진단 AI는 이 둘 사이에서 균형을 맞춥니다.',
    whyMatters:
      "무엇을 더 줄일지는 병원의 정책 판단입니다. 위음성을 줄이려 민감도를 높이면 위양성 알림이 늘고, 반대도 마찬가지입니다. 도입 회의에서 '우리 병동은 어느 쪽 오류가 더 위험한가'를 먼저 합의해야 설정값을 정할 수 있습니다.",
  },
  {
    term: '소프트웨어 의료기기 (SaMD)',
    reading: 'Software as a Medical Device',
    category: '규제·인증',
    definition:
      "하드웨어(의료기기 장비)에 내장되지 않고 소프트웨어 그 자체가 진단·치료 등 의료 목적을 수행하는 독립형 소프트웨어를 말합니다. 국내에서는 식약처가 '의료기기 소프트웨어'로 분류·관리합니다.",
    whyMatters:
      'AI 진단 프로그램이 SaMD로 분류되면 일반 IT 솔루션이 아니라 의료기기가 됩니다. 즉 식약처 허가 대상이 되므로, 구매 검토 시 이 제품이 의료기기 허가를 받았는지가 도입 가능 여부의 전제 조건이 됩니다.',
    source: 'https://www.mfds.go.kr/brd/m_1060/view.do?seq=15628',
  },
  {
    term: '식약처 허가·인증·신고',
    reading: '식품의약품안전처 인허가',
    category: '규제·인증',
    definition:
      '의료기기는 위해도에 따라 1~4등급으로 나뉘며, 위해도가 낮은 1등급은 대체로 신고, 2등급은 인증, 위해도가 높은 3·4등급은 허가 대상으로 각각의 식약처 절차를 거쳐야 시판할 수 있습니다. AI 의료기기도 이 체계 안에서 심사받습니다.',
    whyMatters:
      "제안서에 '식약처 허가'라는 표현이 있으면 품목허가번호와 허가 범위(적응증·사용 대상)를 확인해야 합니다. 허가 범위를 벗어난 용도로 쓰는 것은 규제 위반이 될 수 있어, 행정·구매 검토의 핵심 확인 항목입니다.",
    source: 'https://emedi.mfds.go.kr/msismext/emd/bif/prmProcssView.do',
  },
  {
    term: '임상적 유효성',
    reading: 'Clinical Validity',
    category: '규제·인증',
    definition:
      'AI 의료기기가 의도한 임상 목적(예: 특정 질환 검출)을 실제 환자에게서 신뢰할 수 있게 달성하는지를 뜻합니다. 실험실 성능이 아니라 임상 현장에서의 성능을 가리킵니다.',
    whyMatters:
      "개발사 시험 데이터가 좋아도 임상적 유효성이 우리 병원 환자군에서 검증되지 않았다면 실제 효과를 담보할 수 없습니다. 도입 제안서 검토 시 '어떤 환자 집단에서 임상적으로 검증되었는가'를 묻는 근거가 됩니다.",
    source: 'https://www.mfds.go.kr/brd/m_1060/view.do?seq=15628',
  },
  {
    term: '변경관리 계획서',
    reading: 'Predetermined Change Control Plan',
    category: '규제·인증',
    definition:
      '학습을 통해 성능이 바뀔 수 있는 AI 의료기기의 특성을 반영해, 허가 이후 예상되는 변경과 그 검증 방법을 미리 계획서로 제출해 식약처 승인을 받는 제도입니다. 식약처는 2026년 6월 관련 심사기준을 마련했습니다.',
    whyMatters:
      'AI 제품은 도입 후에도 계속 업데이트됩니다. 변경관리 계획이 있으면 업데이트마다 재심사를 기다릴 필요가 없다는 뜻이므로, 계약·유지보수 조건을 검토하는 행정 업무에서 알아두면 유용합니다.',
    source: 'https://www.medipharmhealth.co.kr/news/article.html?no=117386',
  },
  {
    term: '생성형 AI',
    reading: 'Generative AI',
    category: '기술·모델',
    definition:
      '학습한 데이터의 패턴을 바탕으로 글·이미지·요약 등 새로운 콘텐츠를 만들어내는 AI입니다. 식약처는 2025년 1월 생성형 AI 의료기기 허가·심사 가이드라인을 마련했습니다.',
    whyMatters:
      '진료기록 요약, 상담 초안 작성 등 행정·간호 업무에 빠르게 들어오고 있는 유형입니다. 의료 목적으로 쓰이면 의료기기 심사 대상이 될 수 있어, 단순 사무 자동화인지 의료 판단에 관여하는지 구분하는 것이 중요합니다.',
    source: 'https://www.mfds.go.kr/brd/m_1060/view.do?seq=15628',
  },
  {
    term: '대규모 언어모델 (LLM)',
    reading: 'Large Language Model',
    category: '기술·모델',
    definition:
      '방대한 텍스트로 학습해 사람의 언어를 이해하고 생성하는 생성형 AI의 한 종류입니다. 챗GPT 같은 대화형 도구의 바탕 기술입니다.',
    whyMatters:
      '병원에서 접하는 상담·요약·문서작성 AI 대부분이 LLM 기반입니다. LLM은 그럴듯하지만 틀린 답을 만들 수 있어(할루시네이션), 결과를 사람이 반드시 검토한다는 전제 위에서만 도입해야 합니다.',
  },
  {
    term: '할루시네이션',
    reading: 'Hallucination, 환각',
    category: '기술·모델',
    definition:
      "생성형 AI가 사실이 아닌 정보를 사실처럼 그럴듯하게 만들어내는 현상입니다. 모델이 '진짜인지'가 아니라 '그럴듯한 문장인지'를 기준으로 답을 생성하기 때문에 발생합니다.",
    whyMatters:
      "약물 용량, 진단명, 참고문헌 등에서 할루시네이션이 발생하면 환자 안전에 직접적 위험이 됩니다. 생성형 AI 도입 시 '출력 검증 절차가 있는가'를 반드시 확인해야 합니다.",
  },
  {
    term: '머신러닝',
    reading: 'Machine Learning, 기계학습',
    category: '기술·모델',
    definition:
      '사람이 규칙을 일일이 짜지 않고, 데이터로부터 패턴을 스스로 학습해 예측·판단하는 AI 기법입니다. 딥러닝은 그중 한 방식입니다.',
    whyMatters:
      "학습에 쓴 데이터가 편향되면 결과도 편향됩니다. 우리 병원 환자 특성과 다른 데이터로 학습한 모델은 성능이 떨어질 수 있으므로, 도입 검토 시 '어떤 데이터로 학습했는가'를 확인하는 근거 개념입니다.",
    source: 'https://www.who.int/publications/i/item/9789240029200',
  },
  {
    term: '설명가능성',
    reading: 'Explainability',
    category: '기술·모델',
    definition:
      'AI가 왜 그런 판단을 내렸는지 사람이 이해할 수 있게 설명하는 성질입니다. WHO는 보건의료 AI 6대 원칙 중 하나로 투명성·설명가능성을 제시합니다.',
    whyMatters:
      "근거를 알 수 없는 '블랙박스' 알림은 간호·의료진이 신뢰하고 대응하기 어렵습니다. 설명이 부족한 도구는 현장 수용성이 낮으므로, 도입 평가에서 판단 근거를 함께 제시하는가가 중요한 선택 기준이 됩니다.",
    source: 'https://www.who.int/publications/i/item/9789240029200',
  },
  {
    term: '전자의무기록 (EMR)',
    reading: 'Electronic Medical Record',
    category: '데이터·개인정보',
    definition:
      '종이 차트에 기록하던 인적사항, 병력, 진료·검사·투약 기록 등 환자 정보를 전산으로 입력·저장·관리하는 시스템입니다. 보건복지부는 EMR시스템 인증제를 운영합니다.',
    whyMatters:
      '대부분의 병원 AI는 EMR 데이터를 입력받아 작동합니다. AI 연동 시 어떤 EMR 항목을 어떤 형식으로 넘기는지가 도입 난이도와 개인정보 범위를 좌우하므로, 행정·정보보호 검토의 출발점이 됩니다.',
    source: 'https://emrcert.mohw.go.kr/menu.es?mid=a10102020000',
  },
  {
    term: '가명정보 / 가명처리',
    reading: 'Pseudonymized Information',
    category: '데이터·개인정보',
    definition:
      '개인정보의 일부를 삭제·대체해 추가 정보 없이는 특정 개인을 알아볼 수 없도록 처리한 것이 가명처리이고, 그 결과물이 가명정보입니다. 개인정보 보호법(제28조의2)은 통계작성·과학적 연구·공익적 기록보존 등의 목적이면 정보주체 동의 없이 가명정보를 처리할 수 있도록 정합니다.',
    whyMatters:
      'AI 개발·검증에 병원 데이터를 제공하려면 대개 가명처리가 전제입니다. 다만 목적과 절차 요건을 지켜야 하므로, 데이터 제공 계약·연구 협약 검토 시 행정이 반드시 확인해야 하는 법적 개념입니다.',
    source: 'https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1257&ccfNo=2&cciNo=4&cnpClsNo=1',
  },
  {
    term: '비식별화',
    reading: 'De-identification',
    category: '데이터·개인정보',
    definition:
      '데이터에서 개인을 알아볼 수 없도록 식별 정보를 제거·변형하는 처리 전반을 뜻합니다. 보건복지부 「보건의료데이터 활용 가이드라인」이 그 방법과 기준을 제시합니다.',
    whyMatters:
      'AI 업체에 데이터를 넘기기 전, 가이드라인 기준을 충족했는지 점검하는 것은 병원 행정의 위험관리 업무입니다. 비식별화가 불충분하면 재식별 위험과 함께 개인정보 유출 책임이 병원에 돌아옵니다.',
    source: 'https://www.mohw.go.kr/board.es?mid=a10501010000&bid=0003&list_no=1480106&act=view',
  },
  {
    term: '임상의사결정지원시스템 (CDSS)',
    reading: 'Clinical Decision Support System',
    category: '도입·운영',
    definition:
      '환자 데이터와 의학 지식을 결합해 진료 시점에 경고·권고·정보를 제공함으로써 의료진의 판단을 돕는 시스템입니다. 규칙 기반부터 AI 기반까지 방식이 다양합니다.',
    whyMatters:
      '약물 상호작용 경고, 위험 환자 알림 등 병동에서 실제로 울리는 알림 상당수가 CDSS 출력입니다. 알림이 지나치게 많으면 알림 피로로 오히려 놓침이 생길 수 있어, 알림 정책을 조율하는 것이 간호·행정의 공동 과제입니다.',
    source: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11073764/',
  },
  {
    term: '시판후 성능관리',
    reading: 'Post-market Performance Management',
    category: '도입·운영',
    definition:
      '의료기기를 시판한 뒤에도 실제 사용 환경에서 성능·안전성을 지속 점검·관리하는 활동입니다. AI 의료기기는 데이터·환자군 변화로 성능이 변할 수 있어 특히 중요합니다.',
    whyMatters:
      '도입 시점에 좋았던 성능이 시간이 지나며 저하될 수 있습니다. 계약에 성능 모니터링·재검증 조항을 넣고 원내에서 실제 성능을 추적하는 것은 도입 이후 운영을 책임지는 행정의 몫입니다.',
    source: 'https://www.medipharmhealth.co.kr/news/article.html?no=117386',
  },
];
