import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['논문리뷰', 'AI도구', '칼럼', '소식']),
    draft: z.boolean().default(false),
    /** 홈 히어로에 대표글로 고정할지. 여러 글에 걸려 있으면 가장 최근 글이 노출됨 */
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
