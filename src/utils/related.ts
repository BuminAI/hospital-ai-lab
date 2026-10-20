// 글 하단 '함께 읽으면 좋은 글' 고르기 — 주제가 가까운 글을 먼저 보여 준다 (2026-10-21)
//
// 왜 바꿨나: 예전에는 '같은 분류의 최신 3편'이었다. '실무 AI 도구' 분류가 전체의 70%라
// 사실상 모든 글이 같은 최신 3편으로 연결됐고(글 하나가 받는 문맥 링크가 그 3편에 몰림),
// 독자가 읽던 글과 주제가 다른 글이 붙었다. 검색엔진은 내부 링크로 '이 글과 이 글이 같은
// 주제'임을 읽고, 독자는 다음 글로 넘어간다 — 둘 다 주제가 맞아야 효과가 있다.
//
// 방법: 제목(가중 3)·설명(가중 2)·본문 소제목(가중 1)에서 낱말 조각을 뽑아 글마다 벡터를 만들고,
// 흔한 낱말은 덜 쳐 주는 IDF 가중을 곱한 뒤 코사인 유사도로 가까운 글을 고른다.
// 새 콘텐츠를 만들지 않고 기존 글의 제목·설명·소제목만 쓰며, 외부 라이브러리도 쓰지 않는다.
//
// 낱말 조각: 한자·가나·한글은 띄어쓰기로 낱말이 갈리지 않거나 조사가 붙어 있어서 글자 2개씩 묶고,
// 라틴·키릴 문자는 앞 6글자로 어간을 대충 맞춘다(언어판 다섯 개를 한 코드로 처리하려는 선택).

export interface RelatedCandidate {
  id: string;
  /** 마크다운 원문. 소제목(## …)을 뽑는 데 쓴다. 없어도 동작한다. */
  body?: string;
  data: { title: string; description: string; category: string; pubDate: Date };
}

const NO_SPACE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const word of text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
    if (NO_SPACE_SCRIPT.test(word)) {
      const chars = [...word];
      if (chars.length === 1) out.push(word);
      for (let i = 0; i < chars.length - 1; i++) out.push(chars[i] + chars[i + 1]);
    } else if (word.length >= 4) {
      out.push(word.slice(0, 6));
    }
  }
  return out;
}

function termWeights(p: RelatedCandidate): Map<string, number> {
  const w = new Map<string, number>();
  const add = (text: string, weight: number) => {
    for (const t of tokenize(text)) w.set(t, (w.get(t) ?? 0) + weight);
  };
  add(p.data.title, 3);
  add(p.data.description, 2);
  for (const m of (p.body ?? '').matchAll(/^#{2,3}[ \t]+(.+)$/gm)) add(m[1], 1);
  return w;
}

/** 이 점수 아래면 '주제가 가깝다'고 보지 않는다(약한 우연 일치를 거른다). */
const MIN_SCORE = 0.06;

/**
 * @param post   지금 보고 있는 글
 * @param others 후보 글 전체(지금 글 제외). 최신순으로 정렬해 넘긴다 — 점수가 같으면 앞쪽이 이긴다.
 * @param count  보여 줄 개수
 */
export function pickRelated<T extends RelatedCandidate>(post: T, others: T[], count = 3): T[] {
  const pool = [post, ...others];
  const vectors = new Map<string, Map<string, number>>();
  const df = new Map<string, number>();
  for (const p of pool) {
    const v = termWeights(p);
    vectors.set(p.id, v);
    for (const t of v.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const n = pool.length;
  const weigh = (v: Map<string, number>) => {
    const out = new Map<string, number>();
    let norm = 0;
    for (const [t, tf] of v) {
      const x = Math.sqrt(tf) * Math.log(1 + n / (1 + (df.get(t) ?? 0)));
      out.set(t, x);
      norm += x * x;
    }
    return { vec: out, norm: Math.sqrt(norm) || 1 };
  };
  const mine = weigh(vectors.get(post.id)!);

  const scored = others.map((p, index) => {
    const theirs = weigh(vectors.get(p.id)!);
    let dot = 0;
    for (const [t, x] of mine.vec) {
      const y = theirs.vec.get(t);
      if (y) dot += x * y;
    }
    let score = dot / (mine.norm * theirs.norm);
    // 같은 분류는 아주 조금만 우대한다 — 주제가 비슷한 다른 분류의 글이 밀려나지 않게.
    if (p.data.category === post.data.category) score += 0.02;
    return { p, score, index };
  });

  const chosen = scored
    .filter((s) => s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .map((s) => s.p);
  if (chosen.length >= count) return chosen;

  // 모자라면 예전 방식(같은 분류 최신 → 나머지 최신)으로 채운다.
  const taken = new Set(chosen.map((p) => p.id));
  const filler = [
    ...others.filter((p) => p.data.category === post.data.category),
    ...others.filter((p) => p.data.category !== post.data.category),
  ].filter((p) => !taken.has(p.id));
  return [...chosen, ...filler].slice(0, count);
}
