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

// 러시아어판 블로그 (2026-08-13 신설). 한국어판 blog와 완전히 별개 컬렉션이다 —
// ko↔ru 글은 번역이 아니라 독립 집필이므로 스키마는 같은 모양이어도 섞지 않는다.
const blogRu = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-ru' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['Обзор исследований', 'Инструменты ИИ', 'Колонка', 'Новости']),
    draft: z.boolean().default(false),
  }),
});

// 일본어판 블로그 (2026-08-20 신설). 한국어판 blog와 완전히 별개 컬렉션이다 —
// ko↔ja 글은 번역이 아니라 독립 집필이므로 스키마는 같은 모양이어도 섞지 않는다
// (러시아어판 blogRu와 같은 이유).
const blogJa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-ja' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['論文レビュー', 'AIツール', 'コラム', 'お知らせ']),
    draft: z.boolean().default(false),
  }),
});

// 인도네시아어판 블로그 (2026-09-06 신설). 다른 언어판과 완전히 별개
// 컬렉션이다 — 번역이 아니라 인도네시아 제도를 조사해 쓰는 독립 집필이므로
// 스키마가 같은 모양이어도 섞지 않는다(blogRu·blogJa와 같은 이유).
const blogId = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-id' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['Ulasan Riset', 'Alat AI', 'Kolom', 'Kabar']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, blogRu, blogJa, blogId };
