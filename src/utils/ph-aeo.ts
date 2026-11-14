// AEO/GEO helpers (2026-11-06, English edition)
//
// ① The bullets under a "Key takeaways / Summary / Bottom line" heading at the end of a post are lifted into a "Short answer" box at the top —
//    answer engines quote the short answer at the start of a page most. No new content is made: the summary already in the post is moved as is.
// ② Regulations that actually appear in the body are linked as Legislation nodes (mentions).
//    Never add a regulation that is not in the body (mark up only what is visible on screen).

const HEAD = /^##\s+(?:Buod|Maikling buod|Pangunahing punto|Key takeaways|Takeaways|Key points|Summary|Bottom line|In short|The short version)[^\r\n]*\r?\n/m;

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
  { name: 'Data Privacy Act of 2012 (RA 10173)', id: 'Republic Act No. 10173', url: 'https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html', test: /Data Privacy|RA 10173|personal information|data subject|controller|NPC|National Privacy Commission/i },
  { name: 'FDA Act of 2009 (RA 9711)', id: 'Republic Act No. 9711', url: 'https://lawphil.net/statutes/repacts/ra2009/ra_9711_2009.html', test: /FDA|RA 9711|medical device|license to operate|registration/i },
];

const TOPICS: [string, RegExp][] = [
  ['Personal data protection in healthcare', /Data Privacy|RA 10173|personal data|consent|datos/i],
  ['Data processors and AI vendors', /data processor|vendor|processor/i],
  ['Electronic health records', /EHR|electronic health record|medical record|hospital information system/i],
  ['Artificial intelligence in hospitals', /AI|artificial intelligence|machine learning|large language model/i],
  ['Regulation of medical device software in the Philippines', /FDA|RA 9711|medical device|software|license to operate/i],
  ['Health information security', /cyber|ransomware|security safeguards|breach|phishing/i],
  ['Ethics of AI in healthcare', /ASEAN|ethic|fairness|bias|accountability/i],
  ['Telemedicine', /telehealth|telemedicine/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'PH',
    inLanguage: 'fil-PH',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
