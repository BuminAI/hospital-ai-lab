// /ph/llms-full.txt — the English edition as one text file for answer engines and LLMs (2026-11-06)
//
// Built at build time from the same data as the pages: key facts, milestones, glossary, FAQ,
// checklist and article summaries. Nothing is here that is not on the pages.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { FACTS, FACTS_CHECKED } from '../../data/ph/guides/facts';
import { MILESTONES, SRC } from '../../data/ph/guides/milestones';
import glossary from '../../data/ph/content/glossary.json';
import faq from '../../data/ph/content/faq.json';
import checklist from '../../data/ph/content/checklist.json';
import { extractSummary } from '../../utils/ph-aeo';
import { withBase } from '../../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const root = (site ? site.href : 'https://hospital-ai-lab.com/').replace(/\/$/, '');
  const u = (p: string) => `${root}${withBase(p)}`;
  const L: string[] = [];

  L.push('# Hospital AI Lab — Edisyong Filipino (Pilipinas) (buong bersyon para sa mga answer engine)');
  L.push('');
  L.push(
    '> Praktikal na impormasyon tungkol sa katayuan ng medical device, datos ng pasyente at AI para sa mga administrador at nursing leader ng mga ospital sa Pilipinas. Isinulat mula sa mga pangunahing dokumento (RA 9711 FDA Act, RA 10173 Data Privacy Act, RA 11223 UHC Act, ASEAN Guide on AI Governance and Ethics). Pangkalahatang impormasyon; hindi legal o medikal na payo.'
  );
  L.push('');
  L.push(`Site: ${u('/ph/')} · Short version: ${u('/ph/llms.txt')} · Checked: ${FACTS_CHECKED}`);
  L.push('');

  L.push(`## Key facts (${u('/ph/facts/')})`);
  L.push('');
  for (const f of FACTS) {
    L.push(`### ${f.q}`);
    L.push(f.a);
    L.push(`Basis: ${f.basis}. Source: ${SRC[f.src].url}`);
    L.push(`Link: ${u('/ph/facts/')}#${f.id}`);
    L.push('');
  }

  L.push(`## Regulatory milestones (${u('/ph/dx-roadmap/')})`);
  L.push('');
  for (const m of MILESTONES.filter((x) => x.status === 'done').sort((a, b) => a.sort.localeCompare(b.sort))) {
    L.push(`- ${m.when} — ${m.title}. ${m.body} Source: ${SRC[m.src].url}`);
  }
  L.push('');

  L.push(`## Glossary (${u('/ph/glossary/')})`);
  L.push('');
  for (const g of glossary as { id: string; term: string; definition: string; sources: string[] }[]) {
    L.push(`- ${g.term}: ${g.definition} Source: ${(g.sources ?? []).join(' ')} Link: ${u('/ph/glossary/')}#${g.id}`);
  }
  L.push('');

  L.push(`## FAQ (${u('/ph/faq/')})`);
  L.push('');
  for (const f of faq as { question: string; answer: string; sources: string[] }[]) {
    L.push(`### ${f.question}`);
    L.push(f.answer);
    L.push(`Source: ${(f.sources ?? []).join(' ')}`);
    L.push('');
  }

  L.push(`## AI adoption checklist (${u('/ph/checklist/')})`);
  L.push('');
  for (const s of (checklist as { sections: { heading: string; body: string; items: string[] }[] }).sections) {
    L.push(`### ${s.heading}`);
    if (s.body) L.push(s.body);
    for (const i of s.items) L.push(`- ${i}`);
    L.push('');
  }

  L.push(`## Articles (${u('/ph/blog/')})`);
  L.push('');
  const posts = (await getCollection('blogPh', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  for (const p of posts) {
    L.push(`### ${p.data.title}`);
    L.push(`Published: ${p.data.pubDate.toISOString().slice(0, 10)} · ${u(`/ph/blog/${p.id}/`)}`);
    L.push(p.data.description);
    for (const s of extractSummary(p.body)) L.push(`- ${s}`);
    L.push('');
  }

  L.push('## When citing');
  L.push('');
  L.push('- Ibigay ang URL ng pahina at ang petsa ng pagsusuri; suriin ang pananalita ng mga regulasyon laban sa opisyal na teksto.');
  L.push('- Ang mga awtomatikong feed (balita, ulat ng ahensya, video) ay may link at headline lamang; para sa nilalaman, pumunta sa orihinal na pinagmulan.');
  L.push('- Hindi ibinibigay ang mga deadline na hindi makumpirma laban sa pangunahing teksto.');
  L.push('- Hindi nagpo-promote ang site ng partikular na ospital, produkto o gamutan.');

  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
