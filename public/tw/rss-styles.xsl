<?xml version="1.0" encoding="UTF-8"?>
<!--
  대만어판(정체자) RSS 피드 표시용 스타일시트 (2026-09-06 신설).
  한국어판 /rss-styles.xsl의 복제이고 문구만 정체자로 바꿨다.
  (이 저장소는 언어판끼리 파일을 공유하지 않는 관례를 따른다 — 한 언어를
   고치다 다른 언어가 휘말리는 사고를 막기 위해서다.)
  글꼴은 정체자용 시스템 폰트로 바꿨다 — Pretendard는 한자 자형을
  충분히 담고 있지 않다(tw-tokens.css와 같은 이유).
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/rss/channel">
    <html lang="zh-TW">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="title" /> · RSS 訂閱</title>
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
            font-family: 'PingFang TC', 'Heiti TC', 'Microsoft JhengHei',
              '微軟正黑體', 'Noto Sans TC', sans-serif;
            line-height: 1.7;
          }
          .wrap { max-width: 44rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
          a { color: var(--primary); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .badge {
            display: inline-block; font-size: 0.8rem; font-weight: 600;
            color: var(--primary); background: #eef4fa; border-radius: 999px;
            padding: 0.2rem 0.75rem;
          }
          h1 { font-size: 1.6rem; margin: 0.75rem 0 0.25rem; letter-spacing: -0.01em; }
          .desc { color: var(--muted); margin-top: 0.25rem; }
          .note {
            margin: 1.75rem 0; padding: 1.1rem 1.25rem; background: var(--surface);
            border: 1px solid var(--border); border-radius: 10px; font-size: 0.95rem;
          }
          .note strong { color: var(--text); }
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
          <span class="badge">RSS 訂閱</span>
          <h1><xsl:value-of select="title" /></h1>
          <p class="desc"><xsl:value-of select="description" /></p>

          <div class="note">
            <strong>這一頁是 RSS 訂閱來源。</strong>
            若要自動收到新文章，請把網址列的連結貼到 RSS 閱讀器
            （例如 Feedly 或 Inoreader）。下面列的是最新的文章，直接點標題就能到網站上閱讀。
          </div>

          <h2>最新文章</h2>
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

          <a class="home" href="{link}">← 回 Hospital AI Lab 首頁</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
