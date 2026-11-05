// /en/llms-full.txt — the English edition as one text file for answer engines and LLMs (2026-11-06)
//
// Built at build time from the same data as the pages: key facts, milestones, glossary, FAQ,
// checklist and article summaries. Nothing is here that is not on the pages.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { FACTS, FACTS_CHECKED } from '../../data/en/guides/facts';
import { MILESTONES, SRC } from '../../data/en/guides/milestones';
import glossary from '../../data/en/content/glossary.json';
import faq from '../../data/en/content/faq.json';
import checklist from '../../data/en/content/checklist.json';
import { extractSummary } from '../../utils/en-aeo';
import { withBase } from '../../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const root = (site ? site.href : 'https://hospital-ai-lab.com/').replace(/\/$/, '');
  const u = (p: string) => `${root}${withBase(p)}`;
  const L: string[] = [];

  L.push('# Hospital AI Lab — English (U.S.) edition (full version for answer engines)');
  L.push('');
  L.push(
    '> Practical information on patient data, health records and AI for administrators and nursing leaders in U.S. hospitals. Written from primary sources (eCFR, Federal Register, FDA, ASTP/ONC, NIST). General information; not legal or medical advice.'
  );
  L.push('');
  L.push(`Site: ${u('/en/')} · Short version: ${u('/en/llms.txt')} · Checked: ${FACTS_CHECKED}`);
  L.push('');

  L.push(`## Key facts (${u('/en/facts/')})`);
  L.push('');
  for (const f of FACTS) {
    L.push(`### ${f.q}`);
    L.push(f.a);
    L.push(`Basis: ${f.basis}. Source: ${SRC[f.src].url}`);
    L.push(`Link: ${u('/en/facts/')}#${f.id}`);
    L.push('');
  }

  L.push(`## Regulatory milestones (${u('/en/dx-roadmap/')})`);
  L.push('');
  for (const m of MILESTONES.filter((x) => x.status === 'done').sort((a, b) => a.sort.localeCompare(b.sort))) {
    L.push(`- ${m.when} — ${m.title}. ${m.body} Source: ${SRC[m.src].url}`);
  }
  L.push('');

  L.push(`## Glossary (${u('/en/glossary/')})`);
  L.push('');
  for (const g of glossary as { id: string; term: string; definition: string; sources: string[] }[]) {
    L.push(`- ${g.term}: ${g.definition} Source: ${(g.sources ?? []).join(' ')} Link: ${u('/en/glossary/')}#${g.id}`);
  }
  L.push('');

  L.push(`## FAQ (${u('/en/faq/')})`);
  L.push('');
  for (const f of faq as { question: string; answer: string; sources: string[] }[]) {
    L.push(`### ${f.question}`);
    L.push(f.answer);
    L.push(`Source: ${(f.sources ?? []).join(' ')}`);
    L.push('');
  }

  L.push(`## AI adoption checklist (${u('/en/checklist/')})`);
  L.push('');
  for (const s of (checklist as { sections: { heading: string; body: string; items: string[] }[] }).sections) {
    L.push(`### ${s.heading}`);
    if (s.body) L.push(s.body);
    for (const i of s.items) L.push(`- ${i}`);
    L.push('');
  }

  L.push(`## Articles (${u('/en/blog/')})`);
  L.push('');
  const posts = (await getCollection('blogEn', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  for (const p of posts) {
    L.push(`### ${p.data.title}`);
    L.push(`Published: ${p.data.pubDate.toISOString().slice(0, 10)} · ${u(`/en/blog/${p.id}/`)}`);
    L.push(p.data.description);
    for (const s of extractSummary(p.body)) L.push(`- ${s}`);
    L.push('');
  }

  L.push('## When citing');
  L.push('');
  L.push('- Give the page URL and the date checked; verify the wording of regulations against the official text.');
  L.push('- Automatic feeds (news, new federal documents, videos) contain only links and headlines; for content, go to the original source.');
  L.push('- Deadlines that could not be confirmed against a primary text are not given.');
  L.push('- The site does not promote particular hospitals, products or treatments.');

  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
