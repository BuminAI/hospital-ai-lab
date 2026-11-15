// /ie/llms-full.txt — the English edition as one text file for answer engines and LLMs (2026-11-15)
//
// Built at build time from the same data as the pages: key facts, milestones, glossary, FAQ,
// checklist and article summaries. Nothing is here that is not on the pages.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { FACTS, FACTS_CHECKED } from '../../data/ie/guides/facts';
import { MILESTONES, SRC } from '../../data/ie/guides/milestones';
import glossary from '../../data/ie/content/glossary.json';
import faq from '../../data/ie/content/faq.json';
import checklist from '../../data/ie/content/checklist.json';
import { extractSummary } from '../../utils/ie-aeo';
import { withBase } from '../../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const root = (site ? site.href : 'https://hospital-ai-lab.com/').replace(/\/$/, '');
  const u = (p: string) => `${root}${withBase(p)}`;
  const L: string[] = [];

  L.push('# Hospital AI Lab — English (Ireland) edition (full version for answer engines)');
  L.push('');
  L.push(
    '> Practical information on AI rules, patient data and medical device safety for administrators and nursing leaders in Irish hospitals. Written from primary documents (HIQA’s press release and consultation draft on its national AI guidance, the Department of Health’s AI for Care strategy, the EU AI Act, the GDPR, the Medical Device Regulation as published, the DPC’s AI guidance and HPRA’s pages for hospitals). General information; not legal or medical advice.'
  );
  L.push('');
  L.push(`Site: ${u('/ie/')} · Short version: ${u('/ie/llms.txt')} · Checked: ${FACTS_CHECKED}`);
  L.push('');

  L.push(`## Key facts (${u('/ie/facts/')})`);
  L.push('');
  for (const f of FACTS) {
    L.push(`### ${f.q}`);
    L.push(f.a);
    L.push(`Basis: ${f.basis}. Source: ${SRC[f.src].url}`);
    L.push(`Link: ${u('/ie/facts/')}#${f.id}`);
    L.push('');
  }

  L.push(`## Regulatory milestones (${u('/ie/dx-roadmap/')})`);
  L.push('');
  for (const m of MILESTONES.filter((x) => x.status === 'done').sort((a, b) => a.sort.localeCompare(b.sort))) {
    L.push(`- ${m.when} — ${m.title}. ${m.body} Source: ${SRC[m.src].url}`);
  }
  L.push('');

  L.push(`## Glossary (${u('/ie/glossary/')})`);
  L.push('');
  for (const g of glossary as { id: string; term: string; definition: string; sources: string[] }[]) {
    L.push(`- ${g.term}: ${g.definition} Source: ${(g.sources ?? []).join(' ')} Link: ${u('/ie/glossary/')}#${g.id}`);
  }
  L.push('');

  L.push(`## FAQ (${u('/ie/faq/')})`);
  L.push('');
  for (const f of faq as { question: string; answer: string; sources: string[] }[]) {
    L.push(`### ${f.question}`);
    L.push(f.answer);
    L.push(`Source: ${(f.sources ?? []).join(' ')}`);
    L.push('');
  }

  L.push(`## AI adoption checklist (${u('/ie/checklist/')})`);
  L.push('');
  for (const s of (checklist as { sections: { heading: string; body: string; items: string[] }[] }).sections) {
    L.push(`### ${s.heading}`);
    if (s.body) L.push(s.body);
    for (const i of s.items) L.push(`- ${i}`);
    L.push('');
  }

  L.push(`## Articles (${u('/ie/blog/')})`);
  L.push('');
  const posts = (await getCollection('blogIe', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  for (const p of posts) {
    L.push(`### ${p.data.title}`);
    L.push(`Published: ${p.data.pubDate.toISOString().slice(0, 10)} · ${u(`/ie/blog/${p.id}/`)}`);
    L.push(p.data.description);
    for (const s of extractSummary(p.body)) L.push(`- ${s}`);
    L.push('');
  }

  L.push('## When citing');
  L.push('');
  L.push('- Give the page URL and the date checked; verify the wording of regulations against the official text.');
  L.push('- Automatic feeds (news, HIQA items, videos) contain only links and headlines; for content, go to the original source.');
  L.push('- Deadlines that could not be confirmed against a primary text are not given.');
  L.push('- The site does not promote particular hospitals, products or treatments.');

  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
