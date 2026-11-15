// Feuille de route du numérique et de l'IA pour les hôpitaux français — données de /fr/dx-roadmap/ et /fr/calendar/ (2026-11-15)
//
// ⚠️ Chaque fait vient d'un document primaire réellement ouvert et lu le 2026-11-15 : la fiche de la CNIL « IA et santé : développer et évaluer
//    des systèmes d'IA en conformité avec la réglementation » (5 mars 2026), la page de la CNIL sur la consultation HAS-CNIL (5 mars 2026,
//    « clôturée »), le projet de guide HAS-CNIL « Accompagner le bon usage des systèmes d'intelligence artificielle en contexte de soins »
//    (document de travail du 16 février 2026, PDF hébergé par la CNIL), la page de la CNIL sur la finalisation de ses recommandations
//    sur le développement des systèmes d'IA (22 juillet 2025), et les textes officiels en français du règlement sur l'IA (UE) 2024/1689,
//    du RGPD (UE) 2016/679 et du règlement (UE) 2017/745 publiés au Journal officiel de l'Union européenne (via l'Office des publications).
//    Légifrance (code de la santé publique) et le site de la HAS ont refusé les requêtes automatiques (HTTP 403) et la page de l'ANSM sur la
//    déclaration n'a pas pu être exploitée : aucun article du code de la santé publique n'est cité d'après le code lui-même, seulement tel
//    que le projet de guide HAS-CNIL le rappelle, et toujours signalé comme tel. Nous n'avons trouvé aucune version finale du guide HAS-CNIL.
//    Textes européens = versions publiées au Journal officiel ; les modifications ultérieures n'ont pas été lues.
//    N'ajoutez pas de dates ou d'obligations tirées de la presse ou de résumés de cabinets ; lisez le texte primaire et mettez CHECKED à jour.
export const CHECKED = '15 novembre 2026';

export const SRC = {
  cnilSante: { label: 'CNIL — IA et santé : développer et évaluer des systèmes d’IA en conformité avec la réglementation (fiche, 5 mars 2026)', url: 'https://www.cnil.fr/fr/ia-et-sante-developper-et-evaluer-des-systemes-dia-en-conformite-avec-la-reglementation' },
  cnilConsult: { label: 'CNIL — IA et santé : la HAS et la CNIL lancent une consultation publique sur un projet de guide (5 mars 2026, consultation clôturée)', url: 'https://www.cnil.fr/fr/ia-et-sante-la-has-et-la-cnil-lancent-une-consultation-publique-sur-un-projet-de-guide' },
  guideHasCnil: { label: 'HAS et CNIL — projet de guide « Accompagner le bon usage des systèmes d’intelligence artificielle en contexte de soins » (document de travail, 16 février 2026, PDF)', url: 'https://cnil.fr/sites/default/files/2026-03/guide_has_cnil_recommandations_ia.pdf' },
  cnilFiches: { label: 'CNIL — Les fiches pratiques IA', url: 'https://cnil.fr/fr/les-fiches-pratiques-ia' },
  cnilFinal: { label: 'CNIL — IA : la CNIL finalise ses recommandations sur le développement des systèmes d’IA (22 juillet 2025)', url: 'https://cnil.fr/fr/ia-finalisation-recommandations-developpement-des-systemes-ia' },
  aiAct: { label: 'Union européenne — règlement (UE) 2024/1689 (règlement sur l’intelligence artificielle), JO L du 12.7.2024, version française', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj/fra' },
  rgpd: { label: 'Union européenne — règlement (UE) 2016/679 (RGPD), version française', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra' },
  rdm: { label: 'Union européenne — règlement (UE) 2017/745 (règlement relatif aux dispositifs médicaux), tel que publié au JO le 5.5.2017, version française', url: 'https://eur-lex.europa.eu/eli/reg/2017/745/oj/fra' },
  cnilFeed: { label: 'CNIL — flux RSS des actualités', url: 'https://www.cnil.fr/fr/rss.xml' },
} as const;

export type ThemeKey = 'pd' | 'ai' | 'device' | 'sec';

export const THEMES: Record<ThemeKey, string> = {
  pd: 'Données de santé (RGPD, CNIL)',
  ai: 'IA en soins et règlement européen sur l’IA',
  device: 'Dispositifs médicaux (RDM)',
  sec: 'Incidents et vigilance',
};

export type Milestone = {
  /** Date telle qu'affichée à l'écran */
  when: string;
  /** Pour le tri (AAAA-MM) */
  sort: string;
  status: 'done' | 'ahead';
  theme: ThemeKey;
  title: string;
  body: string;
  src: keyof typeof SRC;
  report?: boolean;
};

export const MILESTONES: Milestone[] = [
  {
    when: '25 mai 2018',
    sort: '2018-05',
    status: 'done',
    theme: 'pd',
    title: 'Le RGPD s’applique dans tous les États membres, France comprise',
    body:
      'L’article 99 précise que le règlement s’applique à partir du 25 mai 2018. L’article 9 range les données concernant la santé parmi les catégories particulières de données à caractère personnel et fixe les cas où elles peuvent être traitées, notamment pour la prestation de soins ou la gestion des systèmes de soins sur la base du droit de l’Union ou du droit d’un État membre. L’article 35 impose une analyse d’impact relative à la protection des données avant tout traitement susceptible d’engendrer un risque élevé, y compris le traitement à grande échelle de catégories particulières de données.',
    src: 'rgpd',
  },
  {
    when: '12 juillet 2024',
    sort: '2024-07',
    status: 'done',
    theme: 'ai',
    title: 'Le règlement européen sur l’IA est publié au Journal officiel de l’Union européenne',
    body:
      'Le règlement (UE) 2024/1689 a été publié le 12 juillet 2024 et entre en vigueur le vingtième jour suivant sa publication. Son article 113 prévoit une application échelonnée : les chapitres I et II (dont la maîtrise de l’IA et les pratiques interdites) à partir du 2 février 2025, l’essentiel du règlement à partir du 2 août 2026, et l’article 6, paragraphe 1, avec les obligations correspondantes à partir du 2 août 2027. Il s’agit du texte tel que publié ; les modifications européennes ultérieures n’ont pas été lues.',
    src: 'aiAct',
  },
  {
    when: '2 février 2025',
    sort: '2025-02',
    status: 'done',
    theme: 'ai',
    title: 'L’obligation de maîtrise de l’IA et les pratiques interdites commencent à s’appliquer',
    body:
      'En vertu de l’article 113, point a), les chapitres I et II s’appliquent à partir du 2 février 2025. L’article 4, au chapitre I, demande aux fournisseurs et aux déployeurs de systèmes d’IA de prendre des mesures pour garantir, dans toute la mesure du possible, un niveau suffisant de maîtrise de l’IA pour leur personnel et les autres personnes s’occupant du fonctionnement et de l’utilisation des systèmes d’IA pour leur compte.',
    src: 'aiAct',
  },
  {
    when: '22 juillet 2025',
    sort: '2025-07',
    status: 'done',
    theme: 'pd',
    title: 'La CNIL finalise ses recommandations sur le développement des systèmes d’IA',
    body:
      'La CNIL publie ses dernières fiches IA : conditions d’applicabilité du RGPD aux modèles, annotation des données d’entraînement et sécurité du développement. Elle rappelle l’avis du Comité européen de la protection des données de décembre 2024 selon lequel le RGPD s’applique dans de nombreux cas aux modèles d’IA entraînés sur des données personnelles, en raison de leurs capacités de mémorisation.',
    src: 'cnilFinal',
    report: true,
  },
  {
    when: '16 février 2026',
    sort: '2026-02',
    status: 'done',
    theme: 'ai',
    title: 'La HAS et la CNIL élaborent un projet de guide sur l’IA en contexte de soins (document de travail)',
    body:
      'Le document de travail du 16 février 2026 est intitulé « Accompagner le bon usage des systèmes d’intelligence artificielle en contexte de soins ». Il compte douze fiches (de l’acquisition à la désinstallation d’un système, plus la gouvernance et l’IA générative) et classe les recommandations en trois niveaux. Il rappelle, d’après une enquête de la Fédération hospitalière de France de juillet 2025, que 65 % des établissements publics de santé répondants utilisaient déjà des technologies d’IA en production. C’est un projet : aucune version finale n’a été trouvée.',
    src: 'guideHasCnil',
    report: true,
  },
  {
    when: '5 mars 2026',
    sort: '2026-03',
    status: 'done',
    theme: 'pd',
    title: 'La CNIL publie sa fiche « IA et santé » et ouvre la consultation sur le projet de guide HAS-CNIL',
    body:
      'La fiche de la CNIL distingue quatre étapes du cycle de vie d’un système d’IA en santé et trois cas d’usage (entrepôt de données de santé, traitement constitué pour développer un système d’IA, évaluation de l’impact d’un déploiement). Le même jour, la CNIL annonce la consultation publique sur le projet de guide, ouverte jusqu’au 16 avril 2026 ; la page est aujourd’hui marquée « clôturée ».',
    src: 'cnilSante',
    report: true,
  },
  {
    when: '16 avril 2026',
    sort: '2026-04',
    status: 'done',
    theme: 'ai',
    title: 'La consultation publique sur le projet de guide HAS-CNIL se termine',
    body:
      'La CNIL indique que la consultation est ouverte jusqu’au 16 avril 2026 et que les contributions ont un but consultatif : elles n’ont pas vocation à être intégrées de manière exhaustive dans la version finale. Nous n’avons pas trouvé de version finale du guide à la date de vérification.',
    src: 'cnilConsult',
  },
  {
    when: '2 août 2026',
    sort: '2026-08',
    status: 'done',
    theme: 'ai',
    title: 'L’essentiel du règlement sur l’IA s’applique, dont les obligations des déployeurs de systèmes à haut risque',
    body:
      'L’article 113 prévoit l’application du règlement à partir du 2 août 2026, sous les réserves indiquées plus haut. L’article 26 fixe les obligations des déployeurs de systèmes d’IA à haut risque : utilisation conforme à la notice, contrôle humain confié à des personnes compétentes et formées, surveillance, information du fournisseur et suspension de l’utilisation en cas de risque, conservation des journaux sous leur contrôle pendant au moins six mois, information des travailleurs avant utilisation au travail. Le statut de haut risque de l’IA dans les dispositifs médicaux (article 6, paragraphe 1) suit à partir du 2 août 2027. Vérifiez si des modifications européennes ont changé ces dates.',
    src: 'aiAct',
    report: true,
  },
  {
    when: '2 août 2027',
    sort: '2027-08',
    status: 'ahead',
    theme: 'device',
    title: 'L’article 6, paragraphe 1, du règlement sur l’IA s’applique : IA dans les produits relevant du RDM ou du RDIV soumis à une évaluation de conformité par un tiers',
    body:
      'L’article 113, point c), prévoit que l’article 6, paragraphe 1, et les obligations correspondantes s’appliquent à partir du 2 août 2027. Selon l’article 6, paragraphe 1, un système d’IA est à haut risque lorsqu’il est un produit, ou un composant de sécurité d’un produit, couvert par la législation d’harmonisation de l’Union de l’annexe I (qui cite le RDM et le RDIV) et que ce produit doit faire l’objet d’une évaluation de la conformité par un tiers. Interrogez dès maintenant les fournisseurs de dispositifs d’IA sur leur plan. C’est la date telle que publiée ; les changements européens ultérieurs n’ont pas été lus.',
    src: 'aiAct',
  },
];
