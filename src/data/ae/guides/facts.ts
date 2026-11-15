// Key facts for citation — data for /ae/facts/ and /ae/llms-full.txt (2026-11-15)
//
// Each item = one question, a short answer, the section it rests on, and a primary source. Everything was written after the text was
// actually opened: the Abu Dhabi DoH Policy on Use of AI (2018), the Dubai Health Authority policy on AI in the healthcare (2021), the DoH
// Policy on the Health Information Exchange (2020), the DoH standards on digital products governance, data access, data sharing and
// interoperability, data storage and retention, analytics and reporting, and medical device reporting, and the DoH medical device
// cybersecurity guideline. The two federal laws are described only as the UAE Government portal (u.ae) describes them.
// Do not add items from news or assumptions; do not write numbers or deadlines that are not in the text.
// Not covered because the primary text was not read: the text of Federal Law No. 2 of 2019 and Federal Decree-Law No. 45 of 2021 themselves
// (the federal legislation portal refused automated requests), Ministry of Health and Prevention rules on medical device registration,
// the Abu Dhabi ADHICS standard and the Dubai NABIDH policy.
import { SRC } from './milestones';

export const FACTS_CHECKED = 'November 15, 2026';

export const FACT_TOPICS = [
  'AI policies (Abu Dhabi DoH and Dubai DHA)',
  'Digital products and health data (Abu Dhabi DoH)',
  'Medical devices and cybersecurity (Abu Dhabi DoH)',
  'Health information exchange and breaches',
] as const;

export type FactTopic = (typeof FACT_TOPICS)[number];

export type Fact = {
  id: string;
  topic: FactTopic;
  q: string;
  a: string;
  /** Short basis, e.g. "Policy/AI/0.9, section 5.3" */
  basis: string;
  src: keyof typeof SRC;
};

export const FACTS: Fact[] = [
  // ── AI policies ──────────────────────────────────────
  {
    id: 'doh-ai-scope',
    topic: 'AI policies (Abu Dhabi DoH and Dubai DHA)',
    q: 'Who has to follow Abu Dhabi’s AI policy for healthcare?',
    a: 'The Department of Health’s policy applies to DoH-licensed healthcare providers, UAE-based pharmaceutical manufacturers, healthcare insurers, licensed researchers involved in human research, and every local, national or locally based international end-user that uses Abu Dhabi population or patient clinical and non-clinical data in AI work, directly or indirectly. The document is version 0.9, dated 30 April 2018, and its effective date is the date of publication.',
    basis: 'Policy/AI/0.9, cover page and section 4',
    src: 'dohAi',
  },
  {
    id: 'doh-ai-principles',
    topic: 'AI policies (Abu Dhabi DoH and Dubai DHA)',
    q: 'What are the six guiding principles in the DoH policy on AI?',
    a: 'Transparency (AI software should be verifiable and explainable), user assistance or supportive technology (AI gives probability-based suggestions and humans decide), safety and security, privacy, ethics (human dignity and autonomy), and accountability of researchers and developers to users. The policy defines supportive technology as technology that assists a human decision and does not replace it, so a human makes the final decision and is responsible for the action taken.',
    basis: 'Policy/AI/0.9, sections 2 and 5.3',
    src: 'dohAi',
  },
  {
    id: 'doh-ai-minimum',
    topic: 'AI policies (Abu Dhabi DoH and Dubai DHA)',
    q: 'What minimum requirements does DoH set for AI tools used in Abu Dhabi healthcare?',
    a: 'AI tools should be robust and responsive, shown by certification of the software and of upgraded major versions from recognised international agencies, compliance with ADSSSA regulations and auditable validation statements. They should have “graceful degradation” (automatic alerts and gradual cessation if hardware or software malfunctions), go through repeated improvement cycles based on end-user feedback sent to the DoH Drug and Medical Products Regulation Department and the manufacturer, be subject to audits, and comply with DoH’s Health Information Exchange policy.',
    basis: 'Policy/AI/0.9, section 7.1.2',
    src: 'dohAi',
  },
  {
    id: 'doh-ai-end-users',
    topic: 'AI policies (Abu Dhabi DoH and Dubai DHA)',
    q: 'What must a hospital that uses AI do under the DoH policy?',
    a: 'Healthcare end-users other than patients should have clear governance on AI use, state where AI enters the process and what the role of the physician or practitioner is, set boundaries on access to and sharing of patient information, educate everyone involved including patients, audit AI functionality regularly and report to DoH as needed, and comply with national and DoH rules on e-health, health information exchange, data protection and information security. They must also report all known or suspected AI incidents or deficiencies, and any implementation issue that could affect patient safety.',
    basis: 'Policy/AI/0.9, sections 7.2, 9.2 and 9.3',
    src: 'dohAi',
  },
  {
    id: 'dha-ai-scope',
    topic: 'AI policies (Abu Dhabi DoH and Dubai DHA)',
    q: 'Does Dubai have its own AI policy for healthcare?',
    a: 'Yes. The Dubai Health Authority’s policy “Artificial Intelligence in the Healthcare” (DHA/HISHD/PP-09) applies to DHA-licensed facilities and professionals that use AI, to national and locally based international AI developers that use Dubai data, and to UAE-based pharmaceutical manufacturers, health insurers, public health entities and researchers using AI in Dubai. Its control table lists an issue date of 1 July 2021, an effective date of 1 October 2021 and a revision date of 1 July 2026, so check DHA for a newer version.',
    basis: 'DHA/HISHD/PP-09, cover page and sections 1 and 2',
    src: 'dhaAi',
  },
  {
    id: 'dha-ai-disclosure',
    topic: 'AI policies (Abu Dhabi DoH and Dubai DHA)',
    q: 'What must a vendor disclose about an AI solution under the Dubai policy, and who validates it?',
    a: 'The disclosure must say which functions are AI-enabled, how the solution was validated, which data sets were or must be used, the expected outcomes, the healthcare professional’s role in the final decision, the type of algorithm, the ethical examination of how data is used, how performance must be validated, how the solution is integrated into care, and the limits of the data and algorithms. All AI solutions for healthcare must also go through independent validation by a competent third party.',
    basis: 'DHA/HISHD/PP-09, sections 4.3.2 and 4.3.3',
    src: 'dhaAi',
  },
  {
    id: 'dha-ai-oversight',
    topic: 'AI policies (Abu Dhabi DoH and Dubai DHA)',
    q: 'What oversight does the Dubai policy require once an AI tool is in use?',
    a: 'AI solutions with a significant effect on people’s lives must be designed so that designated end users can override them or reverse their decisions, and they must have built-in appeals procedures. Performance must be monitored in clinical practice and actual outcomes compared with those from training and validation, with significant gaps leading to further inspection. End users must report incidents and patient-safety issues to DHA’s Health Regulation Sector and have AI functionality audited regularly by an independent third party.',
    basis: 'DHA/HISHD/PP-09, sections 4.2.3, 4.4.2, 4.6.11, 4.8.1, 4.8.2 and 4.8.5',
    src: 'dhaAi',
  },
  // ── Digital products and health data ─────────────────
  {
    id: 'dpgs-scope',
    topic: 'Digital products and health data (Abu Dhabi DoH)',
    q: 'Does the DoH digital products standard cover AI tools?',
    a: 'Yes. It defines digital products as systems, applications, collaborative platforms, electronic health records, telemedicine and wearable devices powered by technologies such as robotics, IoT, 5G, blockchain, artificial intelligence, augmented reality and virtual reality, and it applies to all DoH stakeholders that develop and manage digital products. The standard was published in March 2026 and takes effect in August 2026.',
    basis: 'DoH/ST/DHS/DPGS/V1/26, cover page and section 2.6',
    src: 'dpgs',
  },
  {
    id: 'dpgs-roles',
    topic: 'Digital products and health data (Abu Dhabi DoH)',
    q: 'Who must be named for each digital product in Abu Dhabi healthcare?',
    a: 'Each digital product needs at least a Digital Product Owner and a Digital Product Architect (or equivalents), who may be dedicated roles or added to existing duties. Before any digital product starts, a feasibility study and risk assessment must be done, and products that DoH requires to be reviewed follow the DoH ADHTAC approval and the web and mobile application approval.',
    basis: 'DoH/ST/DHS/DPGS/V1/26, sections 3.2.3.2 and 3.2.4.1',
    src: 'dpgs',
  },
  {
    id: 'dpgs-risk-tiers',
    topic: 'Digital products and health data (Abu Dhabi DoH)',
    q: 'How does the DoH standard sort digital products by risk?',
    a: 'Very high risk products must be prohibited from deployment. High risk products must undergo conformity assessments before and after deployment, in coordination with the DoH Data and Digital Governance Office. Medium risk products are subject to governance policies, standards and risk reporting. Low and very low risk products are exempt from formal risk reporting but must be monitored for the effectiveness of their controls. Risk assessments must be documented in a risk register with defined ownership.',
    basis: 'DoH/ST/DHS/DPGS/V1/26, sections 3.2.8.2.1 and 3.2.8.2.2',
    src: 'dpgs',
  },
  {
    id: 'dpgs-privacy',
    topic: 'Digital products and health data (Abu Dhabi DoH)',
    q: 'What privacy steps does the standard require of a patient-facing digital product?',
    a: 'A privacy policy, a privacy notice shown at registration or before download with affirmative consent such as an “I Agree” box, a separate affirmative consent for sharing data for a specific purpose that names the recipients and purposes, published procedures for security incidents and breaches, instructions to opt out or withdraw consent, and records of consents. Products developed by or owned by DoH, or marked for government use, must integrate UAE Pass for authentication.',
    basis: 'DoH/ST/DHS/DPGS/V1/26, section 3.2.6',
    src: 'dpgs',
  },
  {
    id: 'data-localization',
    topic: 'Digital products and health data (Abu Dhabi DoH)',
    q: 'Can an Abu Dhabi hospital store or process health data with a cloud provider outside the UAE?',
    a: 'Not without DoH’s authorisation. The Data Access Standard says no storage, replication or transfer of healthcare data outside the UAE may occur without explicit DoH authorisation, that remote access from outside the UAE is permitted only in exceptional circumstances with prior written approval, and that entities using external or cloud providers must keep data residency within the UAE with contractual and technical safeguards against cross-border transfer or access. The data sharing standard adds that data labelled under the classification standard must not be transferred, stored, shared, processed or disseminated outside the UAE unless DoH issues a valid and specific exemption.',
    basis: 'Data Access Standard, section 3.2.1.2; Data Sharing, Integration and Interoperability Standard, section 2.1.8',
    src: 'dataAccess',
  },
  {
    id: 'data-retention',
    topic: 'Digital products and health data (Abu Dhabi DoH)',
    q: 'How long must Abu Dhabi healthcare entities keep health data?',
    a: 'The DoH Data Storage and Retention Standard says the minimum retention period for health data is 25 years, “as mandated by UAE Federal Law No. 2, 2019”, and that data should otherwise be retained only as long as necessary, with periods defined and documented by DoH’s Data and Digital Governance Office.',
    basis: 'DoH/ST/DGGO/DSR/V1/2025, section 3.2.2.1',
    src: 'retention',
  },
  {
    id: 'secondary-use',
    topic: 'Digital products and health data (Abu Dhabi DoH)',
    q: 'May patient data be reused for analytics or AI development?',
    a: 'The Analytics and Reporting Standard says patient data used for secondary purposes must be anonymised or de-identified unless the patient explicitly permits otherwise or the law requires it, and it requires explicit informed consent before secondary use. Patients may withdraw consent at any time without any effect on their care. Secondary use to deny or limit insurance, employment or other essential services is prohibited, secondary use of personally identifiable data for commercial gain without explicit consent is prohibited, and attempts to re-identify anonymised data are prohibited.',
    basis: 'DoH/ST/DDGO/AR/V1/2026, sections 3.2.6.2 and 3.2.6.3',
    src: 'analytics',
  },
  {
    id: 'federal-laws',
    topic: 'Digital products and health data (Abu Dhabi DoH)',
    q: 'Which federal laws does the UAE Government portal point to for health data?',
    a: 'Federal Law No. 2 of 2019 regulates the use of information and communication technology in health fields, including in free zones, and requires providers to keep health data confidential, to ensure its validity and protect it from unauthorised change, and to ensure its availability to authorised parties. Federal Decree-Law No. 45 of 2021, the Personal Data Protection Law, came into force on 2 January 2022 and bans processing personal data without the owner’s consent except in listed cases. This site has not read the laws’ own text.',
    basis: 'u.ae pages on ICT in the health sector and on data protection laws',
    src: 'uaeIct',
  },
  // ── Medical devices and cybersecurity ────────────────
  {
    id: 'mdr-clocks',
    topic: 'Medical devices and cybersecurity (Abu Dhabi DoH)',
    q: 'How fast must a medical device incident, including one involving AI software, be reported in Abu Dhabi?',
    a: 'For deaths, serious injuries and malfunctions, and events that need remedial action to prevent an unreasonable risk of substantial harm to public health, the standard says report as soon as possible from the date of awareness and not later than five days; reporting may start as an initial report if follow-up reports come within 15 days. Other reports, such as use errors, product quality issues and therapeutic failures, are due within 90 days of receiving the related reports, when the reporting is in the form of complete reports.',
    basis: 'DoH/ST/HLS/SMDR/V2/26, section 3.1',
    src: 'mdr',
  },
  {
    id: 'mdr-who-how',
    topic: 'Medical devices and cybersecurity (Abu Dhabi DoH)',
    q: 'Who reports and through which channel under the DoH medical device reporting standard?',
    a: 'Healthcare facilities and professionals, and manufacturers, marketing authorisation holders, importers, authorised agents, distributors and anyone who places a device on the market. Facilities and professionals with access to the Malaffi platform must use it as the primary method; those without access, or during downtime, use the online fillable PDF form. Manufacturers and others who place devices on the market must submit, within 15 days after receipt, required information on deaths, serious injuries and malfunctions that was not available when the initial report was filed. The standard was published in July 2026 and takes effect in October 2026.',
    basis: 'DoH/ST/HLS/SMDR/V2/26, cover page, sections 3.1, 3.2.3 and 3.3.1',
    src: 'mdr',
  },
  {
    id: 'cyber-scope',
    topic: 'Medical devices and cybersecurity (Abu Dhabi DoH)',
    q: 'Does the DoH medical device cybersecurity guideline cover software?',
    a: 'Yes. It covers standalone medical device software (for example diagnostic or therapeutic applications) and software embedded in hardware such as MRI machines, infusion pumps and ventilators, and it applies to implantable, mobile, software-only and network-connected devices. It applies to healthcare facilities, providers, IT departments, biomedical and clinical engineers, distributors and vendors, and manufacturers. It was published in November 2026 and takes effect in January 2027.',
    basis: 'DOH/GL/0000002397/24, cover page and section 1.1',
    src: 'cyber',
  },
  {
    id: 'cyber-report',
    topic: 'Medical devices and cybersecurity (Abu Dhabi DoH)',
    q: 'Who gets the call when a connected medical device is attacked or found vulnerable?',
    a: 'For any cybersecurity information or incident involving the Internet of Medical Things, including vulnerabilities or breaches, a healthcare entity must report to the Abu Dhabi Healthcare Cybersecurity Emergency Response Team (ADHCCERT) immediately upon discovery and without delay. Adverse events related to medical devices, including those linked to software or patch updates, go without delay to the DoH Pharmacovigilance team under the medical device reporting standard.',
    basis: 'DOH/GL/0000002397/24, sections 3.5 and 3.6',
    src: 'cyber',
  },
  {
    id: 'cyber-vendors-hta',
    topic: 'Medical devices and cybersecurity (Abu Dhabi DoH)',
    q: 'What must manufacturers and vendors provide, and what review does a new device need?',
    a: 'Manufacturers, distributors and vendors are required to integrate security-by-design, conduct pre- and post-market cybersecurity risk assessments, provide transparent documentation including Manufacturer Disclosure Statements for Medical Device Security (MDS2), deliver timely updates and patches, keep clear channels for security alerts and recalls, and secure the supply chain. Any new medical device, or an existing one with cybersecurity considerations, intended for use in Abu Dhabi healthcare facilities must be evaluated by DoH’s Health Technology Assessment department before implementation.',
    basis: 'DOH/GL/0000002397/24, section 3.6',
    src: 'cyber',
  },
  {
    id: 'cyber-inventory',
    topic: 'Medical devices and cybersecurity (Abu Dhabi DoH)',
    q: 'What basic practices does the guideline ask hospitals to put in place?',
    a: 'Keep an inventory of all medical devices with software and firmware versions, operating system, IP and MAC addresses and network configuration, assess threats and vulnerabilities with the STRIDE method, segment networks, apply software updates and patches promptly, keep backup and recovery plans, run incident response plans with drills, and handle decommissioning securely including data wiping or physical destruction.',
    basis: 'DOH/GL/0000002397/24, section 3.4',
    src: 'cyber',
  },
  // ── Health information exchange and breaches ─────────
  {
    id: 'hie-consent',
    topic: 'Health information exchange and breaches',
    q: 'Does a patient have to consent before a hospital shares data through Abu Dhabi’s health information exchange?',
    a: 'DoH requires healthcare facilities to seek patient consent for sharing patient data through the exchange, to build it into their standard consent forms, and to tell patients that sharing relevant health information with the exchange is part of their treatment. Where consent is unavailable for any reason, for example for legacy data, DoH requires and authorises facilities to share and receive the data as set out in DoH’s instructions. The policy took effect on 16 April 2020.',
    basis: 'DOH/POL/STR/HIE/1.1/2020, sections 4.2.1.2 and 4.2.2',
    src: 'hie',
  },
  {
    id: 'hie-breach',
    topic: 'Health information exchange and breaches',
    q: 'What deadlines does the health information exchange policy set for a breach?',
    a: 'Affected patients must be notified without undue delay and in no event later than 60 days from discovery, and the clause on the exchange’s duties says DoH must be notified as soon as reasonably practicable after a breach is determined, and in any event within 5 business days. The same clause has the exchange develop internal breach procedures, investigate root causes and set preventive plans, and it holds the exchange responsible for unauthorised disclosure by its own staff.',
    basis: 'DOH/POL/STR/HIE/1.1/2020, section 4.3.17',
    src: 'hie',
  },
];
