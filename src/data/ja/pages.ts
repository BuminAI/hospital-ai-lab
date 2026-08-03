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
