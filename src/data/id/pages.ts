// 인도네시아어판 콘텐츠 — 타입만 붙이는 얇은 로더 (2026-09-06 신설)
//
// ⚠️ 본문 데이터는 JSON에 있다. 편집할 파일:
//      src/data/id/content/guide.json
//      src/data/id/content/checklist.json
//      src/data/id/content/tips.json
//      src/data/id/content/videos.json
//      src/data/id/content/videos-meta.json
//    이 파일은 JSON을 읽어 타입만 붙인다. 여기에 본문을 직접 쓰지 말 것.
//    (러시아어판 src/data/ru/pages.ts와 같은 구조다.)
//
// ⚠️ 한국어판의 번역이 아니다. 인도네시아 제도·실무에 맞춰 새로 쓰고,
//    제도 관련 서술은 실제 접속해 확인한 1차 출처만 싣는다.
//
// ⚠️ meta.title에 "| Hospital AI Lab"을 붙이지 말 것. IdLayout이 붙인다.

import guideData from './content/guide.json';
import checklistData from './content/checklist.json';
import tipsData from './content/tips.json';
import videosData from './content/videos.json';
import videosMetaData from './content/videos-meta.json';
import govSupportData from './content/gov-support.json';

// ⚠️ sections[].items는 비어 있어도 반드시 []를 넣을 것. 키를 생략하면
//    렌더링 시 s.items.length에서 빌드가 깨진다(ru·tw판과 같은 함정).
export interface IdSection {
  heading: string;
  body: string;
  items: string[];
}

export interface IdContentPage {
  meta: { title: string; description: string; pageTitle: string; lead: string };
  sections: IdSection[];
}

export const guideId: IdContentPage = guideData;
export const checklistId: IdContentPage = checklistData;
export const tipsId: IdContentPage = tipsData;

export interface IdVideo {
  videoId: string;
  titleId: string;
  note: string;
}

export interface IdVideosMeta {
  title: string;
  description: string;
  pageTitle: string;
  lead: string;
  /** 시청 전에 전달할 안내. 영상 음성이 한국어라는 사실 등 */
  notice: string;
}

export const videosMetaId: IdVideosMeta = videosMetaData;

// ⚠️ 인도네시아어 제목(titleId)이 빈 영상은 공개하지 않는다.
//    제목을 안 넣은 채 한국어 제목이 그대로 나오면 신뢰를 해친다
//    (러시아어판과 같은 원칙). 제목을 넣는 순간 자동으로 공개된다.
export const videosId: IdVideo[] = (videosData as IdVideo[]).filter(
  (v) => v.titleId.trim() !== ''
);

// ── 정부 지원·제도 안내 ────────────────────────────────
// ⚠️ 한국어판·일본어판과 달리 자동 수집이 아니다. 사람이 1차 출처에 접속해
//    확인한 것만 적는다. 사유는 gov-support.json의 _comment 참고.
export interface IdProgram {
  name: string;
  org: string;
  /** 프로그램 공식 페이지 */
  url: string;
  body: string;
  audience: string;
  /** 본문 서술의 근거가 된 페이지 */
  sourceUrl: string;
  sourceLabel: string;
}

export interface IdGovSupport {
  meta: { title: string; description: string; pageTitle: string; lead: string };
  notice: string;
  /** 마지막으로 전 항목을 실제 접속해 확인한 날 (YYYY-MM-DD) */
  checkedAt: string;
  programs: IdProgram[];
}

export const govSupportId: IdGovSupport = govSupportData;

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

export interface LocalVideoId {
  videoId: string;
  /** 유튜브에 실제로 표시되는 제목. 임의로 고쳐 쓰지 말 것 */
  title: string;
  /** 채널명. 누가 만든 영상인지 화면에 밝힌다 */
  channel: string;
  /** 왜 이 영상을 골랐는지 한 줄. 영상이 주장하는 사실을 옮기지 않는다 */
  note: string;
}

export const videosLocalId: LocalVideoId[] = videosLocalData;
