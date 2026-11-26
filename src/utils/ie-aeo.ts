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
  { name: 'Regulation (EU) 2024/1689 (Artificial Intelligence Act)', id: 'Regulation (EU) 2024/1689', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', test: /AI Act|Artificial Intelligence Act|2024\/1689|deployer|high-risk AI/i },
  { name: 'Regulation (EU) 2016/679 (General Data Protection Regulation)', id: 'Regulation (EU) 2016/679', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj', test: /GDPR|General Data Protection Regulation|special categor|impact assessment|72 hours/i },
  { name: 'Regulation (EU) 2017/745 (Medical Device Regulation)', id: 'Regulation (EU) 2017/745', url: 'https://eur-lex.europa.eu/eli/reg/2017/745/oj', test: /\bMDR\b|Medical Device Regulation|2017\/745|medical device software/i },
  { name: 'HIQA National Guidance for the Responsible and Safe Use of AI in Health and Social Care Services', id: 'HIQA, 29 July 2026', url: 'https://www.hiqa.ie/ga/node/74973', test: /HIQA/i },
  { name: 'AI for Care: The AI Strategy for Healthcare in Ireland 2026-2030', id: 'Department of Health, 2026', url: 'https://www.drugsandalcohol.ie/46031/1/AI_for_Care_2026-2030.pdf', test: /AI for Care/i },
  { name: 'AI, Large Language Models and Data Protection (Data Protection Commission)', id: 'DPC, 18 July 2024', url: 'https://www.dataprotection.ie/en/dpc-guidance/blogs/AI-LLMs-and-Data-Protection', test: /Data Protection Commission|\bDPC\b/i },
];

const TOPICS: [string, RegExp][] = [
  ['AI marketing in healthcare', /\bmarketing\b|advertis/i],
  ['Patient data protection in healthcare', /personal data|patient data|consent|privacy|GDPR/i],
  ['Data protection impact assessment', /impact assessment|\bDPIA\b/i],
  ['Electronic health records', /\bEHR\b|electronic health record|medical record/i],
  ['Artificial intelligence in hospitals', /\bAI\b|artificial intelligence|machine learning|large language model/i],
  ['Regulation of medical device software', /medical device|\bMDR\b|HPRA|CE mark/i],
  ['Health information security', /cyber|ransomware|breach|phishing/i],
  ['Ethics of AI in healthcare', /ethic|fairness|bias|accountability|transparen/i],
  ['Telemedicine', /telehealth|telemedicine/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'IE',
    inLanguage: 'en-IE',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
