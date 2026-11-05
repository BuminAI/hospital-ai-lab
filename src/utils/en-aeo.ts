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
  { name: 'HIPAA Privacy Rule (45 CFR Part 164, Subpart E)', id: '45 CFR 164.500–164.534', url: 'https://www.ecfr.gov/current/title-45/part-164', test: /Privacy Rule|45 CFR 164\.5\d\d/i },
  { name: 'HIPAA Security Rule (45 CFR Part 164, Subpart C)', id: '45 CFR 164.302–164.318', url: 'https://www.ecfr.gov/current/title-45/part-164', test: /Security Rule|45 CFR 164\.3\d\d/i },
  { name: 'HIPAA Breach Notification Rule (45 CFR Part 164, Subpart D)', id: '45 CFR 164.400–164.414', url: 'https://www.ecfr.gov/current/title-45/part-164', test: /Breach Notification|45 CFR 164\.4\d\d/i },
  { name: 'Information blocking (45 CFR Part 171)', id: '45 CFR Part 171', url: 'https://www.ecfr.gov/current/title-45/part-171', test: /information blocking|45 CFR (Part )?171/i },
  { name: 'Patient care decision support tools (45 CFR 92.210)', id: '45 CFR 92.210', url: 'https://www.ecfr.gov/current/title-45/section-92.210', test: /92\.210|Section 1557/i },
  { name: 'ONC certification criteria (45 CFR 170.315)', id: '45 CFR 170.315', url: 'https://www.ecfr.gov/current/title-45/section-170.315', test: /170\.315|HTI-\d/i },
];

const TOPICS: [string, RegExp][] = [
  ['Patient health information privacy', /\bHIPAA\b|protected health information|\bPHI\b/i],
  ['Business associate agreements', /business associate/i],
  ['Electronic health records', /\bEHR\b|electronic health record|medical record/i],
  ['Artificial intelligence in hospitals', /\bAI\b|artificial intelligence|machine learning|large language model/i],
  ['FDA regulation of medical device software', /\bFDA\b|medical device|SaMD|clinical decision support/i],
  ['Health information security', /cyber|ransomware|security rule|breach|phishing/i],
  ['Health information interoperability', /interoperab|ONC|ASTP|information blocking|HTI-/i],
  ['Telehealth', /telehealth|telemedicine/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'US',
    inLanguage: 'en',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
