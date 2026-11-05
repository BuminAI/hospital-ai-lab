// Updates of the English edition (2026-11-06)
//
// Collects what was recently added by section, with the dates of the real data.
// ⚠️ The site build time is NOT used as an update date: only the news publication date, the document date, the announcement date, the date a video was added and the article date.
import { getCollection } from 'astro:content';
import news from '../data/en/news.json';
import notices from '../data/en/gov-notices.json';
import videosLocal from '../data/en/content/videos-local.json';
import { withBase } from './site';

export type EnUpdate = {
  date: string; // ISO
  kind: 'news' | 'notice' | 'event' | 'video' | 'blog';
  title: string;
  href: string;
  external: boolean;
  note?: string;
};

export const KIND_LABEL: Record<EnUpdate['kind'], string> = {
  news: 'AI news',
  notice: 'New federal documents',
  event: 'Training and events',
  video: 'Videos',
  blog: 'Articles',
};

export async function getEnUpdates(days = 45): Promise<EnUpdate[]> {
  const since = Date.now() - days * 86400000;
  const out: EnUpdate[] = [];

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
  for (const v of videosLocal as { videoId: string; title: string; channel?: string; addedAt?: string }[]) {
    if (!v.addedAt) continue; // hand-picked videos have no added date
    out.push({
      date: v.addedAt,
      kind: 'video',
      title: v.title,
      href: `https://www.youtube.com/watch?v=${v.videoId}`,
      external: true,
      note: v.channel,
    });
  }
  const posts = await getCollection('blogEn', ({ data }) => !data.draft);
  for (const p of posts) {
    out.push({
      date: p.data.pubDate.toISOString(),
      kind: 'blog',
      title: p.data.title,
      href: withBase(`/en/blog/${p.id}/`),
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
