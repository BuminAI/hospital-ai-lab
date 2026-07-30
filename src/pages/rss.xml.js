import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { BASE, SITE_TITLE, SITE_TAGLINE } from '../utils/site';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: SITE_TITLE,
    description: SITE_TAGLINE,
    // 브라우저에서 열면 원본 XML 대신 안내 페이지로 보이도록 XSL 스타일시트 지정.
    // RSS 리더는 이 스타일시트를 무시하고 정상적으로 구독한다.
    stylesheet: `${BASE}/rss-styles.xsl`,
    // 채널 링크에도 base(하위 경로)를 포함시킨다.
    site: new URL(`${BASE}/`, context.site).href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: [post.data.category],
      // base(하위 경로)까지 포함해야 GitHub Pages 임시 주소에서도 링크가 살아 있다.
      link: `${BASE}/blog/${post.id}/`,
    })),
    // atom:link rel="self"와 lastBuildDate는 피드 검증기가 요구하는 항목이다.
    // 없으면 경고가 뜨고, 일부 수집기(네이버 서치어드바이저 RSS 제출 포함)가
    // 피드를 덜 신뢰한다. lastBuildDate는 최신 글 발행일을 쓴다 — 빌드 시각을
    // 쓰면 내용이 안 바뀌어도 매 배포마다 갱신된 것처럼 보인다(뉴스 수집으로
    // 하루에도 여러 번 배포되는 사이트라 실제로 문제가 된다).
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      '<language>ko</language>',
      `<atom:link href="${new URL(`${BASE}/rss.xml`, context.site).href}" rel="self" type="application/rss+xml"/>`,
      posts.length ? `<lastBuildDate>${posts[0].data.pubDate.toUTCString()}</lastBuildDate>` : '',
    ].join(''),
  });
}
