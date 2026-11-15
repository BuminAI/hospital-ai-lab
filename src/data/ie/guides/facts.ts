// Key facts for citation — data for /ie/facts/ and /ie/llms-full.txt (2026-11-15)
//
// Each item = one question, a short answer, the section it rests on, and a primary source. Everything was written after the text was
// actually opened: HIQA's press release (29 July 2026) and January 2026 consultation draft of its national AI guidance, the Department of
// Health's AI for Care strategy, the EU AI Act, the GDPR and the Medical Device Regulation (as published in the Official Journal), the Data
// Protection Commission's guidance on AI and large language models, and HPRA's pages for hospitals.
// Do not add items from news or assumptions; do not write numbers or deadlines that are not in the text.
// Not covered because the primary text was not read: the final HIQA guidance PDF, Irish statutes (the Data Protection Act 2018, the
// Regulation of Artificial Intelligence Bill 2026, S.I.s designating AI Act authorities), the HSE AI Implementation Framework, the MDCG
// guidance on the AI Act and the MDR, HPRA's standalone software guide, and any EU amendment published after the original texts.
import { SRC } from './milestones';

export const FACTS_CHECKED = 'November 15, 2026';

export const FACT_TOPICS = [
  'AI guidance for Irish health services (HIQA, Department of Health)',
  'EU AI Act for hospitals',
  'Medical devices and incidents (MDR, HPRA)',
  'Patient data (GDPR, Data Protection Commission)',
] as const;

export type FactTopic = (typeof FACT_TOPICS)[number];

export type Fact = {
  id: string;
  topic: FactTopic;
  q: string;
  a: string;
  /** Short basis, e.g. "Regulation (EU) 2024/1689, Article 26" */
  basis: string;
  src: keyof typeof SRC;
};

export const FACTS: Fact[] = [
  // ── AI guidance for Irish health services ────────────────
  {
    id: 'hiqa-guidance',
    topic: 'AI guidance for Irish health services (HIQA, Department of Health)',
    q: 'Is there national guidance on AI for Irish hospitals and who is it for?',
    a: 'Yes. HIQA published Ireland’s first National Guidance for the Responsible and Safe Use of Artificial Intelligence in Health and Social Care Services on 29 July 2026. It was commissioned by the Department of Health and developed with the Department and the HSE. It is intended for all services providing health and social care in Ireland, and is structured around HIQA’s four principles for person-centred care: accountability, a human rights-based approach, safety and wellbeing, and responsiveness. It builds on HIQA’s existing national standards.',
    basis: 'HIQA press release, 29 July 2026',
    src: 'hiqaRelease',
  },
  {
    id: 'hiqa-draft-inventory',
    topic: 'AI guidance for Irish health services (HIQA, Department of Health)',
    q: 'What did the consultation draft say a service should have in place before using an AI tool?',
    a: 'The January 2026 draft (the final text may differ) gives examples: a list of authorised AI tools kept by the service and shared with staff; an individual assigned to compile and maintain an inventory of AI tools; legal and regulatory expertise consulted, including on ethical and cyber security impacts and EU AI Act requirements; quality control and assurance practices; risk assessments within existing risk management procedures; and fundamental rights impact assessments for high-risk tools as the AI Act requires.',
    basis: 'HIQA draft guidance (January 2026), Principle 1: Accountability',
    src: 'hiqaDraft',
  },
  {
    id: 'hiqa-draft-human',
    topic: 'AI guidance for Irish health services (HIQA, Department of Health)',
    q: 'What did the draft say about human oversight and transparency?',
    a: 'The draft says AI tools should augment rather than replace human judgement, and must be part of a process with appropriate human oversight: either a human overseeing decisions in real time (“human in the loop”) or the system operating with the ability to be overridden (“human on the loop”). Staff should have the option to override an output. Services should be transparent about when, where and why AI tools are used in care, and keep documentation that supports explainability, traceability and auditability. Clinical staff remain responsible for their clinical decisions. This describes the draft, not necessarily the final text.',
    basis: 'HIQA draft guidance (January 2026), Principle 1: Accountability',
    src: 'hiqaDraft',
  },
  {
    id: 'hiqa-draft-inhouse',
    topic: 'AI guidance for Irish health services (HIQA, Department of Health)',
    q: 'What if a hospital builds its own AI software?',
    a: 'The draft guidance notes that medical device software, including AI-based software, might be developed by hospitals or health services themselves. In that case the draft says the hospital would need to meet the obligations for providers under the EU AI Act and the obligations of a manufacturer under the MDR or IVDR, as applicable. The MDR has a separate provision for devices made and used only within health institutions (Article 5(5)).',
    basis: 'HIQA draft guidance (January 2026), Principle 1; Regulation (EU) 2017/745, Article 5(5)',
    src: 'hiqaDraft',
  },
  {
    id: 'ai-for-care',
    topic: 'AI guidance for Irish health services (HIQA, Department of Health)',
    q: 'What is the “AI for Care” strategy?',
    a: 'AI for Care is the Department of Health’s AI strategy for healthcare in Ireland for 2026-2030. It sets four strategic pillars (AI for clinical care, operations, research and innovation, and public health) and six guiding principles: person-centred, transparent and trustworthy, human in the loop, lived experience, governance and safety, and proven benefit. It says the HSE has developed a corresponding AI Implementation Framework. The document carries no publication date.',
    basis: 'AI for Care 2026-2030, sections 4.2 and 5',
    src: 'aiForCare',
  },
  {
    id: 'ai-for-care-literacy',
    topic: 'AI guidance for Irish health services (HIQA, Department of Health)',
    q: 'Does the strategy say anything about staff training?',
    a: 'Yes. Under the “human in the loop” principle, the strategy says the clinician stays at the centre of patient care and commits to building AI literacy across the health service and among patients and service users, so that decision-makers, healthcare professionals, researchers and innovators are equipped to use AI technologies effectively and responsibly.',
    basis: 'AI for Care 2026-2030, section 4.2, principle 3',
    src: 'aiForCare',
  },
  // ── EU AI Act for hospitals ───────────────────────────────
  {
    id: 'aiact-dates',
    topic: 'EU AI Act for hospitals',
    q: 'When do the EU AI Act’s rules apply?',
    a: 'As published in the Official Journal on 12 July 2024, Article 113 says the Regulation applies from 2 August 2026; Chapters I and II (general provisions including AI literacy, and prohibited practices) apply from 2 February 2025; certain other parts (including Chapter III Section 4, Chapter V and Chapter VII) from 2 August 2025; and Article 6(1) with its corresponding obligations from 2 August 2027. Later EU amendments were not read, so check the current text.',
    basis: 'Regulation (EU) 2024/1689, Article 113',
    src: 'aiAct',
  },
  {
    id: 'aiact-literacy',
    topic: 'EU AI Act for hospitals',
    q: 'Does the AI Act require a hospital to train staff on AI?',
    a: 'Article 4 says providers and deployers of AI systems shall take measures to ensure, to their best extent, a sufficient level of AI literacy of their staff and other persons dealing with the operation and use of AI systems on their behalf, taking into account their technical knowledge, experience, education and training and the context of use. A hospital that uses an AI system under its authority is a deployer. The article applies from 2 February 2025.',
    basis: 'Regulation (EU) 2024/1689, Articles 4 and 113(a)',
    src: 'aiAct',
  },
  {
    id: 'aiact-high-risk-devices',
    topic: 'EU AI Act for hospitals',
    q: 'When is an AI system in a medical device “high-risk” under the AI Act?',
    a: 'Under Article 6(1), an AI system is high-risk when both conditions are met: it is a safety component of a product, or itself a product, covered by the Union harmonisation legislation listed in Annex I (Annex I, Section A lists the Medical Device Regulation and the In Vitro Diagnostic Regulation), and that product must undergo a third-party conformity assessment before being placed on the market or put into service. Article 113 says Article 6(1) applies from 2 August 2027.',
    basis: 'Regulation (EU) 2024/1689, Article 6(1), Annex I Section A points 11 and 12, Article 113(c)',
    src: 'aiAct',
  },
  {
    id: 'aiact-annex-iii',
    topic: 'EU AI Act for hospitals',
    q: 'Which hospital-related uses are listed as high-risk in Annex III?',
    a: 'Annex III, point 5, lists AI systems used by or on behalf of public authorities to evaluate the eligibility of people for essential public assistance benefits and services, including healthcare services, and AI systems intended to evaluate and classify emergency calls or to dispatch or prioritise emergency first response, including emergency healthcare patient triage systems. Article 6(3) lets a provider show that an Annex III system is not high-risk in certain cases, but never where the system profiles natural persons.',
    basis: 'Regulation (EU) 2024/1689, Annex III point 5(a) and (d), Article 6(3)',
    src: 'aiAct',
  },
  {
    id: 'aiact-deployer',
    topic: 'EU AI Act for hospitals',
    q: 'What must a hospital that deploys a high-risk AI system do?',
    a: 'Article 26 asks deployers to use the system in accordance with its instructions for use; assign human oversight to people with the necessary competence, training, authority and support; ensure input data under their control is relevant and sufficiently representative; monitor the system and, where they see a risk, inform the provider or distributor and the market surveillance authority and suspend use; report a serious incident to the provider first and then the importer or distributor and the authorities; keep the logs under their control for at least six months unless other law says otherwise; and inform workers and their representatives before using such a system at work. Deployers use the provider’s information to carry out a data protection impact assessment where applicable.',
    basis: 'Regulation (EU) 2024/1689, Article 26(1)-(7) and (9)',
    src: 'aiAct',
  },
  {
    id: 'aiact-fria',
    topic: 'EU AI Act for hospitals',
    q: 'Is a fundamental rights impact assessment required?',
    a: 'Article 27 requires one before deploying certain high-risk AI systems (those in Article 6(2), with an exception for Annex III point 2) for deployers that are bodies governed by public law or private entities providing public services, and for deployers of the systems in Annex III points 5(b) and (c). The assessment describes the deployer’s processes, the period and frequency of use, and the categories of people likely to be affected, among other elements. Whether a particular hospital is covered depends on its status; ask counsel.',
    basis: 'Regulation (EU) 2024/1689, Article 27(1)',
    src: 'aiAct',
  },
  {
    id: 'aiact-transparency',
    topic: 'EU AI Act for hospitals',
    q: 'Must patients be told when they are talking to an AI chatbot?',
    a: 'Article 50(1) puts the duty on providers: AI systems intended to interact directly with people must be designed so that the people concerned are informed they are interacting with an AI system, unless this is obvious to a reasonably well-informed, observant and circumspect person in the circumstances. Article 50(2) asks providers of systems that generate synthetic audio, image, video or text to mark outputs in a machine-readable format. Ask your vendor how its product meets this.',
    basis: 'Regulation (EU) 2024/1689, Article 50(1) and (2)',
    src: 'aiAct',
  },
  {
    id: 'ireland-implementation',
    topic: 'EU AI Act for hospitals',
    q: 'How is the AI Act being put into effect in Ireland?',
    a: 'HIQA’s press release says the Regulation of Artificial Intelligence Bill 2026 passed through the Seanad on 15 July, and that its purpose is to support the establishment of the AI Office of Ireland, outline Ireland’s AI regulatory structures, designate the competent authorities and implement the AI Act consistently without adding national requirements. HIQA’s January 2026 draft says that, in healthcare, the HSE and HPRA have been named as competent authorities and that their roles were still being worked out. We did not read the Bill or confirm whether it has been enacted.',
    basis: 'HIQA press release (29 July 2026); HIQA draft guidance (January 2026), section 1.5',
    src: 'hiqaRelease',
  },
  // ── Medical devices and incidents ─────────────────────────
  {
    id: 'hpra-role',
    topic: 'Medical devices and incidents (MDR, HPRA)',
    q: 'Who regulates medical devices in Ireland, and does it approve AI software?',
    a: 'HPRA says it is the National Competent Authority responsible for applying the MDR and the IVDR in Ireland. It monitors devices and IVDs on the Irish market to ensure they are safe and perform as intended, and says it does not play a role in the authorisation or approval of medical devices or IVDs. HPRA also says the MDR became fully applicable in 2021 and the IVDR in 2022.',
    basis: 'HPRA, Overview of medical device & IVD regulation for hospitals',
    src: 'hpraOverview',
  },
  {
    id: 'mdr-software',
    topic: 'Medical devices and incidents (MDR, HPRA)',
    q: 'Can software be a medical device, and how is it classified?',
    a: 'Yes. The MDR’s definition of a medical device names software among the things intended by the manufacturer for a medical purpose such as diagnosis, prevention, monitoring, prediction, prognosis, treatment or alleviation of disease. Annex VIII, rule 11, classifies software that provides information used to take decisions with diagnosis or therapeutic purposes as class IIa, or class IIb if a decision could cause a serious deterioration of health or a surgical intervention, or class III if it could cause death or irreversible deterioration; software monitoring physiological processes is class IIa (IIb for vital parameters where variations could result in immediate danger); all other software is class I. This is the text as published in 2017.',
    basis: 'Regulation (EU) 2017/745, Article 2(1), Annex VIII rule 11',
    src: 'mdr',
  },
  {
    id: 'mdr-inhouse',
    topic: 'Medical devices and incidents (MDR, HPRA)',
    q: 'Can a hospital make and use its own device, including software?',
    a: 'Article 5(5) of the MDR exempts devices manufactured and used only within health institutions established in the Union from most requirements (not the general safety and performance requirements in Annex I), if conditions are met. They include a justification that the target patient group’s needs cannot be met by an equivalent device on the market, a publicly available declaration, documentation sufficient for the competent authority to check that Annex I is met, and review of clinical experience with corrective action. HPRA lists in-house manufacturing among the routes hospitals should understand.',
    basis: 'Regulation (EU) 2017/745, Article 5(5); HPRA overview for hospitals',
    src: 'mdr',
  },
  {
    id: 'hpra-reporting',
    topic: 'Medical devices and incidents (MDR, HPRA)',
    q: 'When should a hospital report a device problem to HPRA, and how?',
    a: 'HPRA says hospitals and healthcare professionals should report serious incidents: any incident that directly or indirectly led, might have led or might lead to the death of a patient, user or other person, a temporary or permanent serious deterioration of someone’s state of health, or a serious public health threat. If in doubt, HPRA encourages reporting. Reports can go through HPRA’s online form, by emailing a completed incident report form to devicesafety@hpra.ie, by post, or by phone on +353 (0)1 676 4971. The page sets no deadline for hospitals.',
    basis: 'HPRA, Reporting medical device & IVD safety issues',
    src: 'hpraReporting',
  },
  {
    id: 'mdr-manufacturer-clocks',
    topic: 'Medical devices and incidents (MDR, HPRA)',
    q: 'What reporting deadlines does the MDR set for manufacturers?',
    a: 'Under Article 87, manufacturers report a serious incident immediately after establishing a causal relationship (or that it is reasonably possible) and not later than 15 days after becoming aware of it; for a serious public health threat, immediately and not later than 2 days; for death or an unanticipated serious deterioration in health, not later than 10 days. Article 87(10) asks Member States to encourage and enable healthcare professionals, users and patients to report suspected serious incidents to the competent authorities. These are manufacturers’ clocks, not hospital deadlines.',
    basis: 'Regulation (EU) 2017/745, Article 87(3), (4), (5) and (10)',
    src: 'mdr',
  },
  {
    id: 'hpra-fsca',
    topic: 'Medical devices and incidents (MDR, HPRA)',
    q: 'What should a hospital do when a manufacturer sends a field safety notice, for example for a software update?',
    a: 'HPRA says a field safety corrective action can include software updates, changes to instructions for use, repair, recall or replacement, and that each hospital manages them under its own quality or risk management protocols. HPRA recommends six steps: a documented process to receive and pass on notices; assessing whether you hold affected devices (traceability); assessing patient risk; implementing the manufacturer’s instructions; documenting actions and returning acknowledgements; and reporting incidents to HPRA where required.',
    basis: 'HPRA, Managing field safety corrective actions',
    src: 'hpraFsca',
  },
  // ── Patient data ──────────────────────────────────────────
  {
    id: 'gdpr-health-data',
    topic: 'Patient data (GDPR, Data Protection Commission)',
    q: 'Is health data treated differently under the GDPR?',
    a: 'Yes. Article 9(1) places data concerning health among the special categories of personal data whose processing is prohibited unless a condition in Article 9(2) applies. Condition (h) covers processing necessary for medical diagnosis, the provision of health or social care or treatment, or the management of health or social care systems and services, on the basis of Union or Member State law or under a contract with a health professional. Article 9(3) requires that such data are processed by or under the responsibility of a professional subject to professional secrecy, and Article 9(4) lets Member States add further conditions for health data.',
    basis: 'Regulation (EU) 2016/679, Article 9(1), (2)(h), (3) and (4)',
    src: 'gdpr',
  },
  {
    id: 'gdpr-dpia',
    topic: 'Patient data (GDPR, Data Protection Commission)',
    q: 'Do we need a data protection impact assessment for a new AI tool?',
    a: 'Article 35(1) requires an assessment before processing that is likely to result in a high risk to people’s rights and freedoms, in particular when using new technologies. Article 35(3)(b) names processing on a large scale of special categories of data, which includes health data, and Article 35(2) asks the controller to seek the advice of the data protection officer. The Data Protection Commission’s AI guidance says an assessment may be needed, especially where technology or processing is new to the organisation.',
    basis: 'Regulation (EU) 2016/679, Article 35(1)-(3); DPC guidance (18 July 2024)',
    src: 'gdpr',
  },
  {
    id: 'gdpr-breach',
    topic: 'Patient data (GDPR, Data Protection Commission)',
    q: 'What are the deadlines for a personal data breach?',
    a: 'Under Article 33(1) the controller notifies the supervisory authority without undue delay and, where feasible, not later than 72 hours after becoming aware of a breach, unless the breach is unlikely to result in a risk to people’s rights and freedoms. A processor notifies the controller without undue delay (Article 33(2)). Where a breach is likely to result in a high risk, the controller communicates it to the people concerned without undue delay (Article 34(1)); Article 34(3) lists exceptions such as encryption that renders the data unintelligible.',
    basis: 'Regulation (EU) 2016/679, Articles 33 and 34',
    src: 'gdpr',
  },
  {
    id: 'gdpr-automated',
    topic: 'Patient data (GDPR, Data Protection Commission)',
    q: 'Can an AI tool make decisions about patients on its own?',
    a: 'Article 22(1) gives people the right not to be subject to a decision based solely on automated processing, including profiling, that produces legal effects or similarly significantly affects them. Exceptions exist (contract necessity, authorisation by law with safeguards, explicit consent), and where some of them apply the controller must provide at least the right to obtain human intervention, to express a point of view and to contest the decision. Article 22 does not decide clinical questions; ask your data protection officer how it applies to a particular tool.',
    basis: 'Regulation (EU) 2016/679, Article 22(1)-(3)',
    src: 'gdpr',
  },
  {
    id: 'dpc-ai-guidance',
    topic: 'Patient data (GDPR, Data Protection Commission)',
    q: 'What does the Data Protection Commission say organisations should check before using an AI product?',
    a: 'The guidance (18 July 2024) says an organisation using an AI product could be a data controller and should consider a formal risk assessment. Before starting, it should understand what personal data the system uses, how it uses it, where the data goes where a third party is involved, whether the provider retains or re-uses it, and how the product lets the organisation meet its GDPR obligations. It also flags memorisation of training data, circumvented filters, inaccurate or biased outputs relied on without human review (automated decision-making risk), the need to handle access and deletion requests, and the need for a retention schedule.',
    basis: 'DPC, AI, Large Language Models and Data Protection (18 July 2024)',
    src: 'dpcAi',
  },
];
