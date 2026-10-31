// Informasi pembaruan edisi Indonesia (2026-10-31)
//
// Merangkai apa yang baru ditambahkan per bidang dengan tanggal data nyata.
// ⚠️ Waktu build situs TIDAK dipakai sebagai tanggal pembaruan. Tanggal yang dipakai hanya: tanggal terbit berita,
//    tanggal penetapan peraturan, tanggal terbit info pelatihan/acara, tanggal video ditambahkan, dan tanggal terbit artikel.
import { getCollection } from 'astro:content';
import news from '../data/id/news.json';
import notices from '../data/id/gov-notices.json';
import events from '../data/id/events.json';
import videosLocal from '../data/id/content/videos-local.json';
import { withBase } from './site';

export type IdUpdate = {
  date: string; // ISO
  kind: 'news' | 'notice' | 'event' | 'video' | 'blog';
  title: string;
  href: string;
  external: boolean;
  note?: string;
};

export const KIND_LABEL: Record<IdUpdate['kind'], string> = {
  news: 'Berita AI',
  notice: 'Peraturan baru',
  event: 'Pelatihan & acara',
  video: 'Video pilihan',
  blog: 'Artikel',
};

export async function getIdUpdates(days = 45): Promise<IdUpdate[]> {
  const since = Date.now() - days * 86400000;
  const out: IdUpdate[] = [];

  for (const n of news.items) {
    out.push({ date: n.pubDate, kind: 'news', title: n.title, href: n.link, external: true, note: n.source });
  }
  for (const n of notices.items) {
    out.push({
      date: n.pubDate,
      kind: 'notice',
      title: n.title,
      href: n.link,
      external: true,
      note: [n.source, n.kind, n.status].filter(Boolean).join(' · '),
    });
  }
  for (const e of events.items) {
    out.push({ date: e.pubDate, kind: 'event', title: e.title, href: e.link, external: true, note: e.source });
  }
  for (const v of videosLocal as { videoId: string; title: string; channel?: string; addedAt?: string }[]) {
    if (!v.addedAt) continue; // video pilihan manual tidak punya tanggal ditambahkan
    out.push({
      date: v.addedAt,
      kind: 'video',
      title: v.title,
      href: `https://www.youtube.com/watch?v=${v.videoId}`,
      external: true,
      note: v.channel,
    });
  }
  const posts = await getCollection('blogId', ({ data }) => !data.draft);
  for (const p of posts) {
    out.push({
      date: p.data.pubDate.toISOString(),
      kind: 'blog',
      title: p.data.title,
      href: withBase(`/id/blog/${p.id}/`),
      external: false,
    });
  }

  const now = Date.now();
  return out
    .filter((u) => {
      const t = new Date(u.date).getTime();
      return !Number.isNaN(t) && t >= since && t <= now + 86400000;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
