// Faits clés à citer — données de /fr/facts/ et /fr/llms-full.txt (2026-11-15)
//
// Chaque élément = une question, une réponse courte, la section sur laquelle elle repose et une source primaire. Tout a été écrit après ouverture
// effective des textes : fiche CNIL « IA et santé » (5 mars 2026), page de consultation HAS-CNIL, projet de guide HAS-CNIL (document de travail
// du 16 février 2026), recommandations de la CNIL sur l'IA, et textes officiels en français du règlement sur l'IA, du RGPD et du RDM (JO de l'UE).
// N'ajoutez pas d'éléments tirés de la presse ou d'hypothèses ; n'écrivez ni chiffres ni échéances absents du texte.
// Non couverts car le texte primaire n'a pas été lu : le code de la santé publique et la loi « Informatique et libertés » (Légifrance a répondu
// HTTP 403), le site de la HAS (403), les pages de l'ANSM sur la déclaration, l'hébergement de données de santé (HDS), le référentiel du 6e cycle de
// certification, une éventuelle version finale du guide HAS-CNIL, et toute modification européenne postérieure aux textes d'origine.
// Quand un fait cite le code de la santé publique, c'est « tel que le projet de guide le rappelle » : le code lui-même n'a pas été lu.
import { SRC } from './milestones';

export const FACTS_CHECKED = '15 novembre 2026';

export const FACT_TOPICS = [
  'IA en soins : projet de guide HAS-CNIL',
  'CNIL, IA et données de santé',
  'Règlement européen sur l’IA (RIA)',
  'Dispositifs médicaux et incidents (RDM)',
  'Données de santé (RGPD)',
] as const;

export type FactTopic = (typeof FACT_TOPICS)[number];

export type Fact = {
  id: string;
  topic: FactTopic;
  q: string;
  a: string;
  /** Base courte, par ex. « règlement (UE) 2024/1689, article 26 » */
  basis: string;
  src: keyof typeof SRC;
};

export const FACTS: Fact[] = [
  // ── IA en soins : projet de guide HAS-CNIL ───────────────
  {
    id: 'guide-statut',
    topic: 'IA en soins : projet de guide HAS-CNIL',
    q: 'Existe-t-il un guide national sur l’usage de l’IA dans les soins, et où en est-il ?',
    a: 'La HAS et la CNIL ont élaboré un projet de guide intitulé « Accompagner le bon usage des systèmes d’intelligence artificielle en contexte de soins » (document de travail du 16 février 2026). La CNIL a ouvert une consultation publique le 5 mars 2026, jusqu’au 16 avril 2026, en précisant que le guide proposé est une version provisoire ne revêtant aucun caractère définitif. La page de consultation est aujourd’hui marquée « clôturée » et nous n’avons pas trouvé de version finale : vérifiez auprès de la HAS et de la CNIL.',
    basis: 'CNIL, page de consultation (5 mars 2026) ; projet de guide, page de garde',
    src: 'cnilConsult',
  },
  {
    id: 'guide-perimetre',
    topic: 'IA en soins : projet de guide HAS-CNIL',
    q: 'À qui s’adresse le projet de guide et que couvre-t-il ?',
    a: 'Il s’adresse à l’ensemble des acteurs du secteur sanitaire (établissements de santé, professionnels libéraux) qui veulent utiliser un système d’IA. Il couvre les systèmes d’IA ayant un impact direct sur la prise en charge d’un patient, quelle que soit leur qualification au titre du règlement sur l’IA ou des règlements sur les dispositifs médicaux. Il exclut la phase de développement (traitée par des contenus de la CNIL) et les systèmes sans impact direct sur la prise en charge, comme la gestion des ressources humaines ou de la facturation. Il compte douze fiches : dix sur les étapes de l’acquisition à la désinstallation, deux sur la gouvernance et l’IA générative.',
    basis: 'CNIL, page de consultation (5 mars 2026) ; projet de guide, sommaire',
    src: 'cnilConsult',
  },
  {
    id: 'guide-gouvernance',
    topic: 'IA en soins : projet de guide HAS-CNIL',
    q: 'Que demande le projet de guide à un établissement en matière de gouvernance ?',
    a: 'Il dit que chaque déployeur doit assumer la responsabilité de la conformité et de la sécurité de l’utilisation des systèmes d’IA, en mobilisant direction, professionnels de santé, ingénieurs biomédicaux, informaticiens, juristes, délégué à la protection des données, responsable de la sécurité des systèmes d’information et représentants des usagers. Il résume les obligations du déployeur : une gouvernance adaptée, un registre des traitements (article 30 du RGPD), une analyse d’impact relative à la protection des données (article 35), une analyse d’impact sur les droits fondamentaux le cas échéant (article 27 du règlement sur l’IA), et l’information des autorités en cas d’incident. Il ajoute que le marquage CE ne dispense pas d’une surveillance locale en conditions réelles. C’est un document de travail.',
    basis: 'Projet de guide HAS-CNIL (document de travail, 16 février 2026), fiche 1',
    src: 'guideHasCnil',
  },
  {
    id: 'guide-information',
    topic: 'IA en soins : projet de guide HAS-CNIL',
    q: 'Faut-il le consentement du patient pour utiliser une IA dans ses soins ?',
    a: 'Le projet de guide distingue le consentement aux soins du code de la santé publique (article L. 1111-4, tel que rappelé) et le consentement au sens du RGPD. Il rapporte l’avis de la CNIL selon lequel le consentement ne constitue ni la base légale ni l’exception pour traiter des données de santé liées à l’usage de systèmes d’IA en contexte de soins ; ces traitements peuvent reposer sur l’intérêt légitime ou une mission d’intérêt public (article 6, paragraphe 1, points f et e) et sur l’exception « médecine » (article 9, paragraphe 2, point h), pour un établissement ou un professionnel tenu au secret. Il rappelle aussi l’obligation d’information sur l’usage d’un système d’IA qualifié de dispositif médical (article L. 4001-3 du code de la santé publique, tel que rappelé) et l’information prévue aux articles 13 et 14 du RGPD. C’est un projet ; le code lui-même n’a pas été lu.',
    basis: 'Projet de guide HAS-CNIL (document de travail), fiche 7',
    src: 'guideHasCnil',
  },
  {
    id: 'guide-decision',
    topic: 'IA en soins : projet de guide HAS-CNIL',
    q: 'Quelle différence entre décision automatisée et contrôle humain ?',
    a: 'Selon le projet de guide, la décision automatisée est une décision prise sans intervention humaine significative et produisant des effets juridiques ou des effets comparables sur une personne (par exemple la priorisation d’une prise en charge) ; elle est interdite par défaut. Le contrôle humain est une mesure de supervision active prévue par l’article 14 du règlement sur l’IA pour tout système à haut risque : un professionnel en mesure de comprendre, vérifier, corriger ou contredire le résultat. Le guide les distingue : la première protège les droits des personnes, le second la qualité et la sécurité de l’usage.',
    basis: 'Projet de guide HAS-CNIL (document de travail), fiche 8',
    src: 'guideHasCnil',
  },
  {
    id: 'guide-vigilance',
    topic: 'IA en soins : projet de guide HAS-CNIL',
    q: 'Un incident avec un logiciel d’IA doit-il être déclaré ?',
    a: 'Le projet de guide indique que les systèmes d’IA ayant le statut de dispositif médical font l’objet de déclarations de matériovigilance et de réactovigilance comme les autres dispositifs. Il cite l’article L. 5212-2 du code de la santé publique : tout professionnel de santé ou utilisateur professionnel ayant connaissance d’un incident grave le déclare à l’agence dans les meilleurs délais ; pour les autres incidents, pas d’obligation de signalement, mais les utilisateurs sont incités à les transmettre au fabricant. Il ajoute que le circuit de vigilance pour les systèmes d’IA utilisés en soins sans statut de dispositif médical ou non classés à haut risque « reste à clarifier ». Le code lui-même n’a pas été lu.',
    basis: 'Projet de guide HAS-CNIL (document de travail), fiche 10',
    src: 'guideHasCnil',
  },
  // ── CNIL, IA et données de santé ─────────────────────────
  {
    id: 'cnil-sante-fiche',
    topic: 'CNIL, IA et données de santé',
    q: 'Que dit la CNIL sur le développement ou l’évaluation d’une IA à partir de données de santé ?',
    a: 'La fiche du 5 mars 2026, issue de l’accompagnement de projets d’IA en santé, distingue quatre étapes du cycle de vie (constitution d’un entrepôt de données de santé, constitution d’une base pour développer un système d’IA, déploiement, évaluation de l’impact) et trois cas d’usage. Elle précise que le développement d’un système d’IA destiné à la santé est assimilé à une recherche, étude ou évaluation dans le domaine de la santé, qui nécessite dans la majorité des cas des formalités préalables auprès de la CNIL. Un entrepôt de données de santé suppose soit le consentement explicite de chaque personne, soit une formalité préalable (déclaration de conformité au référentiel ou demande d’autorisation). Elle s’adresse notamment aux délégués à la protection des données et aux chefs de projet.',
    basis: 'CNIL, fiche « IA et santé » (5 mars 2026)',
    src: 'cnilSante',
  },
  {
    id: 'cnil-finalite',
    topic: 'CNIL, IA et données de santé',
    q: 'Quelles questions la CNIL invite-t-elle à se poser avant de traiter des données de santé pour une IA ?',
    a: 'La fiche propose un tableau d’actions : identifier le régime juridique applicable ; définir une finalité précise, avec des critères objectifs permettant de considérer l’objectif comme atteint ; identifier les rôles et responsabilités (responsable de traitement, sous-traitants, contrat) ; garantir la licéité (base légale de l’article 6 et condition de l’article 9 du RGPD pour les données de santé) ; minimiser les données ; déterminer des durées de conservation et prévoir le devenir des données à la fin du traitement. Elle renvoie aux fiches pratiques IA de la CNIL.',
    basis: 'CNIL, fiche « IA et santé » (5 mars 2026)',
    src: 'cnilSante',
  },
  {
    id: 'cnil-modeles',
    topic: 'CNIL, IA et données de santé',
    q: 'Un modèle d’IA entraîné sur des données personnelles est-il soumis au RGPD ?',
    a: 'La CNIL rappelle l’avis adopté en décembre 2024 par le Comité européen de la protection des données selon lequel le RGPD s’applique, dans de nombreux cas, aux modèles d’IA entraînés sur des données personnelles en raison de leurs capacités de mémorisation. Ses recommandations de juillet 2025 aident à conduire et documenter l’analyse qui permet de savoir si l’utilisation d’un modèle est soumise ou non au RGPD, et traitent de l’annotation des données et de la sécurité du développement.',
    basis: 'CNIL, page du 22 juillet 2025',
    src: 'cnilFinal',
  },
  // ── Règlement européen sur l'IA ──────────────────────────
  {
    id: 'ria-dates',
    topic: 'Règlement européen sur l’IA (RIA)',
    q: 'Quand les règles du règlement sur l’IA s’appliquent-elles ?',
    a: 'Selon le texte publié au Journal officiel le 12 juillet 2024, l’article 113 prévoit que le règlement s’applique à partir du 2 août 2026 ; les chapitres I et II (dispositions générales, dont la maîtrise de l’IA, et pratiques interdites) à partir du 2 février 2025 ; certaines autres parties à partir du 2 août 2025 ; et l’article 6, paragraphe 1, avec les obligations correspondantes à partir du 2 août 2027. Les modifications européennes ultérieures n’ont pas été lues : vérifiez le texte en vigueur.',
    basis: 'Règlement (UE) 2024/1689, article 113',
    src: 'aiAct',
  },
  {
    id: 'ria-maitrise',
    topic: 'Règlement européen sur l’IA (RIA)',
    q: 'Le règlement sur l’IA oblige-t-il à former le personnel ?',
    a: 'L’article 4 (« Maîtrise de l’IA ») demande aux fournisseurs et aux déployeurs de prendre des mesures pour garantir, dans toute la mesure du possible, un niveau suffisant de maîtrise de l’IA pour leur personnel et les autres personnes s’occupant du fonctionnement et de l’utilisation des systèmes d’IA pour leur compte, en tenant compte de leurs connaissances, de leur expérience, de leur formation et du contexte d’utilisation. Un hôpital qui utilise un système d’IA sous son autorité est un déployeur. L’article s’applique depuis le 2 février 2025.',
    basis: 'Règlement (UE) 2024/1689, articles 4 et 113, point a)',
    src: 'aiAct',
  },
  {
    id: 'ria-haut-risque-dm',
    topic: 'Règlement européen sur l’IA (RIA)',
    q: 'Quand une IA intégrée à un dispositif médical est-elle « à haut risque » ?',
    a: 'Selon l’article 6, paragraphe 1, un système d’IA est à haut risque lorsque deux conditions sont réunies : il est un composant de sécurité d’un produit, ou lui-même un produit, couvert par la législation d’harmonisation de l’Union de l’annexe I (la section A cite le règlement relatif aux dispositifs médicaux et celui relatif aux dispositifs de diagnostic in vitro), et ce produit doit faire l’objet d’une évaluation de la conformité par un tiers. L’article 113 prévoit l’application de l’article 6, paragraphe 1, à partir du 2 août 2027.',
    basis: 'Règlement (UE) 2024/1689, article 6, paragraphe 1, annexe I section A points 11 et 12, article 113, point c)',
    src: 'aiAct',
  },
  {
    id: 'ria-annexe-iii',
    topic: 'Règlement européen sur l’IA (RIA)',
    q: 'Quels usages liés aux hôpitaux l’annexe III classe-t-elle à haut risque ?',
    a: 'L’annexe III, point 5, cite notamment les systèmes d’IA utilisés par les autorités publiques ou pour leur compte afin d’évaluer l’éligibilité de personnes aux prestations et services publics essentiels, y compris les services de soins de santé, ainsi que les systèmes destinés à évaluer et classer les appels d’urgence ou à établir des priorités dans l’envoi des services d’urgence, y compris les systèmes de tri des patients en urgence. L’article 6, paragraphe 3, permet à un fournisseur de démontrer, dans certains cas, qu’un système de l’annexe III n’est pas à haut risque, mais jamais lorsqu’il réalise du profilage de personnes physiques.',
    basis: 'Règlement (UE) 2024/1689, annexe III point 5 a) et d), article 6, paragraphe 3',
    src: 'aiAct',
  },
  {
    id: 'ria-deployeur',
    topic: 'Règlement européen sur l’IA (RIA)',
    q: 'Que doit faire un hôpital qui déploie un système d’IA à haut risque ?',
    a: 'L’article 26 demande aux déployeurs d’utiliser le système conformément à sa notice d’utilisation ; de confier le contrôle humain à des personnes disposant de la compétence, de la formation, de l’autorité et du soutien nécessaires ; de veiller à ce que les données d’entrée sous leur contrôle soient pertinentes et suffisamment représentatives ; de surveiller le système et, s’ils ont des raisons de penser qu’il présente un risque, d’en informer sans retard indu le fournisseur ou le distributeur et l’autorité de surveillance du marché et de suspendre l’utilisation ; de signaler un incident grave d’abord au fournisseur, puis à l’importateur ou au distributeur et aux autorités ; de conserver les journaux sous leur contrôle pendant au moins six mois sauf autre disposition du droit ; et d’informer les travailleurs et leurs représentants avant d’utiliser un tel système au travail. Ils utilisent les informations du fournisseur pour réaliser, le cas échéant, leur analyse d’impact relative à la protection des données.',
    basis: 'Règlement (UE) 2024/1689, article 26, paragraphes 1 à 7 et 9',
    src: 'aiAct',
  },
  {
    id: 'ria-aidf',
    topic: 'Règlement européen sur l’IA (RIA)',
    q: 'Une analyse d’impact sur les droits fondamentaux est-elle obligatoire ?',
    a: 'L’article 27 l’exige avant le déploiement de certains systèmes à haut risque (ceux de l’article 6, paragraphe 2, à l’exception de l’annexe III point 2) pour les déployeurs qui sont des organismes de droit public ou des entités privées fournissant des services publics, et pour les déployeurs des systèmes de l’annexe III points 5 b) et c). L’analyse décrit notamment les processus du déployeur, la durée et la fréquence d’utilisation et les catégories de personnes susceptibles d’être touchées. Savoir si un établissement donné est concerné dépend de son statut : demandez conseil à un juriste.',
    basis: 'Règlement (UE) 2024/1689, article 27, paragraphe 1',
    src: 'aiAct',
  },
  {
    id: 'ria-transparence',
    topic: 'Règlement européen sur l’IA (RIA)',
    q: 'Faut-il informer le patient qu’il discute avec un agent conversationnel ?',
    a: 'L’article 50, paragraphe 1, met l’obligation sur les fournisseurs : les systèmes d’IA destinés à interagir directement avec des personnes physiques doivent être conçus de manière que les personnes concernées soient informées qu’elles interagissent avec un système d’IA, sauf si cela ressort clairement du point de vue d’une personne raisonnablement bien informée, attentive et avisée au regard des circonstances. L’article 50, paragraphe 2, demande aux fournisseurs de systèmes générant du contenu synthétique (audio, image, vidéo, texte) de marquer les sorties dans un format lisible par machine. Demandez à votre fournisseur comment son produit y répond.',
    basis: 'Règlement (UE) 2024/1689, article 50, paragraphes 1 et 2',
    src: 'aiAct',
  },
  // ── Dispositifs médicaux et incidents ────────────────────
  {
    id: 'rdm-logiciel',
    topic: 'Dispositifs médicaux et incidents (RDM)',
    q: 'Un logiciel peut-il être un dispositif médical, et comment est-il classé ?',
    a: 'Oui. La définition du dispositif médical cite le logiciel parmi les objets destinés par le fabricant à des fins médicales spécifiques comme le diagnostic, la prévention, le contrôle, la prédiction, le pronostic, le traitement ou l’atténuation d’une maladie. L’annexe VIII, règle 11, classe les logiciels destinés à fournir des informations utilisées pour prendre des décisions à des fins diagnostiques ou thérapeutiques en classe IIa, en classe IIb si la décision peut causer une grave détérioration de l’état de santé ou une intervention chirurgicale, et en classe III si elle peut causer la mort ou une détérioration irréversible ; les logiciels destinés à contrôler des processus physiologiques sont en classe IIa (IIb pour des paramètres vitaux dont les variations peuvent présenter un danger immédiat) ; tous les autres logiciels sont en classe I. Ce sont les termes du texte publié en 2017.',
    basis: 'Règlement (UE) 2017/745, article 2, point 1, annexe VIII règle 11',
    src: 'rdm',
  },
  {
    id: 'rdm-fabricants',
    topic: 'Dispositifs médicaux et incidents (RDM)',
    q: 'Quels délais le RDM impose-t-il aux fabricants pour signaler un incident ?',
    a: 'Selon l’article 87, les fabricants notifient un incident grave immédiatement après avoir établi un lien de causalité avéré ou raisonnablement envisageable, et au plus tard quinze jours après en avoir eu connaissance ; pour une menace grave pour la santé publique, immédiatement et au plus tard deux jours ; en cas de décès ou de détérioration grave imprévue de l’état de santé, au plus tard dix jours. L’article 87, paragraphe 10, demande aux États membres d’encourager et de permettre aux professionnels de santé, aux utilisateurs et aux patients de signaler les incidents graves suspectés aux autorités compétentes. Ce sont les délais des fabricants, pas ceux de l’hôpital.',
    basis: 'Règlement (UE) 2017/745, article 87, paragraphes 3, 4, 5 et 10',
    src: 'rdm',
  },
  {
    id: 'rdm-interne',
    topic: 'Dispositifs médicaux et incidents (RDM)',
    q: 'Un hôpital peut-il fabriquer et utiliser son propre dispositif, logiciel compris ?',
    a: 'L’article 5, paragraphe 5, exempte de la plupart des exigences du RDM (pas des exigences générales en matière de sécurité et de performances de l’annexe I) les dispositifs fabriqués et utilisés uniquement au sein d’établissements de santé établis dans l’Union, sous conditions : justifier que les besoins du groupe de patients cible ne peuvent être satisfaits par un dispositif équivalent sur le marché, rendre publique une déclaration, tenir une documentation suffisante pour que l’autorité compétente vérifie le respect de l’annexe I, et tirer les enseignements de l’expérience clinique avec des mesures correctives. Le projet de guide HAS-CNIL rappelle qu’un établissement qui développe son propre logiciel peut assumer des obligations de fournisseur ou de fabricant.',
    basis: 'Règlement (UE) 2017/745, article 5, paragraphe 5',
    src: 'rdm',
  },
  // ── Données de santé (RGPD) ──────────────────────────────
  {
    id: 'rgpd-sante',
    topic: 'Données de santé (RGPD)',
    q: 'Les données de santé sont-elles traitées différemment par le RGPD ?',
    a: 'Oui. L’article 9, paragraphe 1, range les données concernant la santé parmi les catégories particulières de données dont le traitement est interdit sauf si l’une des conditions du paragraphe 2 s’applique. Le point h) vise le traitement nécessaire aux fins de diagnostics médicaux, de la prise en charge sanitaire ou sociale, ou de la gestion des systèmes et des services de soins, sur la base du droit de l’Union ou du droit d’un État membre ou en vertu d’un contrat avec un professionnel de la santé. Le paragraphe 3 exige que ces données soient traitées par un professionnel soumis au secret professionnel ou sous sa responsabilité, et le paragraphe 4 permet aux États membres d’ajouter des conditions pour les données concernant la santé.',
    basis: 'Règlement (UE) 2016/679, article 9, paragraphes 1, 2 h), 3 et 4',
    src: 'rgpd',
  },
  {
    id: 'rgpd-aipd',
    topic: 'Données de santé (RGPD)',
    q: 'Faut-il une analyse d’impact (AIPD) pour un nouvel outil d’IA ?',
    a: 'L’article 35, paragraphe 1, exige une analyse avant tout traitement susceptible d’engendrer un risque élevé pour les droits et libertés, en particulier en cas de recours à de nouvelles technologies. L’article 35, paragraphe 3, point b), cite le traitement à grande échelle de catégories particulières de données, dont les données de santé, et l’article 35, paragraphe 2, demande au responsable de traitement de solliciter l’avis du délégué à la protection des données. Le projet de guide HAS-CNIL rappelle l’AIPD parmi les obligations du déployeur.',
    basis: 'Règlement (UE) 2016/679, article 35, paragraphes 1 à 3',
    src: 'rgpd',
  },
  {
    id: 'rgpd-violation',
    topic: 'Données de santé (RGPD)',
    q: 'Quels sont les délais en cas de violation de données personnelles ?',
    a: 'Selon l’article 33, paragraphe 1, le responsable de traitement notifie la violation à l’autorité de contrôle dans les meilleurs délais et, si possible, 72 heures au plus tard après en avoir pris connaissance, à moins que la violation ne soit pas susceptible d’engendrer un risque pour les droits et libertés. Le sous-traitant notifie au responsable de traitement dans les meilleurs délais (article 33, paragraphe 2). Lorsque la violation est susceptible d’engendrer un risque élevé, le responsable de traitement la communique à la personne concernée dans les meilleurs délais (article 34, paragraphe 1) ; l’article 34, paragraphe 3, prévoit des exceptions, comme le chiffrement qui rend les données incompréhensibles.',
    basis: 'Règlement (UE) 2016/679, articles 33 et 34',
    src: 'rgpd',
  },
  {
    id: 'rgpd-decision',
    topic: 'Données de santé (RGPD)',
    q: 'Un outil d’IA peut-il décider seul à propos d’un patient ?',
    a: 'L’article 22, paragraphe 1, donne à toute personne le droit de ne pas faire l’objet d’une décision fondée exclusivement sur un traitement automatisé, y compris le profilage, produisant des effets juridiques la concernant ou l’affectant de manière significative de façon similaire. Des exceptions existent (nécessité contractuelle, autorisation par le droit avec garanties, consentement explicite) et, dans certains cas, le responsable de traitement doit prévoir au moins le droit d’obtenir une intervention humaine, d’exprimer son point de vue et de contester la décision. L’article 22 ne tranche pas de questions cliniques : demandez à votre délégué à la protection des données comment il s’applique à un outil précis.',
    basis: 'Règlement (UE) 2016/679, article 22, paragraphes 1 à 3',
    src: 'rgpd',
  },
];
