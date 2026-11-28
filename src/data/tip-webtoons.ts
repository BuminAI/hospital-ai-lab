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
export type SceneProp =
  | 'upload' | 'badge' | 'magnify' | 'exam' | 'typing' | 'notfound' | 'quotes' | 'checklist' | 'lock'
  | 'mismatch' | 'example' | 'examples' | 'longdoc' | 'nodate' | 'idea' | 'board' | 'dateok';

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

/** 모든 웹툰에 나오는 가상 인물 */
const CAST = { staff: '토리 주임', bot: 'AI 냥이' };

export const tipWebtoons: Record<number, Webtoon> = {
  1: {
    names: CAST,
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
  2: {
    names: CAST,
    panels: [
      {
        caption: '공지문 초안을 AI에게 맡기던 날',
        lines: [{ who: 'staff', text: '공지문 초안 써 줘. 간결하게, 공손하게!' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'typing' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 간결하고 공손하게 써 드렸어요.' },
          { who: 'staff', text: '우리 부서 말투랑 서식이 아닌데… 결국 다시 고쳐야겠네.' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'mismatch' },
      },
      {
        caption: '왜 그럴까요? AI가 생각하는 간결함과 우리 부서의 간결함은 다르기 때문입니다.',
        lines: [{ who: 'bot', text: '제가 아는 “간결함”은 이건데요…' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'mismatch' },
      },
      {
        caption: '해법은 설명 대신 예시입니다. Anthropic(Claude를 만든 회사)의 공식 안내서는 예시가 글의 형식·말투·구조를 맞추는 가장 믿을 만한 방법 중 하나라고 설명합니다. OpenAI의 공식 안내서도 입력과 원하는 결과를 짝지은 예시 몇 개를 넣는 방법을 소개합니다.',
        lines: [{ who: 'staff', text: '설명만 하지 말고, 원하는 모양을 보여 주자.' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'example' },
      },
      {
        caption: '괄호 안만 바꿔 질문 맨 앞에 붙여 넣으세요. 예시 내용은 꾸며 낸 것으로 충분합니다.',
        lines: [{ who: 'staff', text: '이 틀을 맨 앞에 붙이고!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(2, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '[공지] 제목, ■ 변경일 ■ 내용 ■ 문의. 보여 주신 모양대로 썼어요.' },
          { who: 'staff', text: '이제 우리 부서 공지 같네!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'example' },
      },
      {
        caption: '한 가지만 더. 예시가 전부 똑같으면 AI가 의도하지 않은 버릇까지 따라 할 수 있습니다. 가능하면 두세 개를 길이나 내용이 다르게 준비해 두세요. 안내서는 3~5개를 권합니다.',
        lines: [{ who: 'staff', text: '예시 앞뒤에는 “[예시 시작]”, “[예시 끝]”을 적어 구분하자.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'examples' },
      },
      {
        caption: '꼭 알아 둘 점: 예시를 보여 줘도 내용이 틀릴 수 있습니다.',
        lines: [{ who: 'staff', text: '날짜, 장소, 숫자는 발송 전에 직접 확인!' }],
        scene: { staff: 'firm', prop: 'checklist' },
      },
      {
        caption: '예시와 입력에는 환자 이름이나 진료 기록처럼 개인을 알아볼 수 있는 정보를 넣지 마세요.',
        lines: [{ who: 'staff', text: '병원의 정보보호 지침부터 확인!' }],
        scene: { staff: 'firm', prop: 'lock' },
      },
    ],
  },
  3: {
    names: CAST,
    panels: [
      {
        caption: '안내문을 줄이던 날',
        lines: [{ who: 'staff', text: '이 안내문, 짧게 써 줘.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'longdoc' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 확 줄였어요.' },
          { who: 'staff', text: '잠깐, 꼭 들어가야 할 날짜가 빠졌어!' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'nodate' },
      },
      {
        caption: '왜 그럴까요? AI는 우리가 왜 짧게 쓰라고 했는지 모르기 때문에, 어디까지 줄여도 되는지 스스로 가늠할 수 없습니다.',
        lines: [{ who: 'bot', text: '어디까지 줄여도 되는지 몰랐어요…' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'nodate' },
      },
      {
        caption: '해법은 이유 한 줄입니다. Anthropic(Claude를 만든 회사)의 공식 안내서는 왜 그렇게 해야 하는지 알려 주면 AI가 목표를 더 잘 이해해, 더 목적에 맞는 답을 내놓도록 도울 수 있다고 설명합니다. OpenAI의 공식 안내서도 참고할 맥락 정보를 넣으면 도움이 된다고 소개합니다.',
        lines: [{ who: 'staff', text: '왜 짧아야 하는지 알려 주면 되겠구나!' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'idea' },
      },
      {
        caption: '지시 끝에 “왜”를 한 줄 붙입니다. 괄호 안은 상황에 맞게 바꾸세요.',
        lines: [{ who: 'staff', text: '게시판에 붙일 글이라고 알려 주자.' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'board' },
        copy: copyOf(3, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '지나가며 읽는 글이니 세 줄로 줄이고, 날짜와 장소는 남겼어요.' },
          { who: 'staff', text: '필요한 건 남았네!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'dateok' },
      },
      {
        caption: '한 가지만 더. 같은 안내서는 하지 말아야 할 것을 나열하기보다 원하는 모습을 직접 말하라고 권합니다.',
        lines: [{ who: 'staff', text: '“표를 쓰지 마세요”보다 “문장으로 이어서 써 주세요”!' }],
        scene: { staff: 'think', bot: 'ready', prop: 'typing' },
      },
      {
        caption: '꼭 알아 둘 점: 이유를 적어도 내용이 틀릴 수 있습니다.',
        lines: [{ who: 'staff', text: '날짜와 숫자는 직접 확인!' }],
        scene: { staff: 'firm', prop: 'checklist' },
      },
      {
        caption: '환자 이름이나 진료 기록처럼 개인을 알아볼 수 있는 정보는 이유 설명에도 넣지 마세요.',
        lines: [{ who: 'staff', text: '병원의 정보보호 지침부터 확인!' }],
        scene: { staff: 'firm', prop: 'lock' },
      },
    ],
  },
};
