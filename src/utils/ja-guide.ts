// 日本語版「実務ガイド」「患者さん向け」ページ共通の構造化データ（2026-10-31）
//
// ⚠️ 画面に見えている内容と同じものだけをマークアップする。
//    citation には、ページ下部の「出典と確認日」に載せた出典をそのまま渡す（見えていない出典を足さない）。
//    FAQPage は、画面に実際に表示している質問と回答を渡すこと。
export type Src = { label: string; url: string };
export type Qa = { q: string; a: string };

interface Opts {
  siteRoot: string;
  /** 例: /ja/dx-roadmap/ */
  path: string;
  headline: string;
  description: string;
  sources: Src[];
  /** 公開日（YYYY-MM-DD）。実際に公開した日を入れる */
  published: string;
  /** 最終確認日（YYYY-MM-DD） */
  modified: string;
  /** 想定する読者（画面の「向け」の表記と合わせる） */
  audience: string;
  faq?: Qa[];
}

export function guideSchema(o: Opts): Record<string, unknown>[] {
  const url = `${o.siteRoot}${o.path}`;
  const out: Record<string, unknown>[] = [
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: o.headline,
      description: o.description,
      inLanguage: 'ja-JP',
      mainEntityOfPage: { '@id': `${url}#webpage` },
      author: { '@id': `${o.siteRoot}/#person` },
      publisher: { '@id': `${o.siteRoot}/#organization` },
      isPartOf: { '@id': `${o.siteRoot}/#website-ja` },
      datePublished: `${o.published}T00:00:00+09:00`,
      dateModified: `${o.modified}T00:00:00+09:00`,
      audience: { '@type': 'Audience', audienceType: o.audience },
      citation: o.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })),
    },
  ];
  if (o.faq && o.faq.length > 0) {
    out.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      inLanguage: 'ja-JP',
      isPartOf: { '@id': `${o.siteRoot}/#website-ja` },
      mainEntity: o.faq.map((f, i) => ({
        '@type': 'Question',
        '@id': `${url}#faq-q${i + 1}`,
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return out;
}
