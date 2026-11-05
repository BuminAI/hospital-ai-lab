// Digital health and AI roadmap for U.S. hospitals — data for /en/dx-roadmap/ and /en/calendar/ (2026-11-06)
//
// ⚠️ Every fact here comes from the primary sources in SRC and was written after the text was actually opened:
//    the eCFR (current text, "up to date as of 2026-11-03"), the Federal Register API, and FDA pages.
//    Only dates stated in those texts are used. Do not add dates or duties from news items or law-firm summaries;
//    when you add one, reread the primary text and update CHECKED.
export const CHECKED = 'November 6, 2026';

export const SRC = {
  sec316: { label: 'eCFR — 45 CFR 164.316 (Security Rule: policies, procedures and documentation)', url: 'https://www.ecfr.gov/current/title-45/section-164.316' },
  sec308: { label: 'eCFR — 45 CFR 164.308 (Security Rule: administrative safeguards)', url: 'https://www.ecfr.gov/current/title-45/section-164.308' },
  sec312: { label: 'eCFR — 45 CFR 164.312 (Security Rule: technical safeguards)', url: 'https://www.ecfr.gov/current/title-45/section-164.312' },
  breach402: { label: 'eCFR — 45 CFR 164.402 (breach definition and risk assessment)', url: 'https://www.ecfr.gov/current/title-45/section-164.402' },
  breach404: { label: 'eCFR — 45 CFR 164.404 (notification to individuals)', url: 'https://www.ecfr.gov/current/title-45/section-164.404' },
  breach406: { label: 'eCFR — 45 CFR 164.406 (notification to the media)', url: 'https://www.ecfr.gov/current/title-45/section-164.406' },
  breach408: { label: 'eCFR — 45 CFR 164.408 (notification to the Secretary)', url: 'https://www.ecfr.gov/current/title-45/section-164.408' },
  breach410: { label: 'eCFR — 45 CFR 164.410 (notification by a business associate)', url: 'https://www.ecfr.gov/current/title-45/section-164.410' },
  baa502: { label: 'eCFR — 45 CFR 164.502(e) (disclosures to business associates)', url: 'https://www.ecfr.gov/current/title-45/section-164.502' },
  baa504: { label: 'eCFR — 45 CFR 164.504(e) (business associate contracts)', url: 'https://www.ecfr.gov/current/title-45/section-164.504' },
  tpo506: { label: 'eCFR — 45 CFR 164.506 (treatment, payment and health care operations)', url: 'https://www.ecfr.gov/current/title-45/section-164.506' },
  auth508: { label: 'eCFR — 45 CFR 164.508 (uses and disclosures requiring authorization)', url: 'https://www.ecfr.gov/current/title-45/section-164.508' },
  deid514: { label: 'eCFR — 45 CFR 164.514(b) (de-identification)', url: 'https://www.ecfr.gov/current/title-45/section-164.514' },
  train530: { label: 'eCFR — 45 CFR 164.530 (administrative requirements, including training)', url: 'https://www.ecfr.gov/current/title-45/section-164.530' },
  def160: { label: 'eCFR — 45 CFR 160.103 (definitions: business associate, covered entity)', url: 'https://www.ecfr.gov/current/title-45/section-160.103' },
  app160: { label: 'eCFR — 45 CFR 160.102 (applicability: who HIPAA applies to)', url: 'https://www.ecfr.gov/current/title-45/section-160.102' },
  notice520: { label: 'eCFR — 45 CFR 164.520 (notice of privacy practices)', url: 'https://www.ecfr.gov/current/title-45/section-164.520' },
  amend526: { label: 'eCFR — 45 CFR 164.526 (amendment of PHI)', url: 'https://www.ecfr.gov/current/title-45/section-164.526' },
  account528: { label: 'eCFR — 45 CFR 164.528 (accounting of disclosures)', url: 'https://www.ecfr.gov/current/title-45/section-164.528' },
  access524: { label: 'eCFR — 45 CFR 164.524 (individual access to PHI)', url: 'https://www.ecfr.gov/current/title-45/section-164.524' },
  ib103: { label: 'eCFR — 45 CFR 171.103 (information blocking)', url: 'https://www.ecfr.gov/current/title-45/section-171.103' },
  s1557_210: { label: 'eCFR — 45 CFR 92.210 (patient care decision support tools)', url: 'https://www.ecfr.gov/current/title-45/section-92.210' },
  s1557_fr: { label: 'Federal Register — Nondiscrimination in Health Programs and Activities, 89 FR 37522 (May 6, 2024)', url: 'https://www.federalregister.gov/documents/2024/05/06/2024-08711/nondiscrimination-in-health-programs-and-activities' },
  nprm: { label: 'Federal Register — HIPAA Security Rule To Strengthen the Cybersecurity of ePHI, 90 FR 898 (proposed rule)', url: 'https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information' },
  hti5: { label: 'Federal Register — HTI-5 final rule (ONC Deregulatory Actions), 91 FR 67916 (Oct. 28, 2026)', url: 'https://www.federalregister.gov/documents/2026/10/28/2026-21943/health-data-technology-and-interoperability-onc-deregulatory-actions-to-unleash-prosperity' },
  fdaCds: { label: 'FDA — Clinical Decision Support Software, guidance for industry and FDA staff (January 2026)', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software' },
  fdaPccp: { label: 'FDA — Predetermined Change Control Plans (page listing the August 2025 final guidance for AI-enabled device software functions)', url: 'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/predetermined-change-control-plans' },
  fdaList: { label: 'FDA — List of AI-enabled medical devices', url: 'https://www.fda.gov/medical-devices/artificial-intelligence-enabled-medical-devices/list-artificial-intelligence-enabled-medical-devices' },
} as const;

export type ThemeKey = 'pd' | 'doc' | 'sec' | 'egisz' | 'device';

export const THEMES: Record<ThemeKey, string> = {
  pd: 'Patient privacy',
  doc: 'Records and interoperability',
  sec: 'Security',
  egisz: 'Nondiscrimination and oversight',
  device: 'FDA and AI-enabled devices',
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
    when: 'February 20, 2003',
    sort: '2003-02',
    status: 'done',
    theme: 'sec',
    title: 'The HIPAA Security Rule text in 45 CFR 164.316 dates from 68 FR 8376',
    body:
      'The rule requires covered entities and business associates to keep written policies and procedures, and to keep documentation of required actions, activities and assessments for 6 years from the date of creation or the date it was last in effect, whichever is later (§ 164.316(b)(2)(i)). It also requires documentation to be reviewed periodically and updated in response to environmental or operational changes (§ 164.316(b)(2)(iii)). The eCFR footer shows later amendments, including 78 FR 5695 (January 25, 2013).',
    src: 'sec316',
  },
  {
    when: 'January 25, 2013',
    sort: '2013-01',
    status: 'done',
    theme: 'pd',
    title: 'The breach notification rules in 45 CFR 164.400–414 reached their current form (78 FR 5695)',
    body:
      'A use or disclosure of protected health information that the Privacy Rule does not permit is presumed to be a breach unless the covered entity or business associate shows a low probability of compromise, based on at least four factors (§ 164.402). Notice to affected individuals must come without unreasonable delay and no later than 60 calendar days after discovery (§ 164.404(b)). For a breach affecting 500 or more individuals, HHS must be told at the same time as the individuals; for fewer than 500, the entity logs it and reports to HHS within 60 days after the end of the calendar year (§ 164.408). A business associate must notify the covered entity, also within 60 days at most (§ 164.410).',
    src: 'breach404',
    report: true,
  },
  {
    when: 'January 9, 2024',
    sort: '2024-01',
    status: 'done',
    theme: 'doc',
    title: 'The current information blocking definition for providers (45 CFR 171.103, 89 FR 1436)',
    body:
      'Information blocking is a practice that is likely to interfere with access, exchange or use of electronic health information, unless required by law or covered by an exception. For a health care provider, the test is that the provider knows the practice is unreasonable and likely to interfere. Whether a given practice qualifies, for example a refusal to share data with an AI vendor, depends on the exceptions in Part 171; ask your compliance office.',
    src: 'ib103',
  },
  {
    when: 'May 6, 2024 (effective July 5, 2024)',
    sort: '2024-05',
    status: 'done',
    theme: 'egisz',
    title: 'Section 1557 rule adds 45 CFR 92.210 on patient care decision support tools (89 FR 37522)',
    body:
      'A covered entity must not discriminate on the basis of race, color, national origin, sex, age or disability through patient care decision support tools (§ 92.210(a)). It has an ongoing duty to make reasonable efforts to identify tools in its programs that use input variables measuring those characteristics (§ 92.210(b)), and to make reasonable efforts to mitigate the risk of discrimination for each one it identifies (§ 92.210(c)). The text does not name AI, so which tools count is a question for counsel.',
    src: 's1557_210',
  },
  {
    when: 'January 6, 2025',
    sort: '2025-01',
    status: 'done',
    theme: 'sec',
    title: 'HHS proposed a rewrite of the HIPAA Security Rule (90 FR 898); it is still only a proposal',
    body:
      'The proposed rule was published January 6, 2025, and the comment period closed March 7, 2025, according to the Federal Register entry. A search of the Federal Register on November 6, 2026 found no final rule, so the current Security Rule text in 45 CFR Part 164, Subpart C, still governs. Do not plan around the proposed text as if it were in force.',
    src: 'nprm',
  },
  {
    when: 'August 2025',
    sort: '2025-08',
    status: 'done',
    theme: 'device',
    title: 'FDA final guidance on predetermined change control plans for AI-enabled device software functions',
    body:
      'FDA lists a final guidance dated August 2025 on marketing submission recommendations for a predetermined change control plan (PCCP) for AI-enabled device software functions. A PCCP describes planned changes to a device and how the manufacturer will develop, test and implement them, so that FDA can authorize those changes in advance. For a hospital, the useful question to a vendor is whether the device has an authorized PCCP and what changes it covers.',
    src: 'fdaPccp',
  },
  {
    when: 'January 2026',
    sort: '2026-01',
    status: 'done',
    theme: 'device',
    title: 'FDA clinical decision support software guidance, January 2026 version',
    body:
      'FDA explains how it reads the non-device clinical decision support criteria in section 520(o)(1)(E) of the FD&C Act, and says its digital health policies still apply to software functions that meet the device definition, including functions meant for patients or caregivers. The page shows the guidance as final and dated January 2026. Whether a vendor’s tool is a device or non-device CDS is the vendor’s regulatory call; ask for the basis in writing.',
    src: 'fdaCds',
  },
  {
    when: 'October 28, 2026',
    sort: '2026-10',
    status: 'done',
    theme: 'doc',
    title: 'ONC publishes the HTI-5 final rule (91 FR 67916), narrowing the decision support certification criterion',
    body:
      'The final rule removes paragraphs (b)(11)(iv) through (vi) of 45 CFR 170.315, the source attribute support, source attribute access and modification, and predictive decision support intervention risk-management requirements. ONC states that it will consider reinstating similar transparency requirements in future rulemaking. For a hospital, this means a vendor’s certified product may no longer carry those federal certification requirements, so your own vendor review matters more.',
    src: 'hti5',
  },
  {
    when: 'December 28, 2026',
    sort: '2026-12',
    status: 'ahead',
    theme: 'doc',
    title: 'The HTI-5 final rule takes effect',
    body:
      'The Federal Register entry gives December 28, 2026 as the effective date, except that three amendatory instructions take effect January 1, 2027. Check the rule text for which instructions those are before you rely on a specific provision.',
    src: 'hti5',
  },
];
