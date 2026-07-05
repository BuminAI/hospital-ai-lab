<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/rss/channel">
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="title" /> · RSS 피드</title>
        <style>
          :root {
            --primary: #0b5394;
            --text: #222222;
            --muted: #5c6670;
            --border: #e5e8ec;
            --surface: #f8fafc;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #ffffff;
            color: var(--text);
            font-family: 'Pretendard Variable', Pretendard, -apple-system,
              BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo',
              'Malgun Gothic', sans-serif;
            line-height: 1.7;
            word-break: keep-all;
          }
          .wrap { max-width: 44rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
          a { color: var(--primary); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .badge {
            display: inline-block; font-size: 0.8rem; font-weight: 600;
            color: var(--primary); background: #eef4fa; border-radius: 999px;
            padding: 0.2rem 0.75rem;
          }
          h1 { font-size: 1.6rem; margin: 0.75rem 0 0.25rem; letter-spacing: -0.02em; }
          .desc { color: var(--muted); margin-top: 0.25rem; }
          .note {
            margin: 1.75rem 0; padding: 1.1rem 1.25rem; background: var(--surface);
            border: 1px solid var(--border); border-radius: 10px; font-size: 0.95rem;
          }
          .note strong { color: var(--text); }
          .note code {
            background: #fff; border: 1px solid var(--border); border-radius: 4px;
            padding: 0.1rem 0.35rem; font-size: 0.85em; word-break: break-all;
          }
          h2 { font-size: 1.05rem; color: var(--muted); margin: 2.25rem 0 0.5rem; }
          ul { list-style: none; margin: 0; padding: 0; }
          li { padding: 1rem 0; border-bottom: 1px solid var(--border); }
          li:first-child { border-top: 1px solid var(--border); }
          .item-title { font-size: 1.1rem; font-weight: 600; }
          .item-desc { color: var(--muted); font-size: 0.95rem; margin-top: 0.35rem; }
          .item-date { color: var(--muted); font-size: 0.8rem; margin-top: 0.35rem; }
          .home { display: inline-block; margin-top: 2rem; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <span class="badge">RSS 피드</span>
          <h1><xsl:value-of select="title" /></h1>
          <p class="desc"><xsl:value-of select="description" /></p>

          <div class="note">
            <strong>이 페이지는 RSS 피드입니다.</strong> 새 글이 올라오면 자동으로
            받아보고 싶다면, RSS 리더(예: Feedly, Inoreader)에 지금 주소창의 링크를
            붙여넣으세요. 지금 보이는 목록이 최신 글입니다. 그냥 사이트에서 읽으시려면
            아래 글 제목을 눌러 이동하시면 됩니다.
          </div>

          <h2>최근 글</h2>
          <ul>
            <xsl:for-each select="item">
              <li>
                <div class="item-title">
                  <a href="{link}"><xsl:value-of select="title" /></a>
                </div>
                <div class="item-desc"><xsl:value-of select="description" /></div>
                <div class="item-date"><xsl:value-of select="pubDate" /></div>
              </li>
            </xsl:for-each>
          </ul>

          <a class="home" href="{link}">← 병원 AI 연구소 홈으로</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
