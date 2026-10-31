// 台灣版的更新資訊 (2026-10-31 新設)
//
// 用真實資料的日期，組出台灣版各個領域最近新增了什麼。
// ⚠️ 不把「建置網站的時間」當成更新日期。這裡用的日期只有：新聞的發布日、衛福部公告的公告日、
//    教育與活動消息的發布日、影片加入本站的日期、專欄的發布日。
import { getCollection } from 'astro:content';
import news from '../data/tw/news.json';
import notices from '../data/tw/gov-notices.json';
import events from '../data/tw/events.json';
import videosLocal from '../data/tw/content/videos-local.json';
import { withBase } from './site';

export type TwUpdate = {
  date: string; // ISO
  kind: 'news' | 'notice' | 'event' | 'video' | 'blog';
  title: string;
  href: string;
  external: boolean;
  note?: string;
};

export const KIND_LABEL: Record<TwUpdate['kind'], string> = {
  news: 'AI 新聞',
  notice: '政府公告',
  event: '教育與活動',
  video: '推薦影片',
  blog: '專欄',
};

export async function getTwUpdates(days = 45): Promise<TwUpdate[]> {
  const since = Date.now() - days * 86400000;
  const out: TwUpdate[] = [];

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
      note: n.dept ? `${n.source}｜${n.dept}` : n.source,
    });
  }
  for (const e of events.items) {
    out.push({ date: e.pubDate, kind: 'event', title: e.title, href: e.link, external: true, note: e.source });
  }
  for (const v of videosLocal as { videoId: string; title: string; channel?: string; addedAt?: string }[]) {
    if (!v.addedAt) continue; // 手動挑選的影片沒有加入日期
    out.push({
      date: v.addedAt,
      kind: 'video',
      title: v.title,
      href: `https://www.youtube.com/watch?v=${v.videoId}`,
      external: true,
      note: v.channel,
    });
  }
  const posts = await getCollection('blogTw', ({ data }) => !data.draft);
  for (const p of posts) {
    out.push({
      date: p.data.pubDate.toISOString(),
      kind: 'blog',
      title: p.data.title,
      href: withBase(`/tw/blog/${p.id}/`),
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
