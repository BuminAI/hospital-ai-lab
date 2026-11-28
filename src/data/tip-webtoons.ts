/**
 * 실무 팁 웹툰 — 팁 번호별 컷 구성. 여기에 번호를 더하면 그 팁 상세 페이지(/tips/번호/)에 웹툰이 붙는다.
 *
 * 규칙
 *  · 설명 글과 말풍선에는 해당 팁 원문(tips.ts)에 있는 사실만 쓴다. 새 사실·수치·기관명을 만들지 않는다.
 *  · 복사해 쓰는 문장은 직접 적지 말고 tips.ts의 copy를 그대로 가져온다(두 곳이 어긋나지 않게).
 *  · 등장인물은 가상 인물이고, 환자나 식별 가능한 정보는 그리지 않는다.
 *  · 글자는 그림에 넣지 않고 HTML로 둔다(검색·접근성·한글 깨짐 방지).
 */
import { tips } from './tips';

export type StaffMood = 'ask' | 'happy' | 'surprised' | 'think' | 'firm';
export type BotMood = 'ready' | 'proud' | 'unsure' | 'honest';
export type SceneProp = 'upload' | 'badge' | 'magnify' | 'exam' | 'typing' | 'notfound' | 'quotes' | 'checklist' | 'lock';

export interface WebtoonPanel {
  /** 컷 위쪽 해설 상자 */
  caption?: string;
  /** 말풍선. 위에서 아래 순서로 읽는다 */
  lines?: { who: 'staff' | 'bot'; text: string }[];
  /** 그림. staff·bot을 빼면 그 인물은 나오지 않는다 */
  scene: { staff?: StaffMood; bot?: BotMood; prop?: SceneProp };
  /** 그림 아래 '복사해 쓰는 문장' 상자 */
  copy?: string;
}

export interface Webtoon {
  /** 말풍선에 붙는 이름 */
  names: { staff: string; bot: string };
  panels: WebtoonPanel[];
}

const copyOf = (no: number, section: number) => {
  const text = tips.find((t) => t.no === no)?.story?.[section]?.copy;
  if (!text) throw new Error(`웹툰: 팁 ${no}의 ${section}번 단락에 copy 문장이 없습니다`);
  return text;
};

export const tipWebtoons: Record<number, Webtoon> = {
  1: {
    names: { staff: '토리 주임', bot: 'AI 냥이' },
    panels: [
      {
        caption: '제안서를 검토하던 어느 날',
        lines: [{ who: 'staff', text: '제안서 PDF 올렸어. 보안 인증은 뭐가 있어?' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'upload' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 「○○ 보안 인증」을 갖추고 있습니다.' },
          { who: 'staff', text: '오, 인증이 있구나.' },
        ],
        scene: { staff: 'happy', bot: 'proud', prop: 'badge' },
      },
      {
        caption: '그런데 원문을 찾아보니',
        lines: [{ who: 'staff', text: '잠깐… 제안서 어디에도 그런 인증은 없는데?' }],
        scene: { staff: 'surprised', bot: 'unsure', prop: 'magnify' },
      },
      {
        caption: '왜 아는 척할까요? 한 연구팀은 지금의 AI가 학습과 평가를 거치면서, “모르겠다”고 하기보다 찍어서라도 답하는 쪽이 유리해지는 구조에 놓여 있다고 설명합니다.',
        lines: [{ who: 'bot', text: '시험에서 비워 두면 0점, 찍으면 맞을 수도 있으니까…' }],
        scene: { bot: 'unsure', prop: 'exam' },
      },
      {
        caption: '해법은 한 문장입니다. 질문 맨 끝에 “모르면 모른다고 말해도 된다”는 허락을 적어 주세요. Anthropic(Claude를 만든 회사)의 공식 안내서는 이렇게 알려 주는 것이 잘못된 정보를 크게 줄여 준다고 소개합니다.',
        lines: [{ who: 'staff', text: '질문 끝에 이 문장을 붙여 보자.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'typing' },
        copy: copyOf(1, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '보안 인증: 문서에서 확인되지 않음.' },
          { who: 'staff', text: '없으면 없다고 해 주니 알아보기 쉽네.' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'notfound' },
      },
      {
        caption: '문서가 길 때는 한 가지만 더. 결론부터 달라고 하지 말고, 근거가 되는 문장을 원문 그대로 먼저 뽑게 하세요.',
        lines: [{ who: 'staff', text: '먼저 뽑고, 뽑은 문장만으로 정리해 줘.' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'quotes' },
        copy: copyOf(1, 2),
      },
      {
        caption: '꼭 알아 둘 점: 거짓 답을 줄여 줄 뿐, 없애 주지는 못합니다.',
        lines: [{ who: 'staff', text: '예산이 걸린 숫자와 계약 조건은 원문에 있는지 직접 찾아봐야지.' }],
        scene: { staff: 'firm', prop: 'checklist' },
      },
      {
        caption: '환자 이름이나 진료 기록처럼 개인을 알아볼 수 있는 정보는 AI 서비스에 넣지 마세요.',
        lines: [{ who: 'staff', text: '병원의 정보보호 지침부터 확인!' }],
        scene: { staff: 'firm', prop: 'lock' },
      },
    ],
  },
};
