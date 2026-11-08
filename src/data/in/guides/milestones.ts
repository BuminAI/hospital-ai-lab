// Digital health and AI roadmap for Indian hospitals — data for /in/dx-roadmap/ and /in/calendar/ (2026-11-07)
//
// ⚠️ Every fact here comes from a primary document that was actually opened and read on 2026-11-07:
//    the Medical Devices Rules, 2017 and CDSCO's Guidance Document on Medical Device Software (both on cdsco.gov.in),
//    the Gazette of India copy of the Digital Personal Data Protection Act, 2023, and ICMR's 2023 AI ethics guidelines.
//    Several Indian government sites (MeitY, PIB, India Code, ABDM, MoHFW) refused automated requests, so anything that
//    only appears there (for example the DPDP Rules and their commencement dates) is NOT stated here.
//    Do not add dates or duties from news items or law-firm summaries; when you add one, read the primary text and update CHECKED.
export const CHECKED = 'November 7, 2026';

export const SRC = {
  mdr: { label: 'CDSCO — Medical Devices Rules, 2017 (full text)', url: 'https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/m_device/Medical%20Devices%20Rules,%202017.pdf' },
  mdsw: { label: 'CDSCO — Guidance Document on Medical Device Software (Doc No. CDSCO/MD/GD/MDSW/01/2026)', url: 'https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Guidance-document-on-Medical-Device-Software-under-MDR-2017.pdf' },
  mdswDraft: { label: 'CDSCO — Draft guidance document on Medical Device Software (for stakeholder comments; file name dated 21 Oct 2025)', url: 'https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2018/UploadPublic_NoticesFiles/Draft%20guidance%20document%20on%20Medical%20Device%20Software%2021%2010%202025.pdf' },
  dpdp: { label: 'Gazette of India (Extraordinary), 11 Aug 2023 — The Digital Personal Data Protection Act, 2023 (No. 22 of 2023), copy hosted by PRS Legislative Research', url: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Digital_Personal_Data_Protection_Act,_2023.pdf' },
  dpdpTrack: { label: 'PRS Legislative Research — The Digital Personal Data Protection Bill, 2023 (passage dates)', url: 'https://prsindia.org/billtrack/digital-personal-data-protection-bill-2023' },
  icmr: { label: 'ICMR — Ethical Guidelines for Application of Artificial Intelligence in Biomedical Research and Healthcare (2023)', url: 'https://www.icmr.gov.in/icmrobject/uploads/Guidelines/1724842648_ethical_guidelines_application_artificial_intelligence_biomed_rsrch_2023.pdf' },
} as const;

export type ThemeKey = 'pd' | 'doc' | 'sec' | 'egisz' | 'device';

export const THEMES: Record<ThemeKey, string> = {
  pd: 'Personal data protection',
  doc: 'Ethics guidance for AI',
  sec: 'Security',
  egisz: 'Oversight',
  device: 'CDSCO and software as a medical device',
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
    when: 'January 1, 2018',
    sort: '2018-01',
    status: 'done',
    theme: 'device',
    title: 'The Medical Devices Rules, 2017 come into force and set four risk classes, A to D',
    body:
      'Rule 1(2) says the rules come into force from 1 January 2018 unless specified otherwise. Rule 4 classifies medical devices other than in vitro diagnostics as Class A (low risk), B (low moderate), C (moderate high) or D (high risk), using the parameters in Part I of the First Schedule. The First Schedule’s implementation rules add that software which drives a device or influences its use falls automatically in the same class as that device.',
    src: 'mdr',
    report: true,
  },
  {
    when: 'August 11, 2023',
    sort: '2023-08',
    status: 'done',
    theme: 'pd',
    title: 'The Digital Personal Data Protection Act, 2023 receives the President’s assent',
    body:
      'The Gazette of India (Extraordinary) of 11 August 2023 publishes the Act (No. 22 of 2023). PRS records the Bill as introduced in the Lok Sabha on 3 August 2023, passed there on 7 August and passed by the Rajya Sabha on 9 August. Section 1(2) says the Act comes into force on the date the Central Government appoints by notification, and different dates may be appointed for different provisions.',
    src: 'dpdp',
    report: true,
  },
  {
    when: '2023',
    sort: '2023-12',
    status: 'done',
    theme: 'doc',
    title: 'ICMR publishes ethical guidelines for AI in biomedical research and healthcare',
    body:
      'Prepared by the DHR-ICMR Artificial Intelligence Cell. Section 1 sets out ten ethical principles: autonomy, safety and risk minimization, trustworthiness, data privacy, accountability and liability, optimization of data quality, accessibility, equity and inclusiveness, collaboration, non-discrimination and fairness, and validity. Section 2 gives guiding principles for development, validation and deployment, and the document ends with an ethics checklist.',
    src: 'icmr',
  },
  {
    when: 'October 2025',
    sort: '2025-10',
    status: 'done',
    theme: 'device',
    title: 'CDSCO circulates a draft guidance on Medical Device Software for stakeholder comments',
    body:
      'The draft is headed “Draft for stakeholder comments” and carries 21 October 2025 in the file name CDSCO uses for it. A guidance document with the same title and a 2026 document number is the next entry; this site relies only on that numbered document for facts.',
    src: 'mdswDraft',
  },
  {
    when: 'July 21, 2026',
    sort: '2026-07',
    status: 'done',
    theme: 'device',
    title: 'CDSCO issues its Guidance Document on Medical Device Software (CDSCO/MD/GD/MDSW/01/2026)',
    body:
      'The 62-page document explains which software is regulated under the Medical Devices Rules, 2017. It treats AI/ML-based and cloud-based software that meets the definition of a medical device as Medical Device Software, lists examples that are not (including hospital and clinical information systems used only for admission, scheduling, billing and similar functions), covers intended-use statements, risk classification, licensing and post-marketing duties, and describes an optional Algorithm Change Protocol for AI updates. The document says it is for public awareness and is not meant for legal use. The date shown is the release date under which CDSCO’s public-notices page lists “Guidance document on Medical Device Software under MDR-2017”; the PDF itself carries only the document number.',
    src: 'mdsw',
    report: true,
  },
  {
    when: 'By notification',
    sort: '2099-01',
    status: 'ahead',
    theme: 'pd',
    title: 'Dates on which provisions of the DPDP Act start to apply are set by government notification',
    body:
      'Because section 1(2) lets the Central Government appoint different dates for different provisions, a hospital cannot read the start date of a duty from the Act alone. Many duties, such as the form and manner of a breach intimation, also depend on rules “as may be prescribed”. This site could not open the Ministry of Electronics and IT notifications from its systems, so check the current notifications and rules at the Ministry before relying on any start date.',
    src: 'dpdp',
  },
];
