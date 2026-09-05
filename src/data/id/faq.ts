// 인도네시아어판 FAQ 데이터 — 타입만 붙이는 얇은 로더
//
// ⚠️ 질문 데이터는 JSON에 있다. 편집할 파일은 src/data/id/content/faq.json
//    이 파일은 JSON을 읽어 타입만 붙인다. 여기에 본문을 직접 쓰지 말 것.
//
// ⚠️ 답변은 인도네시아 제도(UU 27/2022 PDP, izin edar, SATUSEHAT, 보건부
//    2026-06-08 발표)를 실제로 조사해 썼다. 출처는 WebFetch로 직접 접속해
//    답변을 뒷받침하는지 확인했다(2026-09-05). 확인 못 한 내용은 쓰지 않는다.
//
// ⚠️ 러시아어판과 달리 각 항목에 `id`를 둔다 — 앵커를 순번(#q1)이 아니라
//    이름으로 만들어, 나중에 질문을 추가·삭제해도 기존 공유 링크가 다른
//    질문을 가리키지 않게 하려는 것이다. 공개한 id는 바꾸지 말 것.
//
// ⚠️ sources는 비어 있어도 반드시 []를 넣을 것. 각 원소는 http(s)://로
//    시작하는 절대 URL이어야 한다.

import faqData from './content/faq.json';

export interface FaqItemId {
  /** URL 앵커. 바꾸지 말 것 */
  id: string;
  question: string;
  answer: string;
  /** 출처 URL. 여러 개면 전부 싣는다 */
  sources: string[];
}

export const faqItemsId: FaqItemId[] = faqData;
