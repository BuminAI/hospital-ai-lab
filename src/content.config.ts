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
  }),
});

export const collections = { blog };
