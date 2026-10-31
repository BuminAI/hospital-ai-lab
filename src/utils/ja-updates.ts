// 日本語版の更新情報（2026-10-31 新設）
//
// 日本語版のどの分野に、いつ、何が加わったかを、実データの日付だけから組み立てる。
// ⚠️ ビルドした時刻を「更新日」として使わない（JaLayout の注意書きと同じ理由）。
//    ここで使う日付は、ニュースの発行日、補助金の募集開始日、記事の公開日、動画をこのサイトに追加した日だけ。
import { getCollection } from 'astro:content';
import news from '../data/ja/news.json';
import subsidies from '../data/ja/subsidies.json';
import videosLocal from '../data/ja/content/videos-local.json';
import { withBase } from './site';

export type JaUpdate = {
  date: string; // ISO
  kind: 'news' | 'subsidy' | 'video' | 'blog';
  title: string;
  href: string;
  external: boolean;
  note?: string;
};

export const KIND_LABEL: Record<JaUpdate['kind'], string> = {
  news: '医療AIニュース',
  subsidy: '補助金・助成金',
  video: 'おすすめ動画',
  blog: 'ブログ',
};

export async function getJaUpdates(days = 45): Promise<JaUpdate[]> {
  const since = Date.now() - days * 86400000;
  const out: JaUpdate[] = [];

  for (const n of news.items) {
    out.push({ date: n.pubDate, kind: 'news', title: n.title, href: n.link, external: true, note: n.source });
  }
  for (const s of subsidies.items) {
    if (!s.startDate) continue;
    out.push({
      date: s.startDate,
      kind: 'subsidy',
      title: s.title,
      href: s.link,
      external: true,
      note: s.area ? `${s.area}・募集開始` : '募集開始',
    });
  }
  for (const v of videosLocal as { videoId: string; title: string; channel?: string; addedAt?: string }[]) {
    if (!v.addedAt) continue; // 手作業で選んだ動画には追加日がない
    out.push({
      date: v.addedAt,
      kind: 'video',
      title: v.title,
      href: `https://www.youtube.com/watch?v=${v.videoId}`,
      external: true,
      note: v.channel,
    });
  }
  const posts = await getCollection('blogJa', ({ data }) => !data.draft);
  for (const p of posts) {
    out.push({
      date: p.data.pubDate.toISOString(),
      kind: 'blog',
      title: p.data.title,
      href: withBase(`/ja/blog/${p.id}/`),
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
