// Обновления русской версии (2026-10-31)
//
// Складывает то, что недавно добавлено по разделам, с датами реальных данных.
// ⚠️ Время сборки сайта НЕ используется как дата обновления: только дата выхода новости, дата акта, дата публикации анонса, дата добавления видео и дата статьи.
import { getCollection } from 'astro:content';
import news from '../data/ru/news.json';
import notices from '../data/ru/gov-notices.json';
import videosLocal from '../data/ru/content/videos-local.json';
import { withBase } from './site';

export type RuUpdate = {
  date: string; // ISO
  kind: 'news' | 'notice' | 'event' | 'video' | 'blog';
  title: string;
  href: string;
  external: boolean;
  note?: string;
};

export const KIND_LABEL: Record<RuUpdate['kind'], string> = {
  news: 'Новости ИИ',
  notice: 'Новые акты',
  event: 'Обучение и события',
  video: 'Видео',
  blog: 'Статьи',
};

export async function getRuUpdates(days = 45): Promise<RuUpdate[]> {
  const since = Date.now() - days * 86400000;
  const out: RuUpdate[] = [];

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
    if (!v.addedAt) continue; // вручную отобранные видео не имеют даты добавления
    out.push({
      date: v.addedAt,
      kind: 'video',
      title: v.title,
      href: `https://www.youtube.com/watch?v=${v.videoId}`,
      external: true,
      note: v.channel,
    });
  }
  const posts = await getCollection('blogRu', ({ data }) => !data.draft);
  for (const p of posts) {
    out.push({
      date: p.data.pubDate.toISOString(),
      kind: 'blog',
      title: p.data.title,
      href: withBase(`/ru/blog/${p.id}/`),
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
