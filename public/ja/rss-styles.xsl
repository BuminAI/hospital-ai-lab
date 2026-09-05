<?xml version="1.0" encoding="UTF-8"?>
<!--
  日本語版RSSフィードの表示用スタイルシート（2026-09-06新設）。
  韓国語版 /rss-styles.xsl の複製で、文言とフォントだけ日本語に置き換えている。
  （この저장소는 언어판끼리 파일을 공유하지 않는 관례를 따른다 — 한 언어를
   고치다 다른 언어가 휘말리는 사고를 막기 위해서다.）
  フォントは ja-tokens.css のカスタムプロパティ ja-font と同じ構成。
  ⚠️ XMLコメントの中に連続ハイフン（CSS変数の接頭辞など）を書かないこと。
     書くとスタイルシート全体が解析エラーになり、ブラウザで真っ白になる
     （2026-09-06に実際に発生。フィード自体は正常で表示だけ壊れるため、
      ビルドもリンク検査も素通りする）。
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/rss/channel">
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="title" />｜RSSフィード</title>
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
            font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans',
              'Yu Gothic Medium', 'Yu Gothic', YuGothic, Meiryo,
              'Noto Sans JP', sans-serif;
            line-height: 1.95;
            letter-spacing: 0.04em;
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
          <span class="badge">RSSフィード</span>
          <h1><xsl:value-of select="title" /></h1>
          <p class="desc"><xsl:value-of select="description" /></p>

          <div class="note">
            <strong>このページはRSSフィードです。</strong>
            新しい記事を自動で受け取りたい場合は、RSSリーダー（Feedly、Inoreaderなど）に
            アドレスバーのリンクを貼り付けてください。下に表示されているのが最新の記事です。
            サイトで読む場合は、記事のタイトルを押してください。
          </div>

          <h2>最近の記事</h2>
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

          <a class="home" href="{link}">← 病院AI研究所のホームへ</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
