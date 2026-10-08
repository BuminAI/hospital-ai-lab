// 대만어판(정체자) RSS 피드 (2026-09-06 신설)
//
// 한국어판 src/pages/rss.xml.js와 같은 구조다. 언어판끼리 파일을 공유하지
// 않는 이 저장소의 관례를 따라 복제했다 — 한 언어를 고치다 다른 언어가
// 휘말리는 사고를 막기 위해서다.
//
// ⚠️ 채널의 link/self는 반드시 /tw/ 아래를 가리켜야 한다. 한국어 피드와
//    같은 주소를 쓰면 수집기가 두 피드를 같은 것으로 보고 한쪽을 버린다.
import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { BASE } from '../../utils/site';

const SITE_TW = 'Hospital AI Lab';
const DESC_TW =
  '臺灣醫療 AI 的法規與實務專欄——醫療器材認定、個人資料保護、電子病歷管理，都附上法規原文出處。';

export async function GET(context) {
  const posts = (await getCollection('blogTw', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  // 본문 전체를 실어 보낸다(한국어판과 같은 이유 — 요약만 담은 피드는
  // 수집기가 덜 신뢰한다). 본문은 100% 자체 작성 마크다운이라 별도
  // 정제 라이브러리 없이 그대로 쓴다.
  //
  // ⚠️ 전체가 아니라 최근 글만 담는다. RSS는 "새 글 알림"용이지 전체
  //    아카이브가 아니고, 글이 계속 늘어나면 피드가 끝없이 커진다.
  const RSS_ITEM_LIMIT = 20;
  const container = await AstroContainer.create();
  const items = await Promise.all(
    posts.slice(0, RSS_ITEM_LIMIT).map(async (post) => {
      const { Content } = await render(post);
      const content = await container.renderToString(Content);
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        categories: [post.data.category],
        link: `${BASE}/tw/blog/${post.id}/`,
        content,
      };
    })
  );

  return rss({
    title: SITE_TW,
    description: DESC_TW,
    stylesheet: `${BASE}/tw/rss-styles.xsl`,
    site: new URL(`${BASE}/tw/`, context.site).href,
    items,
    // lastBuildDate는 최신 글 발행일을 쓴다 — 빌드 시각을 쓰면 내용이
    // 안 바뀌어도 매 배포마다 갱신된 것처럼 보인다(뉴스 자동 수집으로
    // 하루에도 여러 번 배포되는 사이트라 실제로 문제가 된다).
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      '<language>zh-TW</language>',
      `<atom:link href="${new URL(`${BASE}/tw/rss.xml`, context.site).href}" rel="self" type="application/rss+xml"/>`,
      posts.length ? `<lastBuildDate>${posts[0].data.pubDate.toUTCString()}</lastBuildDate>` : '',
    ].join(''),
  });
}
