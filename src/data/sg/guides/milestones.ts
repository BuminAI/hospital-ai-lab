// Digital health and AI roadmap for Singapore hospitals — data for /sg/dx-roadmap/ and /sg/calendar/ (2026-11-14)
//
// ⚠️ Every fact here comes from a primary document that was actually downloaded and read on 2026-11-14:
//    HSA's GL-04-R4 (software medical devices, Dec 2025), GL-07-R2 (SaMD risk classification and CDSS, Jul 2025) and
//    GN-37-R1 (Change Management Program, Dec 2024), the Ministry of Health's AIHGle 2.0 (Mar 2026) and the PDPC's
//    Guide on Managing and Notifying Data Breaches (revised 15 March 2021).
//    The statutes themselves (Singapore Statutes Online) refused automated requests (HTTP 403), so no section number of an Act is
//    quoted from the Act; where a duty comes from an Act, it is stated only as these guidance documents describe it.
//    Do not add dates or duties from news items or law-firm summaries; when you add one, read the primary text and update CHECKED.
export const CHECKED = 'November 14, 2026';

export const SRC = {
  gl04: { label: 'HSA — GL-04-R4 Regulatory Guidelines for Software Medical Devices including Machine Learning-Enabled Medical Devices: A Life Cycle Approach (Revision 4, December 2025)', url: 'https://isomer-user-content.by.gov.sg/409/26808a93-6a7a-4551-8c66-13046c6124c5/gl-04-r4-regulatory-guidelines-for-software-medical-devices---a-life-cycle-approach-(2025-dec)-pub.pdf' },
  gl07: { label: 'HSA — GL-07-R2 Guidelines on Risk Classification of Software as a Medical Device (SaMD) and Qualification of Clinical Decision Support Software (CDSS) (Revision 2, July 2025)', url: 'https://isomer-user-content.by.gov.sg/409/ae814059-a3ff-4ce3-8192-4534a43ddc6f/gl-07-r2-guidelines-risk-classification-samd-cdss-(2025-jul)-pub.pdf' },
  gn37: { label: 'HSA — GN-37-R1 Guidance on Change Management Program (CMP) for SaMD, including machine-learning enabled SaMD (December 2024)', url: 'https://isomer-user-content.by.gov.sg/409/4e8620d9-267f-41f5-adc3-cc35456d3731/gn-37-r1-guidance-on-change-management-program-(cmp)-for-samd-including-machine-learning-enabled-samd.pdf' },
  aihgle: { label: 'Ministry of Health and HSA — Artificial Intelligence in Healthcare Guidelines (AIHGle), Version 2.0, published March 2026', url: 'https://isomer-user-content.by.gov.sg/3/6636a140-7986-43f6-9861-096333138d59/AIHGle_2.0.pdf' },
  aihglePage: { label: 'Ministry of Health — Emerging regulatory policy issues (AIHGle 2.0 page, with the deployers’ toolkit and infographic)', url: 'https://www.moh.gov.sg/others/health-regulation/emerging-regulatory-policy-issues/' },
  pdpcBreach: { label: 'PDPC — Guide on Managing and Notifying Data Breaches under the PDPA (revised 15 March 2021)', url: 'https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/other-guides/guide-on-managing-and-notifying-data-breaches-under-the-pdpa-15-mar-2021.pdf' },
  mha995: { label: 'Ministry of Home Affairs — 1777 non-emergency ambulance hotline to cease from 1 January 2027 (1 July 2026)', url: 'https://www.mha.gov.sg/media-room/newsroom/1777-non-emergency-ambulance-hotline-to-cease-from-1-january-2027/' },
  hsaGuidance: { label: 'HSA — Medical devices guidance documents (list page)', url: 'https://www.hsa.gov.sg/medical-devices/guidance-documents' },
} as const;

export type ThemeKey = 'pd' | 'ai' | 'device' | 'sec';

export const THEMES: Record<ThemeKey, string> = {
  pd: 'Personal data protection',
  ai: 'MOH guidance for healthcare AI',
  device: 'HSA and software as a medical device',
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
    when: 'April 30, 2020',
    sort: '2020-04',
    status: 'done',
    theme: 'device',
    title: 'HSA issues its first life-cycle guidelines for software medical devices (GL-04)',
    body:
      'The revision history of GL-04 lists the first release as 30 April 2020. The guidelines apply to software whose intended use meets the definition of a medical device under the Health Products Act 2007, and later revisions added machine-learning-specific requirements.',
    src: 'gl04',
  },
  {
    when: 'March 15, 2021',
    sort: '2021-03',
    status: 'done',
    theme: 'pd',
    title: 'The PDPC revises its guide on managing and notifying data breaches',
    body:
      'The revised guide says an organisation that has credible grounds to believe a data breach has occurred must assess within 30 calendar days whether it is notifiable, and must notify the PDPC within 3 calendar days once it determines that the breach is notifiable. A breach that involves the personal data of 500 or more individuals is of “significant scale” and must be notified even if no prescribed data is involved.',
    src: 'pdpcBreach',
    report: true,
  },
  {
    when: 'April 29, 2022',
    sort: '2022-04',
    status: 'done',
    theme: 'device',
    title: 'HSA publishes GL-07 on risk classification of SaMD and on clinical decision support software',
    body:
      'GL-07 lists April 29, 2022 as its first release. It follows the IMDRF framework: the risk class depends on how significant the software’s information is for care (treat or diagnose, drive, or inform clinical management) and on the state of the patient’s situation (critical, serious or non-serious). GL-04 revision 2 carries the same date.',
    src: 'gl07',
  },
  {
    when: 'March 1, 2024',
    sort: '2024-03',
    status: 'done',
    theme: 'device',
    title: 'GL-04 revision 3 takes effect',
    body:
      'The revision history of GL-04 lists revision 3 with the effective date 1 March 2024.',
    src: 'gl04',
  },
  {
    when: 'December 4, 2024',
    sort: '2024-12',
    status: 'done',
    theme: 'device',
    title: 'HSA issues GN-37 on an optional Change Management Program for SaMD, including machine-learning enabled SaMD',
    body:
      'GN-37 revision 1 (4 December 2024) describes a new pathway built into HSA’s existing registration and change notification processes. It lets a manufacturer have “pre-specified changes” approved in advance. The guidance says the program is optional, and its scope note excludes continuous learning and generative AI.',
    src: 'gn37',
    report: true,
  },
  {
    when: 'July 21, 2025',
    sort: '2025-07',
    status: 'done',
    theme: 'device',
    title: 'GL-07 revision 2 takes effect',
    body:
      'GL-07 revision 2 lists 21 July 2025 as its date. The classification table puts software that treats or diagnoses in a critical or serious situation in Class C, and an asterisk says software that analyses vital physiological processes or anatomical structure images to drive clinical management is Class B.',
    src: 'gl07',
  },
  {
    when: 'December 31, 2025',
    sort: '2025-12',
    status: 'done',
    theme: 'device',
    title: 'GL-04 revision 4 takes effect',
    body:
      'The revision history of GL-04 lists revision 4 with the effective date 31 December 2025. The document covers quality management, pre-market registration, change notification, post-market duties, cybersecurity and machine-learning-enabled medical devices, and says Class B, C and D software medical devices require product registration.',
    src: 'gl04',
    report: true,
  },
  {
    when: 'February 2026',
    sort: '2026-02',
    status: 'done',
    theme: 'device',
    title: 'MOH and HSA launch the AI-MD Exemption Sandbox',
    body:
      'AIHGle 2.0 (case study 5) says the sandbox, launched in February 2026, lets selected public healthcare entities deploy low-to-moderately-low-risk AI medical devices across multiple institutions without full licensing and registration requirements. It is not a route for private hospitals in general.',
    src: 'aihgle',
  },
  {
    when: 'March 2026',
    sort: '2026-03',
    status: 'done',
    theme: 'ai',
    title: 'MOH and HSA publish AIHGle 2.0 for AI in healthcare',
    body:
      'Version 2.0 is dated March 2026 on its cover. It splits responsibilities between developers, deployers (healthcare organisations) and users (healthcare professionals), and adds chapters on continuous-learning AI, generative AI and direct-to-consumer AI. For deployers it sets out governance, risk assessment, pre-deployment testing, staff training, monitoring, adverse-event response, end of life and patient communication.',
    src: 'aihgle',
    report: true,
  },
];
