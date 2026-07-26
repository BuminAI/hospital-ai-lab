import type { APIRoute } from 'astro';
import { BASE } from '../utils/site';

// robots.txt는 `public/robots.txt` 파일이 아니라 이 라우트가 만든다.
// (사이트 주소·base 경로를 astro.config의 site 값에서 그대로 가져오려고 이렇게 했다.
//  public/robots.txt를 따로 만들면 같은 경로를 두 곳에서 생성해 충돌한다 — 만들지 말 것.)
//
// 2026-07-27: AI 검색·에이전트 크롤러를 명시적으로 허용했다(오너 지시, SEO/GEO 작업).
// 와일드카드(*)만으로도 대부분 허용되지만, 일부 크롤러는 자기 이름이 명시된 그룹이
// 없으면 보수적으로 해석하므로 이름을 직접 적어 둔다.
//
// ⚠️ Disallow를 쓰지 않는 이유 (중요 — 되돌리지 말 것)
//   /login/ · /signup/ · /admin/ · /unsubscribe/ · /ai-apps/ 는 이미 페이지 자체에
//   `noindex, nofollow` 메타가 붙어 있다(BaseLayout의 noindex prop). 여기에 robots.txt
//   Disallow를 더하면 크롤러가 페이지를 아예 읽지 못해 **그 noindex 지시를 볼 수 없게** 된다.
//   그 경우 외부 링크만으로도 URL이 색인에 남을 수 있다(스니펫 없는 형태로).
//   색인에서 빼는 목적이라면 "크롤 허용 + noindex"가 정답이고, Disallow는 넣지 않는다.
//
// ⚠️ 그룹 문법 주의
//   robots.txt의 Allow/Disallow는 **바로 위 User-agent 그룹에만** 적용된다. 규칙을
//   맨 아래 한 번만 적으면 마지막 그룹에만 걸린다. 그래서 아래처럼 그룹마다 규칙을
//   완전하게 생성한다(지금은 전부 `Allow: /`라 차이가 없지만, 나중에 규칙을 추가할 때
//   이 구조가 실수를 막아 준다).

// 명시 허용 크롤러. 주석은 누가 왜 필요한지 남긴 것이다.
const CRAWLERS: { group: string; agents: string[] }[] = [
  {
    group: '검색엔진',
    agents: [
      'Googlebot', // 구글
      'Bingbot', // 빙 — ChatGPT 검색이 빙 인덱스를 참조한다
      'Yeti', // 네이버
      'Daumoa', // 다음
    ],
  },
  {
    group: 'AI 검색·에이전트',
    agents: [
      'GPTBot', // OpenAI 수집
      'OAI-SearchBot', // ChatGPT 검색 색인
      'ChatGPT-User', // 사용자가 ChatGPT에서 링크를 열 때
      'ClaudeBot', // Anthropic 수집
      'Claude-Web',
      'anthropic-ai',
      'PerplexityBot', // Perplexity 색인
      'Perplexity-User', // 사용자 질문에 답할 때 실시간 조회
      'Google-Extended', // Gemini 학습·근거 활용 (허용 = 학습 데이터 제공에 동의)
      'Applebot-Extended', // Apple Intelligence 학습
      'Amazonbot',
      'meta-externalagent', // Meta AI
    ],
  },
];

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(`${BASE}/sitemap-index.xml`, site);

  const block = (ua: string) => `User-agent: ${ua}\nAllow: /`;

  const sections = [
    block('*'),
    ...CRAWLERS.map(
      ({ group, agents }) => `# ── ${group} ──\n${agents.map(block).join('\n\n')}`
    ),
  ];

  const body = `${sections.join('\n\n')}\n\nSitemap: ${sitemapURL.href}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
