/**
 * 실무 팁 웹툰 — 팁 상세 페이지(/tips/번호/)에 붙는 컷 구성.
 *
 * 어디에 쓰나
 *  · 팁 1~15번: 이 파일의 tipWebtoons.
 *  · 16번부터: tips.ts의 해당 팁 항목 안 `webtoon` 배열(매일 발행 작업이 팁과 함께 한 번에 쓴다).
 *    화면은 두 곳을 webtoonFor()로 똑같이 읽는다.
 *
 * 규칙
 *  · 설명 글과 말풍선에는 해당 팁 원문(tips.ts)에 있는 사실만 쓴다. 새 사실·수치·기관명을 만들지 않는다.
 *  · 복사해 쓰는 문장은 직접 적지 말고 tips.ts의 copy를 그대로 가져온다(두 곳이 어긋나지 않게).
 *  · 등장인물은 가상 인물이고, 환자나 식별 가능한 정보는 그리지 않는다.
 *  · 글자는 그림에 넣지 않고 HTML로 둔다(검색·접근성·한글 깨짐 방지).
 */
import { tips } from './tips';

// 쓸 수 있는 표정과 소품. 여기에 없는 값을 쓰면 빌드가 실패한다(webtoonFor의 검사).
const STAFF_MOODS = ['ask', 'happy', 'surprised', 'think', 'firm'] as const;
const BOT_MOODS = ['ready', 'proud', 'unsure', 'honest'] as const;
const SCENE_PROPS = [
  'upload', 'badge', 'magnify', 'exam', 'typing', 'notfound', 'quotes', 'checklist', 'lock',
  'mismatch', 'example', 'examples', 'longdoc', 'nodate', 'idea', 'board', 'dateok',
  'order', 'tags', 'table', 'prose', 'steps', 'role', 'chart', 'plans', 'count', 'chats', 'newchat', 'conditions',
] as const;
export type StaffMood = (typeof STAFF_MOODS)[number];
export type BotMood = (typeof BOT_MOODS)[number];
export type SceneProp = (typeof SCENE_PROPS)[number];

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

/** tips.ts의 팁 항목 안에 적는 컷. 복사 문장은 다시 쓰지 않고 story 단락 번호(0부터)로 가리킨다 */
export type TipPanel = Omit<WebtoonPanel, 'copy'> & { copyFrom?: number };

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

/** 마지막 두 컷은 팁마다 모양이 같다: '직접 확인'과 '개인정보 지침' */
const checkPanel = (caption: string, text: string): WebtoonPanel => ({
  caption,
  lines: [{ who: 'staff', text }],
  scene: { staff: 'firm', prop: 'checklist' },
});
const lockPanel = (caption: string): WebtoonPanel => ({
  caption,
  lines: [{ who: 'staff', text: '병원의 정보보호 지침부터 확인!' }],
  scene: { staff: 'firm', prop: 'lock' },
});

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
  4: {
    names: CAST,
    panels: [
      {
        caption: '긴 제안서를 AI에게 맡기던 날',
        lines: [{ who: 'staff', text: '“보안 내용만 정리해 줘”라고 먼저 쓰고, 아래에 제안서를 통째로 붙였어.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'longdoc' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 정리해 드렸어요.' },
          { who: 'staff', text: '핵심을 빗나갔네. 일부만 다뤘어.' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'magnify' },
      },
      {
        caption: '해법은 순서입니다. Anthropic(Claude를 만든 회사)의 공식 안내서는 긴 문서나 입력 자료는 위쪽에, 질문과 지시는 그 아래에 두라고 권합니다.',
        lines: [{ who: 'staff', text: '자료가 위, 질문이 아래!' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'order' },
      },
      {
        caption: '같은 안내서는 질문을 맨 끝에 두면 시험에서 답변 품질이 최대 30%까지 좋아질 수 있다고 소개합니다. 특히 자료가 여러 개이고 복잡할 때입니다. 우리 업무에서 같은 폭으로 좋아진다는 뜻은 아닙니다.',
        lines: [{ who: 'staff', text: '30%는 안내서의 시험 결과구나.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'order' },
      },
      {
        caption: '채팅창에서는 자료를 먼저 붙여 넣고, 그다음 줄에 이 틀을 적으세요. 괄호 안은 상황에 맞게 바꾸세요.',
        lines: [{ who: 'staff', text: '자료 먼저 붙이고, 질문은 맨 끝!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(4, 1),
      },
      {
        caption: '한 가지만 더. 자료가 여러 개면 머리글을 붙여 구분하세요.',
        lines: [
          { who: 'staff', text: '“[자료 1: A사 제안서]”, “[자료 2: B사 제안서]” 이렇게!' },
          { who: 'bot', text: '어느 자료의 내용인지 따라가기 쉬워요.' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'tags' },
      },
      checkPanel('꼭 알아 둘 점: 순서를 바꿔도 AI가 틀릴 수 있습니다.', '숫자와 날짜, 계약 조건은 원문에서 직접 확인!'),
      lockPanel('제안서나 공문에 환자 이름 같은 개인정보가 들어 있다면, AI 서비스에 붙여 넣기 전에 병원의 지침부터 확인하세요.'),
    ],
  },
  5: {
    names: CAST,
    panels: [
      {
        caption: '공지문 초안을 부탁하던 날',
        lines: [{ who: 'staff', text: '글머리 기호는 쓰지 마세요.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'typing' },
      },
      {
        lines: [
          { who: 'bot', text: '네! • 첫째 • 둘째 • 셋째…' },
          { who: 'staff', text: '또 목록이잖아!' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'table' },
      },
      {
        caption: '왜 그럴까요? 하지 말라는 말은 AI에게 원하는 모양을 알려 주지 못하기 때문입니다.',
        lines: [{ who: 'bot', text: '그럼 어떤 모양이 좋은 걸까요?' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'table' },
      },
      {
        caption: '해법: 원하는 모양을 말하세요. Anthropic(Claude를 만든 회사)의 공식 안내서는 형식을 조정하는 방법 하나로 “하지 말아야 할 것 대신 해야 할 것을 말하라”를 꼽습니다.',
        lines: [{ who: 'staff', text: '이런 모양으로 써 달라고 하면 되겠네!' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'idea' },
      },
      {
        caption: '안내서의 예는 “마크다운을 쓰지 마세요” 대신 “매끄럽게 이어지는 산문 문단으로 써 주세요”라고 쓰는 것입니다. 병원 업무에서는 이렇게 바꿔 볼 수 있습니다.',
        lines: [{ who: 'staff', text: '괄호 안만 고쳐서 보내자.' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(5, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '짧은 문단 서너 개로 이어서 썼어요.' },
          { who: 'staff', text: '안내문 같아졌네!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'prose' },
      },
      {
        caption: '한 가지만 더. 같은 안내서는 지시의 배경이나 이유를 함께 알려 주면 AI가 더 알맞은 답을 낸다고 설명합니다.',
        lines: [{ who: 'staff', text: '“사내 게시판에 그대로 붙일 글이라 서식 없는 문장이 필요해요.”' }],
        scene: { staff: 'think', bot: 'ready', prop: 'board' },
      },
      checkPanel('꼭 알아 둘 점: 표현을 바꿔도 AI가 모든 지시를 완벽히 따른다고 장담할 수는 없습니다.', '나온 답은 직접 읽고 확인!'),
      lockPanel('환자 이름 등 개인정보는 AI 서비스에 입력하지 마세요.'),
    ],
  },
  6: {
    names: CAST,
    panels: [
      {
        caption: '공지문 초안을 받은 날',
        lines: [
          { who: 'bot', text: '초안 완성이에요!' },
          { who: 'staff', text: '오, 그럴듯한데?' },
        ],
        scene: { staff: 'happy', bot: 'proud', prop: 'prose' },
      },
      {
        caption: '그런데 날짜가 빠졌거나, 문의처가 없거나, 말투가 들쭉날쭉한 부분은 나중에야 발견되곤 합니다.',
        lines: [{ who: 'staff', text: '어? 문의처가 없잖아!' }],
        scene: { staff: 'surprised', bot: 'unsure', prop: 'magnify' },
      },
      {
        caption: '해법: 초안 만들기 → 기준에 비춰 점검 → 반영해 고치기. Anthropic(Claude를 만든 회사)의 공식 안내서는 가장 흔한 연결 방식으로 이런 자기 점검을 소개합니다.',
        lines: [{ who: 'staff', text: '세 단계로 나눠 시키자.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'steps' },
      },
      {
        caption: '안내서는 API로 단계를 나눠 호출하는 개발자용 방식으로 설명하지만, 대화창에서 메시지 세 번으로 따라 해 볼 수 있습니다. 초안이 나온 뒤 이렇게 보내 보세요.',
        lines: [{ who: 'staff', text: '기준을 알려 주고 점검부터!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(6, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '(1) 날짜와 장소: 있어요. (2) 문의처: 빠졌어요. (3) 말투: 중간에 바뀌어요.' },
          { who: 'staff', text: '부족한 곳이 보이네.' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'checklist' },
      },
      {
        caption: '한 가지만 더. 고치기는 점검 결과를 읽고 나서 시키세요. 마음에 안 드는 지적은 빼고 골라서 시킬 수 있습니다.',
        lines: [{ who: 'staff', text: '2번과 3번만 반영해서 다시 써 주세요.' }],
        scene: { staff: 'firm', bot: 'ready', prop: 'steps' },
      },
      checkPanel('꼭 알아 둘 점: AI가 점검했다고 틀린 곳이 모두 걸러진다고 장담할 수는 없습니다.', '날짜, 금액, 규정 내용은 원문과 직접 대조!'),
      lockPanel('환자 이름 등 개인정보는 AI 서비스에 입력하지 마세요.'),
    ],
  },
  7: {
    names: CAST,
    panels: [
      {
        caption: '환자 안내문 초안을 맡기던 날',
        lines: [{ who: 'staff', text: '안내문 초안 부탁해.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'typing' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 오늘은 딱딱한 공문처럼 썼어요.' },
          { who: 'staff', text: '지난번엔 설명서 같더니…' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'mismatch' },
      },
      {
        caption: '왜 그럴까요? 누구의 입장에서 쓰는 글인지 AI가 알지 못하면 답의 결이 흔들리기 쉽습니다.',
        lines: [{ who: 'bot', text: '저는 누구로서 써야 할까요?' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'mismatch' },
      },
      {
        caption: '해법: 역할을 한 문장으로 알려 주세요. Anthropic(Claude를 만든 회사)의 공식 안내서는 역할을 정해 주면 Claude의 행동과 말투가 쓰임새에 맞게 모이고, 한 문장만으로도 차이가 난다고 설명합니다.',
        lines: [{ who: 'staff', text: '역할 한 줄을 먼저 주자.' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'role' },
      },
      {
        caption: '안내서는 시스템 프롬프트(개발자가 미리 정해 두는 지시문)를 기준으로 설명하지만, 같은 문장을 대화창 첫 줄에 적어 보는 것은 쉽게 따라 할 수 있습니다.',
        lines: [{ who: 'staff', text: '첫 줄에 이렇게!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(7, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '원무팀 글을 다듬는 편집자로서 살펴볼게요.' },
          { who: 'staff', text: '방향이 잡혔네!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'role' },
      },
      {
        caption: '한 가지만 더. 읽는 사람도 함께 적으세요. 안내서가 직접 권하는 문장은 아니고 응용한 활용이니, 결과를 읽어 보고 고쳐 쓰세요.',
        lines: [{ who: 'staff', text: '“읽는 사람은 처음 방문하는 고령 이용자입니다.”' }],
        scene: { staff: 'think', bot: 'ready', prop: 'prose' },
      },
      checkPanel('꼭 알아 둘 점: 역할을 정해도 AI가 내용의 정확성까지 보장해 주지는 않습니다.', '날짜, 금액, 규정은 원문과 직접 대조!'),
      lockPanel('환자 이름 등 개인정보는 AI 서비스에 입력하지 마세요.'),
    ],
  },
  8: {
    names: CAST,
    panels: [
      {
        caption: '수십 쪽짜리 규정을 요약시키던 날',
        lines: [{ who: 'staff', text: '이 규정, 요약해 주세요.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'longdoc' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 요약 끝!' },
          { who: 'staff', text: '궁금했던 비용 조건은 한 줄로 지나갔네…' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'magnify' },
      },
      {
        caption: '해법: 요약 전에 관련 부분을 먼저 인용하게 하세요. Anthropic(Claude를 만든 회사)의 공식 안내서는 긴 문서를 다룰 때 “인용으로 답의 근거 잡기”를 권합니다.',
        lines: [{ who: 'staff', text: '근거부터 뽑아 달라고 하자.' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'quotes' },
      },
      {
        caption: '문서에서 관련된 부분을 먼저 인용하게 하면, 관련 내용에 집중하고 나머지를 걸러내는 데 도움이 된다고 설명합니다. 괄호 안은 상황에 맞게 고치세요.',
        lines: [{ who: 'staff', text: '이 문장으로 부탁!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(8, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '관련 문장을 원문 그대로 뽑고, 그 문장만으로 요약했어요.' },
          { who: 'staff', text: '어디서 나온 말인지 보이네.' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'quotes' },
      },
      {
        caption: '한 가지만 더. 뽑힌 문장이 원문에 있는지 검색(Ctrl+F)으로 확인하세요. 안내서가 직접 말한 내용은 아니고 응용한 활용입니다.',
        lines: [{ who: 'staff', text: '원문에 진짜 있는지 찾아보자.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'magnify' },
      },
      checkPanel('꼭 알아 둘 점: 근거를 뽑게 해도 요약이 항상 정확하다고 장담할 수는 없습니다.', '금액, 날짜, 규정 내용은 원문과 직접 대조!'),
      lockPanel('환자 이름 등 개인정보가 담긴 자료는 AI 서비스에 넣지 마세요.'),
    ],
  },
  9: {
    names: CAST,
    panels: [
      {
        caption: '요금제가 궁금해진 날',
        lines: [{ who: 'staff', text: 'Claude Pro와 Max 사용자는 어떤 모델을 가장 많이 쓸까?' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'chart' },
      },
      {
        caption: '공식 안내 문서 네 곳과 웹 검색 결과를 살펴봤지만, 요금제별·제품별 모델 사용 비율이나 순위를 공개한 자료는 찾지 못했습니다.',
        lines: [{ who: 'staff', text: '순위표가 없다고?' }],
        scene: { staff: 'surprised', bot: 'unsure', prop: 'chart' },
      },
      {
        caption: '일부 블로그의 추정치는 공식 수치가 아니고 출처도 불분명해 싣지 않았습니다.',
        lines: [{ who: 'staff', text: '출처 없는 숫자는 거르자.' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'magnify' },
      },
      {
        caption: '공식 문서로 확인되는 가장 큰 차이는 사용량입니다. Max는 Pro 사용량의 5배를 5시간마다, 그리고 매주 제공한다고 설명합니다.',
        lines: [{ who: 'staff', text: '차이는 사용량이구나.' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'plans' },
      },
      {
        caption: 'Pro에는 5시간 한도와 모든 모델에 걸친 주간 한도가 있습니다. Max에는 Fable 모델용 별도 주간 한도도 있습니다. Claude와 Claude Code는 같은 사용 한도를 함께 씁니다.',
        lines: [{ who: 'staff', text: '한도를 같이 쓴다는 점도 기억하자.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'plans' },
      },
      {
        caption: 'Claude Code 문서에 따르면 Anthropic API에서 opus·sonnet·haiku 별칭은 Opus 5.5·Sonnet 5.5·Haiku 5.5를 가리킵니다. Fable 모델은 어느 요금제에서도 기본 모델이 아니어서 직접 골라야 합니다.',
        lines: [{ who: 'bot', text: '이름과 기본 모델은 따로 확인해 주세요.' }],
        scene: { staff: 'think', bot: 'honest', prop: 'checklist' },
      },
      {
        caption: '요금제와 모델 구성은 자주 바뀝니다. 이 내용은 2026-11-20 확인 기준입니다.',
        lines: [{ who: 'staff', text: '내 계정의 기본 모델은 /model 메뉴나 공식 문서에서 직접 확인!' }],
        scene: { staff: 'firm', bot: 'ready', prop: 'typing' },
      },
      lockPanel('어떤 요금제나 모델이 더 좋다는 뜻은 아닙니다. 모델을 고르기 전에, 환자 이름이나 진료기록 같은 개인정보는 넣지 않는다는 원칙부터 확인하세요.'),
    ],
  },
  10: {
    names: CAST,
    panels: [
      {
        caption: '회의록 정리를 맡기던 날',
        lines: [{ who: 'staff', text: '회의록 붙였어. 결정 사항만 정리해 줘.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'longdoc' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 초안을 작성했어요.' },
          { who: 'staff', text: '초안을 써 달라는 게 아닌데?' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'prose' },
      },
      {
        caption: '회의록 속 “다음 주까지 초안을 작성할 것” 같은 문장 때문입니다. 자료와 부탁이 섞이면 어디까지가 자료인지 AI가 헷갈릴 수 있습니다.',
        lines: [{ who: 'bot', text: '그 문장도 부탁인 줄 알았어요…' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'magnify' },
      },
      {
        caption: '해법: 태그로 감싸기. Anthropic(Claude를 만든 회사)의 공식 안내서는 지시·배경 자료·예시·입력이 섞일수록 각각 태그로 감싸면 잘못 해석할 일이 줄어든다고 설명합니다.',
        lines: [{ who: 'staff', text: '<context>로 열고 </context>로 닫는 거구나.' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'tags' },
      },
      {
        caption: '안내서가 예로 드는 context(배경 자료)와 instructions(지시)를 쓰면 이렇게 됩니다. 괄호 안은 상황에 맞게 바꾸세요.',
        lines: [{ who: 'staff', text: '자료 따로, 부탁 따로!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(10, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '자료 안의 결정 사항만 세 줄로 정리했어요.' },
          { who: 'staff', text: '이게 원하던 거야!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'steps' },
      },
      {
        caption: '한 가지만 더. 안내서는 일관되고 내용을 잘 드러내는 태그 이름을 권합니다. 부서 질문 양식으로 정해 두는 것은 이를 응용한 활용입니다.',
        lines: [{ who: 'staff', text: '우리 부서 양식에 이름을 정해 두자.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'checklist' },
      },
      checkPanel('꼭 알아 둘 점: 태그로 나눠도 AI의 답이 항상 정확한 것은 아닙니다.', '날짜, 금액, 결정 내용은 원문과 직접 대조!'),
      lockPanel('환자 이름 등 개인정보가 담긴 자료는 AI 서비스에 넣지 마세요.'),
    ],
  },
  11: {
    names: CAST,
    panels: [
      {
        caption: '여러 일을 한 문장에 담은 날',
        lines: [{ who: 'staff', text: '회의록 읽고 결정 사항 뽑고 담당자 정리한 다음 공지문으로 만들어 줘.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'typing' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 공지문 완성!' },
          { who: 'staff', text: '담당자 정리는 어디 갔어?' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'magnify' },
      },
      {
        caption: '왜 그럴까요? 부탁하는 사람은 다 말했다고 생각하지만, 읽는 쪽에는 한 덩어리로 보이기 때문입니다.',
        lines: [{ who: 'bot', text: '한 덩어리로 보였어요…' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'longdoc' },
      },
      {
        caption: '해법: 번호를 붙여 한 줄씩. Anthropic(Claude를 만든 회사)의 공식 안내서는 순서나 빠짐없음이 중요할 때 번호 목록이나 글머리표로 단계를 적으라고 권합니다.',
        lines: [{ who: 'staff', text: '1, 2, 3으로 나눠 적자!' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'steps' },
      },
      {
        caption: '위 부탁을 이렇게 바꿔 보세요. 괄호 안은 상황에 맞게 바꾸세요.',
        lines: [{ who: 'staff', text: '순서대로 부탁할게.' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(11, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '1. 결정 사항, 2. 담당자, 3. 공지문 초안 순서로 했어요.' },
          { who: 'staff', text: '단계가 한눈에 보이네!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'steps' },
      },
      {
        caption: '한 가지만 더. 원하는 출력 형식과 제약도 구체적으로 알려 주세요. 아래 예문은 안내서의 권고를 응용한 것입니다.',
        lines: [{ who: 'staff', text: '“공지문은 다섯 줄 이내로 써 주세요.”' }],
        scene: { staff: 'think', bot: 'ready', prop: 'prose' },
      },
      checkPanel('꼭 알아 둘 점: 번호를 붙여도 AI가 모든 단계를 정확히 해낸다고 보장되지는 않습니다.', '빠진 단계는 없는지, 날짜·담당자·금액이 원문과 같은지 대조!'),
      lockPanel('환자 이름 등 개인정보가 담긴 자료는 AI 서비스에 넣지 마세요.'),
    ],
  },
  12: {
    names: CAST,
    panels: [
      {
        caption: '안내문 초안을 받은 날',
        lines: [
          { who: 'bot', text: '## 안내 **꼭 확인** 초안이에요!' },
          { who: 'staff', text: '고마워. 메신저에 붙여 볼게.' },
        ],
        scene: { staff: 'ask', bot: 'proud', prop: 'table' },
      },
      {
        caption: '병원 메신저나 문서에 붙여 넣으면 ## 같은 제목 기호와 별표(**)가 그대로 보이는 경우가 있습니다.',
        lines: [{ who: 'staff', text: '기호가 그대로 보이잖아!' }],
        scene: { staff: 'surprised', bot: 'unsure', prop: 'table' },
      },
      {
        caption: '해법 첫째. Anthropic(Claude를 만든 회사)의 공식 안내서는 하지 말아야 할 것보다 해야 할 것을 말하라고 권합니다.',
        lines: [{ who: 'staff', text: '“이어지는 줄글 문단으로 써 주세요.”' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'idea' },
      },
      {
        caption: '둘째, 원하는 답의 모양에 질문의 모양을 맞추세요. 안내서는 프롬프트에서 마크다운(기호로 꾸미는 표기)을 빼면 답의 마크다운도 줄어들 수 있다고 설명합니다.',
        lines: [{ who: 'staff', text: '질문도 평범한 문장으로!' }],
        scene: { staff: 'think', bot: 'ready', prop: 'prose' },
      },
      {
        caption: '이 문장을 복사해 괄호 안만 바꿔 써 보세요.',
        lines: [{ who: 'staff', text: '표나 기호 없이 부탁!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(12, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '이어지는 문장과 짧은 문단으로만 썼어요.' },
          { who: 'staff', text: '그대로 붙여 넣기 좋겠다!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'prose' },
      },
      {
        caption: '한 가지만 더. 답이 쓰일 곳을 알려 주세요. 안내서는 규칙만 던지기보다 이유나 쓰임새를 알려 주는 편이 낫다고 설명합니다. 아래 말은 이를 응용한 예입니다.',
        lines: [{ who: 'staff', text: '“이 글은 병동 단체 메신저에 그대로 붙여 넣습니다.”' }],
        scene: { staff: 'think', bot: 'ready', prop: 'board' },
      },
      checkPanel('꼭 알아 둘 점: 형식을 정해도 내용이 맞다는 보장은 없습니다.', '날짜·시간·담당자·금액은 원문과 직접 대조!'),
      lockPanel('환자 이름 등 개인정보가 담긴 자료는 AI 서비스에 넣지 마세요.'),
    ],
  },
  13: {
    names: CAST,
    panels: [
      {
        caption: '회의 내용을 정리시키던 날',
        lines: [{ who: 'staff', text: '이 회의 내용, 정리해 줘.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'longdoc' },
      },
      {
        lines: [
          { who: 'bot', text: '네! 오늘은 두 줄이에요.' },
          { who: 'staff', text: '지난번엔 한 쪽 가득이더니…' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'mismatch' },
      },
      {
        caption: '보고 양식이나 공지 칸에 맞추려면 결국 사람이 다시 줄이거나 늘려야 합니다.',
        lines: [{ who: 'bot', text: '얼마나 길게 써야 할까요?' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'mismatch' },
      },
      {
        caption: '해법: 원하는 모양을 숫자로. Anthropic(Claude를 만든 회사)의 공식 안내서는 원하는 출력의 형식과 제약을 구체적으로 적으라고 안내합니다. 몇 문장인지, 항목이 몇 개인지, 누가 읽는지 한 줄로 적어 보세요.',
        lines: [{ who: 'staff', text: '몇 개, 몇 문장인지 정해 주자.' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'count' },
      },
      {
        caption: '아래 문장에서 괄호만 바꿔 써 보세요.',
        lines: [{ who: 'staff', text: '세 가지, 한 문장씩!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(13, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '결정 사항 3개를 한 문장씩, 단체 메신저 공지로 썼어요.' },
          { who: 'staff', text: '칸에 맞겠다!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'steps' },
      },
      checkPanel('꼭 알아 둘 점: 분량을 정해도 내용이 맞다는 보장은 없습니다.', '날짜·시간·담당자·금액은 원문과 직접 대조!'),
      lockPanel('환자 이름 등 개인정보가 담긴 자료는 AI 서비스에 넣지 마세요.'),
    ],
  },
  14: {
    names: CAST,
    panels: [
      {
        caption: '오전에는 병동 공지, 오후에는 같은 창에서 회의 보고를 부탁합니다.',
        lines: [{ who: 'staff', text: '이번엔 회의 보고 초안 부탁해.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'chats' },
      },
      {
        caption: '앞의 공지와 자료는 대화 안에 그대로 남아 있어, 보고서 초안에 영향을 줄 수 있습니다.',
        lines: [
          { who: 'bot', text: '아까 병동 공지처럼 써 볼게요!' },
          { who: 'staff', text: '그건 아까 일이야!' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'chats' },
      },
      {
        caption: 'AI가 답을 만들 때 한 번에 참고하는 글의 범위를 “컨텍스트 윈도”라고 부릅니다. 대화가 이어지면 내 말과 AI의 답이 그 안에 쌓입니다.',
        lines: [{ who: 'staff', text: '대화가 계속 쌓이는 거구나.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'chats' },
      },
      {
        caption: 'Anthropic(Claude를 만든 회사)의 공식 문서는 쌓인 글의 양이 늘수록 정확도와 기억해 내는 능력이 떨어진다고 설명합니다.',
        lines: [{ who: 'bot', text: '너무 많이 쌓였어요…' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'chats' },
      },
      {
        caption: '해법: 일 하나에 대화 하나. 주제가 바뀌면 새 대화를 열고 필요한 내용만 다시 알려 주세요. 옮겨 올 것을 추릴 때는 이 문장을 쓰세요.',
        lines: [{ who: 'staff', text: '정리해서 새 대화로 옮기자!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'newchat' },
        copy: copyOf(14, 1),
      },
      {
        caption: '위 설명은 개발자용 문서의 내용이라, 서비스마다 대화를 다루는 방식은 다를 수 있습니다.',
        lines: [{ who: 'staff', text: '쓰는 서비스마다 다를 수 있구나.' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'newchat' },
      },
      checkPanel('꼭 알아 둘 점: 정리해 준 내용도 빠지거나 틀릴 수 있습니다.', '날짜·담당자·금액은 원문과 대조한 뒤 붙여 넣기!'),
      lockPanel('환자 이름 등 개인정보가 담긴 자료는 AI 서비스에 넣지 마세요.'),
    ],
  },
  15: {
    names: CAST,
    panels: [
      {
        caption: '다음 달 교육 일정을 잡던 날',
        lines: [{ who: 'staff', text: '야간 근무 다음 날은 빼고, 신규 간호사는 오전에만, 주말은 제외해서 잡아 줘.' }],
        scene: { staff: 'ask', bot: 'ready', prop: 'conditions' },
      },
      {
        lines: [
          { who: 'bot', text: '결론! 이 날짜들이에요.' },
          { who: 'staff', text: '조건이 다 지켜진 걸까?' },
        ],
        scene: { staff: 'surprised', bot: 'proud', prop: 'conditions' },
      },
      {
        caption: '곧바로 결론만 받으면, 조건 하나가 빠진 답이 나와도 알아채기 어렵습니다.',
        lines: [{ who: 'staff', text: '하나씩 확인하기가 어렵네.' }],
        scene: { staff: 'think', bot: 'unsure', prop: 'magnify' },
      },
      {
        caption: '해법: 답하기 전에 따져 보라고 한 줄. Anthropic(Claude를 만든 회사)의 공식 안내서는 생각 기능이 꺼져 있을 때도 이렇게 부탁하면 단계적인 추론을 끌어낼 수 있다고 설명합니다. 단계를 일일이 적기보다 “충분히 생각해 달라”는 부탁이 더 나은 경우가 많다고도 합니다.',
        lines: [{ who: 'staff', text: '충분히 따져 보고 답해 달라고 하자.' }],
        scene: { staff: 'happy', bot: 'ready', prop: 'idea' },
      },
      {
        caption: '순서를 길게 짜 주기보다 이 한 줄을 질문 끝에 붙여 보세요.',
        lines: [{ who: 'staff', text: '질문 끝에 붙이기!' }],
        scene: { staff: 'firm', bot: 'honest', prop: 'typing' },
        copy: copyOf(15, 1),
      },
      {
        caption: '이런 답을 기대할 수 있습니다',
        lines: [
          { who: 'bot', text: '결론과 함께, 조건마다 어떻게 지켰는지 적었어요.' },
          { who: 'staff', text: '하나씩 대조하기 쉽겠다!' },
        ],
        scene: { staff: 'happy', bot: 'honest', prop: 'checklist' },
      },
      {
        caption: '한 가지만 더. 간단한 문장 다듬기나 짧은 공지에는 답만 길어질 수 있으니, 조건이 여럿 얽힌 질문에만 쓰세요.',
        lines: [{ who: 'staff', text: '짧은 공지에는 빼자.' }],
        scene: { staff: 'think', bot: 'ready', prop: 'prose' },
      },
      checkPanel('꼭 알아 둘 점: 따져 본 과정이 적혀 있다고 결론이 맞다는 보장은 없습니다. 개발자용 문서의 내용이라 서비스와 모델에 따라 결과가 다를 수 있습니다.', '날짜·근무 규정·인원 수는 근무표와 병원 규정에 직접 대조!'),
      lockPanel('직원·환자 이름 등 개인정보가 담긴 자료는 AI 서비스에 넣지 마세요.'),
    ],
  },
};

/** 그림이 조용히 빠지거나 깨지지 않도록 빌드 때 컷을 검사한다 */
function check(no: number, panels: WebtoonPanel[]) {
  const fail = (i: number, why: string): never => {
    throw new Error(`웹툰: 팁 ${no}의 ${i + 1}번째 컷 - ${why}`);
  };
  const oneOf = (list: readonly string[], v: string | undefined) => v === undefined || list.includes(v);
  if (!Array.isArray(panels) || panels.length === 0) fail(0, '컷이 없습니다');
  panels.forEach((p, i) => {
    if (!p.scene) fail(i, 'scene이 없습니다');
    if (!oneOf(STAFF_MOODS, p.scene.staff)) fail(i, `없는 staff 표정 ${p.scene.staff}`);
    if (!oneOf(BOT_MOODS, p.scene.bot)) fail(i, `없는 bot 표정 ${p.scene.bot}`);
    if (!oneOf(SCENE_PROPS, p.scene.prop)) fail(i, `없는 소품 ${p.scene.prop}`);
    if (!p.caption && !p.lines?.length) fail(i, 'caption이나 lines가 있어야 합니다');
    p.lines?.forEach((l) => {
      if (l.who !== 'staff' && l.who !== 'bot') fail(i, 'who는 staff 또는 bot입니다');
      if (!l.text) fail(i, '빈 말풍선이 있습니다');
    });
  });
}

/** 팁 번호의 웹툰. 없으면 undefined */
export function webtoonFor(no: number): Webtoon | undefined {
  const tip = tips.find((t) => t.no === no);
  const inline = tip?.webtoon;
  if (inline && tipWebtoons[no]) throw new Error(`웹툰: 팁 ${no}이 tips.ts와 tip-webtoons.ts 두 곳에 있습니다`);

  const webtoon = inline
    ? {
        names: CAST,
        panels: inline.map(({ copyFrom, ...panel }) =>
          copyFrom === undefined ? panel : { ...panel, copy: copyOf(no, copyFrom) },
        ),
      }
    : tipWebtoons[no];
  if (webtoon) check(no, webtoon.panels);
  return webtoon;
}
