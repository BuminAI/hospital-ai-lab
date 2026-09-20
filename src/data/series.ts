// 연재 시리즈 정의 (2026-09-20 신설, 오너 지시 — 벤치마킹 사이트의 연재 구조 도입)
//
// 새 글을 쓰지 않는다. 이미 발행된 글을 읽는 순서대로 묶어 놓은 목록이다.
// 글 ID는 src/content/blog/ 의 파일명(확장자 제외)이며, 순서가 곧 권장 읽기 순서다.
//
// ⚠️ 없는 글 ID를 적으면 빌드가 실패한다(src/utils/series.ts). 오타로 글이 조용히
//    빠지는 것보다 빌드가 멈추는 편이 낫다.
// ⚠️ 한 글이 여러 시리즈에 들어가도 된다(예: 패혈증 AI 검증 글은 '제안서 검토'와
//    '예측·진단 사례' 양쪽).
// ⚠️ 여기 없는 새 글은 frontmatter에 `series: <slug>`를 적으면 그 시리즈 끝에 자동으로
//    합류한다(발행일 순).

export interface SeriesDef {
  slug: string;
  title: string;
  /** 목록 카드와 시리즈 첫머리에 쓰는 소개(독자 눈높이, 2문장 안팎) */
  description: string;
  /** 이 시리즈와 이어 보면 좋은 점검표(있을 때만) */
  checklist?: { href: string; label: string };
  postIds: string[];
}

export const series: SeriesDef[] = [
  {
    slug: 'getting-started',
    title: '병원 AI 입문',
    description:
      'AI를 처음 공부하는 병원 행정·간호 실무자를 위한 시작점입니다. 왜 지금 공부해야 하는지, 첫 한 달을 어떻게 보낼지, 대화형 AI에 무엇을 어떻게 시킬지부터 짚습니다.',
    postIds: [
      'starting-hospital-ai-lab',
      '2026-07-05-why-study-ai-now',
      '2026-07-05-first-month-roadmap',
      '2026-07-26-prompt-basics-hospital-staff',
      '2026-08-29-public-sector-ai-guide-prompt-basics',
      '2026-09-03-hospital-ai-agent-vs-chatbot',
    ],
  },
  {
    slug: 'proposal-review',
    title: 'AI 제안서 검토 기준',
    description:
      '업체가 AI 제안서를 들고 왔을 때 행정이 무엇을 물어야 하는지 모았습니다. 허가와 급여의 차이, 성능 숫자 읽는 법, 도입 뒤 성능 점검까지 순서대로 읽을 수 있습니다.',
    checklist: { href: '/checklist/', label: 'AI 도입 검토 체크리스트' },
    postIds: [
      '2026-07-07-digital-medical-products-act',
      '2026-07-19-ai-approval-vs-reimbursement',
      '2026-08-09-reading-ai-performance-numbers',
      '2026-07-09-sepsis-ai-external-validation',
      '2026-09-10-five-phase-evaluation-framework-medical-ai',
      '2026-08-27-ai-medical-device-change-management-plan',
      '2026-09-12-ai-medical-device-excellent-management-certification',
      '2026-07-25-ai-performance-drift-after-deployment',
      '2026-08-20-ai-compare-vendor-proposals',
    ],
  },
  {
    slug: 'data-privacy',
    title: '환자정보·개인정보와 AI',
    description:
      '병원 데이터를 AI에 쓸 때 행정이 확인할 점을 모았습니다. 업체와 데이터를 나눌 때, 직원이 대화형 AI에 입력할 때, 관련 제도가 바뀔 때를 나눠 다룹니다.',
    checklist: { href: '/checklist/dept-ai-rules/', label: '부서 AI 사용 규칙 점검표' },
    postIds: [
      '2026-07-08-sharing-data-with-ai-vendors',
      '2026-08-16-ai-personal-enterprise-account-privacy',
      '2026-08-23-generative-ai-input-caution-drafting',
      '2026-09-08-department-ai-usage-rules-one-page',
      '2026-08-17-bioethics-committee-ai-health-data',
      '2026-08-21-pseudonymized-data-processing-suspension',
      '2026-08-06-automated-decision-rights-hospital-ai',
      '2026-09-13-privacy-act-amendment-september-2026',
    ],
  },
  {
    slug: 'work-with-ai-tools',
    title: '행정·간호 AI 도구 활용',
    description:
      '회의록, 안내문, 매뉴얼, 인수인계처럼 일상 업무에 AI를 쓸 때 어디서 틀리는지, 무엇을 확인하고 써야 하는지 사례별로 정리했습니다.',
    checklist: { href: '/checklist/ai-draft-input/', label: 'AI 초안 작성 전 입력 점검표' },
    postIds: [
      '2026-07-15-generative-ai-hospital-work-cautions',
      '2026-07-16-ai-meeting-minutes-hospital',
      '2026-08-03-ai-plain-language-patient-materials',
      '2026-07-21-ai-translation-foreign-patient-materials',
      '2026-07-15-ai-generated-images-copyright-hospital',
      '2026-08-04-ask-ai-about-hospital-policy-documents',
      '2026-08-31-lost-in-the-middle-long-documents-ai',
      '2026-08-07-ai-patient-survey-free-text',
      '2026-08-08-ai-table-calculation-hospital-stats',
      '2026-09-05-ai-nursing-handover-sbar',
      '2026-09-07-ai-draft-department-manual-onboarding',
      '2026-09-17-ai-drafting-staff-training-from-legal-update',
      '2026-08-12-ai-nurse-schedule-inha-university-hospital',
      '2026-08-26-ai-voice-recognition-surgical-records',
    ],
  },
  {
    slug: 'dont-overtrust',
    title: 'AI를 과신하지 않기',
    description:
      'AI 답이 그럴듯해도 틀릴 수 있는 이유와 점검 방법을 다룹니다. 자동화 편향, 경보 피로, 알고리즘 편향, 없는 출처까지 현장에서 실제로 일어나는 함정을 모았습니다.',
    postIds: [
      '2026-07-23-automation-bias-overtrust',
      '2026-07-09-alarm-fatigue-ai-alerts',
      '2026-07-29-algorithmic-bias-what-ai-predicts',
      '2026-08-11-verifying-ai-generated-citations',
      '2026-08-25-ai-education-material-error-rate',
      '2026-07-27-patient-ai-symptom-checkers',
      '2026-07-30-ai-scribe-documentation-burden',
      '2026-09-16-generative-ai-vs-multidisciplinary-decision',
    ],
  },
  {
    slug: 'clinical-prediction-cases',
    title: '예측·진단 AI 사례 읽기',
    description:
      '낙상, 예약부도, 뇌졸중, 치매 선별처럼 실제 연구와 병원 사례를 행정·간호의 눈높이로 읽습니다. 모델의 근거와 한계, 도입 전에 확인할 점을 함께 봅니다.',
    postIds: [
      '2026-07-09-sepsis-ai-external-validation',
      '2026-08-01-ai-appointment-no-show-prediction',
      '2026-08-02-ai-fall-prediction-nursing',
      '2026-08-16-osteoporosis-risk-prediction-thyroid-cancer',
      '2026-08-24-stroke-ai-workflow-change',
      '2026-08-30-retinal-photo-dementia-screening-ai',
      '2026-09-18-multimodal-ai-missing-data-mortality-prediction',
    ],
  },
  {
    slug: 'policy-news',
    title: '제도·정책 소식',
    description:
      'AI 기본법, 국가 전략, 심사 제도, 해외 규제처럼 병원 실무에 영향을 주는 제도 소식을 모았습니다. 소식마다 병원이 무엇을 준비해야 하는지에 초점을 둡니다.',
    postIds: [
      '2026-08-18-ai-basic-act-hospital-implications',
      '2026-08-28-ai-basic-medicine-strategy-public-hospitals',
      '2026-09-04-hira-ai-imaging-claims-review',
      '2026-09-20-hira-realtime-ct-mri-history-ai-review',
      '2026-09-09-genai-medical-device-fda-discussion-paper',
      '2026-09-15-fda-ai-model-disclosure-mandate',
    ],
  },
];
