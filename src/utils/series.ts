import { getCollection, type CollectionEntry } from 'astro:content';
import { series, type SeriesDef } from '../data/series';

export type Post = CollectionEntry<'blog'>;

export interface ResolvedSeries extends SeriesDef {
  posts: Post[];
  /** 시리즈에서 가장 최근에 발행된 글의 날짜 */
  latest: Date;
}

// 시리즈 정의를 실제 글과 맞춰 본다.
//  - data/series.ts에 적힌 순서 그대로 글을 잇는다.
//  - 없는 글 ID·초안(draft) 글 ID는 빌드를 멈춘다(조용히 빠지지 않게).
//  - frontmatter `series: <slug>`가 있는 글은 명시 목록 뒤에 발행일 순으로 붙는다.
export async function getResolvedSeries(): Promise<ResolvedSeries[]> {
  const all = await getCollection('blog', ({ data }) => !data.draft);
  const byId = new Map(all.map((p) => [p.id, p]));

  return series.map((def) => {
    const explicit = def.postIds.map((id) => {
      const post = byId.get(id);
      if (!post) {
        throw new Error(
          `[series] '${def.slug}' 시리즈에 적힌 글 ID '${id}'가 없습니다(오타이거나 초안입니다). src/data/series.ts를 확인하세요.`
        );
      }
      return post;
    });
    const explicitIds = new Set(def.postIds);
    const tagged = all
      .filter((p) => p.data.series === def.slug && !explicitIds.has(p.id))
      .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
    const posts = [...explicit, ...tagged];
    const latest = new Date(Math.max(...posts.map((p) => p.data.pubDate.valueOf())));
    return { ...def, posts, latest };
  });
}

/** 한 글이 속한 시리즈들과 그 안에서의 위치(이전·다음 글) */
export function seriesOfPost(resolved: ResolvedSeries[], postId: string) {
  return resolved
    .map((s) => {
      const i = s.posts.findIndex((p) => p.id === postId);
      if (i < 0) return null;
      return {
        series: s,
        index: i,
        prev: i > 0 ? s.posts[i - 1] : null,
        next: i < s.posts.length - 1 ? s.posts[i + 1] : null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}
