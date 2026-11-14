// Key facts for citation — data for /sg/facts/ and /sg/llms-full.txt (2026-11-14)
//
// Each item = one question, a short answer, the section it rests on, and a primary source. Everything was written after the
// text was actually opened: HSA's GL-04-R4, GL-07-R2 and GN-37-R1, the Ministry of Health's AIHGle 2.0 and the PDPC's
// Guide on Managing and Notifying Data Breaches (revised 15 March 2021).
// Do not add items from news or assumptions; do not write numbers or deadlines that are not in the text.
// Not covered because the primary text was not read: the Personal Data Protection Act 2012 itself and the PDPC's AI advisory
// guidelines (Singapore Statutes Online refused automated requests), the Healthcare Services Act 2020, the Health Information
// Bill, and HSA's cybersecurity guide GL-10.
import { SRC } from './milestones';

export const FACTS_CHECKED = 'November 14, 2026';

export const FACT_TOPICS = [
  'Software as a medical device (HSA)',
  'Hospital AI governance (MOH AIHGle 2.0)',
  'Generative AI',
  'Data breaches (PDPC)',
] as const;

export type FactTopic = (typeof FACT_TOPICS)[number];

export type Fact = {
  id: string;
  topic: FactTopic;
  q: string;
  a: string;
  /** Short basis, e.g. "GL-04-R4, section 1.3" */
  basis: string;
  src: keyof typeof SRC;
};

export const FACTS: Fact[] = [
  // ── Software as a medical device ─────────────────────
  {
    id: 'hsa-scope-software',
    topic: 'Software as a medical device (HSA)',
    q: 'When is software a medical device in Singapore?',
    a: 'HSA’s guidelines apply to software whose intended use meets the definition of a medical device under the Health Products Act 2007. That includes software intended for medical purposes such as investigating, detecting, diagnosing, monitoring, treating or managing a medical condition, disease, anatomy or physiological process. The intended use comes from the specifications, instructions and information the product owner provides.',
    basis: 'GL-04-R4, section 1.3; GL-07-R2, definitions',
    src: 'gl04',
  },
  {
    id: 'hsa-registration-classes',
    topic: 'Software as a medical device (HSA)',
    q: 'Which classes of software medical device need product registration?',
    a: 'GL-04-R4 states that Class B, C and D software medical devices require product registration in all the supply scenarios it lists. Software medical devices of every risk class, including Class A, must be safe and perform as intended throughout their life cycle.',
    basis: 'GL-04-R4, section 3.1 and Table 5 note',
    src: 'gl04',
  },
  {
    id: 'hsa-risk-classification',
    topic: 'Software as a medical device (HSA)',
    q: 'How does HSA decide the risk class of a standalone software medical device?',
    a: 'GL-07-R2 follows the IMDRF framework. It looks at how significant the software’s information is for care (treat or diagnose, drive clinical management, or inform clinical management) and at the state of the patient’s situation (critical, serious or non-serious). Its table gives Class C for software that treats or diagnoses in a critical or serious situation, and Class A for software that informs management in a serious or non-serious situation. Software that analyses a vital physiological process or anatomical structure images to drive clinical management is Class B.',
    basis: 'GL-07-R2, risk classification framework and table',
    src: 'gl07',
  },
  {
    id: 'hsa-ml-qms',
    topic: 'Software as a medical device (HSA)',
    q: 'What does HSA expect of a machine-learning-enabled medical device?',
    a: 'All activities from design and training to validation, retraining and deployment must be managed under an ISO 13485-based quality management system. Registration should include a description of the ML feature and the model, its inputs and outputs, the clinical workflow including any human intervention, and the risks and limitations of the ML function. Users must be told that the device contains ML.',
    basis: 'GL-04-R4, section 9.1',
    src: 'gl04',
  },
  {
    id: 'hsa-continuous-learning',
    topic: 'Software as a medical device (HSA)',
    q: 'What is expected when a medical device keeps learning after deployment?',
    a: 'The manufacturer must define the learning process and put process controls in place. GL-04-R4 lists, non-exhaustively, a description of the continuous learning process, a built-in safety mechanism that can detect anomalies and roll back to a previous algorithm version, controls on the data used for learning, software version control, and traceability between real-world data, learning process, software version and clinical output.',
    basis: 'GL-04-R4, section 9.2',
    src: 'gl04',
  },
  {
    id: 'hsa-change-notification',
    topic: 'Software as a medical device (HSA)',
    q: 'Does a vendor have to notify HSA when it changes a registered AI model?',
    a: 'GL-04-R4 says a change notification is required for any change made to a registered machine-learning-enabled medical device, and that the category of the change (technical, review or notification) follows GN-21. For software in general it lists technical review for Class C and D, review for Class B, and notification for Class B, C and D, depending on the change.',
    basis: 'GL-04-R4, sections 5 and 9.4',
    src: 'gl04',
  },
  {
    id: 'hsa-cmp',
    topic: 'Software as a medical device (HSA)',
    q: 'What is HSA’s Change Management Program for SaMD?',
    a: 'It is an optional pathway, built into HSA’s existing registration and change notification processes, that lets a manufacturer have anticipated “pre-specified changes” approved in advance. GN-37 (revision 1, December 2024) applies to SaMD including machine-learning enabled SaMD but notes that it does not include continuous learning and generative AI. It relies on conformity with ISO 13485 and IEC 62304.',
    basis: 'GN-37-R1, sections 1 and 1.3',
    src: 'gn37',
  },
  {
    id: 'hsa-postmarket-mlmd',
    topic: 'Software as a medical device (HSA)',
    q: 'Who monitors the real-world performance of a registered AI medical device?',
    a: 'GL-04-R4 says companies must monitor the real-world performance of all registered machine-learning-enabled medical devices after deployment, and that developers and distributors should set up processes with the implementers and users to ensure traceability. A hospital that uses such a device is therefore part of the monitoring loop.',
    basis: 'GL-04-R4, section 9.3',
    src: 'gl04',
  },
  // ── Hospital AI governance ───────────────────────────
  {
    id: 'aihgle-governance',
    topic: 'Hospital AI governance (MOH AIHGle 2.0)',
    q: 'What should a hospital’s AI governance platform do?',
    a: 'AIHGle 2.0 says organisations should set up internal governance platforms that assess and approve AI solutions (including that they are fit for purpose and perform at least as well as current standard processes), keep a registry of every deployed AI solution with its risk classification, give guidance on safe deployment, and ensure that AI deployment meets cybersecurity and data protection requirements, including which data types may be input for each solution.',
    basis: 'AIHGle 2.0, section 6.1.1',
    src: 'aihgle',
  },
  {
    id: 'aihgle-three-functions',
    topic: 'Hospital AI governance (MOH AIHGle 2.0)',
    q: 'Who inside a hospital should do what in AI governance?',
    a: 'AIHGle 2.0 recommends keeping three distinct functions, which existing units may take on: a governance platform, a unit for day-to-day implementation, monitoring and enforcement, and a unit that checks and audits compliance. It also recommends that the governance platform has clinical, operational, technical and legal knowledge, with multi-disciplinary representatives where feasible.',
    basis: 'AIHGle 2.0, sections 6.1.2 and 6.1.3',
    src: 'aihgle',
  },
  {
    id: 'aihgle-buy-build',
    topic: 'Hospital AI governance (MOH AIHGle 2.0)',
    q: 'Does a hospital that builds or co-develops an AI tool take on developer duties?',
    a: 'Yes. AIHGle 2.0 says that whether an organisation buys, builds or co-develops an AI solution, it should ensure the solution meets prevailing regulatory requirements, for example that AI medical devices are registered with HSA under the Health Products Act. The “build” and “co-develop” routes mean the organisation takes on all or some of a developer’s responsibilities.',
    basis: 'AIHGle 2.0, section 6.1.4',
    src: 'aihgle',
  },
  {
    id: 'aihgle-risk-human-oversight',
    topic: 'Hospital AI governance (MOH AIHGle 2.0)',
    q: 'How does AIHGle 2.0 link risk to human oversight?',
    a: 'Organisations should adopt a risk-based approach that considers the potential harm to the patient and the probability of that harm. Its illustrative table distinguishes human-in-the-loop, human-over-the-loop and human-out-of-the-loop, and clinical from clinical-ops use. For clinical use it says deployers should not deploy AI solutions that make clinical decisions independently without a human making the final decision.',
    basis: 'AIHGle 2.0, section 6.2 and Table 4',
    src: 'aihgle',
  },
  {
    id: 'aihgle-pre-deployment',
    topic: 'Hospital AI governance (MOH AIHGle 2.0)',
    q: 'What testing should a hospital do before going live with an AI tool?',
    a: 'AIHGle 2.0 says the implementing organisation usually performs testing and validation in its own context and workflows, and for higher-risk solutions may consider a pilot phase with a smaller patient population. It mentions toolkits such as the AI Verify testing framework, and says organisations should also measure clinical outcomes and at minimum ensure that professionals and patients benefit from or maintain current care standards.',
    basis: 'AIHGle 2.0, sections 6.3.1 to 6.3.3',
    src: 'aihgle',
  },
  {
    id: 'aihgle-training-monitoring',
    topic: 'Hospital AI governance (MOH AIHGle 2.0)',
    q: 'What does AIHGle 2.0 say about staff training and monitoring after deployment?',
    a: 'Training should cover roles and responsibilities, workflow integration, contingency plans, AI limitations, output interpretation, patient communication, data input restrictions and incident reporting, and staff should be re-trained after significant updates. Monitoring should check that performance is at least equivalent to current practice, with user feedback channels, reporting timelines and indicators such as model drift.',
    basis: 'AIHGle 2.0, sections 6.5.2 and 6.6.2',
    src: 'aihgle',
  },
  {
    id: 'aihgle-adverse-events',
    topic: 'Hospital AI governance (MOH AIHGle 2.0)',
    q: 'Which authorities does AIHGle 2.0 name for reporting AI-related incidents?',
    a: 'It tells organisations to set up internal reporting and to abide by existing frameworks: data-related incidents go to the PDPC, adverse events from the use of medical devices to HSA, and critical cybersecurity incidents to the Cyber Security Agency of Singapore. Contingency plans should include shutting down the AI solution and switching to a protocol that does not involve it.',
    basis: 'AIHGle 2.0, section 6.7.1 and footnotes 24 to 26',
    src: 'aihgle',
  },
  // ── Generative AI ────────────────────────────────────
  {
    id: 'aihgle-genai-risks',
    topic: 'Generative AI',
    q: 'Which generative AI risks does AIHGle 2.0 call out?',
    a: 'Four: hallucination, undesirable content, data disclosure (a model could leak sensitive data that users submit), and vulnerability to adversarial prompts.',
    basis: 'AIHGle 2.0, section 8.2.1',
    src: 'aihgle',
  },
  {
    id: 'aihgle-genai-deployers',
    topic: 'Generative AI',
    q: 'What should hospitals do when they deploy generative AI?',
    a: 'AIHGle 2.0 says deployers should design workflows that support fact-checking of outputs, train healthcare professionals on responsible use including redlines, support patient communication about generative AI, and where possible provide clear front-end labels showing where content is generated by AI. Users should keep clinical judgment as the primary decision-making tool.',
    basis: 'AIHGle 2.0, section 8.2.2(d) and (e)',
    src: 'aihgle',
  },
  // ── Data breaches ────────────────────────────────────
  {
    id: 'pdpc-breach-timeline',
    topic: 'Data breaches (PDPC)',
    q: 'How fast must an organisation assess and report a data breach to the PDPC?',
    a: 'Once an organisation has credible grounds to believe a data breach has occurred, it must take reasonable and expeditious steps to assess within 30 calendar days whether the breach is notifiable. After it determines that the breach is notifiable, it must notify the PDPC within 3 calendar days. The assessment steps must be documented.',
    basis: 'PDPC breach guide (revised 15 March 2021), Part III and annex D flowchart',
    src: 'pdpcBreach',
  },
  {
    id: 'pdpc-breach-scale',
    topic: 'Data breaches (PDPC)',
    q: 'When is a breach of “significant scale”?',
    a: 'The PDPC’s guide says a breach that involves the personal data of 500 or more individuals meets the criteria of significant scale, and the organisation must notify the PDPC even if no prescribed personal data is involved. If the exact number is unknown, it should notify when it has reason to believe at least 500 individuals are affected. A breach that is likely to cause significant harm to affected individuals is notifiable on that ground.',
    basis: 'PDPC breach guide (revised 15 March 2021), Part III',
    src: 'pdpcBreach',
  },
];
