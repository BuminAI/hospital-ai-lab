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
  { name: 'Policy on Use of Artificial Intelligence (AI) in the Healthcare Sector of the Emirate of Abu Dhabi', id: 'Policy/AI/0.9 (30 April 2018)', url: 'https://www.doh.gov.ae/-/media/E9C1470A575146B18015DEBE57E47F8D.ashx', test: /DoH AI policy|Policy on Use of Artificial Intelligence|Abu Dhabi.{0,40}AI policy|graceful degradation/i },
  { name: 'Artificial Intelligence in the Healthcare (Dubai Health Authority policy)', id: 'DHA/HISHD/PP-09', url: 'https://www.dha.gov.ae/uploads/082022/Artificial%20Intelligence%20Policy20228457.pdf', test: /DHA AI policy|Dubai Health Authority|Dubai.{0,40}AI policy|DHA\/HISHD/i },
  { name: 'Digital Products Governance Standard (Abu Dhabi DoH)', id: 'DoH/ST/DHS/DPGS/V1/26', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/24032026--Digital-Products-Governance-Standard.ashx', test: /Digital Products Governance|digital product owner|DPGS/i },
  { name: 'Data Access Standard (Abu Dhabi DoH)', id: 'DoH/ST/DDGO/DAS/V1/2025', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/11126_Data_Access_Standard.ashx', test: /Data Access Standard|data residency|outside the UAE/i },
  { name: 'Analytics and Reporting Standard (Abu Dhabi DoH)', id: 'DoH/ST/DDGO/AR/V1/2026', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/070426Analytics-and-Reporting-Standard.ashx', test: /Analytics and Reporting Standard|secondary use/i },
  { name: 'Policy on the Abu Dhabi Health Information Exchange', id: 'DOH/POL/STR/HIE/1.1/2020', url: 'https://www.doh.gov.ae/-/media/A78104416DF2440E89AC90FB75F11055.ashx', test: /health information exchange|Malaffi/i },
  { name: 'Medical Device Cybersecurity in Healthcare Facilities Guideline (Abu Dhabi DoH)', id: 'DOH/GL/0000002397/24', url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/2026/Medical-Device-Cybersecurity-in-healthcare-facilities-Guideline301026.ashx', test: /Medical Device Cybersecurity|ADHCCERT|MDS2/i },
];

const TOPICS: [string, RegExp][] = [
  ['AI marketing in healthcare', /\bmarketing\b|advertis/i],
  ['Patient data protection in healthcare', /personal data|patient data|consent|privacy/i],
  ['Data residency and cloud services', /data residency|cloud|outside the UAE|localis|localiz/i],
  ['Electronic health records', /\bEHR\b|electronic health record|medical record|Malaffi|NABIDH/i],
  ['Artificial intelligence in hospitals', /\bAI\b|artificial intelligence|machine learning|large language model/i],
  ['Regulation of digital health products and medical devices', /medical device|digital product|DoH|DHA|risk tier/i],
  ['Health information security', /cyber|ransomware|breach|phishing|MDS2/i],
  ['Ethics of AI in healthcare', /ethic|fairness|bias|accountability|transparen/i],
  ['Telemedicine', /telehealth|telemedicine/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'AE',
    inLanguage: 'en-AE',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
