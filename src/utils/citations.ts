// 글 본문에 실제로 걸린 외부 출처 링크를 BlogPosting의 citation으로 옮긴다(2026-09-20).
//
// 화면에 보이는 출처 링크만 쓴다(본문 마크다운에서 그대로 뽑는다). 구글은 보이지 않는
// 콘텐츠를 마크업하는 것을 금지하고, 답변 엔진은 글이 무엇을 근거로 삼았는지 이 필드로
// 읽을 수 있다. 자기 사이트 링크와 중복 주소는 뺀다.
const OWN_HOST = 'hospital-ai-lab.com';

export function citationsOf(markdown: string | undefined, max = 12) {
  if (!markdown) return [];
  const seen = new Set<string>();
  const out: { '@type': 'CreativeWork'; url: string }[] = [];
  for (const m of markdown.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    let url: URL;
    try {
      url = new URL(m[1]);
    } catch {
      continue;
    }
    if (url.hostname === OWN_HOST || url.hostname.endsWith(`.${OWN_HOST}`)) continue;
    url.hash = '';
    const href = url.href;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push({ '@type': 'CreativeWork', url: href });
    if (out.length >= max) break;
  }
  return out;
}
