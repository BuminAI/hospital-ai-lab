// Digital health and AI roadmap for UAE hospitals — data for /ae/dx-roadmap/ and /ae/calendar/ (2026-11-15)
//
// ⚠️ Every fact here comes from a primary document that was actually downloaded and read on 2026-11-15:
//    the Abu Dhabi Department of Health (DoH) Policy on Use of Artificial Intelligence (AI), the Dubai Health Authority (DHA) policy
//    "Artificial Intelligence in the Healthcare", the DoH Policy on the Abu Dhabi Health Information Exchange, and the DoH standards and
//    guideline on digital products governance, data access, data sharing and interoperability, data storage and retention,
//    analytics and reporting, medical device reporting and medical device cybersecurity. The two federal laws are described only
//    as the UAE Government portal (u.ae) describes them.
//    The federal legislation portal (uaelegislation.gov.ae) answered automated requests with HTTP 403 and the Ministry of Health and
//    Prevention site could not be reached, so no article of a federal law is quoted from the law itself; where a DoH or DHA document
//    says a federal law requires something, that is stated as "the document says".
//    Do not add dates or duties from news items or law-firm summaries; when you add one, read the primary text and update CHECKED.
export const CHECKED = 'November 15, 2026';

export const SRC = {
  dohAi: { label: 'Abu Dhabi DoH — Policy on Use of Artificial Intelligence (AI) in the Healthcare Sector of the Emirate of Abu Dhabi (Policy/AI/0.9, version 0.9, 30 April 2018)', url: 'https://www.doh.gov.ae/-/media/E9C1470A575146B18015DEBE57E47F8D.ashx' },
  dhaAi: { label: 'Dubai Health Authority — Artificial Intelligence in the Healthcare (policy DHA/HISHD/PP-09, issue date 1 July 2021)', url: 'https://www.dha.gov.ae/uploads/082022/Artificial%20Intelligence%20Policy20228457.pdf' },
  dpgs: { label: 'Abu Dhabi DoH — Digital Products Governance Standard (DoH/ST/DHS/DPGS/V1/26, published March 2026, effective August 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/24032026--Digital-Products-Governance-Standard.ashx' },
  dataAccess: { label: 'Abu Dhabi DoH — Data Access Standard (DoH/ST/DDGO/DAS/V1/2025, published January 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/11126_Data_Access_Standard.ashx' },
  dsii: { label: 'Abu Dhabi DoH — Data Sharing, Integration and Interoperability Standard (published December 2025, effective April 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/Data-Sharing-Integration-and-Interoperability-Standard.ashx' },
  retention: { label: 'Abu Dhabi DoH — Data Storage and Retention Standard (DoH/ST/DGGO/DSR/V1/2025, published December 2025)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2025/Data-Storage-and-Retention_Standard.ashx' },
  analytics: { label: 'Abu Dhabi DoH — Analytics and Reporting Standard (DoH/ST/DDGO/AR/V1/2026, published April 2026, effective May 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/070426Analytics-and-Reporting-Standard.ashx' },
  mdr: { label: 'Abu Dhabi DoH — Standard on Medical Device Reporting (MDR) (DoH/ST/HLS/SMDR/V2/26, published July 2026, effective October 2026)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/18826-Medical-Device-Reporting-Standard-MDR.ashx' },
  cyber: { label: 'Abu Dhabi DoH — Medical Device Cybersecurity in Healthcare Facilities Guideline (DOH/GL/0000002397/24, published November 2026, effective January 2027)', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/Medical-Device-Cybersecurity-in-healthcare-facilities-Guideline301026.ashx' },
  hie: { label: 'Abu Dhabi DoH — Policy on the Abu Dhabi Health Information Exchange (DOH/POL/STR/HIE/1.1/2020, effective 16 April 2020)', url: 'https://www.doh.gov.ae/-/media/A78104416DF2440E89AC90FB75F11055.ashx' },
  uaeIct: { label: 'UAE Government portal (u.ae) — ICT in the health sector: Federal Law No. 2 of 2019 (legislations and policies)', url: 'https://u.ae/en/about-the-uae/digital-uae/whole-of-government-approach/digital-health/ict-in-the-health-sector' },
  uaePdpl: { label: 'UAE Government portal (u.ae) — Data protection laws: Federal Decree-Law No. 45 of 2021 (Personal Data Protection Law)', url: 'https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws' },
  dohStandards: { label: 'Abu Dhabi DoH — Standards (list page and RSS feed of new documents)', url: 'https://www.doh.gov.ae/en/resources/standards' },
  dohPolicies: { label: 'Abu Dhabi DoH — Policies (list page)', url: 'https://www.doh.gov.ae/en/resources/policies' },
} as const;

export type ThemeKey = 'pd' | 'ai' | 'device' | 'sec';

export const THEMES: Record<ThemeKey, string> = {
  pd: 'Health data and information exchange',
  ai: 'AI policies (Abu Dhabi DoH, Dubai DHA)',
  device: 'Digital products and medical devices',
  sec: 'Security and incidents',
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
    when: 'April 30, 2018',
    sort: '2018-04',
    status: 'done',
    theme: 'ai',
    title: 'Abu Dhabi’s Department of Health publishes its Policy on Use of AI in the Healthcare Sector',
    body:
      'The policy is version 0.9 and is dated 30 April 2018; its effective date is the date of publication. It applies to DoH-licensed providers, UAE-based pharmaceutical manufacturers, insurers, licensed researchers and any end-user that uses Abu Dhabi population or patient data in AI work. It sets six guiding principles (transparency, supportive technology, safety and security, privacy, ethics, accountability) and minimum requirements for AI tools, and it asks end-users to report known or suspected AI incidents to DoH.',
    src: 'dohAi',
    report: true,
  },
  {
    when: 'April 16, 2020',
    sort: '2020-04',
    status: 'done',
    theme: 'pd',
    title: 'The DoH policy on the Abu Dhabi Health Information Exchange takes effect',
    body:
      'The policy (version 1.1) lists 16 April 2020 as its effective date and November 2018 as the previous version. It requires healthcare facilities to seek patient consent for sharing patient data through the exchange, and it says DoH authorises sharing where consent is unavailable, for example for legacy data. Its breach clause says affected patients must be notified without undue delay and no later than 60 days from discovery, and that the exchange side must notify DoH of a breach within 5 business days of determining it occurred.',
    src: 'hie',
    report: true,
  },
  {
    when: 'July 1, 2021',
    sort: '2021-07',
    status: 'done',
    theme: 'ai',
    title: 'The Dubai Health Authority issues its policy on Artificial Intelligence in the Healthcare',
    body:
      'The policy’s control table lists 1 July 2021 as the issue date, 1 October 2021 as the effective date and 1 July 2026 as the revision date (the first-page header shows 1 July 2021 as the effective date). It applies to DHA-licensed facilities and professionals, AI developers that use Dubai data, and insurers and researchers. It requires disclosure of how an AI solution was validated, independent validation by a competent third party, the ability for designated users to override or reverse significant decisions, and reporting of AI incidents to DHA.',
    src: 'dhaAi',
    report: true,
  },
  {
    when: 'January 2, 2022',
    sort: '2022-01',
    status: 'done',
    theme: 'pd',
    title: 'The federal Personal Data Protection Law comes into force',
    body:
      'The UAE Government portal says Federal Decree-Law No. 45 of 2021 came into force on 2 January 2022. It describes a framework that bans processing personal data without the owner’s consent except in listed cases, gives the owner the right to ask for corrections and to restrict or stop processing, and sets requirements for cross-border transfer. The portal separately describes Federal Law No. 2 of 2019 on ICT in health fields, which covers health data and information, including in free zones.',
    src: 'uaePdpl',
  },
  {
    when: 'December 2025',
    sort: '2025-12',
    status: 'done',
    theme: 'pd',
    title: 'DoH publishes the Data Storage and Retention Standard and the Data Sharing, Integration and Interoperability Standard',
    body:
      'The retention standard says the minimum retention period for health data is 25 years, as the standard says Federal Law No. 2 of 2019 mandates. The sharing standard (effective April 2026) says data labelled under the data classification standard must not be transferred, stored, shared, processed or disseminated outside the UAE unless DoH issues a valid and specific exemption.',
    src: 'retention',
    report: true,
  },
  {
    when: 'January 2026',
    sort: '2026-01',
    status: 'done',
    theme: 'pd',
    title: 'DoH publishes the Data Access Standard',
    body:
      'The standard says remote access from outside the UAE is permitted only in exceptional circumstances with prior written approval from DoH, that no storage, replication or transfer of healthcare data outside the UAE may happen without explicit DoH authorisation, and that entities using external or cloud providers must keep data residency within the UAE with contractual and technical safeguards. It takes effect six months from the date of publishing.',
    src: 'dataAccess',
    report: true,
  },
  {
    when: 'March 2026',
    sort: '2026-03',
    status: 'done',
    theme: 'device',
    title: 'DoH publishes the Digital Products Governance Standard',
    body:
      'The standard treats software, applications, platforms, electronic health records, telemedicine and wearables as digital products, including those powered by AI. Every digital product needs a Digital Product Owner and a Digital Product Architect, and a feasibility study and risk assessment before it starts. Its risk tiers are: very high risk, prohibited; high risk, conformity assessments before and after deployment; medium risk, governance and risk reporting; low and very low risk, no formal risk reporting but monitoring. It takes effect in August 2026.',
    src: 'dpgs',
    report: true,
  },
  {
    when: 'April 2026',
    sort: '2026-04',
    status: 'done',
    theme: 'pd',
    title: 'DoH publishes the Analytics and Reporting Standard (effective May 2026)',
    body:
      'Patient data used for secondary purposes must be anonymised or de-identified unless the patient explicitly permits otherwise or the law requires it. The standard requires explicit informed consent before secondary use, lets patients withdraw consent at any time without any effect on their care, bans secondary use to deny insurance, employment or other essential services, and bans attempts to re-identify anonymised data. It also asks data science and AI teams to embed ethical data use at every stage of the AI system lifecycle.',
    src: 'analytics',
    report: true,
  },
  {
    when: 'July 2026',
    sort: '2026-07',
    status: 'done',
    theme: 'sec',
    title: 'DoH publishes version 2 of the Standard on Medical Device Reporting (effective October 2026)',
    body:
      'For deaths, serious injuries and malfunctions the reporting clock is “as soon as possible” from awareness and not more than five days; follow-up reports are due within 15 days; other medical device reports, such as use errors and product problems, are due within 90 days of receiving the related reports when the report is complete. Facilities with access to the Malaffi platform must use it as the primary reporting route.',
    src: 'mdr',
    report: true,
  },
  {
    when: 'November 2026',
    sort: '2026-11',
    status: 'done',
    theme: 'sec',
    title: 'DoH publishes its Medical Device Cybersecurity in Healthcare Facilities Guideline',
    body:
      'The guideline covers standalone medical device software and software embedded in hardware, implantable, mobile and network-connected devices. Cybersecurity or information incidents involving connected medical devices must be reported to the Abu Dhabi Healthcare Cybersecurity Emergency Response Team immediately upon discovery and without delay. Any new medical device, or an existing one with cybersecurity considerations, must be evaluated by DoH’s Health Technology Assessment department before implementation. The guideline takes effect in January 2027.',
    src: 'cyber',
    report: true,
  },
  {
    when: 'January 2027',
    sort: '2027-01',
    status: 'ahead',
    theme: 'sec',
    title: 'The DoH medical device cybersecurity guideline takes effect',
    body:
      'The guideline lists January 2027 as its effective date and October 2029 as its revision date. Facilities, IT departments, biomedical engineers, distributors, vendors and manufacturers are all named as parties it applies to. Ask connected-device and AI vendors now for their security disclosure (the guideline names the MDS2 form) and for their patching and recall communication.',
    src: 'cyber',
  },
];
