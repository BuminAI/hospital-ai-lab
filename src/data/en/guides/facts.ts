// Key facts for citation — data for /en/facts/ and /en/llms-full.txt (2026-11-06)
//
// Each item = one question, a short answer, the section it rests on, and a primary source. Everything was written
// after the text was actually opened (eCFR current text as of 2026-11-03, Federal Register, FDA pages).
// Do not add items from news or assumptions; do not write numbers or deadlines that are not in the text.
// When a rule changes, reread the text and update FACTS_CHECKED.
import { SRC } from './milestones';

export const FACTS_CHECKED = 'November 6, 2026';

export const FACT_TOPICS = [
  'Patient privacy (HIPAA Privacy Rule)',
  'Breach notification',
  'Security Rule',
  'Business associates and AI vendors',
  'Records, access and information blocking',
  'FDA and AI-enabled devices',
  'Nondiscrimination and oversight',
] as const;

export type FactTopic = (typeof FACT_TOPICS)[number];

export type Fact = {
  id: string;
  topic: FactTopic;
  q: string;
  a: string;
  /** Short basis, e.g. "45 CFR 164.404(b)" */
  basis: string;
  src: keyof typeof SRC;
};

export const FACTS: Fact[] = [
  // ── Patient privacy ──────────────────────────────────
  {
    id: 'tpo-without-authorization',
    topic: 'Patient privacy (HIPAA Privacy Rule)',
    q: 'Can a hospital use patient information for treatment, payment and health care operations without the patient’s authorization?',
    a: 'Yes, a covered entity may use or disclose protected health information for its own treatment, payment or health care operations, if the use is consistent with the other requirements of the subpart. Uses that need an authorization under § 164.508(a)(2) through (4) are excluded. Whether a particular AI project counts as “health care operations” is a question for your privacy officer, not something this rule answers by itself.',
    basis: '45 CFR 164.506(a), (c)(1)',
    src: 'tpo506',
  },
  {
    id: 'minimum-necessary',
    topic: 'Patient privacy (HIPAA Privacy Rule)',
    q: 'What is the “minimum necessary” rule?',
    a: 'When using or disclosing protected health information, or requesting it from another covered entity or business associate, a covered entity or business associate must make reasonable efforts to limit the information to the minimum necessary to accomplish the intended purpose. Section 164.502(b)(2) lists exceptions, so read the full paragraph before relying on this.',
    basis: '45 CFR 164.502(b)',
    src: 'baa502',
  },
  {
    id: 'authorization-marketing-sale',
    topic: 'Patient privacy (HIPAA Privacy Rule)',
    q: 'When does HIPAA require a patient’s authorization even though the use looks routine?',
    a: 'A covered entity must obtain an authorization for any use or disclosure of protected health information for marketing (with the exception stated in § 164.508(a)(3)(i)) and for any disclosure that is a sale of protected health information (with the exceptions in § 164.508(a)(4)). Handing patient data to an AI vendor in exchange for payment or other value is therefore a point to check against these paragraphs.',
    basis: '45 CFR 164.508(a)(3), (a)(4)',
    src: 'auth508',
  },
  {
    id: 'deidentification-two-ways',
    topic: 'Patient privacy (HIPAA Privacy Rule)',
    q: 'What are the two ways to de-identify health information under HIPAA?',
    a: 'Expert determination: a person with appropriate statistical and scientific knowledge finds that the risk is very small that the information could be used, alone or with other reasonably available information, to identify an individual, and documents the methods and results. Safe harbor: the listed identifiers of the individual and of relatives, employers or household members are removed, and the covered entity has no actual knowledge that the information could identify an individual.',
    basis: '45 CFR 164.514(b)(1), (b)(2)',
    src: 'deid514',
  },
  {
    id: 'workforce-training',
    topic: 'Patient privacy (HIPAA Privacy Rule)',
    q: 'Does HIPAA require staff training?',
    a: 'Yes. A covered entity must train all members of its workforce on its policies and procedures for protected health information, as necessary and appropriate for them to carry out their functions, and must document that the training was provided. This applies to staff who use AI tools too.',
    basis: '45 CFR 164.530(b)',
    src: 'train530',
  },

  // ── Breach notification ──────────────────────────────
  {
    id: 'breach-presumption',
    topic: 'Breach notification',
    q: 'When is an impermissible use or disclosure treated as a breach?',
    a: 'A use or disclosure not permitted by the Privacy Rule is presumed to be a breach unless the covered entity or business associate demonstrates a low probability that the information has been compromised, based on a risk assessment of at least four factors: the nature and extent of the information, the unauthorized person who used it or received it, whether it was actually acquired or viewed, and the extent to which the risk has been mitigated. Three narrow exclusions are listed in the definition.',
    basis: '45 CFR 164.402',
    src: 'breach402',
  },
  {
    id: 'breach-60-days',
    topic: 'Breach notification',
    q: 'How fast must a hospital notify patients of a breach?',
    a: 'Without unreasonable delay and in no case later than 60 calendar days after discovery. A breach is treated as discovered on the first day it is known, or would have been known with reasonable diligence, to any workforce member or agent other than the person who committed it.',
    basis: '45 CFR 164.404(a)(2), (b)',
    src: 'breach404',
  },
  {
    id: 'breach-500-hhs',
    topic: 'Breach notification',
    q: 'When must HHS be told about a breach?',
    a: 'For a breach affecting 500 or more individuals, the covered entity notifies the Secretary at the same time as it notifies the individuals, in the manner specified on the HHS website. For fewer than 500, it keeps a log and notifies the Secretary no later than 60 days after the end of the calendar year in which the breaches were discovered.',
    basis: '45 CFR 164.408(b), (c)',
    src: 'breach408',
  },
  {
    id: 'breach-media',
    topic: 'Breach notification',
    q: 'When must the media be notified?',
    a: 'For a breach of unsecured protected health information involving more than 500 residents of a State or jurisdiction, the covered entity must notify prominent media outlets serving that State or jurisdiction, within the same 60-day outer limit.',
    basis: '45 CFR 164.406',
    src: 'breach406',
  },
  {
    id: 'breach-business-associate',
    topic: 'Breach notification',
    q: 'What must a vendor do when it discovers a breach?',
    a: 'A business associate must notify the covered entity without unreasonable delay and in no case later than 60 calendar days after discovery, and must identify each affected individual to the extent possible. Your contract can set a shorter period, and a hospital that depends on the vendor’s notice to meet its own 60-day clock has good reason to ask for one.',
    basis: '45 CFR 164.410',
    src: 'breach410',
  },

  // ── Security Rule ────────────────────────────────────
  {
    id: 'risk-analysis',
    topic: 'Security Rule',
    q: 'Is a risk analysis required?',
    a: 'Yes. A covered entity or business associate must conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity and availability of the electronic protected health information it holds, and must implement security measures sufficient to reduce those risks to a reasonable and appropriate level. Both are marked “Required.”',
    basis: '45 CFR 164.308(a)(1)(ii)(A), (B)',
    src: 'sec308',
  },
  {
    id: 'audit-controls',
    topic: 'Security Rule',
    q: 'Do systems that hold patient data need activity logs?',
    a: 'The technical safeguards require mechanisms that record and examine activity in information systems that contain or use electronic protected health information (audit controls), and the administrative safeguards require procedures to regularly review records of system activity such as audit logs and access reports.',
    basis: '45 CFR 164.312(b); 164.308(a)(1)(ii)(D)',
    src: 'sec312',
  },
  {
    id: 'encryption-addressable',
    topic: 'Security Rule',
    q: 'Is encryption mandatory under the current Security Rule?',
    a: 'The current text lists encryption and decryption of electronic protected health information as an “Addressable” implementation specification under access control, not “Required.” Addressable does not mean optional: the entity must assess it and document its decision. HHS proposed changes in January 2025, but we found no final rule.',
    basis: '45 CFR 164.312(a)(2)(iv)',
    src: 'sec312',
  },
  {
    id: 'six-year-documentation',
    topic: 'Security Rule',
    q: 'How long must Security Rule documentation be kept?',
    a: 'Six years from the date of creation or the date the document last was in effect, whichever is later. Documentation must also be reviewed periodically and updated as needed in response to environmental or operational changes affecting security.',
    basis: '45 CFR 164.316(b)(2)',
    src: 'sec316',
  },
  {
    id: 'security-nprm-status',
    topic: 'Security Rule',
    q: 'Has the proposed HIPAA Security Rule rewrite been finalized?',
    a: 'We found no final rule. The proposed rule, “HIPAA Security Rule To Strengthen the Cybersecurity of Electronic Protected Health Information,” was published January 6, 2025 (90 FR 898) and its comment period closed March 7, 2025. A Federal Register search on November 6, 2026 returned no final rule, so the existing Subpart C text applies.',
    basis: '90 FR 898',
    src: 'nprm',
  },

  // ── Business associates and AI vendors ───────────────
  {
    id: 'vendor-is-ba',
    topic: 'Business associates and AI vendors',
    q: 'When is an AI vendor a business associate?',
    a: 'The definition covers a person who, on behalf of a covered entity and other than as a workforce member, creates, receives, maintains or transmits protected health information for a regulated function, or who provides services such as legal, actuarial, accounting, consulting or data aggregation to the covered entity where the service involves disclosure of that information. Read the definition in 45 CFR 160.103 against the vendor’s actual role.',
    basis: '45 CFR 160.103 (definition)',
    src: 'def160',
  },
  {
    id: 'baa-required',
    topic: 'Business associates and AI vendors',
    q: 'Is a written agreement required before giving patient data to a vendor?',
    a: 'A covered entity may disclose protected health information to a business associate only if it obtains satisfactory assurance that the business associate will safeguard the information, and those assurances must be documented through a written contract or other written agreement that meets § 164.504(e).',
    basis: '45 CFR 164.502(e)(1)-(2)',
    src: 'baa502',
  },
  {
    id: 'baa-contents',
    topic: 'Business associates and AI vendors',
    q: 'What must a business associate agreement say?',
    a: 'Among other things: that the business associate will not use or further disclose the information other than as the contract permits or as required by law, will use appropriate safeguards, will report any use or disclosure not provided for including breaches under § 164.410, will bind subcontractors to the same restrictions, will make information available for access, amendment and accounting, and will return or destroy the information at termination if feasible. The contract must also let the covered entity terminate if the business associate violates a material term.',
    basis: '45 CFR 164.504(e)(2)',
    src: 'baa504',
  },
  {
    id: 'subcontractors',
    topic: 'Business associates and AI vendors',
    q: 'Does the agreement reach a vendor’s own subcontractors, such as a cloud or model provider?',
    a: 'A business associate may let a subcontractor create, receive, maintain or transmit protected health information on its behalf only if it obtains satisfactory assurances that the subcontractor will appropriately safeguard it, and the agreement must require the business associate to bind subcontractors to the same restrictions and conditions.',
    basis: '45 CFR 164.502(e)(1)(ii); 164.504(e)(2)(ii)(D)',
    src: 'baa504',
  },

  // ── Records, access and information blocking ─────────
  {
    id: 'access-30-days',
    topic: 'Records, access and information blocking',
    q: 'How quickly must a hospital respond to a patient’s request for their records?',
    a: 'No later than 30 days after receipt of the request. If it cannot act in that time, it may extend once by no more than 30 days, provided that within the first 30 days it gives the individual a written statement of the reasons for the delay and the date by which it will complete the action.',
    basis: '45 CFR 164.524(b)(2)',
    src: 'access524',
  },
  {
    id: 'access-electronic-copy',
    topic: 'Records, access and information blocking',
    q: 'Must a patient be able to get an electronic copy?',
    a: 'If the information is maintained electronically in one or more designated record sets and the individual requests an electronic copy, the covered entity must provide access in the electronic form and format requested, if readily producible in that form, or in a readable electronic form and format agreed with the individual.',
    basis: '45 CFR 164.524(c)(2)(ii)',
    src: 'access524',
  },
  {
    id: 'info-blocking-provider',
    topic: 'Records, access and information blocking',
    q: 'What is the information blocking standard for a hospital?',
    a: 'Information blocking is a practice likely to interfere with access, exchange or use of electronic health information, except as required by law or covered by an exception. For a health care provider, it applies if the provider knows the practice is unreasonable and likely to interfere. The exceptions are in Part 171, Subparts B, C and D.',
    basis: '45 CFR 171.103',
    src: 'ib103',
  },

  // ── FDA and AI-enabled devices ───────────────────────
  {
    id: 'fda-cds',
    topic: 'FDA and AI-enabled devices',
    q: 'Is clinical decision support software regulated as a medical device?',
    a: 'It depends. Section 520(o)(1)(E) of the FD&C Act excludes certain clinical decision support functions from the device definition if they meet statutory criteria, and FDA’s guidance (dated January 2026 on its page) explains how it reads those criteria. FDA also says its digital health policies still apply to software functions that meet the device definition, including those intended for patients or caregivers.',
    basis: 'FDA CDS guidance (January 2026)',
    src: 'fdaCds',
  },
  {
    id: 'fda-pccp',
    topic: 'FDA and AI-enabled devices',
    q: 'Can an AI-enabled device change after FDA authorizes it?',
    a: 'A manufacturer can include a predetermined change control plan in a marketing submission. It describes planned changes and how they will be developed, tested and implemented, and FDA’s page says authorized changes can then be made without a new submission for each one. FDA lists a final guidance dated August 2025 for AI-enabled device software functions.',
    basis: 'FDA PCCP page; August 2025 final guidance',
    src: 'fdaPccp',
  },
  {
    id: 'fda-list-not-comprehensive',
    topic: 'FDA and AI-enabled devices',
    q: 'Does FDA keep a list of AI-enabled devices?',
    a: 'Yes, FDA publishes a list of AI-enabled medical devices authorized for marketing. FDA states that the list is not a comprehensive resource of AI-enabled medical devices, because devices were identified mainly by AI-related terms in their summaries or classifications. Absence from the list does not prove a product is not a device, and presence does not tell you how it performs in your hospital.',
    basis: 'FDA list page',
    src: 'fdaList',
  },

  // ── Nondiscrimination and oversight ──────────────────
  {
    id: 's1557-decision-support',
    topic: 'Nondiscrimination and oversight',
    q: 'What does the Section 1557 rule require for patient care decision support tools?',
    a: 'A covered entity must not discriminate on the basis of race, color, national origin, sex, age or disability through patient care decision support tools; must make reasonable efforts to identify tools that use input variables measuring those characteristics; and must make reasonable efforts to mitigate the risk of discrimination for each tool it identifies.',
    basis: '45 CFR 92.210',
    src: 's1557_210',
  },
  {
    id: 'hti5-dsi',
    topic: 'Nondiscrimination and oversight',
    q: 'What did the October 2026 HTI-5 final rule change for decision support in certified health IT?',
    a: 'The rule removes paragraphs (b)(11)(iv) through (vi) of 45 CFR 170.315, which covered source attribute support, source attribute access and modification, and risk management for predictive decision support interventions. It is effective December 28, 2026, except three amendatory instructions effective January 1, 2027. ONC says it will consider reinstating similar requirements in future rulemaking.',
    basis: '91 FR 67916',
    src: 'hti5',
  },
];
