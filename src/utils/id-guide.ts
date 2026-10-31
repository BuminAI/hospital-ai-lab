// Struktur data bersama untuk halaman panduan praktis dan sudut pasien edisi Indonesia (2026-10-31)
//
// ⚠️ Hanya konten yang terlihat di layar yang diberi markup terstruktur.
//    citation = sumber yang tercantum di bagian 'Sumber dan tanggal verifikasi' di bawah halaman.
//    FAQPage = pertanyaan dan jawaban yang benar-benar tampil di layar.
export type Src = { label: string; url: string };
export type Qa = { q: string; a: string };

interface Opts {
  siteRoot: string;
  /** 例: /id/dx-roadmap/ */
  path: string;
  headline: string;
  description: string;
  sources: Src[];
  /** tanggal terbit (YYYY-MM-DD) */
  published: string;
  /** tanggal verifikasi terakhir (YYYY-MM-DD) */
  modified: string;
  /** pembaca sasaran (sama dengan label 'untuk siapa' di layar) */
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
      inLanguage: 'id',
      mainEntityOfPage: { '@id': `${url}#webpage` },
      author: { '@id': `${o.siteRoot}/#person` },
      publisher: { '@id': `${o.siteRoot}/#organization` },
      isPartOf: { '@id': `${o.siteRoot}/#website-id` },
      datePublished: `${o.published}T00:00:00+07:00`,
      dateModified: `${o.modified}T00:00:00+07:00`,
      audience: { '@type': 'Audience', audienceType: o.audience },
      citation: o.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })),
    },
  ];
  if (o.faq && o.faq.length > 0) {
    out.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      inLanguage: 'id',
      isPartOf: { '@id': `${o.siteRoot}/#website-id` },
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
