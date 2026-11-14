// 광폭 수집기 공통 라이브러리 (2026-11-14, 오너 지시: 각 나라 유명 매체 전체에서 조회수 많은 것을 매일)
//
// 하는 일: 공개 RSS/Atom/RDF를 읽어 → 언어별 키워드로 'AI 관련'만 골라 → 기존 JSON에 중복 없이 누적한다.
// 하지 않는 일: 기사 본문 복사(제목·링크·날짜·출처만 저장), 로그인·봇 차단 우회, 존재하지 않는 값 창작.
//
// 설계 원칙
//  - 한 출처가 죽어도 나머지는 계속 간다. 모든 출처가 실패했을 때만 기존 파일을 그대로 둔다(덮어쓰지 않음).
//  - 기존 항목은 절대 지우지 않는다(MAX_ITEMS를 넘을 때만 오래된 것부터 자른다).
//  - '많이 본 기사' 피드(popular:true)에서 온 항목에는 popular·rank를 붙인다. 이미 있는 항목이면 그 표시만 갱신한다.
//  - 의료 전문 매체(topic:'health')는 AI 단어만, 종합·IT 매체(topic:'tech'|'general')는 AI+의료 단어를 모두 요구한다.
//    정부 기관(topic:'gov')은 AI·디지털헬스 단어 또는 지원사업 단어를 요구한다.
import { readFile, writeFile } from 'node:fs/promises';

export const UA = 'hospital-ai-lab news fetcher (+https://hospital-ai-lab.com)'; // 봇임을 밝힌다. 브라우저 UA에 봇 이름을 덧붙이면 오히려 WAF에 막힌다(2026-11-14 실측).

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchText(url, { tries = 3, timeout = 25000, headers = {} } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*', ...headers },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeout),
      });
      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer());
        // 인코딩: 응답 헤더 또는 XML 선언의 charset을 따른다(일본·한국 일부 피드는 Shift_JIS·EUC-KR).
        const ct = res.headers.get('content-type') || '';
        let cs = (/charset=([\w-]+)/i.exec(ct) || [])[1];
        if (!cs) {
          const head = new TextDecoder('latin1').decode(buf.slice(0, 300));
          cs = (/encoding=["']([\w-]+)["']/i.exec(head) || [])[1];
        }
        try {
          return new TextDecoder((cs || 'utf-8').toLowerCase()).decode(buf);
        } catch {
          return new TextDecoder('utf-8').decode(buf);
        }
      }
      last = new Error(`HTTP ${res.status}`);
      if ([403, 404, 410].includes(res.status)) break; // 재시도해도 같다
    } catch (e) {
      last = e;
    }
    await sleep(900 * (i + 1));
  }
  throw last;
}

// ── 문자 처리 ─────────────────────────────────────────
export function decode(s) {
  return String(s ?? '')
    .replace(/<!\[CDATA\[([^]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCp(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => safeCp(Number(n)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, '&');
}
function safeCp(n) {
  try {
    return String.fromCodePoint(n);
  } catch {
    return '';
  }
}
// 제목·요약에 태그가 끼어들면 JSON-LD·화면에서 문제가 되므로 모두 벗긴다(2회 디코드: 이중 인코딩 대비).
export const clean = (s) =>
  decode(decode(s).replace(/<[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ── 피드 파싱 (RSS 2.0 / RDF / Atom) ───────────────────
export function parseFeed(xml, baseUrl = '') {
  const blocks = xml.split(/<item[\s>]|<entry[\s>]/).slice(1);
  const rows = [];
  for (const b of blocks) {
    const tag = (n) => {
      const m = b.match(new RegExp(`<${n}(?:\\s[^>]*)?>([^]*?)</${n}>`, 'i'));
      return m ? m[1] : '';
    };
    const title = clean(tag('title'));
    let link = decode(tag('link')).trim();
    if (!link) {
      const m = b.match(/<link[^>]*href=["']([^"']+)["']/i); // Atom
      if (m) link = decode(m[1]).trim();
    }
    if (!link) link = decode(tag('guid')).trim();
    try {
      link = new URL(link, baseUrl || undefined).toString();
    } catch {
      continue;
    }
    const dateRaw = tag('pubDate') || tag('dc:date') || tag('published') || tag('updated') || tag('dcterms:issued');
    let d = dateRaw ? new Date(decode(dateRaw).trim()) : null;
    if (d && Number.isNaN(d.getTime())) d = null;
    const desc = clean(tag('description') || tag('summary') || tag('content:encoded') || tag('content')).slice(0, 300);
    if (!title || !/^https?:\/\//.test(link)) continue;
    rows.push({ title, link, desc, pubDate: d ? d.toISOString() : null });
  }
  return rows;
}

// ── 링크 정규화(중복 판정용) ───────────────────────────
export function canonLink(u) {
  try {
    const x = new URL(u);
    for (const k of [...x.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|ref$|from$|cid$|rss|mkt$|ocid$|source$)/i.test(k)) x.searchParams.delete(k);
    }
    x.hash = '';
    let s = x.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s.replace(/^http:\/\//, 'https://').replace('://www.', '://').toLowerCase();
  } catch {
    return String(u).toLowerCase();
  }
}
export const normTitle = (t) => String(t || '').toLowerCase().replace(/[\s'"‘’“”「」『』«»„“`\-–—:;,.!?·…\[\]()<>]/g, '');

// ── 언어별 키워드 ──────────────────────────────────────
// 라틴·한자·한글은 \b·\p{L} 경계가 달라서 언어마다 따로 쓴다. 키릴 문자는 JS의 \b가 듣지 않으므로 lookaround를 쓴다.
const L = (s) => `(?<![\\p{L}\\p{N}])(?:${s})(?![\\p{L}\\p{N}])`;
export const TERMS = {
  en: {
    ai: new RegExp(
      '(?<![A-Za-z])AI(?![A-Za-z])|\\bA\\.I\\.|artificial intelligence|machine learning|deep learning|generative|large language model|\\bLLMs?\\b|chatbot|agentic|\\bChatGPT\\b|\\bGemini\\b|\\bClaude\\b|\\bCopilot\\b|\\bOpenAI\\b|neural network',
      'i'
    ),
    health: /health|hospital|clinic|patient|medical|medicine|medication|\bnurs(e|es|ing)\b|doctor|physician|pharma|\bdrugs?\b|\bFDA\b|\bCMS\b|HIPAA|radiolog|diagnos|surgery|surgeon|surgical|cancer|disease|therap|biotech|\bEHR\b|telehealth|dementia|\bcare\b|\bMOH\b|\bNHS\b|\bICMR\b|\bCDSCO\b|\bHSA\b/i,
    digital: /digital health|health ?IT|\bEHR\b|electronic (health|medical) record|interoperab|telehealth|telemedicine|cyber|data breach|medical device|software as a medical|\bSaMD\b|\bFHIR\b|\bABDM\b|\bPDPA\b|\bDPDP\b/i,
  },
  ko: {
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|인공지능|생성형|챗\s?GPT|\bLLM\b|머신러닝|딥러닝|거대언어모델|챗봇|에이전트|제미나이|클로드|코파일럿|오픈AI|딥시크/i,
    health: /병원|의료|의사|의대|간호|환자|보건|헬스|건강|진료|제약|의약|바이오|임상|질병|수술|복지부|식약처|디지털\s?헬스|약사|약국|건보|심평원|치료|진단/,
    digital: /디지털\s?헬스|의료\s?데이터|전자의무기록|EMR|마이데이터|비대면\s?진료|원격의료|사이버|해킹|개인정보|의료기기|SaMD|소프트웨어/,
  },
  ja: {
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|人工知能|生成AI|ChatGPT|LLM|機械学習|ディープラーニング|大規模言語モデル|チャットボット|エージェント|Gemini|Claude|Copilot/i,
    health: /病院|医療|医師|看護|患者|厚労|ヘルスケア|診療|薬|介護|健康|臨床|医薬|創薬|診断|手術|医学|クリニック|保健|がん|疾患/,
    digital: /デジタルヘルス|電子カルテ|医療DX|サイバー|情報漏えい|医療機器|プログラム医療機器|SaMD|オンライン診療|マイナ/,
  },
  ru: {
    ai: new RegExp(
      L('ИИ|ИИ-\\p{L}+|искусственн\\p{L}* интеллект\\p{L}*|нейросет\\p{L}*|нейронн\\p{L}*|машинн\\p{L}* обучени\\p{L}*|генеративн\\p{L}*|чат-?бот\\p{L}*|GigaChat|YandexGPT|ChatGPT|LLM|AI|большие языковые модели'),
      'iu'
    ),
    health: /медицин|врач|больниц|поликлиник|пациент|здравоохранен|клиник|минздрав|медсестр|лекарств|здоров|диагност|госпитал|фармац|онколог|телемедицин/iu,
    digital: /цифров\p{L}* здравоохранен|ЕГИСЗ|электронн\p{L}* (медицинск|карт|рецепт)|телемедицин|медицинск\p{L}* издели|персональн\p{L}* данн|утечк|кибер/iu,
  },
  id: {
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|kecerdasan buatan|\bChatGPT\b|\bLLM\b|machine learning|generatif|\bGemini\b|\bCopilot\b|robot/i,
    health: /kesehatan|rumah sakit|\bRS\b|dokter|pasien|medis|klinik|obat|Kemenkes|BPJS|SATUSEHAT|\bRME\b|puskesmas|perawat|farmasi|penyakit|\bIDI\b|bedah|kanker/i,
    digital: /rekam medis|RME|SATUSEHAT|telemedis|siber|kebocoran data|alat kesehatan|data pribadi|\bPDP\b/i,
  },
  tw: {
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|人工智慧|人工智能|生成式|ChatGPT|大型語言模型|\bLLM\b|機器學習|深度學習|智慧醫療|聊天機器人|智能體|Gemini|Claude|Copilot/i,
    health: /醫院|醫療|醫師|護理|病患|病人|健康|衛福|診所|藥|醫學|癌|長照|健保|疾病|手術|生技|醫材|診斷/,
    digital: /電子病歷|資安|個資|醫療器材|遠距醫療|數位醫療|智慧醫院|FHIR|健保卡/,
  },
};
TERMS.in = TERMS.en;
TERMS.sg = TERMS.en;

// 지원사업·공모(정부 카테고리)와 교육·행사(이벤트 카테고리) 단어
export const GRANT = {
  en: /grant|funding|subsid|call for (proposals|applications)|\bRFP\b|tender|scheme|programme|program\b|sandbox|incentive|apply (now|by)|applications? (open|invited)|fellowship|award/i,
  ko: /지원사업|공모|모집|보조금|지원금|사업\s?공고|공고|바우처|과제|참가기업|신청|선정|펀드/,
  ja: /補助金|助成|公募|募集|支援事業|採択|交付|委託事業|実証事業|給付/,
  ru: /грант\p{L}*|субсиди\p{L}*|конкурс\p{L}*|финансирован\p{L}*|поддержк\p{L}*|тендер\p{L}*|закупк\p{L}*|программ\p{L}*/iu,
  id: /hibah|pendanaan|subsidi|pendaftaran|seleksi|insentif|program|beasiswa|tender|pengadaan/i,
  tw: /補助|計畫|徵件|公告|申請|獎勵|徵求|招標|輔導|專案/,
};
export const EVENT = {
  en: /conference|summit|symposium|webinar|workshop|seminar|forum|expo\b|congress|bootcamp|hackathon|training|course\b|masterclass|roundtable|meetup|exhibition|\bHIMSS\b|register (now|today)|call for (papers|abstracts)/i,
  ko: /학술대회|심포지엄|세미나|컨퍼런스|콘퍼런스|워크숍|포럼|박람회|전시회|교육과정|교육\s?프로그램|웨비나|해커톤|아카데미|개최|국제\s?학술/,
  ja: /セミナー|シンポジウム|ウェビナー|カンファレンス|フォーラム|学術大会|展示会|研修|ワークショップ|講座|開催|大会/,
  ru: /конференци\p{L}*|форум\p{L}*|вебинар\p{L}*|семинар\p{L}*|симпозиум\p{L}*|выставк\p{L}*|хакатон\p{L}*|курс\p{L}*|обучени\p{L}*|мастер-класс\p{L}*|саммит\p{L}*/iu,
  id: /seminar|webinar|pelatihan|workshop|konferensi|simposium|kongres|lokakarya|forum|pameran|rakernas|diklat/i,
  tw: /研討會|論壇|講座|工作坊|培訓|課程|展覽|大會|座談|黑客松|說明會|高峰會/,
};

// 한 줄(제목+요약)이 AI 관련인지, 의료 관련인지
// 'AI'가 인공지능이 아닌 뜻인 글(조류인플루엔자 등)은 어느 경로에서든 뺀다.
export const NOT_AI = {
  ko: /고병원성\s?AI|조류\s?인플루엔자|AI\s?(확진|방역|의심|발생|살처분|매몰|위험주의보|위기경보|농장)|AI[·\s]?구제역/,
  ja: /鳥インフル/,
  ru: /птичь\p{L}* грипп\p{L}*/iu,
  id: /flu burung|avian influenza/i,
  tw: /禽流感/,
  en: /avian (influenza|flu)|bird flu|\bH5N1\b|\bH5N5\b/i,
};
// 한 줄이 '뉴스' 후보인지: 반환 'A' | null  (B는 보조 단어만 있는 경우 — 기본은 쓰지 않는다)
export function judge(lang, title, desc, topic) {
  const T = TERMS[lang] || TERMS.en;
  const text = `${title} ${desc || ''}`;
  if ((NOT_AI[lang] || NOT_AI.en).test(text)) return null;
  const ai = T.ai.test(text);
  if (topic === 'health') return ai ? 'A' : T.digital.test(text) ? 'B' : null;
  if (topic === 'gov') return ai || (T.digital.test(text) && T.health.test(text)) ? 'A' : null;
  // tech·general: AI와 의료 단어가 모두 있고, 둘 중 하나는 제목에 있어야 한다(요약에만 스치는 글 제외)
  const health = T.health.test(text);
  if (!(ai && health)) return null;
  return T.ai.test(title) || T.health.test(title) ? 'A' : null;
}

// ── 수집 ─────────────────────────────────────────────
// source: { name, url, topic:'health'|'tech'|'general'|'gov', popular?:boolean, sourceLabel?:string, maxAgeDays?:number }
// 출처마다 한 번만 접속해서 원시 행(rows)을 모으고, 분류(뉴스·정부·행사)는 select()가 따로 한다.
export async function fetchAll(sources, { concurrency = 6, log = console.log } = {}) {
  const rows = [];
  const report = [];
  let idx = 0;
  async function worker() {
    while (idx < sources.length) {
      const s = sources[idx++];
      const rec = { name: s.name, url: s.url, ok: false, fetched: 0, error: null };
      try {
        const xml = await fetchText(s.url);
        const parsed = parseFeed(xml, s.url);
        rec.fetched = parsed.length;
        rec.ok = parsed.length > 0;
        if (!rec.ok) rec.error = 'no items';
        parsed.forEach((r, i) => {
          rows.push({
            ...r,
            source: s.sourceLabel || s.name,
            topic: s.topic,
            popular: !!s.popular,
            rank: s.popular ? i + 1 : undefined,
            maxAgeDays: s.maxAgeDays,
          });
        });
      } catch (e) {
        rec.error = String(e.cause?.code || e.message || e).slice(0, 80);
      }
      report.push(rec);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, sources.length) }, worker));
  log(`  출처 ${report.filter((r) => r.ok).length}/${sources.length} 응답, 원시 ${rows.length}행`);
  for (const r of report.filter((r) => !r.ok)) log(`    ✗ ${r.name}: ${r.error}`);
  return { rows, report };
}

// cat: 'news' | 'gov' | 'events'
// 반환: 조건을 통과한 행(내부 표시 _tier 포함). 날짜가 없거나 너무 오래된 행은 거른다.
export function select(lang, rows, cat, { maxAgeDays = 45, allowB = false } = {}) {
  const T = TERMS[lang] || TERMS.en;
  const now = Date.now();
  const out = [];
  for (const r of rows) {
    const t = r.pubDate ? Date.parse(r.pubDate) : NaN;
    if (!Number.isFinite(t)) continue; // 날짜 없는 글이 '새 글'로 둔갑하는 것을 막는다
    if (now - t > (r.maxAgeDays ?? maxAgeDays) * 86400000) continue;
    if (t - now > 2 * 86400000) continue;
    const text = `${r.title} ${r.desc || ''}`;
    let tier = null;
    if (cat === 'news') {
      tier = judge(lang, r.title, r.desc, r.topic);
      if (tier === 'B' && !allowB) tier = null;
    } else if (cat === 'gov') {
      // 정부 지원사업: 부처·공공기관 출처에서만. 지원사업 단어가 있어야 하고, 의료·AI·디지털 중 하나와 닿아야 한다.
      if (r.topic !== 'gov') continue;
      if ((GRANT[lang] || GRANT.en).test(text) && (T.ai.test(text) || T.health.test(text) || T.digital.test(text))) tier = 'A';
    } else if (cat === 'events') {
      // 교육·행사: 행사 단어 + AI 단어(AI 교육·행사 목록이므로). 정부 기관은 의료·디지털헬스만으로도 통과.
      if ((NOT_AI[lang] || NOT_AI.en).test(text)) continue;
      if (!(EVENT[lang] || EVENT.en).test(text)) continue;
      const ai = T.ai.test(text);
      const health = T.health.test(text) || T.digital.test(text);
      if (r.topic === 'general' || r.topic === 'tech') tier = ai && health ? 'A' : null;
      else if (r.topic === 'gov') tier = ai || T.digital.test(text) ? 'A' : null;
      else tier = ai ? 'A' : null;
    }
    if (!tier) continue;
    const row = { title: r.title, link: r.link, source: r.source, pubDate: r.pubDate };
    if (r.popular) {
      row.popular = true;
      row.rank = r.rank;
    }
    row._tier = tier;
    out.push(row);
  }
  return out;
}

// ── 병합 ─────────────────────────────────────────────
// existing: 기존 items, incoming: 새 후보. 중복은 링크(정규화) 또는 제목으로 판정한다.
export function mergeItems(existing, incoming, { max = 1000 } = {}) {
  const byLink = new Map();
  const byTitle = new Map();
  const items = existing.map((x) => ({ ...x }));
  for (const it of items) {
    byLink.set(canonLink(it.link), it);
    byTitle.set(normTitle(it.title), it);
  }
  let added = 0;
  let updated = 0;
  for (const r of incoming) {
    const hit = byLink.get(canonLink(r.link)) || byTitle.get(normTitle(r.title));
    if (hit) {
      // 이미 있는 항목: 인기 표시만 갱신(순위는 좋은 쪽을 남긴다)
      if (r.popular) {
        const better = !hit.popular || (r.rank && r.rank < (hit.rank ?? 99));
        if (better) {
          hit.popular = true;
          hit.rank = r.rank;
          updated++;
        }
      }
      continue;
    }
    const { _tier, _topic, ...clean } = r;
    items.push(clean);
    byLink.set(canonLink(clean.link), clean);
    byTitle.set(normTitle(clean.title), clean);
    added++;
  }
  items.sort((a, b) => Date.parse(b.pubDate || 0) - Date.parse(a.pubDate || 0));
  return { items: items.slice(0, max), added, updated };
}

export async function readJson(url) {
  try {
    return JSON.parse(await readFile(url, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}
export async function writeJson(url, data) {
  await writeFile(url, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
