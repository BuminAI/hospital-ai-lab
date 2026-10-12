import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';

// ── 예약 발행 (2026-10-13 신설) ───────────────────────────────────────────────
// frontmatter의 pubDate에 시각(예: 2026-10-14T13:47:00+09:00)을 적으면, 그 시각이
// 지나기 전에는 이 컬렉션에서 글이 아예 빠진다. 글 목록·상세·RSS·사이트맵·OG 이미지·
// 시리즈·점검표 연결 등 컬렉션을 읽는 모든 곳이 한 번에 같은 규칙을 따르게 하려고
// 개별 페이지가 아니라 **로더 단계**에서 거른다.
//
// 왜 필요한가: 예약 작업이 매일 같은 시각에 5개 언어판 글을 한꺼번에 올리면 발행
// 시각이 기계적으로 보인다. 그렇다고 pubDate를 거짓 시각으로 적으면 구조화 데이터의
// datePublished가 사실과 달라진다. 그래서 '진짜로 그 시각에 공개되는' 방식을 쓴다 —
// 글 파일은 먼저 올려 두고, 정한 시각이 지난 뒤의 배포에서 처음 나타난다.
// (그 시각에 맞춰 배포를 깨우는 일은 .github/workflows/scheduled-publish.yml이 한다.)
//
// ⚠️ pubDate가 날짜만(2026-10-13)이면 그 날 00:00 UTC라 이미 지난 시각이므로 지금처럼
//    바로 공개된다. 기존 글과 관리자 화면(admin.astro)이 만든 글은 영향이 없다.
// ⚠️ 빌드 시각 기준이다. 정확히 몇 시 몇 분에 사이트에 뜨는지는 그 시각 이후 첫 배포가
//    정한다(워크플로가 30분 간격으로 확인한다).
function scheduled(inner: Loader): Loader {
  return {
    ...inner,
    async load(context) {
      await inner.load(context);
      const now = Date.now();
      const waiting: string[] = [];
      for (const [id, entry] of context.store.entries()) {
        const raw = (entry.data as { pubDate?: unknown }).pubDate;
        const t = raw instanceof Date ? raw.getTime() : new Date(String(raw)).getTime();
        if (Number.isFinite(t) && t > now) waiting.push(id);
      }
      for (const id of waiting) context.store.delete(id);
      if (waiting.length > 0) {
        context.logger.info(`예약 발행 대기 ${waiting.length}편 제외: ${waiting.join(', ')}`);
      }
    },
  };
}

// 운영자 메모(ownerNote)는 **오너가 직접 쓴 글에만** 넣는다. 자동 작성 세션이 채우면 안 된다 —
// 사람이 쓰지 않은 것을 사람의 말처럼 보이게 하는 장치가 되어 버린다(CLAUDE.md '글 품질 기준').
const common = {
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  draft: z.boolean().default(false),
  // 연재 시리즈 슬러그(src/data/series.ts·series-locales.ts의 slug). 선택 항목 — 지정하면
  // 그 시리즈 끝에 발행일 순으로 자동 합류한다.
  series: z.string().optional(),
  // 오너가 직접 쓴 한두 문단의 현장 메모(선택). 있으면 글 하단에 따로 표시된다.
  ownerNote: z.string().optional(),
};

const blog = defineCollection({
  loader: scheduled(glob({ pattern: '**/*.md', base: './src/content/blog' })),
  schema: z.object({
    ...common,
    category: z.enum(['논문리뷰', 'AI도구', '칼럼', '소식']),
  }),
});

// 러시아어판 블로그 (2026-08-13 신설). 한국어판 blog와 완전히 별개 컬렉션이다 —
// ko↔ru 글은 번역이 아니라 독립 집필이므로 스키마는 같은 모양이어도 섞지 않는다.
const blogRu = defineCollection({
  loader: scheduled(glob({ pattern: '**/*.md', base: './src/content/blog-ru' })),
  schema: z.object({
    ...common,
    category: z.enum(['Обзор исследований', 'Инструменты ИИ', 'Колонка', 'Новости']),
  }),
});

// 일본어판 블로그 (2026-08-20 신설). 한국어판 blog와 완전히 별개 컬렉션이다 —
// ko↔ja 글은 번역이 아니라 독립 집필이므로 스키마는 같은 모양이어도 섞지 않는다
// (러시아어판 blogRu와 같은 이유).
const blogJa = defineCollection({
  loader: scheduled(glob({ pattern: '**/*.md', base: './src/content/blog-ja' })),
  schema: z.object({
    ...common,
    category: z.enum(['論文レビュー', 'AIツール', 'コラム', 'お知らせ']),
  }),
});

// 인도네시아어판 블로그 (2026-09-06 신설). 다른 언어판과 완전히 별개
// 컬렉션이다 — 번역이 아니라 인도네시아 제도를 조사해 쓰는 독립 집필이므로
// 스키마가 같은 모양이어도 섞지 않는다(blogRu·blogJa와 같은 이유).
const blogId = defineCollection({
  loader: scheduled(glob({ pattern: '**/*.md', base: './src/content/blog-id' })),
  schema: z.object({
    ...common,
    category: z.enum(['Ulasan Riset', 'Alat AI', 'Kolom', 'Kabar']),
  }),
});

const blogTw = defineCollection({
  loader: scheduled(glob({ pattern: '**/*.md', base: './src/content/blog-tw' })),
  schema: z.object({
    ...common,
    category: z.enum(['研究回顧', 'AI 工具', '專欄', '消息']),
  }),
});

export const collections = { blog, blogRu, blogJa, blogId, blogTw };
