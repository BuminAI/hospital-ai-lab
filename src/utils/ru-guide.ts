// Общие структурированные данные страниц «Практикум» и «Для пациентов» русской версии (2026-10-31)
//
// ⚠️ Размечаем только то, что видно на экране.
//    citation = источники из блока «Источники и дата проверки» внизу страницы.
//    FAQPage = вопросы и ответы, реально показанные на экране.
export type Src = { label: string; url: string };
export type Qa = { q: string; a: string };

interface Opts {
  siteRoot: string;
  /** 例: /ru/dx-roadmap/ */
  path: string;
  headline: string;
  description: string;
  sources: Src[];
  /** дата публикации (YYYY-MM-DD) */
  published: string;
  /** дата последней проверки (YYYY-MM-DD) */
  modified: string;
  /** целевая аудитория (как в подписи «для кого» на экране) */
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
      inLanguage: 'ru',
      mainEntityOfPage: { '@id': `${url}#webpage` },
      author: { '@id': `${o.siteRoot}/#person` },
      publisher: { '@id': `${o.siteRoot}/#organization` },
      isPartOf: { '@id': `${o.siteRoot}/#website-ru` },
      datePublished: `${o.published}T00:00:00+03:00`,
      dateModified: `${o.modified}T00:00:00+03:00`,
      audience: { '@type': 'Audience', audienceType: o.audience },
      citation: o.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })),
    },
  ];
  if (o.faq && o.faq.length > 0) {
    out.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      inLanguage: 'ru',
      isPartOf: { '@id': `${o.siteRoot}/#website-ru` },
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
