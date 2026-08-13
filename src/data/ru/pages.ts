// 러시아어판 콘텐츠 — 타입만 붙이는 얇은 로더
//
// ⚠️ 본문 데이터는 JSON에 있다. 편집할 파일:
//      src/data/ru/content/guide.json
//      src/data/ru/content/checklist.json
//      src/data/ru/content/tips.json
//      src/data/ru/content/videos.json
//      src/data/ru/content/videos-meta.json
//    이 파일은 JSON을 읽어 타입만 붙인다. 여기에 본문을 직접 쓰지 말 것.
//
// ⚠️ 한국어판·일본어판의 번역이 아니다. 러시아 제도·실무에 맞춰 새로 썼고,
//    제도 관련 서술은 실제 접속해 확인한 자료만 실었다. 수정할 때도 같은
//    원칙을 지킬 것 — 확인 못 한 내용은 쓰지 않는다.
//
// ⚠️ meta.title에 "| Лаборатория ИИ для больниц"를 붙이지 말 것.
//    RuLayout이 자동으로 붙인다.
//
// ⚠️ sections[].items는 비어 있어도 반드시 []를 넣을 것. 키를 생략하면
//    렌더링 시 s.items.length에서 빌드가 깨진다.

import guideData from './content/guide.json';
import checklistData from './content/checklist.json';
import tipsData from './content/tips.json';
import videosData from './content/videos.json';
import videosMetaData from './content/videos-meta.json';

export interface RuSection {
  heading: string;
  body: string;
  items: string[];
}

export interface RuContentPage {
  meta: { title: string; description: string; pageTitle: string; lead: string };
  sections: RuSection[];
}

export interface RuVideo {
  videoId: string;
  titleRu: string;
  note: string;
}

export interface RuVideosMeta {
  title: string;
  description: string;
  pageTitle: string;
  lead: string;
  /** 시청 전에 전달할 안내. 영상 음성이 한국어라는 사실 등 */
  notice: string;
}

export const guideRu: RuContentPage = guideData;
export const checklistRu: RuContentPage = checklistData;
export const tipsRu: RuContentPage = tipsData;

export const videosMetaRu: RuVideosMeta = videosMetaData;

// ⚠️ 러시아어 제목(titleRu)이 빈 영상은 공개하지 않는다.
//    관리자 화면에서 "한국어판에 있고 러시아어판에 없는 영상"을 먼저 등록할 수
//    있지만, 러시아어 제목을 입력하지 않은 채 한국어 제목으로 노출하지 않는다
//    (러시아어판에 한국어가 그대로 나오면 신뢰를 해친다). 제목을 입력하는
//    순간 자동으로 공개된다.
export const videosRu: RuVideo[] = (videosData as RuVideo[]).filter(
  (v) => v.titleRu.trim() !== ''
);
