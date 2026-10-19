// 빌드 산출물(dist) 전수 검수 스크립트 (2026-09-20 신설).
//
// 사용: `npm run build` 뒤 `node scripts/audit-site.mjs` (--json 이면 기계가 읽는 결과)
//
// 의존성이 없다(정규식으로 Astro가 만든 정형 HTML만 읽는다). 5개 언어판(ko·ja·ru·id·tw)
// 전 페이지를 같은 잣대로 훑어 "논리적으로 맞는가·객관적인가·언어판끼리 획일적인가"를
// 사람 눈 대신 기계로 먼저 걸러낸다. 자동 검사가 통과해도 문장 내용의 사실 여부까지
// 보장하지는 않는다 — 그건 글마다 출처를 직접 확인해야 한다(CLAUDE.md 사실 검증 원칙).
//
// 검사 항목
//  · 메타: title·description 유무와 길이(CJK는 폭 2로 계산), canonical, og·twitter, html lang
//  · 구조: h1 정확히 1개, 이미지 alt, JSON-LD 파싱·WebPage·BreadcrumbList
//  · 다국어: hreflang 자기참조·상호참조·x-default
//  · 링크: 내부 링크가 실제 산출물로 이어지는지
//  · 언어 혼입: 언어판 본문에 다른 언어 문자가 섞였는지(복제 문구 사고, 메모리 참고)
//  · 글: 출처 링크 유무, 과장 표현, 면책 문구
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const SITE = 'https://hospital-ai-lab.com';
const JSON_OUT = process.argv.includes('--json');
const LOCALES = ['ko', 'ja', 'ru', 'id', 'tw'];

const HTML_LANG = { ko: 'ko', ja: 'ja', ru: 'ru', id: 'id', tw: 'zh-TW' };
const OG_LOCALE = { ko: 'ko_KR', ja: 'ja_JP', ru: 'ru_RU', id: 'id_ID', tw: 'zh_TW' };
const HREFLANG = { ko: 'ko', ja: 'ja', ru: 'ru', id: 'id', tw: 'zh-TW' };

// 언어판별 "이 문자가 본문에 보이면 이상하다" 판정
const RE = {
  hangul: /[가-힣]/g,
  kana: /[぀-ヿ]/g,
  cyrillic: /[Ѐ-ӿ]/g,
  han: /[一-鿿]/g,
};
const FOREIGN = {
  ko: ['kana', 'cyrillic'],
  ja: ['hangul', 'cyrillic'],
  ru: ['hangul', 'kana', 'han'],
  id: ['hangul', 'kana', 'cyrillic', 'han'],
  tw: ['hangul', 'kana', 'cyrillic'],
};

// 언어 전환 링크 등 모든 페이지에 있는 자국 밖 표기는 허용한다
const ALLOWED_FOREIGN =
  /한국어|日本語|Русский|Русская версия|Bahasa Indonesia|繁體中文|조영호|병원|연구소|Hospital AI Lab/g;

// 소개 성격의 글이라 외부 출처가 없어도 되는 글(저자 사실의 근거는 briefing.md)
const SOURCE_EXEMPT = new Set(['/blog/starting-hospital-ai-lab/']);

const widthOf = (s) => [...s].reduce((n, ch) => n + (/[ᄀ-ᇿ぀-ヿ㐀-鿿가-힣＀-￯]/.test(ch) ? 2 : 1), 0);
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name === 'index.html' || e.name === '404.html') out.push(p);
  }
  return out;
}

const localeOf = (urlPath) => {
  const m = /^\/(ja|ru|id|tw)(\/|$)/.exec(urlPath);
  return m ? m[1] : 'ko';
};
// dist 경로 → URL 경로
const toUrlPath = (file) => {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  if (rel === '404.html') return '/404.html';
  return '/' + rel.replace(/index\.html$/, '');
};
const urlToFile = (u) => {
  const clean = u.split('#')[0].split('?')[0];
  const cands = [
    path.join(DIST, clean),
    path.join(DIST, clean, 'index.html'),
    path.join(DIST, clean.replace(/\/$/, '') + '.html'),
  ];
  return cands.some((c) => existsSync(c));
};

const meta = (html, re) => {
  const m = re.exec(html);
  return m ? decode(m[1]).trim() : null;
};
const metaTag = (html, attr, name) => {
  const re = new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, 'i');
  const re2 = new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`, 'i');
  const m = re.exec(html) || re2.exec(html);
  return m ? decode(m[1]).trim() : null;
};

const issues = []; // {sev, locale, url, code, msg}
const add = (sev, locale, url, code, msg) => issues.push({ sev, locale, url, code, msg });

const pages = new Map(); // urlPath → info
const files = await walk(DIST);

for (const file of files) {
  const url = toUrlPath(file);
  const html = await readFile(file, 'utf8');
  const locale = localeOf(url);
  const noindex = /<meta[^>]*name="robots"[^>]*noindex/i.test(html);
  const info = { url, locale, noindex, html };
  pages.set(url, info);
}

const isPost = (u) => /\/blog\/[^/]+\/$/.test(u) && !/\/blog\/category\//.test(u);

for (const info of pages.values()) {
  const { url, locale, html, noindex } = info;
  if (url === '/404.html') continue;
  const tag = (sev, code, msg) => add(sev, locale, url, code, msg);

  // ── 메타 ─────────────────────────────────────────
  const lang = meta(html, /<html[^>]*\slang="([^"]*)"/i);
  if (lang !== HTML_LANG[locale]) tag('error', 'html-lang', `html lang="${lang}" (기대 ${HTML_LANG[locale]})`);

  const title = meta(html, /<title>([^<]*)<\/title>/i);
  const desc = metaTag(html, 'name', 'description');
  info.title = title;
  info.desc = desc;
  if (!title) tag('error', 'title-missing', 'title 없음');
  else if (widthOf(title) > 78 && !noindex) tag('warn', 'title-long', `title 폭 ${widthOf(title)} > 78: ${title}`);
  if (!desc) tag('error', 'desc-missing', 'meta description 없음');
  else if (!noindex) {
    const w = widthOf(desc);
    if (w < 60) tag('warn', 'desc-short', `description 폭 ${w} < 60`);
    if (w > 320) tag('warn', 'desc-long', `description 폭 ${w} > 320 (검색결과에서 잘림)`);
  }

  const canonical = meta(html, /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i);
  info.canonical = canonical;
  if (!noindex) {
    if (!canonical) tag('error', 'canonical-missing', 'canonical 없음');
    else if (canonical !== SITE + url) tag('error', 'canonical-mismatch', `canonical ${canonical} ≠ ${SITE + url}`);
  }

  if (!noindex) {
    for (const k of ['og:title', 'og:description', 'og:url', 'og:image', 'og:locale', 'og:type']) {
      if (!metaTag(html, 'property', k)) tag('warn', 'og-missing', `${k} 없음`);
    }
    const ogl = metaTag(html, 'property', 'og:locale');
    if (ogl && ogl !== OG_LOCALE[locale]) tag('error', 'og-locale', `og:locale ${ogl} (기대 ${OG_LOCALE[locale]})`);
    if (!metaTag(html, 'name', 'twitter:card')) tag('warn', 'twitter-missing', 'twitter:card 없음');
  }

  // ── 구조 ─────────────────────────────────────────
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1 && !noindex) tag('error', 'h1-count', `h1 ${h1}개`);
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  for (const im of imgs) if (!/\salt=/.test(im)) tag('warn', 'img-alt', `alt 없는 이미지: ${im.slice(0, 80)}`);

  const ld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const types = new Set();
  let ldOk = true;
  for (const m of ld) {
    try {
      const j = JSON.parse(m[1]);
      for (const n of j['@graph'] || [j]) for (const t of [].concat(n['@type'] || [])) types.add(t);
    } catch {
      ldOk = false;
      tag('error', 'jsonld-parse', 'JSON-LD 파싱 실패');
    }
  }
  info.types = types;
  if (!noindex && ldOk) {
    if (!types.has('WebPage')) tag('warn', 'jsonld-webpage', 'WebPage 노드 없음');
    if (url !== `/${locale === 'ko' ? '' : locale + '/'}` && !types.has('BreadcrumbList') && url !== '/')
      tag('warn', 'jsonld-breadcrumb', 'BreadcrumbList 없음');
  }

  // ── hreflang ────────────────────────────────────
  const hl = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="([^"]*)"[^>]*href="([^"]*)"/gi)].map((m) => ({
    lang: m[1],
    href: m[2],
  }));
  info.hreflang = hl;
  if (hl.length) {
    const self = hl.find((h) => h.lang === HREFLANG[locale]);
    if (!self) tag('error', 'hreflang-self', 'hreflang 자기참조 없음');
    else if (self.href !== canonical) tag('error', 'hreflang-self-mismatch', `자기참조 ${self.href} ≠ canonical`);
    const xd = hl.find((h) => h.lang === 'x-default');
    const ko = hl.find((h) => h.lang === 'ko');
    if (!xd) tag('error', 'hreflang-xdefault', 'x-default 없음');
    else if (ko && xd.href !== ko.href) tag('error', 'hreflang-xdefault-ko', 'x-default가 한국어판을 가리키지 않음');
  }

  // ── 링크 ────────────────────────────────────────
  const bodyHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const hrefs = [...bodyHtml.matchAll(/<a\b[^>]*\shref="([^"]*)"/gi)].map((m) => decode(m[1]));
  const seenBad = new Set();
  for (const h of hrefs) {
    if (!h || h.startsWith('#') || /^(mailto:|tel:|javascript:)/.test(h)) continue;
    let internal = null;
    if (h.startsWith('/') && !h.startsWith('//')) internal = h;
    else if (h.startsWith(SITE)) internal = h.slice(SITE.length) || '/';
    if (internal === null) continue;
    if (!urlToFile(internal) && !seenBad.has(internal)) {
      seenBad.add(internal);
      tag('error', 'link-broken', `깨진 내부 링크 ${internal}`);
    }
  }

  // ── 언어 혼입 ───────────────────────────────────
  const text = decode(
    bodyHtml
      .replace(/<head[\s\S]*?<\/head>/i, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(ALLOWED_FOREIGN, ' ')
  );
  info.textLen = text.replace(/\s+/g, '').length;
  for (const k of noindex ? [] : FOREIGN[locale]) {
    const n = (text.match(RE[k]) || []).length;
    // 출처 매체명·고유명사가 섞이는 건 정상이라 임계값을 둔다
    const limit = isPost(url) ? 12 : 6;
    if (n > limit) tag('warn', 'foreign-script', `${k} 문자 ${n}자 혼입`);
  }
}

// ── hreflang 상호참조 ───────────────────────────────
for (const info of pages.values()) {
  for (const h of info.hreflang || []) {
    if (h.lang === 'x-default' || h.href === info.canonical) continue;
    const target = pages.get(h.href.replace(SITE, ''));
    if (!target) {
      add('error', info.locale, info.url, 'hreflang-target-missing', `${h.lang} → ${h.href} 페이지 없음`);
      continue;
    }
    const back = (target.hreflang || []).find((x) => x.href === info.canonical);
    if (!back) add('error', info.locale, info.url, 'hreflang-not-reciprocal', `${h.href}가 이 페이지를 되가리키지 않음`);
  }
}

// ── 글 검사 ─────────────────────────────────────────
const DISCLAIMER_HINT = {
  ko: /진단이나 조언을 대신하지 않습니다/,
  ja: /診断や助言/,
  ru: /не заменя|не является/i,
  id: /tidak menggantikan|bukan pengganti/i,
  tw: /不能取代|不代替|並非/,
};
const HYPE = {
  ko: /완치|100\s?%|부작용\s?없|확실히\s?낫|(?<![가-힣])기적(?![가-힣]*적)/,
  ja: /完治|100\s?%|副作用なし|必ず治/,
  ru: /100\s?%|полное излечение|без побочных/i,
  id: /100\s?%|sembuh total|tanpa efek samping/i,
  tw: /根治|100\s?%|無副作用|保證/,
};
for (const info of pages.values()) {
  if (!isPost(info.url)) continue;
  const { url, locale, html } = info;
  // 언어판마다 글 본문을 감싸는 태그가 달라(ko는 article, 나머지는 div) <main> 전체에서 본다.
  // 머리·꼬리(내비·푸터의 외부 링크)는 빠지고, 글 본문·출처 줄만 남는다.
  const main = /<main[\s\S]*?<\/main>/i.exec(html)?.[0] ?? '';
  const ext = [...main.matchAll(/<a\b[^>]*\shref="(https?:\/\/[^"]+)"/gi)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith(SITE));
  info.extLinks = ext;
  if (ext.length === 0 && !SOURCE_EXEMPT.has(url)) add('error', locale, url, 'post-no-source', '외부 출처 링크가 하나도 없음(사실 검증 원칙)');
  // 면책 문구는 글 본문이 아니라 사이트 공통 푸터에 나오므로 페이지 전체에서 찾는다.
  const plain = decode(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' '));
  if (!DISCLAIMER_HINT[locale].test(plain)) add('warn', locale, url, 'post-no-disclaimer', '면책 문구를 찾지 못함');
  const mainText = decode(main.replace(/<[^>]+>/g, ' '));
  const unquoted = mainText.replace(/«[^»]*»|「[^」]*」|“[^”]*”|"[^"]*"/g, ' ');
  const hype = HYPE[locale].exec(unquoted);
  if (hype) add('warn', locale, url, 'post-hype', `과장·단정 표현 의심: "${hype[0]}"`);
  if (info.textLen < 900) add('warn', locale, url, 'post-thin', `본문 글자 수 ${info.textLen} (얇은 글)`);
}

// ── 언어판 간 획일성 ────────────────────────────────
const logical = (u, loc) => (loc === 'ko' ? u : u.replace(new RegExp(`^/${loc}`), '')) || '/';
const inventory = {};
for (const loc of LOCALES) inventory[loc] = new Set();
for (const info of pages.values()) {
  if (info.url === '/404.html' || info.noindex) continue;
  const l = logical(info.url, info.locale);
  if (isPost(info.url) || /\/blog\/category\//.test(info.url) || /^\/og\//.test(info.url)) continue;
  inventory[info.locale].add(l);
}
const core = ['/', '/about/', '/blog/', '/news/', '/faq/', '/glossary/', '/checklist/', '/guide/', '/tips/', '/events/', '/videos/'];
const uniformity = {};
for (const loc of LOCALES) uniformity[loc] = core.filter((c) => !inventory[loc].has(c));

// ── 결과 ────────────────────────────────────────────
const bySev = (s) => issues.filter((i) => i.sev === s);
const counts = {};
for (const i of issues) counts[`${i.sev}:${i.code}`] = (counts[`${i.sev}:${i.code}`] || 0) + 1;

const summary = {
  pages: pages.size,
  perLocale: Object.fromEntries(
    LOCALES.map((l) => [l, [...pages.values()].filter((p) => p.locale === l && p.url !== '/404.html').length])
  ),
  errors: bySev('error').length,
  warnings: bySev('warn').length,
  counts,
  missingCorePages: uniformity,
};

if (JSON_OUT) {
  console.log(JSON.stringify({ summary, issues }, null, 2));
} else {
  console.log(`검수 페이지 ${summary.pages}개 · 오류 ${summary.errors} · 경고 ${summary.warnings}`);
  console.log('언어판별 페이지 수:', summary.perLocale);
  console.log('언어판별 빠진 핵심 페이지:', uniformity);
  console.log('\n[유형별 건수]');
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
  const show = (sev) => {
    const rows = bySev(sev).slice(0, 60);
    if (rows.length) console.log(`\n[${sev === 'error' ? '오류' : '경고'} 상위 ${rows.length}건]`);
    for (const r of rows) console.log(`  ${r.locale} ${r.url} · ${r.code} · ${r.msg}`);
  };
  show('error');
  show('warn');
}
process.exitCode = summary.errors > 0 ? 1 : 0;
