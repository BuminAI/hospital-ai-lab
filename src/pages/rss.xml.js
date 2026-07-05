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
    customData: '<language>ko</language>',
  });
}
