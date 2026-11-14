// /sg/llms-full.txt — the English edition as one text file for answer engines and LLMs (2026-11-06)
//
// Built at build time from the same data as the pages: key facts, milestones, glossary, FAQ,
// checklist and article summaries. Nothing is here that is not on the pages.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { FACTS, FACTS_CHECKED } from '../../data/sg/guides/facts';
import { MILESTONES, SRC } from '../../data/sg/guides/milestones';
import glossary from '../../data/sg/content/glossary.json';
import faq from '../../data/sg/content/faq.json';
import checklist from '../../data/sg/content/checklist.json';
import { extractSummary } from '../../utils/sg-aeo';
import { withBase } from '../../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const root = (site ? site.href : 'https://hospital-ai-lab.com/').replace(/\/$/, '');
  const u = (p: string) => `${root}${withBase(p)}`;
  const L: string[] = [];

  L.push('# Hospital AI Lab — English (Singapore) edition (full version for answer engines)');
  L.push('');
  L.push(
    '> Practical information on medical device status, patient data and AI for administrators and nursing leaders in Singapore hospitals. Written from primary documents (HSA GL-04-R4, GL-07-R2 and GN-37-R1, the Ministry of Health’s AIHGle 2.0, the PDPC’s guide on data breaches). General information; not legal or medical advice.'
  );
  L.push('');
  L.push(`Site: ${u('/sg/')} · Short version: ${u('/sg/llms.txt')} · Checked: ${FACTS_CHECKED}`);
  L.push('');

  L.push(`## Key facts (${u('/sg/facts/')})`);
  L.push('');
  for (const f of FACTS) {
    L.push(`### ${f.q}`);
    L.push(f.a);
    L.push(`Basis: ${f.basis}. Source: ${SRC[f.src].url}`);
    L.push(`Link: ${u('/sg/facts/')}#${f.id}`);
    L.push('');
  }

  L.push(`## Regulatory milestones (${u('/sg/dx-roadmap/')})`);
  L.push('');
  for (const m of MILESTONES.filter((x) => x.status === 'done').sort((a, b) => a.sort.localeCompare(b.sort))) {
    L.push(`- ${m.when} — ${m.title}. ${m.body} Source: ${SRC[m.src].url}`);
  }
  L.push('');

  L.push(`## Glossary (${u('/sg/glossary/')})`);
  L.push('');
  for (const g of glossary as { id: string; term: string; definition: string; sources: string[] }[]) {
    L.push(`- ${g.term}: ${g.definition} Source: ${(g.sources ?? []).join(' ')} Link: ${u('/sg/glossary/')}#${g.id}`);
  }
  L.push('');

  L.push(`## FAQ (${u('/sg/faq/')})`);
  L.push('');
  for (const f of faq as { question: string; answer: string; sources: string[] }[]) {
    L.push(`### ${f.question}`);
    L.push(f.answer);
    L.push(`Source: ${(f.sources ?? []).join(' ')}`);
    L.push('');
  }

  L.push(`## AI adoption checklist (${u('/sg/checklist/')})`);
  L.push('');
  for (const s of (checklist as { sections: { heading: string; body: string; items: string[] }[] }).sections) {
    L.push(`### ${s.heading}`);
    if (s.body) L.push(s.body);
    for (const i of s.items) L.push(`- ${i}`);
    L.push('');
  }

  L.push(`## Articles (${u('/sg/blog/')})`);
  L.push('');
  const posts = (await getCollection('blogSg', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  for (const p of posts) {
    L.push(`### ${p.data.title}`);
    L.push(`Published: ${p.data.pubDate.toISOString().slice(0, 10)} · ${u(`/sg/blog/${p.id}/`)}`);
    L.push(p.data.description);
    for (const s of extractSummary(p.body)) L.push(`- ${s}`);
    L.push('');
  }

  L.push('## When citing');
  L.push('');
  L.push('- Give the page URL and the date checked; verify the wording of regulations against the official text.');
  L.push('- Automatic feeds (news, HSA guidance, videos) contain only links and headlines; for content, go to the original source.');
  L.push('- Deadlines that could not be confirmed against a primary text are not given.');
  L.push('- The site does not promote particular hospitals, products or treatments.');

  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
