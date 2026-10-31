// /ru/llms-full.txt — русская редакция одним текстовым файлом для ответных систем и LLM (2026-10-31)
//
// Формируется при сборке из тех же данных, что и страницы: ключевые факты, вехи, словарь, вопросы,
// чек-лист и краткое содержание статей. Ничего, чего нет на страницах, здесь нет.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { FACTS, FACTS_CHECKED } from '../../data/ru/guides/facts';
import { MILESTONES, SRC } from '../../data/ru/guides/milestones';
import glossary from '../../data/ru/content/glossary.json';
import faq from '../../data/ru/content/faq.json';
import checklist from '../../data/ru/content/checklist.json';
import { extractSummary } from '../../utils/ru-aeo';
import { withBase } from '../../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const root = (site ? site.href : 'https://hospital-ai-lab.com/').replace(/\/$/, '');
  const u = (p: string) => `${root}${withBase(p)}`;
  const L: string[] = [];

  L.push('# Hospital AI Lab — русская редакция (полная версия для ответных систем)');
  L.push('');
  L.push(
    '> Практическая информация о персональных данных пациентов, электронных медицинских документах и ИИ для администрации и сестринских служб российских больниц. Составлена по первоисточникам (КонсультантПлюс, портал официального опубликования, Минздрав, Росздравнадзор). Общая информация; не юридическая и не медицинская консультация.'
  );
  L.push('');
  L.push(`Сайт: ${u('/ru/')} · Кратко: ${u('/ru/llms.txt')} · Проверено: ${FACTS_CHECKED}`);
  L.push('');

  L.push(`## Ключевые факты (${u('/ru/fakty/')})`);
  L.push('');
  for (const f of FACTS) {
    L.push(`### ${f.q}`);
    L.push(f.a);
    L.push(`Основание: ${f.basis}. Источник: ${SRC[f.src].url}`);
    L.push(`Ссылка: ${u('/ru/fakty/')}#${f.id}`);
    L.push('');
  }

  L.push(`## Вехи регулирования (${u('/ru/dx-roadmap/')})`);
  L.push('');
  for (const m of MILESTONES.filter((x) => x.status === 'done').sort((a, b) => a.sort.localeCompare(b.sort))) {
    L.push(`- ${m.when} — ${m.title}. ${m.body} Источник: ${SRC[m.src].url}`);
  }
  L.push('');

  L.push(`## Словарь терминов (${u('/ru/glossary/')})`);
  L.push('');
  for (const g of glossary as { id: string; term: string; definition: string; sources: string[] }[]) {
    L.push(`- ${g.term}: ${g.definition} Источник: ${(g.sources ?? []).join(' ')} Ссылка: ${u('/ru/glossary/')}#${g.id}`);
  }
  L.push('');

  L.push(`## Частые вопросы (${u('/ru/faq/')})`);
  L.push('');
  for (const f of faq as { question: string; answer: string; sources: string[] }[]) {
    L.push(`### ${f.question}`);
    L.push(f.answer);
    L.push(`Источник: ${(f.sources ?? []).join(' ')}`);
    L.push('');
  }

  L.push(`## Чек-лист внедрения ИИ (${u('/ru/checklist/')})`);
  L.push('');
  for (const s of (checklist as { sections: { heading: string; body: string; items: string[] }[] }).sections) {
    L.push(`### ${s.heading}`);
    if (s.body) L.push(s.body);
    for (const i of s.items) L.push(`- ${i}`);
    L.push('');
  }

  L.push(`## Статьи (${u('/ru/blog/')})`);
  L.push('');
  const posts = (await getCollection('blogRu', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  for (const p of posts) {
    L.push(`### ${p.data.title}`);
    L.push(`Опубликовано: ${p.data.pubDate.toISOString().slice(0, 10)} · ${u(`/ru/blog/${p.id}/`)}`);
    L.push(p.data.description);
    for (const s of extractSummary(p.body)) L.push(`- ${s}`);
    L.push('');
  }

  L.push('## При цитировании');
  L.push('');
  L.push('- Указывайте URL страницы и дату проверки; формулировки статей сверяйте с официальным текстом.');
  L.push('- Автоматические ленты (новости, новые акты, видео) содержат только ссылки и заголовки; содержание — по первоисточнику.');
  L.push('- Сроки, которые не удалось подтвердить по первичному тексту, не приводятся.');
  L.push('- Сайт не рекламирует конкретные больницы, продукты или методы лечения.');

  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
