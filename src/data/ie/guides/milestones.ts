// Digital health and AI roadmap for Irish hospitals — data for /ie/dx-roadmap/ and /ie/calendar/ (2026-11-15)
//
// ⚠️ Every fact here comes from a primary document that was actually opened and read on 2026-11-15:
//    HIQA's press release of 29 July 2026 on its national AI guidance and the January 2026 consultation draft (PDF), the Department of
//    Health's AI for Care strategy 2026-2030 (PDF), the EU AI Act (Regulation (EU) 2024/1689), the GDPR (Regulation (EU) 2016/679) and the
//    Medical Device Regulation (Regulation (EU) 2017/745) as published in the Official Journal (via the EU Publications Office), the Data
//    Protection Commission's guidance "AI, Large Language Models and Data Protection" (18 July 2024), and HPRA's pages for hospitals.
//    The final HIQA guidance PDF could not be found (the HIQA page for it answered HTTP 503 and its file address is unknown), so facts about
//    the final text come only from HIQA's press release; the details in the draft are always labelled as a draft. Irish statutes, the
//    Regulation of Artificial Intelligence Bill 2026 and the HSE AI Implementation Framework were not read. EU texts are the versions as
//    published in the Official Journal; later amendments were not read.
//    Do not add dates or duties from news items or law-firm summaries; when you add one, read the primary text and update CHECKED.
export const CHECKED = 'November 15, 2026';

export const SRC = {
  hiqaRelease: { label: 'HIQA — press release: HIQA publishes first National Guidance on Responsible and Safe Use of AI in Health and Social Care Services (29 July 2026)', url: 'https://www.hiqa.ie/ga/node/74973' },
  hiqaDraft: { label: 'HIQA — Draft National Guidance for the Responsible and Safe use of AI in Health and Social Care Services, for public consultation (January 2026, PDF)', url: 'https://www.hiqa.ie/sites/default/files/2026-01/Draft-National-Guidance-for-the-Responsible-and-Safe-Use-of-Artificial-Intelligence-in-Health-and-Social-Care-Services-for-public-consultation.pdf' },
  aiForCare: { label: 'Department of Health (Ireland) — AI for Care: The Artificial Intelligence (AI) Strategy for Healthcare in Ireland 2026-2030 (PDF, as hosted by the HRB National Drugs Library)', url: 'https://www.drugsandalcohol.ie/46031/1/AI_for_Care_2026-2030.pdf' },
  aiAct: { label: 'European Union — Regulation (EU) 2024/1689 (Artificial Intelligence Act), Official Journal L, 12.7.2024', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' },
  gdpr: { label: 'European Union — Regulation (EU) 2016/679 (General Data Protection Regulation)', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj' },
  mdr: { label: 'European Union — Regulation (EU) 2017/745 (Medical Device Regulation), as published in the Official Journal on 5.5.2017', url: 'https://eur-lex.europa.eu/eli/reg/2017/745/oj' },
  dpcAi: { label: 'Data Protection Commission (Ireland) — AI, Large Language Models and Data Protection (18 July 2024)', url: 'https://www.dataprotection.ie/en/dpc-guidance/blogs/AI-LLMs-and-Data-Protection' },
  hpraOverview: { label: 'HPRA — Overview of medical device & IVD regulation for hospitals', url: 'https://www.hpra.ie/regulation/medical-devices/health-institutions-and-healthcare-professionals/overview-of-medical-device---ivd-regulation-for-hospitals' },
  hpraReporting: { label: 'HPRA — Reporting medical device & IVD safety issues (for hospitals and healthcare professionals)', url: 'https://www.hpra.ie/regulation/medical-devices/health-institutions-and-healthcare-professionals/reporting-medical-device---ivd-safety-issues' },
  hpraFsca: { label: 'HPRA — Managing field safety corrective actions (for hospitals)', url: 'https://www.hpra.ie/regulation/medical-devices/health-institutions-and-healthcare-professionals/managing-field-safety-corrective-actions' },
  hiqaFeed: { label: 'HIQA — news and publications feed (RSS)', url: 'https://www.hiqa.ie/rss.xml' },
} as const;

export type ThemeKey = 'pd' | 'ai' | 'device' | 'sec';

export const THEMES: Record<ThemeKey, string> = {
  pd: 'Patient data (GDPR)',
  ai: 'AI guidance and the EU AI Act',
  device: 'Medical devices (MDR, HPRA)',
  sec: 'Incidents and reporting',
};

export type Milestone = {
  /** Date as shown on screen */
  when: string;
  /** For sorting (YYYY-MM) */
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
    when: 'May 25, 2018',
    sort: '2018-05',
    status: 'done',
    theme: 'pd',
    title: 'The GDPR applies in every EU Member State, Ireland included',
    body:
      'Article 99 says the Regulation applies from 25 May 2018. Article 9 treats data concerning health as a special category of personal data and sets out when it may be processed, including for the provision of health care and the management of health care systems on the basis of Union or Member State law. Article 35 requires a data protection impact assessment before processing that is likely to result in a high risk, including large-scale processing of special categories of data.',
    src: 'gdpr',
  },
  {
    when: '2021',
    sort: '2021-05',
    status: 'done',
    theme: 'device',
    title: 'The EU Medical Device Regulation becomes fully applicable (HPRA is Ireland’s competent authority)',
    body:
      'HPRA says the MDR became fully applicable in 2021 and the IVDR in 2022, and that it is the national competent authority responsible for applying them in Ireland. The MDR’s definition of a medical device names software, and its classification rule 11 puts software that informs diagnostic or therapeutic decisions in class IIa or higher. HPRA says it monitors devices on the Irish market but does not authorise or approve them.',
    src: 'hpraOverview',
    report: true,
  },
  {
    when: 'July 12, 2024',
    sort: '2024-07',
    status: 'done',
    theme: 'ai',
    title: 'The EU AI Act is published in the Official Journal',
    body:
      'Regulation (EU) 2024/1689 was published on 12 July 2024 and enters into force on the twentieth day after publication. Its Article 113 sets staged application: Chapters I and II (including AI literacy and the prohibited practices) from 2 February 2025, most of the Regulation from 2 August 2026, and Article 6(1) with its corresponding obligations from 2 August 2027. This is the text as published; later EU amendments were not read.',
    src: 'aiAct',
  },
  {
    when: 'July 18, 2024',
    sort: '2024-07',
    status: 'done',
    theme: 'pd',
    title: 'The Data Protection Commission publishes its guidance on AI, large language models and data protection',
    body:
      'The guidance says that where personal data is involved, the GDPR applies to organisations using AI systems as well as to the product providers. It asks an organisation that uses an AI product to understand what personal data the product uses, where it goes, whether the provider retains or re-uses it, and how the product lets the organisation meet its GDPR duties, and says a data protection impact assessment may be needed.',
    src: 'dpcAi',
    report: true,
  },
  {
    when: 'February 2, 2025',
    sort: '2025-02',
    status: 'done',
    theme: 'ai',
    title: 'AI literacy duty and the prohibited AI practices start to apply',
    body:
      'Under Article 113(a) of the AI Act, Chapters I and II apply from 2 February 2025. Article 4 in Chapter I asks providers and deployers of AI systems to take measures to ensure a sufficient level of AI literacy of their staff and other persons dealing with the operation and use of AI systems on their behalf.',
    src: 'aiAct',
  },
  {
    when: 'January 2026',
    sort: '2026-01',
    status: 'done',
    theme: 'ai',
    title: 'HIQA publishes its draft national guidance on AI for consultation',
    body:
      'The draft (January 2026, 55 pages) is built on HIQA’s four principles of person-centred care and support: accountability, a human rights-based approach, safety and wellbeing, and responsiveness. It says services should keep a list of authorised AI tools, assign someone to keep an inventory, and carry out fundamental rights impact assessments for high-risk tools as the AI Act requires. It is a draft; the final guidance was published later and may differ.',
    src: 'hiqaDraft',
    report: true,
  },
  {
    when: '2026',
    sort: '2026-03',
    status: 'done',
    theme: 'ai',
    title: 'The Department of Health publishes AI for Care, the AI strategy for healthcare in Ireland 2026-2030',
    body:
      'The strategy sets four pillars (AI for clinical care, operations, research and innovation, and public health) and six guiding principles: person-centred, transparent and trustworthy, human in the loop, lived experience, governance and safety, and proven benefit. It says the HSE has developed a corresponding AI Implementation Framework and that HIQA’s guidance will support compliance with the AI Act. The document itself carries no publication date.',
    src: 'aiForCare',
    report: true,
  },
  {
    when: 'July 15, 2026',
    sort: '2026-07',
    status: 'done',
    theme: 'ai',
    title: 'The Regulation of Artificial Intelligence Bill 2026 passes the Seanad',
    body:
      'HIQA’s press release says the Bill passed through the Seanad on 15 July and that its purpose is to support the establishment of the AI Office of Ireland, outline Ireland’s AI regulatory structures, designate the competent authorities and implement the EU AI Act consistently without adding national requirements. We did not read the Bill and have not confirmed whether it has been enacted.',
    src: 'hiqaRelease',
    report: true,
  },
  {
    when: 'July 29, 2026',
    sort: '2026-07',
    status: 'done',
    theme: 'ai',
    title: 'HIQA publishes Ireland’s first National Guidance for the Responsible and Safe Use of AI in Health and Social Care Services',
    body:
      'HIQA’s press release says the guidance was commissioned by the Department of Health, developed with the Department and the HSE, and is meant for all services providing health and social care in Ireland. It is structured around HIQA’s four principles and covers topics such as governance, transparency and public engagement. The final PDF could not be opened for this site, so details are taken from the press release and from the January 2026 draft.',
    src: 'hiqaRelease',
    report: true,
  },
  {
    when: 'August 2, 2026',
    sort: '2026-08',
    status: 'done',
    theme: 'ai',
    title: 'Most of the EU AI Act applies, including the duties of deployers of high-risk AI systems',
    body:
      'Article 113 says the Regulation applies from 2 August 2026, with the exceptions above. Article 26 sets the duties of deployers of high-risk AI systems: use according to the instructions, human oversight by competent and trained people, monitoring, informing the provider and suspending use where a risk appears, keeping logs under their control for at least six months, and informing workers before use at work. Article 6(1) high-risk status for AI in medical devices follows from 2 August 2027. Check whether EU amendments have changed these dates.',
    src: 'aiAct',
    report: true,
  },
  {
    when: 'August 2, 2027',
    sort: '2027-08',
    status: 'ahead',
    theme: 'device',
    title: 'Article 6(1) of the AI Act applies: AI in products covered by the MDR or IVDR that need third-party conformity assessment',
    body:
      'Article 113(c) says Article 6(1) and the corresponding obligations apply from 2 August 2027. Under Article 6(1), an AI system is high-risk when it is a product, or a safety component of a product, covered by the Union harmonisation legislation in Annex I (which lists the MDR and the IVDR) and that product must undergo third-party conformity assessment. Ask AI device vendors now how they plan to meet it. This is the date as published; later EU changes were not read.',
    src: 'aiAct',
  },
];
