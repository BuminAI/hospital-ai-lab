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
import govSupportData from './content/gov-support.json';
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

// ── 다른 채널의 추천 영상 (2026-09-06 신설) ─────────────
// ⚠️ 연구소장이 만든 영상이 아니다. **그 나라 언어로 된 의료 AI 영상**을
//    유튜브에서 찾아 링크만 건 것이다(한국어판 /youtube/의 '다른 채널 추천
//    영상'과 같은 성격). 한국어판 영상을 번역해 붙인 것이 아니다.
//
// ⚠️ 여기 싣는 영상은 **전부 유튜브 oEmbed로 제목·채널명을 실제 확인**한
//    것만 쓴다(2026-09-06 확인). videoId를 눈대중으로 적지 말 것 — 오타 하나면
//    전혀 다른 영상이 걸린다. 확인 방법:
//      https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json
//
// ⚠️ 화면에는 "선정했을 뿐 제휴·후원 관계가 없다"는 안내를 반드시 함께 낸다.
//    영상 내용은 각 채널 제작자의 것이고 이 사이트가 검증한 주장이 아니다.
import videosLocalData from './content/videos-local.json';

export interface LocalVideoRu {
  videoId: string;
  /** 유튜브에 실제로 표시되는 제목. 임의로 고쳐 쓰지 말 것 */
  title: string;
  /** 채널명. 누가 만든 영상인지 화면에 밝힌다 */
  channel: string;
  /** 왜 이 영상을 골랐는지 한 줄. 영상이 주장하는 사실을 옮기지 않는다 */
  note: string;
}

export const videosLocalRu: LocalVideoRu[] = videosLocalData;

// ── 정부 자원 안내 ────────────────────────────────────
// ⚠️ 한국어판·일본어판과 달리 자동 수집이 아니다. 사람이 1차 출처에 접속해
//    확인한 것만 적는다. 사유는 gov-support.json의 _comment 참고.
//    러시아도 대만과 마찬가지로 '보조금 공고'가 아니라 '판단 근거가 되는
//    공식 창구'를 모으는 쪽으로 구성했다.
export interface RuProgram {
  name: string;
  org: string;
  /** 기관·서비스 공식 페이지 */
  url: string;
  body: string;
  audience: string;
  /** 본문 서술의 근거가 된 페이지 */
  sourceUrl: string;
  sourceLabel: string;
}

export interface RuGovSupport {
  meta: { title: string; description: string; pageTitle: string; lead: string };
  notice: string;
  /** 마지막으로 전 항목을 실제 접속해 확인한 날 (YYYY-MM-DD) */
  checkedAt: string;
  programs: RuProgram[];
}

export const govSupportRu: RuGovSupport = govSupportData;

// ── 교육·행사 안내 (2026-09-06 신설) ────────────────────
// ⚠️ 자동 수집이 아니다. 사람이 1차 출처에 접속해 확인한 것만 적는다.
//    사유는 content/events.json의 _comment 참고.
import eventsData from './content/events.json';

export interface EventEntryRu {
  name: string;
  org: string;
  url: string;
  body: string;
  audience: string;
  sourceUrl: string;
  sourceLabel: string;
}

export interface EventsPageRu {
  meta: { title: string; description: string; pageTitle: string; lead: string };
  notice: string;
  /** 마지막으로 전 항목을 실제 접속해 확인한 날 (YYYY-MM-DD) */
  checkedAt: string;
  items: EventEntryRu[];
}

export const eventsRu: EventsPageRu = eventsData;
