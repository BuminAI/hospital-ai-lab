// /fr/llms-full.txt — l'édition française en un seul fichier texte for answer engines and LLMs (2026-11-15)
//
// Built at build time from the same data as the pages: key facts, milestones, glossary, FAQ,
// checklist and article summaries. Nothing is here that is not on the pages.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { FACTS, FACTS_CHECKED } from '../../data/fr/guides/facts';
import { MILESTONES, SRC } from '../../data/fr/guides/milestones';
import glossary from '../../data/fr/content/glossary.json';
import faq from '../../data/fr/content/faq.json';
import checklist from '../../data/fr/content/checklist.json';
import { extractSummary } from '../../utils/fr-aeo';
import { withBase } from '../../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const root = (site ? site.href : 'https://hospital-ai-lab.com/').replace(/\/$/, '');
  const u = (p: string) => `${root}${withBase(p)}`;
  const L: string[] = [];

  L.push('# Hospital AI Lab — Édition française (version complète pour les moteurs de réponse)');
  L.push('');
  L.push(
    '> Informations pratiques sur les règles de l’IA, les données des patients et la sécurité des dispositifs médicaux pour les directions et les cadres de santé des hôpitaux français. Rédigé à partir de documents primaires (fiche CNIL « IA et santé », projet de guide HAS-CNIL, recommandations de la CNIL sur l’IA, textes officiels en français du règlement sur l’IA, du RGPD et du RDM). Information générale ; ni avis juridique ni avis médical.'
  );
  L.push('');
  L.push(`Site: ${u('/fr/')} · Version courte : ${u('/fr/llms.txt')} · Vérifié le : ${FACTS_CHECKED}`);
  L.push('');

  L.push(`## Faits clés (${u('/fr/facts/')})`);
  L.push('');
  for (const f of FACTS) {
    L.push(`### ${f.q}`);
    L.push(f.a);
    L.push(`Base : ${f.basis}. Source : ${SRC[f.src].url}`);
    L.push(`Lien : ${u('/fr/facts/')}#${f.id}`);
    L.push('');
  }

  L.push(`## Jalons réglementaires (${u('/fr/dx-roadmap/')})`);
  L.push('');
  for (const m of MILESTONES.filter((x) => x.status === 'done').sort((a, b) => a.sort.localeCompare(b.sort))) {
    L.push(`- ${m.when} — ${m.title}. ${m.body} Source : ${SRC[m.src].url}`);
  }
  L.push('');

  L.push(`## Glossaire (${u('/fr/glossary/')})`);
  L.push('');
  for (const g of glossary as { id: string; term: string; definition: string; sources: string[] }[]) {
    L.push(`- ${g.term}: ${g.definition} Source : ${(g.sources ?? []).join(' ')} Lien : ${u('/fr/glossary/')}#${g.id}`);
  }
  L.push('');

  L.push(`## FAQ (${u('/fr/faq/')})`);
  L.push('');
  for (const f of faq as { question: string; answer: string; sources: string[] }[]) {
    L.push(`### ${f.question}`);
    L.push(f.answer);
    L.push(`Source : ${(f.sources ?? []).join(' ')}`);
    L.push('');
  }

  L.push(`## Liste d'adoption d'une IA (${u('/fr/checklist/')})`);
  L.push('');
  for (const s of (checklist as { sections: { heading: string; body: string; items: string[] }[] }).sections) {
    L.push(`### ${s.heading}`);
    if (s.body) L.push(s.body);
    for (const i of s.items) L.push(`- ${i}`);
    L.push('');
  }

  L.push(`## Articles (${u('/fr/blog/')})`);
  L.push('');
  const posts = (await getCollection('blogFr', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  for (const p of posts) {
    L.push(`### ${p.data.title}`);
    L.push(`Publié le : ${p.data.pubDate.toISOString().slice(0, 10)} · ${u(`/fr/blog/${p.id}/`)}`);
    L.push(p.data.description);
    for (const s of extractSummary(p.body)) L.push(`- ${s}`);
    L.push('');
  }

  L.push('## Pour citer');
  L.push('');
  L.push('- Indiquez l’URL de la page et la date de vérification ; vérifiez la formulation des règles sur le texte officiel.');
  L.push('- Les flux automatiques (actualités, nouveautés CNIL, vidéos) ne contiennent que des liens et des titres ; pour le contenu, allez à la source d’origine.');
  L.push('- Les échéances qui n’ont pas pu être confirmées par un texte primaire ne sont pas données.');
  L.push('- Le site ne fait la promotion d’aucun hôpital, produit ou traitement en particulier.');

  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
