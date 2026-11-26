// 메타 설명(description) 길이 맞춤 — 구글 검색결과는 대략 155~160자(한자권은 70~80자 폭)에서 잘린다.
// 160자를 넘는 설명만 문장 끝(없으면 절·쉼표 끝, 그것도 없으면 단어 끝)에서 끊어 말줄임표를 붙인다.
// 새 내용을 만들지 않고, 본문 설명은 그대로 두며 <meta>·og·twitter 설명에만 쓴다.
const MAX = 160;
const MIN = 70;

export function fitDescription(text: string | undefined): string {
  const s = (text ?? '').replace(/\s+/g, ' ').trim();
  const chars = [...s];
  if (chars.length <= MAX) return s;
  const head = chars.slice(0, MAX - 1).join('');
  const lastIdx = (re: RegExp) => {
    let idx = -1;
    for (const m of head.matchAll(re)) idx = m.index! + m[0].length;
    return idx;
  };
  const sentence = lastIdx(/[.!?。！？](?=\s|$)/g);
  if (sentence >= MIN) return head.slice(0, sentence).trim();
  const clause = lastIdx(/[;:—–,、，；：](?=\s|$)/g);
  if (clause >= MIN) return head.slice(0, clause - 1).trim() + '…';
  const space = head.lastIndexOf(' ');
  return (space >= MIN ? head.slice(0, space) : head).replace(/[\s,;:—–-]+$/, '') + '…';
}

// 글의 설명문이 너무 짧으면 그 글의 '핵심 요약' 첫 문장들을 이어 붙인다(2026-11-26, Bing 웹마스터의
// '메타 설명이 짧음' 지적과 AI 답변 인용 대비). 새 문장을 만들지 않고 글에 이미 있는 요약만 쓴다.
// 한자·한글·가나 위주의 글은 같은 정보를 적은 글자 수로 담으므로 기준을 낮춘다.
export function extendDescription(text: string, extras: string[] = []): string {
  let out = (text ?? '').replace(/\s+/g, ' ').trim();
  const cjk = ([...out].filter((c) => /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(c)).length) > [...out].length * 0.3;
  const target = cjk ? 90 : 130;
  for (const extra of extras) {
    if ([...out].length >= target) break;
    const add = (extra ?? '').replace(/\*\*|__|`/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
    if (!add || out.includes(add)) continue;
    const joiner = /[.!?。！？]$/.test(out) ? (cjk && /[。！？]$/.test(out) ? '' : ' ') : '. ';
    const next = `${out}${joiner}${add}`;
    const chars = [...next];
    out = chars.length <= MAX ? next : chars.slice(0, MAX - 1).join('').replace(/[\s,;:—–、，-]+$/, '') + '…';
  }
  return out;
}
