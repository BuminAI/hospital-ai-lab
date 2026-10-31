// 러시아어판 '다른 채널의 추천 영상' 자동 수집기 (2026-10-31 신설, 대만어판 fetch-tw-videos.mjs와 같은 방식)
//
// 유튜브 검색 결과 → oEmbed로 실재 확인. src/data/ru/content/videos-local.json 에 새 영상을 '추가'만 한다
// (수동 항목은 지우지 않는다).
//
// 정책
//  - 러시아어권 전체(러시아·카자흐스탄·벨라루스·우즈베키스탄 등)의 공적·보도 기관 영상을 대상으로 한다(2026-10-31 확대). 국가별 제도가 다르므로 페이지에 그 사실을 밝힌다.
//  - 주제: 러시아어로 된 의료·병원 × AI·디지털 영상(제목에 AI 신호와 의료 신호가 모두 있을 것)
//  - 채널: **공적 기관·공영방송·통신사·주요 보도기관·병원협회만**(CHANNEL_ALLOW). 개인·기업·병원 채널은 특정 제품·의료기관
//    홍보가 되기 쉬워(의료광고 관점) 자동으로 싣지 않는다.
//  - 기간: 최근 12개월 / 조회수 1,000회 이상
//  - 자극적·낚시성 제목, 광고, 효과 수치(○%·○배)가 든 제목 제외
//  - 설명문(note)은 만들지 않는다 — 영상을 보지 않고 내용을 서술하면 사실 창작이 된다.
//  - 검색이 실패하면 기존 파일을 그대로 둔다. 24시간 안에 자동 추가가 있었으면 건너뛴다.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/ru/content/videos-local.json', import.meta.url);
const MAX_NEW = 2;
const MAX_AUTO = 60;
const RECENT_DAYS = 365;
const MIN_VIEWS = 1000;

const QUERIES = [
  'искусственный интеллект в медицине',
  'ИИ в здравоохранении Минздрав',
  'ЕГИСЗ электронная медицинская карта',
  'цифровизация здравоохранения',
  'телемедицина больница',
  'ИИ врач поликлиника',
  'защита персональных данных пациентов',
  'медицинские изделия с ИИ регистрация',
  'электронные медицинские документы',
  'медицинская информационная система больница',
  // 러시아어권 공적·보도 기관 영상(2026-10-31 확대): 카자흐스탄·벨라루스·우즈베키스탄·키르기스스탄·아르메니아 등
  'искусственный интеллект в медицине Казахстан',
  'цифровое здравоохранение Казахстан министерство',
  'телемедицина Казахстан',
  'ИИ в здравоохранении Беларусь',
  'электронное здравоохранение Беларусь Минздрав',
  'цифровизация здравоохранения Узбекистан',
  'искусственный интеллект медицина Кыргызстан',
  'ИИ в медицине Армения',
];

const AI_SIGNAL =
  /(?<![A-Za-zА-Яа-я])ИИ(?![A-Za-zА-Яа-я])|искусственн[а-я]+ интеллект|нейросет|ChatGPT|GigaChat|YandexGPT|ЕГИСЗ|ЕМИАС|электронн[а-я]+ (?:медицинск|карт|документ|рецепт)|цифров|телемедицин|персональн[а-я]+ данн|информационн[а-я]+ безопасност/i;
const MEDICAL = /больниц|поликлиник|врач|медицин|здравоохран|пациент|клиник|медицинск|Минздрав|ФФОМС|ОМС|диагност/i;
const CLICKBAIT =
  /шок|сенсаци|скандал|взорвал|тайн|разоблач|заработ|\bреклама\b|#shorts|акци[яи]|скидк|умрут|смертельн|[%％]|[0-9]+\s*(?:раз(?:а)?|x)(?![а-я])/i; // заголовки с цифрами эффекта (○% / ○ раз) тоже исключаем (могут читаться как гарантия результата)
// 공적 기관·공영·통신사·탐사 비영리 매체만
const CHANNEL_ALLOW =
  /Минздрав|Министерство здравоохранения|Росздравнадзор|ФФОМС|Роскомнадзор|ТАСС|РИА Новости|Россия 24|Первый канал|РБК|Известия|Москва 24|Мэр Москвы|Правительство Москвы|ВЦИОМ|Медвестник|Интерфакс|Вести|НТВ|ТВ Центр|Минцифры|Правительство России|Департамент здравоохранения|Первый медицинский канал|Телеканал «Доктор»|Высшая школа экономики|Euronews по-русски|Министерство здравоохранения Республики|Министерство здравоохранения РК|Республиканский центр электронного здравоохранения|Қазақстан Республикасы Денсаулық|Казинформ|Хабар|Qazaqstan|Телеканал 24kz|Almaty TV|Aqparat|БЕЛТА|Беларусь 1|Белтелерадиокомпания|ОНТ|СТВ|Кабар|Raqamli texnologiyalar vazirligi|Sog.liqni saqlash vazirligi|Минздрав Узбекистана|Узбекистан 24|Armenpress|АРМЕНПРЕСС|Sputnik/i;
const channelOk = (ch) => CHANNEL_ALLOW.test(ch || '');
const okTitle = (t) => AI_SIGNAL.test(t) && MEDICAL.test(t) && !CLICKBAIT.test(t) && [...t].length <= 110;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  'Accept-Language': 'ru-RU,ru;q=0.9',
  Cookie: 'CONSENT=YES+cb',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, opts = {}, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(25000) });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = e;
    }
    await sleep(1000 * (i + 1));
  }
  throw last;
}

// «3 дня назад» / «2 месяца назад» / «1 год назад» / «5 часов назад» / «3 недели назад»
function daysAgo(pub) {
  const m = /(\d+)\s*(мин|час|ч\.|дн|день|нед|мес|г\.|год|лет)/i.exec(pub || '');
  if (!m) return 99999;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  if (u.startsWith('мин') || u.startsWith('час') || u === 'ч.') return 0;
  if (u.startsWith('дн') || u === 'день') return n;
  if (u.startsWith('нед')) return n * 7;
  if (u === 'г.' || u.startsWith('год') || u === 'лет') return n * 365;
  return n * 30;
}

// «3 048 просмотров» / «72 тыс. просмотров» / «1,2 млн просмотров»
function parseViews(text) {
  const t = (text || '').toLowerCase().replace(/ /g, ' ');
  const m = /([\d\s.,]+?)\s*(тыс|млн|млрд)?\.?\s*просмотр/.exec(t);
  if (!m) return 0;
  const num = Number(m[1].replace(/\s/g, '').replace(',', '.'));
  const mul = { тыс: 1e3, млн: 1e6, млрд: 1e9 }[m[2]] || 1;
  return Math.round(num * mul);
}

function walkVideos(node, out) {
  if (Array.isArray(node)) {
    for (const v of node) walkVideos(v, out);
  } else if (node && typeof node === 'object') {
    if (node.videoRenderer) {
      const v = node.videoRenderer;
      const title = (v.title?.runs || []).map((r) => r.text).join('');
      const views = parseViews(v.viewCountText?.simpleText || '');
      const pub = v.publishedTimeText?.simpleText || '';
      const channel = (v.ownerText?.runs || []).map((r) => r.text).join('');
      if (v.videoId && title) out.push({ videoId: v.videoId, title, views, pub, channel });
    }
    for (const k of Object.keys(node)) walkVideos(node[k], out);
  }
}

async function search(query) {
  // gl=RU&hl=ru: 실행 서버 위치와 무관하게 러시아 지역·러시아어 결과를 강제한다.
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&gl=RU&hl=ru`;
  const html = await (await fetchRetry(url, { headers: HEADERS })).text();
  const m = /var ytInitialData = (\{.*?\});<\/script>/s.exec(html);
  if (!m) return [];
  const out = [];
  walkVideos(JSON.parse(m[1]), out);
  await sleep(700);
  return out;
}

async function verify(videoId) {
  try {
    const res = await fetchRetry(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      {},
      2
    );
    const d = await res.json();
    return { title: d.title || null, channel: d.author_name || '' };
  } catch {
    return { title: null, channel: '' };
  }
}

async function main() {
  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT, 'utf8'));
  } catch (e) {
    console.error(`videos-local.json 읽기/파싱 실패 — 중단: ${e.message}`);
    process.exit(1);
  }
  if (!Array.isArray(existing)) {
    console.error('videos-local.json이 배열이 아닙니다 — 중단.');
    process.exit(1);
  }
  const ids = new Set(existing.map((v) => v.videoId));

  const lastAuto = existing
    .filter((v) => v.source === 'auto' && v.addedAt)
    .map((v) => Date.parse(v.addedAt))
    .sort((a, b) => b - a)[0];
  if (!process.env.FORCE_UPDATE && lastAuto && Date.now() - lastAuto < 24 * 3600 * 1000) {
    console.log('최근 24시간 내 자동 추가가 있었습니다. 건너뜁니다.');
    return;
  }

  const cand = new Map();
  let okQueries = 0;
  for (const q of QUERIES) {
    try {
      for (const it of await search(q)) {
        if (!okTitle(it.title) || !channelOk(it.channel)) continue;
        if (daysAgo(it.pub) > RECENT_DAYS || it.views < MIN_VIEWS) continue;
        if (!cand.has(it.videoId)) cand.set(it.videoId, it);
      }
      okQueries++;
    } catch (e) {
      console.error(`검색 실패(${q}): ${e.message}`);
    }
  }
  if (okQueries === 0) {
    console.error('검색이 모두 실패했습니다. 기존 목록을 유지합니다.');
    process.exit(1);
  }

  const sorted = [...cand.values()].sort((a, b) => b.views - a.views);
  const now = new Date().toISOString();
  const fresh = [];
  for (const p of sorted.slice(0, 30)) {
    if (fresh.length >= MAX_NEW) break;
    if (ids.has(p.videoId)) continue;
    const v = await verify(p.videoId);
    if (!v.title || !okTitle(v.title) || !channelOk(v.channel || p.channel)) continue; // 삭제·비공개·원제 불일치·허용 외 채널 제외
    fresh.push({
      videoId: p.videoId,
      title: v.title.trim(),
      channel: (v.channel || p.channel).trim(),
      source: 'auto',
      addedAt: now,
    });
    ids.add(p.videoId);
  }

  if (fresh.length === 0) {
    console.log(`추가할 새 영상이 없습니다(후보 ${cand.size}건 모두 기존 목록에 있거나 기준 미달).`);
    return;
  }

  // 새 영상을 맨 앞에 둔다(화면 맨 위에 최신 추가분이 보이도록).
  let final = [...fresh, ...existing];
  const autos = final.filter((v) => v.source === 'auto');
  if (autos.length > MAX_AUTO) {
    const drop = new Set(autos.slice(MAX_AUTO).map((v) => v.videoId));
    final = final.filter((v) => !drop.has(v.videoId));
  }

  await writeFile(OUT, JSON.stringify(final, null, 2) + '\n', 'utf8');
  console.log(`저장 완료: 신규 ${fresh.length}건 추가, 누적 ${final.length}건 (후보 ${cand.size}건)`);
  for (const f of fresh) console.log(`  + ${f.title} / ${f.channel}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
