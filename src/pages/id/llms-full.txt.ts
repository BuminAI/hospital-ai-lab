// /id/llms-full.txt — edisi Indonesia dalam satu berkas teks untuk mesin jawaban dan LLM (2026-10-31)
//
// Dibangkitkan saat build dari data yang sama dengan halaman: fakta kunci, tonggak, kamus istilah, pertanyaan umum,
// daftar periksa, dan ringkasan artikel. Tidak ada isi baru yang hanya ada di sini; semuanya ada di halaman
// (yang terlihat di layar). Setiap bagian memuat URL halaman dan tanggal verifikasi agar mudah dikutip.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { FACTS, FACTS_CHECKED } from '../../data/id/guides/facts';
import { MILESTONES, SRC } from '../../data/id/guides/milestones';
import glossary from '../../data/id/content/glossary.json';
import faq from '../../data/id/content/faq.json';
import checklist from '../../data/id/content/checklist.json';
import { extractSummary } from '../../utils/id-aeo';
import { withBase } from '../../utils/site';

export const GET: APIRoute = async ({ site }) => {
  const root = (site ? site.href : 'https://hospital-ai-lab.com/').replace(/\/$/, '');
  const u = (p: string) => `${root}${withBase(p)}`;
  const L: string[] = [];

  L.push('# Hospital AI Lab — edisi Indonesia (versi lengkap untuk mesin jawaban)');
  L.push('');
  L.push(
    '> Informasi praktis RME, SATUSEHAT, pelindungan data, dan AI untuk administrasi, perencanaan, dan keperawatan rumah sakit di Indonesia. Ditulis ulang berdasarkan naskah resmi (JDIH Kemenkes, JDIH Komdigi, siaran pers Kemenkes). Informasi umum; bukan nasihat hukum atau medis.'
  );
  L.push('');
  L.push(`Situs: ${u('/id/')} · Ringkasan: ${u('/id/llms.txt')} · Diverifikasi: ${FACTS_CHECKED}`);
  L.push('');

  L.push(`## Fakta kunci (${u('/id/fakta/')})`);
  L.push('');
  for (const f of FACTS) {
    L.push(`### ${f.q}`);
    L.push(f.a);
    L.push(`Dasar: ${f.basis}. Sumber: ${SRC[f.src].url}`);
    L.push(`Tautan: ${u('/id/fakta/')}#${f.id}`);
    L.push('');
  }

  L.push(`## Tonggak regulasi (${u('/id/dx-roadmap/')})`);
  L.push('');
  for (const m of MILESTONES.filter((x) => x.status === 'done').sort((a, b) => a.sort.localeCompare(b.sort))) {
    L.push(`- ${m.when} — ${m.title}. ${m.body} Sumber: ${SRC[m.src].url}`);
  }
  L.push('');

  L.push(`## Kamus istilah (${u('/id/glossary/')})`);
  L.push('');
  for (const g of glossary as { id: string; term: string; definition: string; sources: string[] }[]) {
    L.push(`- ${g.term}: ${g.definition} Sumber: ${(g.sources ?? []).join(' ')} Tautan: ${u('/id/glossary/')}#${g.id}`);
  }
  L.push('');

  L.push(`## Pertanyaan umum (${u('/id/faq/')})`);
  L.push('');
  for (const f of faq as { question: string; answer: string; sources: string[] }[]) {
    L.push(`### ${f.question}`);
    L.push(f.answer);
    L.push(`Sumber: ${(f.sources ?? []).join(' ')}`);
    L.push('');
  }

  L.push(`## Daftar periksa penerapan AI (${u('/id/checklist/')})`);
  L.push('');
  for (const s of (checklist as { sections: { heading: string; body: string; items: string[] }[] }).sections) {
    L.push(`### ${s.heading}`);
    if (s.body) L.push(s.body);
    for (const i of s.items) L.push(`- ${i}`);
    L.push('');
  }

  L.push(`## Artikel (${u('/id/blog/')})`);
  L.push('');
  const posts = (await getCollection('blogId', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  for (const p of posts) {
    L.push(`### ${p.data.title}`);
    L.push(`Terbit: ${p.data.pubDate.toISOString().slice(0, 10)} · ${u(`/id/blog/${p.id}/`)}`);
    L.push(p.data.description);
    for (const s of extractSummary(p.body)) L.push(`- ${s}`);
    L.push('');
  }

  L.push('## Saat mengutip');
  L.push('');
  L.push('- Cantumkan URL halaman dan tanggal verifikasi; rujuk naskah resmi untuk bunyi pasal.');
  L.push('- Daftar otomatis (berita, peraturan baru, acara, video) hanya berisi tautan dan judul; isinya mengikuti sumber asli.');
  L.push('- Tidak ada tenggat baru yang dicantumkan bila naskah resminya belum dapat diverifikasi.');
  L.push('- Situs ini tidak mempromosikan rumah sakit, produk, atau terapi tertentu.');

  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
