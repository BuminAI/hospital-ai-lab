// 대만어판(정체자) 용어집 데이터 — 타입만 붙이는 얇은 로더
//
// ⚠️ 용어 데이터는 JSON에 있다. 편집할 파일은 src/data/tw/content/glossary.json
//    이 파일은 JSON을 읽어 타입만 붙인다. 여기에 본문을 직접 쓰지 말 것.
//
// ⚠️ 한국어판·일본어판·러시아어판의 번역이 아니다. 제도 관련 항목은 대만
//    제도(醫療器材管理法·個人資料保護法·醫療機構電子病歷製作及管理辦法)를
//    실제로 조사해 쓴 것이고, 출처는 전국법규자료고(law.moj.gov.tw) 원문에
//    직접 접속해 조문을 확인했다(2026-09-06).
//    수정할 때도 같은 원칙을 지킬 것 — 확인 못 한 내용은 쓰지 않는다.
//
//    ⚠️ 인도네시아어판과 반대로, 대만은 **소프트웨어가 의료기기에 포함된다는
//       것이 법률 조문에 명시**돼 있다(醫療器材管理法 제3조). 조문을 직접
//       확인했다(2026-09-06). 이 점이 대만어판 용어집의 출발점이다.
//
// ⚠️ id는 URL 앵커다(예: /tw/glossary/#medical-device-software). 한번 공개한 id는 바꾸지 말 것
//    — 외부 링크가 깨진다.
//
// ⚠️ category는 아래 glossaryCategoriesTw 2개 중 하나와 정확히 일치해야 한다.
//    안 맞으면 그 용어가 화면에서 조용히 사라진다.
//
// ⚠️ sources는 비어 있어도 반드시 []를 넣을 것. 각 원소는 http(s)://로
//    시작하는 절대 URL이어야 한다(glossary.astro가 new URL()로 파싱).

import glossaryData from './content/glossary.json';

export type GlossaryCategoryTw = '法規與許可' | '病歷與資料管理';

export interface GlossaryTermTw {
  /** URL 앵커. 바꾸지 말 것 */
  id: string;
  term: string;
  category: GlossaryCategoryTw;
  definition: string;
  whyMatters: string;
  /** 출처 URL. 여러 개면 전부 싣는다 */
  sources: string[];
}

/** 이 배열의 순서가 화면 섹션 순서가 된다 */
export const glossaryCategoriesTw: GlossaryCategoryTw[] = [
  '法規與許可',
  '病歷與資料管理',
];

export const glossaryTermsTw: GlossaryTermTw[] = glossaryData as GlossaryTermTw[];
