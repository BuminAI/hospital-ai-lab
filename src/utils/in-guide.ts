// Shared structured data for the Practice and For-patients pages of the English edition (2026-11-06)
//
// ⚠️ Mark up only what is visible on screen.
//    citation = the sources in the "Sources and date checked" block at the bottom of the page.
//    FAQPage = questions and answers actually shown on screen.
export type Src = { label: string; url: string };
export type Qa = { q: string; a: string };

interface Opts {
  siteRoot: string;
  /** e.g. /in/dx-roadmap/ */
  path: string;
  headline: string;
  description: string;
  sources: Src[];
  /** publication date (YYYY-MM-DD) */
  published: string;
  /** date last checked (YYYY-MM-DD) */
  modified: string;
  /** target audience (as in the "for whom" line on screen) */
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
      inLanguage: 'en-IN',
      mainEntityOfPage: { '@id': `${url}#webpage` },
      author: { '@id': `${o.siteRoot}/#person` },
      publisher: { '@id': `${o.siteRoot}/#organization` },
      isPartOf: { '@id': `${o.siteRoot}/#website-in` },
      datePublished: `${o.published}T00:00:00-05:00`,
      dateModified: `${o.modified}T00:00:00-05:00`,
      audience: { '@type': 'Audience', audienceType: o.audience },
      citation: o.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })),
    },
  ];
  if (o.faq && o.faq.length > 0) {
    out.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      inLanguage: 'en-IN',
      isPartOf: { '@id': `${o.siteRoot}/#website-in` },
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
