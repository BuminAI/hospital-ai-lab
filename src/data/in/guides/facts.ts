// Key facts for citation — data for /in/facts/ and /in/llms-full.txt (2026-11-07)
//
// Each item = one question, a short answer, the section it rests on, and a primary source. Everything was written after the
// text was actually opened: the Gazette of India copy of the DPDP Act 2023, the Medical Devices Rules 2017, CDSCO's Guidance
// Document on Medical Device Software (CDSCO/MD/GD/MDSW/01/2026) and ICMR's 2023 AI guidelines.
// Do not add items from news or assumptions; do not write numbers or deadlines that are not in the text.
// Not covered because the primary text could not be opened from this site's systems: the DPDP Rules and the start dates of
// the Act's provisions, ABDM (Ayushman Bharat Digital Mission) documents, CERT-In directions, telemedicine guidelines.
import { SRC } from './milestones';

export const FACTS_CHECKED = 'November 7, 2026';

export const FACT_TOPICS = [
  'Personal data (DPDP Act, 2023)',
  'Security and breaches',
  'Software as a medical device (CDSCO)',
  'Ethics guidance for AI (ICMR)',
] as const;

export type FactTopic = (typeof FACT_TOPICS)[number];

export type Fact = {
  id: string;
  topic: FactTopic;
  q: string;
  a: string;
  /** Short basis, e.g. "DPDP Act 2023, section 8(5)" */
  basis: string;
  src: keyof typeof SRC;
};

export const FACTS: Fact[] = [
  // ── Personal data ────────────────────────────────────
  {
    id: 'dpdp-notice-and-consent',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'What must a hospital do before it asks a patient to consent to the processing of personal data?',
    a: 'Every request for consent must be accompanied or preceded by a notice. The notice tells the person which personal data is to be processed and for what purpose, how the person can exercise their rights, and how to complain to the Data Protection Board (section 5(1)). The consent must be free, specific, informed, unconditional and unambiguous, given by a clear affirmative action, and limited to the personal data necessary for the specified purpose (section 6(1)). The Act’s own illustration: a telemedicine app that also asks for the phone’s contact list gets valid consent only for what telemedicine needs.',
    basis: 'DPDP Act 2023, sections 5(1) and 6(1)',
    src: 'dpdp',
  },
  {
    id: 'dpdp-language',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'In which language must a patient be able to read a notice or a consent request?',
    a: 'The person must be given the option to read the notice, and the request for consent, in English or in any language specified in the Eighth Schedule to the Constitution. A request for consent must also give the contact details of a Data Protection Officer, where applicable, or of another person authorised to answer the person’s communications.',
    basis: 'DPDP Act 2023, sections 5(3) and 6(3)',
    src: 'dpdp',
  },
  {
    id: 'dpdp-withdrawal-erasure',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'Can a patient withdraw consent, and what must the hospital do then?',
    a: 'Yes, at any time, and withdrawing must be as easy as giving consent (section 6(4)). Within a reasonable time the data fiduciary must stop processing, and make its data processors stop, unless processing without consent is required or authorised by law (section 6(6)). Unless retention is necessary to comply with a law, it must also erase the personal data when consent is withdrawn or once it is reasonable to assume the purpose is no longer served, and make its processors erase it (section 8(7)).',
    basis: 'DPDP Act 2023, sections 6(4), 6(6) and 8(7)',
    src: 'dpdp',
  },
  {
    id: 'dpdp-emergency',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'Does the Act allow a hospital to process personal data without consent in a medical emergency?',
    a: 'Section 7 lists “certain legitimate uses” that do not depend on consent. They include responding to a medical emergency involving a threat to the life or an immediate threat to the health of the person or any other individual (7(f)), and taking measures to provide medical treatment or health services during an epidemic, an outbreak of disease or any other threat to public health (7(g)). Section 7(a) also covers the specified purpose for which a person voluntarily provided their data, as long as they have not said they do not consent to that use.',
    basis: 'DPDP Act 2023, section 7(a), (f) and (g)',
    src: 'dpdp',
  },
  {
    id: 'dpdp-vendor-responsibility',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'Is the hospital still responsible when an AI or software vendor processes patient data for it?',
    a: 'Yes. The data fiduciary is responsible for complying with the Act for any processing it undertakes, or that a data processor undertakes on its behalf, irrespective of any agreement to the contrary (section 8(1)). A data fiduciary may engage a data processor to offer goods or services only under a valid contract (section 8(2)).',
    basis: 'DPDP Act 2023, sections 8(1) and 8(2)',
    src: 'dpdp',
  },
  {
    id: 'dpdp-accuracy',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'What does the Act say about personal data that is used to make a decision about a person?',
    a: 'Where personal data is likely to be used to make a decision that affects the person, or to be disclosed to another data fiduciary, the data fiduciary must ensure its completeness, accuracy and consistency. This is the nearest general rule to ask about when a tool scores, ranks or flags patients on the basis of records.',
    basis: 'DPDP Act 2023, section 8(3)',
    src: 'dpdp',
  },
  {
    id: 'dpdp-children',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'What changes when the patient is a child or a person with a lawful guardian?',
    a: 'A “child” is an individual under eighteen (section 2(f)). Before processing the personal data of a child, or of a person with a disability who has a lawful guardian, the data fiduciary must obtain verifiable consent of the parent or lawful guardian (section 9(1)). It must not process in a way likely to cause a detrimental effect on the child’s well-being, and must not track or behaviourally monitor children or direct targeted advertising at them (section 9(2) and 9(3)). Section 9(4) allows the government to exempt prescribed classes of data fiduciaries or purposes from 9(1) and 9(3).',
    basis: 'DPDP Act 2023, sections 2(f) and 9',
    src: 'dpdp',
  },
  {
    id: 'dpdp-grievance',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'What must a hospital provide so that patients can raise a complaint about their data?',
    a: 'It must establish an effective mechanism to redress the grievances of data principals (section 8(10)) and publish the business contact information of a Data Protection Officer, if applicable, or of a person who can answer questions about the processing (section 8(9)). The person’s own right to readily available grievance redressal is in section 13.',
    basis: 'DPDP Act 2023, sections 8(9), 8(10) and 13',
    src: 'dpdp',
  },
  {
    id: 'dpdp-significant',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'Can a hospital be treated as a “Significant Data Fiduciary”?',
    a: 'The Central Government may notify a data fiduciary, or a class of them, as a Significant Data Fiduciary on the basis of factors that include the volume and sensitivity of the personal data processed and the risk to the rights of data principals (section 10(1)). A Significant Data Fiduciary must appoint a Data Protection Officer (section 10(2)(a)) and has the further obligations listed in section 10. Whether any hospital or class of hospitals has been notified has to be checked in the Gazette; this site did not find or read such a notification.',
    basis: 'DPDP Act 2023, section 10',
    src: 'dpdp',
  },
  {
    id: 'dpdp-in-force',
    topic: 'Personal data (DPDP Act, 2023)',
    q: 'Is the DPDP Act in force, and from which date does each duty apply?',
    a: 'Section 1(2) says the Act comes into force on the date the Central Government appoints by notification in the Official Gazette, and that different dates may be appointed for different provisions. Many duties also depend on rules “as may be prescribed”. The Act’s text therefore does not tell you a start date. This site could not open the Ministry of Electronics and IT’s notifications and rules, so it does not state any date: check the notifications and the Rules before you plan around one.',
    basis: 'DPDP Act 2023, section 1(2)',
    src: 'dpdp',
  },

  // ── Security and breaches ────────────────────────────
  {
    id: 'dpdp-security-safeguards',
    topic: 'Security and breaches',
    q: 'What security does the Act require, and what is the penalty for failing?',
    a: 'A data fiduciary must protect personal data in its possession or under its control, including data processed by a data processor on its behalf, by taking reasonable security safeguards to prevent a personal data breach (section 8(5)). It must also implement appropriate technical and organisational measures to ensure effective observance of the Act (section 8(4)). In the Schedule, a breach of the section 8(5) obligation carries a penalty that may extend to two hundred and fifty crore rupees.',
    basis: 'DPDP Act 2023, sections 8(4) and 8(5), Schedule item 1',
    src: 'dpdp',
  },
  {
    id: 'dpdp-breach-intimation',
    topic: 'Security and breaches',
    q: 'Who must be told about a personal data breach?',
    a: 'In the event of a personal data breach, the data fiduciary must give the Data Protection Board and each affected data principal an intimation of the breach, in the form and manner prescribed (section 8(6)). A “personal data breach” is any unauthorised processing of personal data, or accidental disclosure, acquisition, sharing, use, alteration, destruction or loss of access to it, that compromises its confidentiality, integrity or availability (section 2(u)). In the Schedule, failing to give this notice carries a penalty that may extend to two hundred crore rupees. The deadline and format are left to the Rules, which this site could not open.',
    basis: 'DPDP Act 2023, sections 2(u) and 8(6), Schedule item 2',
    src: 'dpdp',
  },

  // ── Software as a medical device ─────────────────────
  {
    id: 'mdsw-what-counts',
    topic: 'Software as a medical device (CDSCO)',
    q: 'When is software regulated as a medical device in India?',
    a: 'CDSCO’s guidance applies to software that meets the definition of a “medical device” in the Medical Devices Rules, 2017, which it calls Medical Device Software (MDSW). It says mobile apps, AI/ML-based software and cloud or network-based software that meet that definition are considered MDSW, and that software which controls or adjusts a medical device is considered a medical device. Standalone software intended for a medical purpose is also covered. Software merely intended for general wellness or fitness tracking, with no medical purpose, is outside the document, and commercial off-the-shelf software with no medical purpose may not fall under the Rules. The guidance says it reflects current practice under the Rules and should not be misconstrued as a new regulatory control. It also says it is meant for public awareness and not for legal use; the statutory text is the Drugs and Cosmetics Act, 1940 and the Medical Devices Rules, 2017.',
    basis: 'CDSCO/MD/GD/MDSW/01/2026, sections 2.0 and 4',
    src: 'mdsw',
  },
  {
    id: 'mdsw-hospital-systems',
    topic: 'Software as a medical device (CDSCO)',
    q: 'Is a hospital information system a medical device?',
    a: 'Not necessarily. Among its practical illustrations of software that is not Medical Device Software (section 5.2), CDSCO lists hospital or clinical information systems that support patient data management and are intended only for patient admission, scheduling appointments or visits, insurance and billing, clinical communication such as voice or video calling, and storing and transferring patient information. It also lists general communication systems, and laboratory information systems whose main purpose is managing and validating information coming from analysers. What counts is the intended use stated by the manufacturer, so a system that adds a diagnostic or decision-support function is a different question.',
    basis: 'CDSCO/MD/GD/MDSW/01/2026, section 5.2',
    src: 'mdsw',
  },
  {
    id: 'mdsw-classes',
    topic: 'Software as a medical device (CDSCO)',
    q: 'How is the risk class of such software decided?',
    a: 'Rule 4 of the Medical Devices Rules, 2017 sets four classes for medical devices other than in vitro diagnostics: A low risk, B low moderate, C moderate high and D high risk, classified on the parameters in Part I of the First Schedule. The implementation rules in the Schedule say that software which drives a device or influences its use falls automatically in the same class as that device. CDSCO’s guidance adds that the risk class of Medical Device Software is fundamentally based on its intended use and the applicable rules in the First Schedule.',
    basis: 'Medical Devices Rules 2017, Rule 4 and First Schedule; CDSCO/MD/GD/MDSW/01/2026, section 7.0',
    src: 'mdr',
  },
  {
    id: 'mdsw-where-filed',
    topic: 'Software as a medical device (CDSCO)',
    q: 'Where do manufacturers and importers apply for permission for such software?',
    a: 'According to CDSCO’s guidance, applications for a test licence go through the National Single Window System (nsws.gov.in), and all other applications for permissions, licences or registration go through the Online System for Medical Devices (cdscomdonline.gov.in). For a hospital, the practical use of this is to ask a vendor which licence or permission it holds for the specific software and intended use, and to ask to see it.',
    basis: 'CDSCO/MD/GD/MDSW/01/2026, section 3.0',
    src: 'mdsw',
  },
  {
    id: 'mdsw-algorithm-change',
    topic: 'Software as a medical device (CDSCO)',
    q: 'What does CDSCO say about updating an AI model after approval?',
    a: 'The guidance says an Algorithm Change Protocol (ACP) “may be devised, wherever applicable”, based on the nature and risks of the software, setting out the procedures that keep changes from compromising its safety and intended use. It may contain a data management plan; a performance evaluation and monitoring plan with metrics, statistical analysis plan, assessment frequency, performance targets and a post-market monitoring overview; an algorithm retraining plan; a software update plan covering version tracking, verification and validation, update triggers and transparently communicating updates to end users; and a rollback plan with triggers, backup and recovery procedures and communication to users. The guidance also asks for risk documentation that includes cybersecurity risks and AI bias risks, and treats unintended bias in clinical decision-making caused by a software output as a possible indirect harm.',
    basis: 'CDSCO/MD/GD/MDSW/01/2026, Algorithm Change Protocol (p. 43)',
    src: 'mdsw',
  },

  // ── Ethics guidance (ICMR) ───────────────────────────
  {
    id: 'icmr-principles',
    topic: 'Ethics guidance for AI (ICMR)',
    q: 'Which principles does ICMR list for AI in healthcare?',
    a: 'Section 1 of ICMR’s 2023 guidelines lists ten principles: autonomy; safety and risk minimization; trustworthiness; data privacy; accountability and liability; optimization of data quality; accessibility, equity and inclusiveness; collaboration; non-discrimination and fairness; and validity. Section 2 then gives guiding principles for the development, validation and clinical deployment phases, section 3 covers ethical review, section 4 informed consent and section 5 governance, and the document ends with an ethics checklist.',
    basis: 'ICMR Ethical Guidelines for AI in Biomedical Research and Healthcare (2023), Sections 1–5',
    src: 'icmr',
  },
  {
    id: 'icmr-hospital-management',
    topic: 'Ethics guidance for AI (ICMR)',
    q: 'Does the ICMR guidance mention AI for hospital administration?',
    a: 'Yes. The introduction describes medical AI software for hospital management systems, for example support for in-patient and out-patient scheduling and for coordination between departments, with alerts when particular areas are under stress. The same guidelines state their own ethical concerns for AI in health: algorithmic transparency and explainability, clarity on liability, accountability and oversight, and bias and discrimination.',
    basis: 'ICMR Ethical Guidelines for AI in Biomedical Research and Healthcare (2023), Foreword and Introduction',
    src: 'icmr',
  },
];
