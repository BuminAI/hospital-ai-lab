// 러시아어판 FAQ 데이터 — 타입만 붙이는 얇은 로더
//
// ⚠️ 질문 데이터는 JSON에 있다. 편집할 파일은 src/data/ru/content/faq.json
//    이 파일은 JSON을 읽어 타입만 붙인다. 여기에 본문을 직접 쓰지 말 것.
//
// ⚠️ 답변은 러시아 제도(152-ФЗ, Постановление №1684 등)를 실제로 조사해
//    썼다. 출처는 WebFetch로 직접 접속해 답변을 뒷받침하는지 확인했다
//    (2026-08-13). 확인 못 한 내용은 쓰지 않는다.
//
// ⚠️ 배열 순서가 화면 순서이자 JSON-LD 앵커(#q1~)다. 중간에 끼워 넣거나
//    지우면 기존 공유 링크가 다른 질문을 가리키게 된다.
//
// ⚠️ sources는 비어 있어도 반드시 []를 넣을 것. 각 원소는 http(s)://로
//    시작하는 절대 URL이어야 한다.

import faqData from './content/faq.json';

export interface FaqItemRu {
  question: string;
  answer: string;
  /** 출처 URL. 여러 개면 전부 싣는다 */
  sources: string[];
}

export const faqItemsRu: FaqItemRu[] = faqData;
