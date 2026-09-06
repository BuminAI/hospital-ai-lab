// 인도네시아어판 의료 AI 뉴스 수집기
//
// ⚠️ 2026-09-06 수집원 전면 교체. 그전에는 detikHealth·Kompas Health의 건강
//    지면을 크롤링했는데, **24시간 동안 한 건도 못 건졌다**(누적 0건).
//    두 매체는 일반 소비자 건강 기사가 대부분이라 병원 실무·의료 AI와
//    겹치는 기사가 사실상 나오지 않는다. 실측으로 확인하고 버렸다.
//
// 지금 쓰는 곳 (2026-09-06 실측으로 고름):
//   1) PERSI(persi.or.id) — 인도네시아병원협회. 워드프레스 REST API를
//      공개하고 있어 날짜·제목·링크를 JSON으로 정확히 받는다. 한국어판의
//      병원신문(대한병원협회)에 대응하는 자리다.
//   2) ANTARA(antaranews.com) 태그 지면 — 국영 통신사. 아래 다섯 태그를 쓴다.
//      satusehat / kesehatan-digital / rekam-medis-elektronik / telemedisin은
//      이미 "디지털 보건" 주제로 좁혀진 지면이고, kecerdasan-buatan은 일반 AI
//      지면이라 의료 관련만 다시 거른다.
//
// 필터 정책 (한국어판 fetch-news.mjs와 같은 사고방식):
//   - PERSI는 협회 매체라 모든 기사가 병원 이야기다. 그래서 **의료 조건을
//     걸지 않고 디지털·AI 조건만** 본다. 의료 조건을 함께 걸면 「Rakernas
//     PERSI 2026 … hingga Implementasi AI」처럼 제목에 '병원'이라는 낱말이
//     없는 기사가 통째로 떨어진다(실제로 그랬다).
//   - ANTARA의 보건 태그 4종도 지면 자체가 보건이라 디지털 조건만 본다.
//   - ANTARA kecerdasan-buatan(일반 AI)만 의료 조건을 함께 본다.
//
// 저작권: 본문을 옮기지 않는다. 제목·링크·매체·발행일만 저장하고 원문으로
// 링크만 건다(한국어·러시아어판과 같은 원칙).
//
// 누적 정책: 기존 src/data/id/news.json 항목을 지우지 않고 새 기사를 병합한다
// (제목 기준 중복 제거). 한 수집원이 실패해도 나머지는 계속하고, 전부 실패한
// 경우에만 기존 파일을 그대로 두고 중단한다.
// (이 저장소는 크롤러 간 공용 유틸을 두지 않는 관례라 decodeEntities·
//  stripTags 등은 다른 수집기에서 그대로 복붙했다.)
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/id/news.json', import.meta.url);
const MAX_ITEMS = 300;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const PERSI_SOURCE = 'PERSI';
// categories=1(Berita Persi), 683(Berita Kanal PERSI) — 협회 뉴스 두 분류.
// info-pelatihan(682)·event(338)은 교육·행사라 여기 넣지 않는다.
const PERSI_API =
  'https://www.persi.or.id/wp-json/wp/v2/posts?per_page=40&categories=1,683&_fields=date_gmt,link,title';

const ANTARA_SOURCE = 'ANTARA';
// [태그, 의료 조건도 함께 볼 것인가]
const ANTARA_TAGS = [
  ['satusehat', false],
  ['kesehatan-digital', false],
  ['rekam-medis-elektronik', false],
  ['telemedisin', false],
  ['kecerdasan-buatan', true],
];

// AI·디지털 신호.
// 'AI'는 앞뒤 단어 경계를 둬서 'AIDS'·'MAIN' 같은 말에 걸리지 않게 한다.
const DIGITAL_RE =
  /(?<![A-Za-z])AI(?![A-Za-z])|kecerdasan (?:buatan|artifisial)|artificial intelligence|machine learning|pembelajaran mesin|algoritma|digitalisasi|kesehatan digital|digital kesehatan|transformasi digital|rekam medis elektronik|(?<![A-Za-z])RME(?![A-Za-z])|telemedisin|telemedicine|satusehat|interoperabilitas|big data|chatbot|robotik|teknologi digital|sistem informasi|data pasien|perlindungan data/i;

// 병원·의료 신호. 일반 AI 지면(kecerdasan-buatan)에만 함께 적용한다.
const MED_RE =
  /rumah sakit|(?<![A-Za-z])RS(?![A-Za-z])|dokter|pasien|medis|kesehatan|klinik|perawat|diagnosis|kemenkes|BPJS|obat|farmasi|nakes|faskes|puskesmas|JKN/i;

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8217;|&#8216;|&#039;|&#39;|&apos;/g, "'")
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .trim();

// XSS 방지: 본문에 태그가 섞여 들어오지 않게 한다(JSON-LD에도 그대로 실리므로).
const stripTags = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

// 제목 정규화 — 같은 기사가 두 매체·두 태그에 걸릴 때 한 건으로 묶는다.
const normTitle = (t) =>
  (t || '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/["'“”‘’.,!?:;()[\]-]/g, '');

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'text/html,application/xhtml+xml,application/json,*/*;q=0.8',
          'accept-language': 'id-ID,id;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = new Error(`${e.message}${e.cause?.code ? ` (${e.cause.code})` : ''}`);
    }
    if (i < tries - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw last;
}

// ── PERSI (워드프레스 REST API) ────────────────────────
// date_gmt는 타임존 표기가 없는 UTC 시각이라 'Z'를 붙여 해석한다.
async function fetchPersi() {
  const rows = await (await fetchRetry(PERSI_API)).json();
  if (!Array.isArray(rows)) throw new Error('예상과 다른 응답(배열이 아님)');
  return rows
    .map((p) => {
      const title = stripTags(p?.title?.rendered ?? '');
      const d = new Date(`${p?.date_gmt}Z`);
      if (!title || !p?.link || Number.isNaN(d.getTime())) return null;
      return { title, link: p.link, source: PERSI_SOURCE, pubDate: d.toISOString() };
    })
    .filter(Boolean);
}

// ── ANTARA (태그 지면 HTML) ────────────────────────────
// 카드 블록: class="card__post card__post-list ..." 로 시작한다.
// 제목·링크: <a href="https://www.antaranews.com/berita/…" title="제목">
// 날짜: <span class="text-dark text-capitalize">…</span>
//
// ⚠️ 날짜 표기가 세 가지다(2026-09-06 실측). 하나만 처리하면 나머지 기사가
//    조용히 버려진다 — 러시아어판에서 실제로 겪은 사고라 세 가지를 모두 만든다.
//      "2 September 2026"  (절대)
//      "Kemarin 08:05"     (어제)
//      "1 jam lalu" / "35 menit lalu" (상대)
//    kecerdasan-buatan 지면은 갱신이 잦아 상대 표기만 나오기도 한다.
const ID_MONTHS = {
  januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
  juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12',
};
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // 자카르타(WIB) = UTC+7

function antaraDateToIso(raw) {
  const s = decodeEntities(raw).trim();

  // "2 September 2026" — 일이 한 자리일 수 있으므로 자릿수를 열어 둔다.
  const abs = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (abs) {
    const mon = ID_MONTHS[abs[2].toLowerCase()];
    if (!mon) return null;
    // 시각 정보가 없어 정오(WIB)로 채운다 — 정렬용이라 정밀할 필요는 없지만,
    // 날짜가 하루 밀리지 않도록 UTC 자정은 피한다.
    const d = new Date(`${abs[3]}-${mon}-${abs[1].padStart(2, '0')}T12:00:00+07:00`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  // "Kemarin 08:05" — WIB 기준 어제
  const kemarin = s.match(/^Kemarin\s+(\d{1,2}):(\d{2})/i);
  if (kemarin) {
    const wibNow = new Date(Date.now() + WIB_OFFSET_MS);
    const y = wibNow.getUTCFullYear();
    const m = String(wibNow.getUTCMonth() + 1).padStart(2, '0');
    const day = String(wibNow.getUTCDate()).padStart(2, '0');
    const d = new Date(
      `${y}-${m}-${day}T${kemarin[1].padStart(2, '0')}:${kemarin[2]}:00+07:00`
    );
    if (Number.isNaN(d.getTime())) return null;
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString();
  }

  // "1 jam lalu" / "35 menit lalu" — 지금으로부터 상대
  const rel = s.match(/^(\d{1,3})\s+(jam|menit)\s+lalu/i);
  if (rel) {
    const unit = rel[2].toLowerCase() === 'jam' ? 3600e3 : 60e3;
    return new Date(Date.now() - Number(rel[1]) * unit).toISOString();
  }

  return null;
}

async function fetchAntaraTag(tag) {
  const html = await (await fetchRetry(`https://www.antaranews.com/tag/${tag}`)).text();
  const rows = [];
  for (const part of html.split('card__post card__post-list').slice(1)) {
    const block = part.slice(0, 3000);
    const linkM = block.match(
      /<a href="(https:\/\/www\.antaranews\.com\/berita\/[^"]+)" title="([^"]+)"/
    );
    const dateM = block.match(/<span class="text-dark text-capitalize">([^<]+)<\/span>/);
    if (!linkM || !dateM) continue;
    const title = decodeEntities(linkM[2]);
    const pubDate = antaraDateToIso(dateM[1]);
    if (!title || !pubDate) continue;
    rows.push({ title, link: linkM[1], source: ANTARA_SOURCE, pubDate });
  }
  return rows;
}

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okSources = 0;

try {
  const rows = await fetchPersi();
  // 협회 매체 — 디지털·AI 조건만 본다(위 "필터 정책" 참고).
  const kept = rows.filter((r) => DIGITAL_RE.test(r.title));
  collected.push(...kept);
  okSources++;
  console.log(`${PERSI_SOURCE}: ${rows.length}건 중 ${kept.length}건 채택`);
} catch (e) {
  console.error(`${PERSI_SOURCE} 수집 실패 — ${e.message}`);
}

for (const [tag, needMed] of ANTARA_TAGS) {
  try {
    const rows = await fetchAntaraTag(tag);
    const kept = rows.filter(
      (r) => DIGITAL_RE.test(r.title) && (!needMed || MED_RE.test(r.title))
    );
    collected.push(...kept);
    okSources++;
    console.log(`${ANTARA_SOURCE}/${tag}: ${rows.length}건 중 ${kept.length}건 채택`);
  } catch (e) {
    console.error(`${ANTARA_SOURCE}/${tag} 수집 실패 — ${e.message}`);
  }
}

if (okSources === 0) {
  console.error('모든 수집원을 읽지 못했습니다. 기존 id/news.json을 유지합니다.');
  process.exit(1);
}

// ── 기존 항목과 병합 (누적) ────────────────────────────
// 파일이 "없는" 경우만 빈 목록으로 시작한다. 파싱 실패(손상)는 중단 —
// 그대로 진행하면 누적 이력이 최근 수집분만으로 리셋되기 때문.
let existing = [];
try {
  const prev = JSON.parse(await readFile(OUT, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`id/news.json 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

const seen = new Set();
const items = [...collected, ...existing]
  .filter((it) => {
    const key = normTitle(it.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

// 변경이 없으면 파일을 건드리지 않는다 — 커밋·배포를 만들지 않기 위해.
if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 기사 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

await writeFile(
  OUT,
  JSON.stringify(
    { updatedAt: new Date().toISOString(), source: `${PERSI_SOURCE}·${ANTARA_SOURCE}`, items },
    null,
    2
  ) + '\n',
  'utf8'
);

const by = (s) => items.filter((i) => i.source === s).length;
console.log(
  `수집 완료: 누적 ${items.length}건 ` +
    `(${PERSI_SOURCE} ${by(PERSI_SOURCE)}건, ${ANTARA_SOURCE} ${by(ANTARA_SOURCE)}건)`
);
