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
  { name: 'Artificial Intelligence in Healthcare Guidelines (AIHGle) 2.0', id: 'AIHGle 2.0 (March 2026)', url: 'https://isomer-user-content.by.gov.sg/3/6636a140-7986-43f6-9861-096333138d59/AIHGle_2.0.pdf', test: /AIHGle|AI in Healthcare Guidelines|governance platform|deployer/i },
  { name: 'HSA GL-04-R4 Regulatory Guidelines for Software Medical Devices', id: 'GL-04-R4 (December 2025)', url: 'https://isomer-user-content.by.gov.sg/409/26808a93-6a7a-4551-8c66-13046c6124c5/gl-04-r4-regulatory-guidelines-for-software-medical-devices---a-life-cycle-approach-(2025-dec)-pub.pdf', test: /GL-04|HSA|software medical device|Class [A-D]|risk class/i },
];

const TOPICS: [string, RegExp][] = [
  ['Personal data protection in healthcare', /PDPA|PDPC|personal data|consent/i],
  ['Data processors and AI vendors', /data processor|vendor|processor/i],
  ['Electronic health records', /\bEHR\b|electronic health record|medical record|hospital information system/i],
  ['Artificial intelligence in hospitals', /\bAI\b|artificial intelligence|machine learning|large language model/i],
  ['Regulation of medical device software in Singapore', /HSA|medical device|SaMD|software medical device|GL-04|GL-07/i],
  ['Health information security', /cyber|ransomware|security safeguards|breach|phishing/i],
  ['Ethics of AI in healthcare', /AIHGle|ethic|fairness|bias|accountability/i],
  ['Telemedicine', /telehealth|telemedicine/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'SG',
    inLanguage: 'en-SG',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
