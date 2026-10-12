// 블로그 글 편집 품질 점검기 (2026-10-13 신설)
//
// 목적: "크롤링해서 옮겨 쓴 글" 같은 인상을 주는 요소를 글이 나가기 전에 잡는다.
//   구글이 '크롤링됨 - 현재 색인이 생성되지 않음'으로 돌리는 글의 공통점은 대체로
//   (1) 기사 한 건을 그대로 풀어 쓴 단일 출처 글, (2) 어느 글에나 들어갈 수 있는
//   범용 문장, (3) 소제목·마무리가 매번 같은 틀, (4) 본문을 되풀이하는 요약이다.
//   이 스크립트는 그 신호를 숫자로 보여 준다.
//
// ⚠️ 이건 '탐지기 회피' 도구가 아니다. 글이 실제로 얕은지를 보는 편집 점검표다.
//    점수를 맞추려고 문구만 바꾸면 의미가 없다 — 경고가 뜨면 글에 내용을 더해야 한다.
// ⚠️ 사실 검증은 못 한다(링크가 걸려 있는지만 본다). 출처 대조는 사람이/세션이 따로 한다.
//
// 사용:
//   node scripts/post-quality-check.mjs                 # 전 언어판 요약 + 경고 많은 글 20편
//   node scripts/post-quality-check.mjs <파일...>       # 지정한 글만 상세
//   node scripts/post-quality-check.mjs --since 2026-10-01   # 이 날짜 이후 글만
//   node scripts/post-quality-check.mjs --json          # 원자료
//
// 종료 코드: 지정 파일 모드에서 '오류(ERROR)'급 경고가 있으면 1, 그 외 0.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

const LOCALES = {
  ko: { dir: 'src/content/blog', label: '한국어' },
  ja: { dir: 'src/content/blog-ja', label: '일본어' },
  ru: { dir: 'src/content/blog-ru', label: '러시아어' },
  id: { dir: 'src/content/blog-id', label: '인도네시아어' },
  tw: { dir: 'src/content/blog-tw', label: '대만어' },
};

// 길이 기준(공백 제외 글자 수). CLAUDE.md의 1,500~2,500자는 공백을 포함한 한국어 기준이라
// 공백을 뺀 한국어 글은 1,200~2,100자쯤 된다. 표의문자·키릴·라틴 판은 같은 분량이 다른 글자 수로 나온다.
const LENGTH = {
  ko: [1200, 2400],
  ja: [1000, 2400],
  ru: [1800, 4200],
  id: [1800, 4200],
  tw: [900, 2200],
};

// 범용 문장·AI 말투로 자주 쓰이는 표현. 한두 번은 괜찮고, 많으면 글이 '찍어낸 느낌'을 준다.
// 목록은 완벽하지 않다 — 기준이 아니라 '의심 신호'다.
const FORMULAIC = {
  ko: [
    '살펴보겠습니다', '알아보겠습니다', '짚어보겠습니다', '에 대해 알아', '중요한 역할',
    '매우 중요', '다양한', '이를 통해', '결론적으로', '마무리하며', '이처럼', '뿐만 아니라',
    '라고 전했습니다', '라고 밝혔습니다', '보도에 따르면', '것으로 알려졌습니다',
    '필요가 있습니다', '수 있을 것입니다', '귀추가 주목', '주목할 만합니다',
  ],
  ja: [
    'について解説します', 'ではないでしょうか', 'と言えるでしょう', 'ことが重要です', 'ことが求められます',
    '重要な役割', 'さまざまな', 'このように', '今後の動向', '注目されています', '見逃せません',
  ],
  ru: [
    'Таким образом', 'Важно отметить', 'Стоит отметить', 'стоит отметить', 'в современном мире',
    'играет важную роль', 'В заключение', 'Подводя итог', 'является ключевым', 'в целом',
    'На сегодняшний день', 'Следует отметить',
  ],
  id: [
    'Dalam era digital', 'Penting untuk dicatat', 'Sebagai kesimpulan', 'memainkan peran penting',
    'Di era modern', 'tidak dapat dipungkiri', 'Dengan demikian', 'Oleh karena itu', 'Perlu dicatat',
    'berbagai macam',
  ],
  tw: [
    '值得注意的是', '不可忽視', '扮演重要角色', '總而言之', '綜上所述', '在當今', '隨著科技的發展',
    '具有重要意義', '不容小覷', '多元化',
  ],
};

// 기사 한 건을 옮겨 쓸 때 늘어나는 '전언' 표현
const ATTRIBUTION = {
  ko: [/에 따르면/g, /보도/g, /기사/g, /밝혔/g, /전했/g],
  ja: [/によると/g, /報じ/g, /報道/g, /記事/g, /伝え/g],
  ru: [/по данным/gi, /сообщ/gi, /согласно/gi, /заявил/gi],
  id: [/menurut/gi, /dilaporkan/gi, /disebutkan/gi, /kata /gi],
  tw: [/根據/g, /報導/g, /指出/g, /表示/g],
};

// 1차 출처로 볼 만한 도메인 조각(휴리스틱)
const PRIMARY_HINTS = [
  /\.go\.kr$/, /\.go\.jp$/, /\.gov$/, /\.gov\.[a-z]{2}$/, /\.go\.id$/, /\.gov\.tw$/, /\.mil\.ru$/,
  /^law\.go\.kr$/, /^www\.law\.go\.kr$/, /^elaw\.klri\.re\.kr$/, /^law\.moj\.gov\.tw$/,
  /(^|\.)mfds\.go\.kr$/, /(^|\.)mohw\.go\.kr$/, /(^|\.)pipc\.go\.kr$/, /(^|\.)hira\.or\.kr$/,
  /(^|\.)pmda\.go\.jp$/, /(^|\.)mhlw\.go\.jp$/, /(^|\.)e-gov\.go\.jp$/,
  /(^|\.)minzdrav\.gov\.ru$/, /(^|\.)government\.ru$/, /(^|\.)publication\.pravo\.gov\.ru$/, /(^|\.)pravo\.gov\.ru$/,
  /(^|\.)consultant\.ru$/, /(^|\.)garant\.ru$/, /(^|\.)docs\.cntd\.ru$/, /(^|\.)rg\.ru$/, /(^|\.)roszdravnadzor\.gov\.ru$/,
  /(^|\.)kemkes\.go\.id$/, /(^|\.)satusehat\.kemkes\.go\.id$/, /(^|\.)peraturan\.bpk\.go\.id$/,
  /(^|\.)mohw\.gov\.tw$/, /(^|\.)fda\.gov\.tw$/,
  /(^|\.)nature\.com$/, /(^|\.)thelancet\.com$/, /(^|\.)nejm\.org$/, /(^|\.)jamanetwork\.com$/,
  /(^|\.)bmj\.com$/, /(^|\.)ncbi\.nlm\.nih\.gov$/, /(^|\.)pubmed\.ncbi\.nlm\.nih\.gov$/,
  /(^|\.)who\.int$/, /(^|\.)fda\.gov$/, /(^|\.)doi\.org$/, /(^|\.)arxiv\.org$/, /(^|\.)oecd\.org$/,
];

const SUMMARY_HEADINGS = /(핵심 요약|요약|정리|한 줄|마무리|まとめ|要点|ポイント|Основные выводы|Итоги|Итог|Главное|Коротко|Кратко|Выводы|Rangkuman|Ringkasan|Kesimpulan|重點整理|重點摘要|重點|總結|整理)/;

function readText(p) {
  return readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

function parseFrontmatter(raw) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([A-Za-z_]\w*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1);
    fm[kv[1]] = v;
  }
  return { fm, body: raw.slice(m[0].length) };
}

function stripMarkdown(s) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '');
}

const SOURCE_LINE = /^(\*{0,2})(출처|Источники?|Sumber|出典|参考|來源|来源|資料)/;

function analyze(file, loc) {
  const raw = readText(file);
  const { fm, body } = parseFrontmatter(raw);

  // 본문 / 면책 꼬리 분리 (마지막 단독 '---')
  const lines = body.split('\n');
  let cut = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '---') {
      cut = i;
      break;
    }
  }
  const mainLines = lines.slice(0, cut);

  // 출처 블록 분리
  const prose = [];
  let inSource = false;
  for (const ln of mainLines) {
    const t = ln.trim();
    if (SOURCE_LINE.test(t)) {
      inSource = true;
      continue;
    }
    if (inSource) {
      if (t === '' ) {
        inSource = false;
      }
      continue;
    }
    prose.push(ln);
  }

  // 소제목 분해
  const sections = [];
  let cur = { heading: '(intro)', text: [] };
  for (const ln of prose) {
    const h = /^##\s+(.*)$/.exec(ln);
    if (h) {
      sections.push(cur);
      cur = { heading: h[1].trim(), text: [] };
    } else {
      cur.text.push(ln);
    }
  }
  sections.push(cur);
  const h2 = sections.slice(1).map((s) => s.heading);

  const plain = stripMarkdown(prose.join('\n'));
  const chars = plain.replace(/\s+/g, '').length;

  // 외부 링크
  const links = [...raw.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  const domains = new Set();
  for (const u of links) {
    try {
      const host = new URL(u).hostname.replace(/^www\./, '');
      if (!/hospital-ai-lab\.com$/.test(host)) domains.add(host);
    } catch {
      /* 무시 */
    }
  }
  const primary = [...domains].filter((d) => PRIMARY_HINTS.some((re) => re.test(d)));

  // 범용 표현
  const formulaicHits = [];
  for (const phrase of FORMULAIC[loc] ?? []) {
    const n = plain.split(phrase).length - 1;
    if (n > 0) formulaicHits.push([phrase, n]);
  }
  const formulaicTotal = formulaicHits.reduce((a, [, n]) => a + n, 0);

  // 전언 표현 밀도(1,000자당)
  let attr = 0;
  for (const re of ATTRIBUTION[loc] ?? []) attr += (plain.match(re) ?? []).length;
  const attrPer1k = chars ? (attr / chars) * 1000 : 0;

  // 문장 길이 변동계수
  const sentences = (plain.match(/[^.!?。！？\n]+[.!?。！？]?/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length >= 6);
  const lens = sentences.map((s) => [...s].length);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  const cv = mean ? sd / mean : 0;

  // 요약이 본문을 되풀이하는 정도(마지막 '요약'류 소제목)
  let echo = null;
  const lastIdx = (() => {
    for (let i = sections.length - 1; i >= 1; i--) if (SUMMARY_HEADINGS.test(sections[i].heading)) return i;
    return -1;
  })();
  if (lastIdx > 0) {
    const sumText = stripMarkdown(sections[lastIdx].text.join('\n')).replace(/[\s\p{P}]/gu, '');
    const bodyText = stripMarkdown(
      sections
        .filter((_, i) => i !== lastIdx)
        .map((s) => s.text.join('\n'))
        .join('\n'),
    ).replace(/[\s\p{P}]/gu, '');
    const grams = (t, n = 4) => {
      const out = new Set();
      for (let i = 0; i + n <= t.length; i++) out.add(t.slice(i, i + n));
      return out;
    };
    const sg = grams(sumText);
    const bg = grams(bodyText);
    if (sg.size >= 12) {
      let hit = 0;
      for (const g of sg) if (bg.has(g)) hit++;
      echo = hit / sg.size;
    }
  }

  return {
    file,
    id: basename(file, '.md'),
    loc,
    title: fm.title ?? '',
    description: fm.description ?? '',
    pubDate: fm.pubDate ?? '',
    series: fm.series ?? null,
    draft: fm.draft === 'true',
    chars,
    h2,
    h2Count: h2.length,
    domains: [...domains],
    domainCount: domains.size,
    primaryCount: primary.length,
    formulaicTotal,
    formulaicHits,
    attrPer1k: Math.round(attrPer1k * 10) / 10,
    sentenceCv: Math.round(cv * 100) / 100,
    sentenceCount: sentences.length,
    summaryEcho: echo === null ? null : Math.round(echo * 100) / 100,
    ownerNote: Boolean(fm.ownerNote),
  };
}

function judge(r, ctx) {
  const w = [];
  const [lo, hi] = LENGTH[r.loc];
  if (r.chars < lo) w.push(['WARN', `짧음(${r.chars}자 < ${lo})`]);
  if (r.chars > hi) w.push(['WARN', `김(${r.chars}자 > ${hi})`]);
  const bodyHeads = r.h2.filter((h) => !SUMMARY_HEADINGS.test(h)).length;
  if (bodyHeads < 2 || bodyHeads > 4) w.push(['WARN', `본문 소제목 ${bodyHeads}개(2~4개 권장)`]);
  if (r.domainCount === 0) w.push(['ERROR', '외부 출처 링크 없음']);
  else if (r.domainCount < 2) w.push(['WARN', `단일 출처(${r.domains[0]}) — 기사 한 건을 옮긴 글로 읽힐 수 있음`]);
  if (r.domainCount > 0 && r.primaryCount === 0) w.push(['WARN', '1차 출처(법령·부처 원문·논문 등) 링크 없음']);
  if (r.formulaicTotal >= 3) w.push(['WARN', `범용 표현 ${r.formulaicTotal}회(${r.formulaicHits.map(([p, n]) => `${p}×${n}`).join(', ')})`]);
  if (r.attrPer1k >= 6) w.push(['WARN', `전언 표현이 많음(1,000자당 ${r.attrPer1k}회) — 기사 요약 느낌`]);
  if (r.sentenceCount >= 12 && r.sentenceCv < 0.38) w.push(['WARN', `문장 길이가 단조로움(변동계수 ${r.sentenceCv})`]);
  if (r.summaryEcho !== null && r.summaryEcho >= 0.65) w.push(['WARN', `요약이 본문을 되풀이함(겹침 ${Math.round(r.summaryEcho * 100)}%)`]);
  // 같은 언어판의 다른 글과 소제목이 겹치는지
  const dupHeads = r.h2.filter((h) => !SUMMARY_HEADINGS.test(h) && (ctx.headingCount.get(`${r.loc}|${h}`) ?? 0) > 1);
  if (dupHeads.length) w.push(['WARN', `다른 글과 같은 소제목: ${dupHeads.join(' / ')}`]);
  const key = `${r.loc}|${[...r.description].slice(0, 14).join('')}`;
  if ((ctx.descCount.get(key) ?? 0) > 1) w.push(['WARN', '설명문 첫머리가 다른 글과 같음']);
  return w;
}

function isoWeek(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - y0) / 86400000 + 1) / 7)).padStart(2, '0')}`;
}

// ───────────────────────────── main ─────────────────────────────
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const sinceIdx = args.indexOf('--since');
const since = sinceIdx >= 0 ? args[sinceIdx + 1] : null;
const fileArgs = args.filter((a, i) => !a.startsWith('--') && (sinceIdx < 0 || i !== sinceIdx + 1));

const all = [];
for (const [loc, { dir }] of Object.entries(LOCALES)) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) continue;
  for (const f of readdirSync(abs)) {
    if (!f.endsWith('.md')) continue;
    if (f === 'starting-hospital-ai-lab.md') continue; // 소개 글(발행 규칙 대상 아님)
    all.push(analyze(join(abs, f), loc));
  }
}

const published = all.filter((r) => !r.draft);
const ctx = { headingCount: new Map(), descCount: new Map(), weekly: new Map() };
for (const r of published) {
  for (const h of new Set(r.h2)) ctx.headingCount.set(`${r.loc}|${h}`, (ctx.headingCount.get(`${r.loc}|${h}`) ?? 0) + 1);
  const dk = `${r.loc}|${[...r.description].slice(0, 14).join('')}`;
  ctx.descCount.set(dk, (ctx.descCount.get(dk) ?? 0) + 1);
  const wk = isoWeek(r.pubDate);
  if (wk) ctx.weekly.set(`${r.loc}|${wk}`, (ctx.weekly.get(`${r.loc}|${wk}`) ?? 0) + 1);
}
for (const r of published) {
  r.warnings = judge(r, ctx);
  const wk = isoWeek(r.pubDate);
  r.week = wk;
  r.weekCount = wk ? ctx.weekly.get(`${r.loc}|${wk}`) ?? 0 : 0;
}

// --week-count <언어판>: 이번 주(ISO 주)에 그 언어판에 이미 잡혀 있는 글 수(예약분 포함)만 출력한다.
// 예약 작업이 '이번 주 3편을 넘기지 않는다'는 규칙을 지키는 데 쓴다.
const wcIdx = args.indexOf('--week-count');
if (wcIdx >= 0) {
  const loc = args[wcIdx + 1];
  const wk = isoWeek(new Date().toISOString());
  console.log(ctx.weekly.get(`${loc}|${wk}`) ?? 0);
  process.exit(0);
}

let target = published;
if (since) target = target.filter((r) => String(r.pubDate).slice(0, 10) >= since);
if (fileArgs.length) {
  const want = new Set(fileArgs.map((f) => resolve(f).toLowerCase()));
  target = published.filter((r) => want.has(resolve(r.file).toLowerCase()));
  if (target.length === 0) {
    // draft이거나 새 글이라 위 집계에 없을 수 있다 — 개별 분석
    for (const f of fileArgs) {
      const loc = Object.entries(LOCALES).find(([, v]) => resolve(f).replace(/\\/g, '/').includes(`/${v.dir}/`))?.[0];
      if (!loc) continue;
      const r = analyze(resolve(f), loc);
      r.warnings = judge(r, ctx);
      target.push(r);
    }
  }
}

if (asJson) {
  console.log(JSON.stringify(target, null, 1));
  process.exit(0);
}

const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '-');
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

if (!fileArgs.length) {
  console.log(`점검 대상 ${target.length}편${since ? ` (${since} 이후)` : ''}\n`);
  console.log('언어판   글수  중앙값(자)  단일출처  1차출처無  범용표현≥4  요약되풀이  단조문장  소제목중복');
  for (const [loc, { label }] of Object.entries(LOCALES)) {
    const g = target.filter((r) => r.loc === loc);
    if (!g.length) continue;
    const c = (pred) => g.filter(pred).length;
    console.log(
      `${(label + '      ').slice(0, 7)} ${String(g.length).padStart(4)}  ${String(median(g.map((r) => r.chars))).padStart(9)}  ` +
        `${pct(c((r) => r.domainCount < 2), g.length).padStart(8)}  ` +
        `${pct(c((r) => r.domainCount > 0 && r.primaryCount === 0), g.length).padStart(9)}  ` +
        `${pct(c((r) => r.formulaicTotal >= 4), g.length).padStart(10)}  ` +
        `${pct(c((r) => r.summaryEcho !== null && r.summaryEcho >= 0.65), g.length).padStart(10)}  ` +
        `${pct(c((r) => r.sentenceCount >= 12 && r.sentenceCv < 0.38), g.length).padStart(8)}  ` +
        `${pct(c((r) => r.warnings.some(([, m]) => m.startsWith('다른 글과 같은 소제목'))), g.length).padStart(9)}`,
    );
  }
  const over = [...ctx.weekly.entries()].filter(([, n]) => n > 3);
  console.log(`\n주당 3편 초과 발행(언어판|주): ${over.length}건${over.length ? ' — ' + over.slice(-6).map(([k, n]) => `${k}:${n}`).join(', ') : ''}`);

  const ranked = [...target].sort((a, b) => b.warnings.length - a.warnings.length).slice(0, 20);
  console.log('\n경고가 많은 글 상위 20편');
  for (const r of ranked) {
    console.log(`  [${r.loc}] ${r.id}  (경고 ${r.warnings.length})`);
  }
  process.exit(0);
}

let hasError = false;
for (const r of target) {
  console.log(`\n■ [${r.loc}] ${r.id}`);
  console.log(`  ${r.title}`);
  console.log(
    `  글자 ${r.chars} · 소제목 ${r.h2Count} · 출처 도메인 ${r.domainCount}(1차 ${r.primaryCount}) · 범용표현 ${r.formulaicTotal} · ` +
      `전언 ${r.attrPer1k}/1k · 문장변동 ${r.sentenceCv} · 요약겹침 ${r.summaryEcho ?? '-'}`,
  );
  if (r.weekCount > 3) console.log(`  ⚠ 같은 주(${r.week}) ${r.loc}판 ${r.weekCount}편째 — 주당 3편 이내 권장`);
  if (!r.warnings.length) console.log('  ✓ 경고 없음');
  for (const [lvl, msg] of r.warnings) {
    console.log(`  ${lvl === 'ERROR' ? '✗' : '⚠'} ${msg}`);
    if (lvl === 'ERROR') hasError = true;
  }
}
process.exit(hasError ? 1 : 0);
