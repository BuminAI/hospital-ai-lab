// 인도네시아어판 용어집 데이터 — 타입만 붙이는 얇은 로더
//
// ⚠️ 용어 데이터는 JSON에 있다. 편집할 파일은 src/data/id/content/glossary.json
//    이 파일은 JSON을 읽어 타입만 붙인다. 여기에 본문을 직접 쓰지 말 것.
//
// ⚠️ 한국어판·일본어판·러시아어판의 번역이 아니다. 제도 관련 항목은 인도네시아
//    제도(UU 27/2022 PDP, SATUSEHAT, izin edar alat kesehatan 등)를 실제로
//    조사해 쓴 것이고, 출처는 WebFetch로 직접 접속해 내용을 확인했다(2026-09-05).
//    수정할 때도 같은 원칙을 지킬 것 — 확인 못 한 내용은 쓰지 않는다.
//
//    ⚠️ 특히 "소프트웨어가 alat kesehatan에 포함되어 등록 대상"이라는 서술은
//       이번에 1차 출처로 확인하지 못해 일부러 넣지 않았다(컨설팅 업체 글에만
//       나온다). Permenkes 원문으로 확인되기 전에는 쓰지 말 것.
//
// ⚠️ id는 URL 앵커다(예: /id/glossary/#uu-pdp). 한번 공개한 id는 바꾸지 말 것
//    — 외부 링크가 깨진다.
//
// ⚠️ category는 아래 glossaryCategoriesId 2개 중 하나와 정확히 일치해야 한다.
//    안 맞으면 그 용어가 화면에서 조용히 사라진다.
//
// ⚠️ sources는 비어 있어도 반드시 []를 넣을 것. 각 원소는 http(s)://로
//    시작하는 절대 URL이어야 한다(glossary.astro가 new URL()로 파싱).

import glossaryData from './content/glossary.json';

export type GlossaryCategoryId = 'Regulasi dan Perizinan' | 'Data dan Platform Nasional';

export interface GlossaryTermId {
  /** URL 앵커. 바꾸지 말 것 */
  id: string;
  term: string;
  category: GlossaryCategoryId;
  definition: string;
  whyMatters: string;
  /** 출처 URL. 여러 개면 전부 싣는다 */
  sources: string[];
}

/** 이 배열의 순서가 화면 섹션 순서가 된다 */
export const glossaryCategoriesId: GlossaryCategoryId[] = [
  'Regulasi dan Perizinan',
  'Data dan Platform Nasional',
];

export const glossaryTermsId: GlossaryTermId[] = glossaryData as GlossaryTermId[];
