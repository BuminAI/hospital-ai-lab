// AEO/GEO helpers (2026-11-06, English edition)
//
// ① The bullets under a "Key takeaways / Summary / Bottom line" heading at the end of a post are lifted into a "Short answer" box at the top —
//    answer engines quote the short answer at the start of a page most. No new content is made: the summary already in the post is moved as is.
// ② Regulations that actually appear in the body are linked as Legislation nodes (mentions).
//    Never add a regulation that is not in the body (mark up only what is visible on screen).

const HEAD = /^##\s+(?:Key takeaways|Takeaways|Key points|Summary|Bottom line|In short|The short version)[^\r\n]*\r?\n/m;

/** Pull the bullets under a "## Key takeaways" style heading as plain text. Empty array if none. */
export function extractSummary(markdown: string | undefined): string[] {
  if (!markdown) return [];
  const head = markdown.match(HEAD);
  if (!head || head.index === undefined) return [];
  let rest = markdown.slice(head.index + head[0].length);
  const stop = rest.search(/^(?:##\s|<br|\*\*Sources|\*Sources|---)/m);
  if (stop >= 0) rest = rest.slice(0, stop);
  const out: string[] = [];
  for (const line of rest.split('\n')) {
    const b = line.match(/^\s*[-*]\s+(.*\S)\s*$/);
    if (!b) continue;
    out.push(
      b[1]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim()
    );
  }
  return out.slice(0, 6);
}

type Law = { name: string; id: string; url: string; test: RegExp };
const LAWS: Law[] = [
  { name: 'The Digital Personal Data Protection Act, 2023 (No. 22 of 2023)', id: 'Act No. 22 of 2023', url: 'https://prsindia.org/files/bills_acts/bills_parliament/2023/Digital_Personal_Data_Protection_Act,_2023.pdf', test: /DPDP|Digital Personal Data Protection|Data Protection Board|data fiduciary|data processor|data principal/i },
  { name: 'Medical Devices Rules, 2017', id: 'Medical Devices Rules, 2017', url: 'https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/m_device/Medical%20Devices%20Rules,%202017.pdf', test: /Medical Devices Rules|\bMDR[- ]?2017|Class [A-D]\b|risk class/i },
];

const TOPICS: [string, RegExp][] = [
  ['Personal data protection in healthcare', /DPDP|personal data|data fiduciary|data principal|consent/i],
  ['Data processors and AI vendors', /data processor|vendor|processor/i],
  ['Electronic health records', /\bEHR\b|electronic health record|medical record|hospital information system/i],
  ['Artificial intelligence in hospitals', /\bAI\b|artificial intelligence|machine learning|large language model/i],
  ['Regulation of medical device software in India', /CDSCO|medical device|Medical Device Software|MDSW|Medical Devices Rules/i],
  ['Health information security', /cyber|ransomware|security safeguards|breach|phishing/i],
  ['Ethics of AI in healthcare', /ICMR|ethic|fairness|bias|accountability/i],
  ['Telemedicine', /telehealth|telemedicine/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'IN',
    inLanguage: 'en-IN',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
