// 台灣版「實務指南」「患者專區」頁面共用的結構化資料（2026-10-31）
//
// ⚠️ 畫面上看得到的內容才做結構化標記。
//    citation 直接傳入頁面下方「出處與查證日」列出的出處（不要加入畫面上看不到的出處）。
//    FAQPage 要傳入畫面上實際顯示的問題與回答。
export type Src = { label: string; url: string };
export type Qa = { q: string; a: string };

interface Opts {
  siteRoot: string;
  /** 例: /tw/dx-roadmap/ */
  path: string;
  headline: string;
  description: string;
  sources: Src[];
  /** 公開日（YYYY-MM-DD）。填入實際公開的日期 */
  published: string;
  /** 最後查證日（YYYY-MM-DD） */
  modified: string;
  /** 預設讀者（與畫面上「適用對象」的標示一致） */
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
      inLanguage: 'zh-TW',
      mainEntityOfPage: { '@id': `${url}#webpage` },
      author: { '@id': `${o.siteRoot}/#person` },
      publisher: { '@id': `${o.siteRoot}/#organization` },
      isPartOf: { '@id': `${o.siteRoot}/#website-tw` },
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
      inLanguage: 'zh-TW',
      isPartOf: { '@id': `${o.siteRoot}/#website-tw` },
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
