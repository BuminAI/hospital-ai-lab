// 日本語版コンテンツ — 型付きローダー
//
// ⚠️ 本文データは JSON に移しました。編集するファイルは以下です。
//      src/data/ja/content/guide.json
//      src/data/ja/content/checklist.json
//      src/data/ja/content/tips.json
//      src/data/ja/content/videos.json
//      src/data/ja/content/videos-meta.json
//    このファイルは JSON を読み込んで型を付けるだけです。本文は書かないこと。
//
// ⚠️ 韓国語版の直訳ではありません。日本の制度・実務に合わせて書き直し、
//    制度に関わる記述は公式資料で確認したものだけを載せています。
//    修正する際も同じ原則を守ってください。確認できない内容は書かないこと。
//
// ⚠️ meta.title に「｜病院AI研究所」を付けないこと。JaLayout が自動で付けます。
//
// ⚠️ sections[].items は空でも必ず [] を入れること。キーを省くと
//    JaSections.astro の s.items.length でビルドが落ちます。

import guideData from './content/guide.json';
import checklistData from './content/checklist.json';
import tipsData from './content/tips.json';
import videosData from './content/videos.json';
import videosMetaData from './content/videos-meta.json';

export interface JaSection {
  heading: string;
  body: string;
  items: string[];
}

export interface JaContentPage {
  meta: { title: string; description: string; pageTitle: string; lead: string };
  sections: JaSection[];
}

export interface JaVideo {
  videoId: string;
  titleJa: string;
  note: string;
}

export interface JaVideosMeta {
  title: string;
  description: string;
  pageTitle: string;
  lead: string;
  /** 視聴前に伝える案内。動画の音声が韓国語である旨など */
  notice: string;
}

export const guideJa: JaContentPage = guideData;
export const checklistJa: JaContentPage = checklistData;
export const tipsJa: JaContentPage = tipsData;

export const videosMetaJa: JaVideosMeta = videosMetaData;

// ⚠️ 日本語タイトル(titleJa)が空の動画は公開しません。
//    管理画面では「韓国語版にあって日本語版に無い動画」を先に登録できますが、
//    日本語タイトルを入れないまま韓国語のタイトルで出すことはしない、という
//    方針です(日本語版に韓国語がそのまま出ると信頼を損ないます)。
//    タイトルを入れた時点で自動的に公開されます。
export const videosJa: JaVideo[] = (videosData as JaVideo[]).filter(
  (v) => v.titleJa.trim() !== ''
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

export interface LocalVideoJa {
  videoId: string;
  /** 유튜브에 실제로 표시되는 제목. 임의로 고쳐 쓰지 말 것 */
  title: string;
  /** 채널명. 누가 만든 영상인지 화면에 밝힌다 */
  channel: string;
  /** 왜 이 영상을 골랐는지 한 줄. 영상이 주장하는 사실을 옮기지 않는다 */
  note: string;
}

export const videosLocalJa: LocalVideoJa[] = videosLocalData;

// ── 교육·행사 안내 (2026-09-06 신설) ────────────────────
// ⚠️ 자동 수집이 아니다. 사람이 1차 출처에 접속해 확인한 것만 적는다.
//    사유는 content/events.json의 _comment 참고.
import eventsData from './content/events.json';

export interface EventEntryJa {
  name: string;
  org: string;
  url: string;
  body: string;
  audience: string;
  sourceUrl: string;
  sourceLabel: string;
}

export interface EventsPageJa {
  meta: { title: string; description: string; pageTitle: string; lead: string };
  notice: string;
  /** 마지막으로 전 항목을 실제 접속해 확인한 날 (YYYY-MM-DD) */
  checkedAt: string;
  items: EventEntryJa[];
}

export const eventsJa: EventsPageJa = eventsData;
