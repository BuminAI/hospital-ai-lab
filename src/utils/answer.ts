// AEO/GEO 보조 유틸 — 한국어·일본어·대만어판 글 공용 (2026-11-04)
//
// 러시아어·인도네시아어판은 이미 같은 일을 하는 ru-aeo.ts·id-aeo.ts를 쓴다. 이 파일은 나머지 세 판용이다.
// ① 글 하단의 요약 소제목(핵심 요약 / まとめ / 重點整理 …) 아래 불릿을 글 맨 위 「답변 상자」로 올린다.
//    답변 엔진(AI 검색·구글 AI 개요·음성 비서)은 글 첫머리의 짧은 답을 가장 많이 인용한다.
//    새 내용을 만들지 않고 글에 이미 있는 요약을 그대로 옮긴다 — 화면에 보이는 것만 마크업한다.
// ② 본문에 실제로 등장하는 주제만 BlogPosting.about 으로 잇는다. 본문에 없는 주제는 절대 넣지 않는다.

export type Loc = 'ko' | 'ja' | 'tw';

const HEADINGS: Record<Loc, string[]> = {
  ko: ['핵심 요약', '정리', '요약'],
  ja: ['まとめ', '要点'],
  tw: ['重點整理', '重點摘要', '重點'],
};

export const ANSWER_LABEL: Record<Loc, { title: string; note: string }> = {
  ko: { title: '핵심 답변', note: '본문 하단의 요약을 위로 옮긴 것입니다. 근거와 한계는 본문과 출처를 확인해 주세요.' },
  ja: { title: '要点', note: '本文末尾の「まとめ」を冒頭に再掲したものです。根拠と限界は本文と出典をご確認ください。' },
  tw: { title: '重點先看', note: '此為文末「重點整理」的前置摘要；依據與限制請見內文與出處。' },
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 요약 소제목 아래 불릿을 평문으로 뽑는다. 없으면 빈 배열. */
export function extractSummary(markdown: string | undefined, loc: Loc): string[] {
  if (!markdown) return [];
  const head = new RegExp(`^##\\s+(?:${HEADINGS[loc].map(esc).join('|')})[^\\r\\n]*\\r?\\n`, 'm');
  const m = markdown.match(head);
  if (!m || m.index === undefined) return [];
  let rest = markdown.slice(m.index + m[0].length);
  const stop = rest.search(/^(?:##\s|<br|\*\*(?:출처|出典|出處|Sumber)|\*(?:출처|出典|出處)|---)/m);
  if (stop >= 0) rest = rest.slice(0, stop);
  const out: string[] = [];
  for (const line of rest.split('\n')) {
    const b = line.match(/^\s*[-*]\s+(.*\S)\s*$/);
    if (!b) continue;
    out.push(
      b[1]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim()
    );
  }
  return out.slice(0, 6);
}

const TOPICS: Record<Loc, [string, RegExp][]> = {
  ko: [
    ['병원 인공지능(AI) 도입', /인공지능|\bAI\b/],
    ['환자 개인정보 보호', /개인정보|가명정보|민감정보/],
    ['의료기기 소프트웨어(SaMD)', /의료기기|SaMD|디지털의료제품/],
    ['생성형 AI', /생성형|ChatGPT|챗GPT|LLM|대규모 언어/i],
    ['전자의무기록(EMR)', /전자의무기록|EMR|EHR/],
    ['사이버 보안', /사이버|해킹|랜섬웨어|보안/],
    ['AI 알림·경보 피로', /알림 피로|경보 피로|알람 피로/],
    ['건강보험 수가·급여', /수가|급여|비급여|건강보험/],
  ],
  ja: [
    ['病院の人工知能(AI)導入', /人工知能|\bAI\b/],
    ['患者の個人情報保護', /個人情報|要配慮/],
    ['プログラム医療機器(SaMD)', /プログラム医療機器|SaMD|医療機器/],
    ['生成AI', /生成AI|ChatGPT|大規模言語/],
    ['電子カルテ', /電子カルテ|電子処方箋/],
    ['医療機関のサイバーセキュリティ', /サイバー|ランサム|セキュリティ/],
    ['補助金・助成', /補助金|助成|交付/],
    ['医療DX', /医療DX|医療ＤＸ/],
  ],
  tw: [
    ['醫院導入人工智慧(AI)', /人工智慧|\bAI\b/],
    ['病人個人資料保護', /個資|個人資料/],
    ['醫療器材軟體(SaMD)', /醫療器材|SaMD/],
    ['生成式AI', /生成式|ChatGPT|大型語言/],
    ['電子病歷', /電子病歷/],
    ['資訊安全', /資安|資通安全|勒索/],
    ['補助與計畫', /補助|計畫/],
  ],
};

export function aboutTopics(text: string, loc: Loc) {
  return TOPICS[loc].filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
