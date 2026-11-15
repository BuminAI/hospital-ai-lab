// AEO/GEO helpers (2026-11-06, English edition)
//
// ① The bullets under a "Key takeaways / Summary / Bottom line" heading at the end of a post are lifted into a "Short answer" box at the top —
//    answer engines quote the short answer at the start of a page most. No new content is made: the summary already in the post is moved as is.
// ② Regulations that actually appear in the body are linked as Legislation nodes (mentions).
//    Never add a regulation that is not in the body (mark up only what is visible on screen).

const HEAD = /^##\s+(?:À retenir|Points clés|En bref|Résumé|L’essentiel|Key takeaways)[^\r\n]*\r?\n/m;

/** Pull the bullets under a "## Key takeaways" style heading as plain text. Empty array if none. */
export function extractSummary(markdown: string | undefined): string[] {
  if (!markdown) return [];
  const head = markdown.match(HEAD);
  if (!head || head.index === undefined) return [];
  let rest = markdown.slice(head.index + head[0].length);
  const stop = rest.search(/^(?:##\s|<br|\*\*Sources|\*Sources|---)/m);
  if (stop >= 0) rest = rest.slice(0, stop);
  const out: string[] = [];
  for (const line of rest.split('\n')) {
    const b = line.match(/^\s*[-*]\s+(.*\S)\s*$/);
    if (!b) continue;
    out.push(
      b[1]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim()
    );
  }
  return out.slice(0, 6);
}

type Law = { name: string; id: string; url: string; test: RegExp };
const LAWS: Law[] = [
  { name: 'Règlement (UE) 2024/1689 (règlement sur l’intelligence artificielle)', id: 'Règlement (UE) 2024/1689', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra', test: /règlement sur l[’']IA|règlement européen sur l[’']IA|2024\/1689|déployeur|haut risque|\bRIA\b/i },
  { name: 'Règlement (UE) 2016/679 (RGPD)', id: 'Règlement (UE) 2016/679', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra', test: /RGPD|règlement général sur la protection des données|catégories particulières|analyse d[’']impact|AIPD|72 heures/i },
  { name: 'Règlement (UE) 2017/745 (règlement relatif aux dispositifs médicaux)', id: 'Règlement (UE) 2017/745', url: 'https://eur-lex.europa.eu/eli/reg/2017/745/oj/fra', test: /\bRDM\b|dispositifs? médica|2017\/745|marquage CE/i },
  { name: 'Projet de guide HAS-CNIL « Accompagner le bon usage des systèmes d’intelligence artificielle en contexte de soins »', id: 'Document de travail, 16 février 2026', url: 'https://cnil.fr/sites/default/files/2026-03/guide_has_cnil_recommandations_ia.pdf', test: /guide HAS-CNIL|HAS et la CNIL|contexte de soins/i },
  { name: 'CNIL — IA et santé : développer et évaluer des systèmes d’IA en conformité avec la réglementation', id: 'CNIL, 5 mars 2026', url: 'https://www.cnil.fr/fr/ia-et-sante-developper-et-evaluer-des-systemes-dia-en-conformite-avec-la-reglementation', test: /CNIL/i },
];

const TOPICS: [string, RegExp][] = [
  ['Protection des données des patients', /données personnelles|données de patients|consentement|vie privée|RGPD/i],
  ['Analyse d’impact relative à la protection des données', /analyse d[’']impact|AIPD/i],
  ['Dossier patient informatisé', /dossier patient|dossier médical|DPI\b/i],
  ['Intelligence artificielle à l’hôpital', /\bIA\b|intelligence artificielle|apprentissage automatique|grand modèle de langage/i],
  ['Réglementation des logiciels dispositifs médicaux', /dispositif médical|\bRDM\b|marquage CE|matériovigilance/i],
  ['Sécurité de l’information de santé', /cyber|rançongiciel|violation|hameçonnage/i],
  ['Éthique de l’IA en santé', /éthique|biais|responsabilité|transparence/i],
  ['Télémédecine', /télémédecine|téléconsultation/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'FR',
    inLanguage: 'fr-FR',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
