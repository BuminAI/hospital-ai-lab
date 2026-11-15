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
