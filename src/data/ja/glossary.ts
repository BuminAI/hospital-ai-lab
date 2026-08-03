// 日本語版 用語集データ — 型付きローダー
//
// ⚠️ 用語データは JSON に移しました。編集するファイルは
//      src/data/ja/content/glossary.json
//    このファイルは JSON を読み込んで型を付けるだけです。用語は書かないこと。
//
// ⚠️ 韓国語版の翻訳ではありません。制度に関わる項目は日本の制度
//    (薬機法・個人情報保護法・次世代医療基盤法など) に沿って書き直し、
//    出典は実際に接続して内容を確認しています。
//    修正するときも同じ原則を守ってください。確認できない内容は書かないこと。
//
// ⚠️ id は URL アンカーです (例: /ja/glossary/#sensitivity)。
//    一度公開した id は変更しないでください。外部リンクが切れます。
//
// ⚠️ category は下の glossaryCategoriesJa の 5 つのいずれかと完全に一致させること。
//    一致しない値を入れると、その用語は画面から静かに消えます。
//
// ⚠️ sources は空でも必ず [] を入れること。また各要素は http(s):// で始まる
//    絶対 URL であること。glossary.astro が new URL() で解析するため、
//    スキームが欠けているとビルドが落ちます。
//
// 検証で修正した点:
//   - id 'mfds-approval' → 'yakkiho-approval' (MFDS は韓国の規制当局の略称のため)
//   - 出典が本文の主張を裏づけていない項目に、根拠 URL を併記 (sources 配列)

import glossaryData from './content/glossary.json';

export type GlossaryCategoryJa =
  | '性能指標'
  | '規制・認証'
  | '技術・モデル'
  | 'データ・個人情報'
  | '導入・運用';

export interface GlossaryTermJa {
  /** URL アンカー。変更しないこと */
  id: string;
  term: string;
  reading: string;
  category: GlossaryCategoryJa;
  definition: string;
  whyMatters: string;
  /** 出典 URL。複数ある場合はすべて掲載する */
  sources: string[];
}

/** この配列の順番が、画面のセクションの順番になります */
export const glossaryCategoriesJa: GlossaryCategoryJa[] = [
  '性能指標',
  '規制・認証',
  '技術・モデル',
  'データ・個人情報',
  '導入・運用',
];

export const glossaryTermsJa: GlossaryTermJa[] = glossaryData as GlossaryTermJa[];
