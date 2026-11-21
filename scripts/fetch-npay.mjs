// 공공 포털 › 비급여 진료비 수집기 (2026-11-21, 오너 지시).
//
// 건강보험심사평가원 '비급여진료비정보조회서비스'(공공데이터포털 OpenAPI)에서 전국 병원급 이상 의료기관의 비급여 항목별 가격을 모두 받아
// 페이지용 파일로 나눠 쓴다. 특정 병원을 기준으로 삼지 않는다(우리 병원 고정·강조 없음).
//   · getNonPaymentItemCodeList2   비급여 항목 코드표(항목명·대분류)
//   · getNonPaymentItemHospDtlList 전체 병원의 항목별 가격(약 28만 줄, 한 쪽 최대 1만 줄)
//
// 출력(디렉터리):
//   index.json          { updatedAt, source, rows, hospitals:[{n 병원명, c 종별, s 시도, g 시군구, u 홈페이지}], items:[{c 코드, n 항목명, m 대분류, h 병원 수, r 가격 줄 수}] }
//   items/<코드>.json   한 항목의 병원별 가격 [[병원 번호, 가격(원), 병원이 쓰는 항목명, 적용 시작일], …]
// 페이지(/portal/npay/)가 index.json 을 먼저 읽고, 항목을 고르면 그 항목 파일만 읽는다(28만 줄을 한 번에 받지 않는다).
//
//   DATA_GO_KR_KEY=... node scripts/fetch-npay.mjs <출력 디렉터리>
//   NPAY_MAX_PAGES=2  (시험용: 가격 자료를 앞쪽 N쪽만 받고, 줄 수 검증을 건너뛴다)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = 'https://apis.data.go.kr/B551182/nonPaymentDamtInfoService/';
const PAGE = 10000;
const CONCURRENCY = Number(process.env.NPAY_CONCURRENCY || 4);
const MAX_PAGES = Number(process.env.NPAY_MAX_PAGES || 0);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const KEYS = String(process.env.DATA_GO_KR_KEY || '').split(/[\s,;]+/).filter(Boolean);
const keyParam = (k) => (/%[0-9A-Fa-f]{2}/.test(k) ? k : encodeURIComponent(k));

const decode = (s) => String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#x?[0-9a-fA-F]+;/g, ' ').replace(/&amp;/g, '&').trim();
export function parseItems(xml) {
  const out = [];
  for (const m of String(xml).matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const o = {};
    for (const f of m[1].matchAll(/<([A-Za-z0-9]+)>([^<]*)<\/\1>/g)) o[f[1]] = decode(f[2]);
    out.push(o);
  }
  return out;
}
const tag = (xml, t) => (String(xml).match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1];

const isAuthErr = (m) => /NOT_REGISTERED|등록되지 않은|SERVICE_KEY_IS|ACCESS_DENIED/i.test(String(m));
/** 호출 1회(일시 오류는 간격을 늘려 다시 시도). 인증 오류는 바로 중단. */
async function call(op, params, retries = 5) {
  const wait = (a) => [0, 5000, 15000, 30000, 60000, 90000, 120000][a] || 120000;
  let err;
  for (let a = 1; a <= retries; a++) {
    try {
      const url = `${BASE}${op}?ServiceKey=${keyParam(KEYS[0])}&${new URLSearchParams(params)}`;
      const res = await fetch(url);
      const xml = await res.text();
      if (!res.ok || tag(xml, 'resultCode') !== '00') throw new Error(`${res.status} ${tag(xml, 'errMsg') || tag(xml, 'returnAuthMsg') || tag(xml, 'resultMsg') || xml.slice(0, 120)}`);
      return xml;
    } catch (e) {
      err = e;
      if (isAuthErr(e.message)) break;
      if (a < retries) await pause(wait(a));
    }
  }
  throw new Error(`${op} 호출 실패: ${err && err.message}`);
}

// 시도 이름: 목록의 짧은 이름(서울·부산…) → 다른 공공 포털 페이지와 같은 정식 이름. '경기'는 응답에서 글자가 깨져 올 때가 있다(�기).
const SIDO_FULL = {
  서울: '서울특별시', 부산: '부산광역시', 대구: '대구광역시', 인천: '인천광역시', 광주: '광주광역시', 대전: '대전광역시', 울산: '울산광역시', 세종: '세종특별자치시',
  경기: '경기도', 강원: '강원특별자치도', 충북: '충청북도', 충남: '충청남도', 전북: '전북특별자치도', 전남: '전라남도', 경북: '경상북도', 경남: '경상남도', 제주: '제주특별자치도',
};
export function normSido(s) {
  const v = String(s || '').trim();
  if (/^�+기$/.test(v)) return SIDO_FULL['경기'];
  return SIDO_FULL[v] || v;
}
/** 시군구 이름: '인천연수구'처럼 시도 이름이 앞에 붙어 오면 떼어 낸다(드롭다운에서 시도 안의 이름으로 보이게). */
export function normSgg(g, sidoShort) {
  const v = String(g || '').trim();
  const sh = String(sidoShort || '').trim();
  if (sh && v.startsWith(sh) && v.length > sh.length) return v.slice(sh.length);
  return v;
}

/** 병원정보서비스 목록에서 실제로 쓰이는 시도 코드를 모은다(종별 한 쪽씩이면 충분하지 않아, 종별마다 끝까지 훑는다). */
async function fetchSidoCodes() {
  const set = new Set();
  const key = KEYS[0];
  for (const cl of ['01', '11', '21', '28', '29', '41', '92']) {
    for (let page = 1; page <= 4; page++) {
      const u = `https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?ServiceKey=${keyParam(key)}&_type=json&pageNo=${page}&numOfRows=500&clCd=${cl}`;
      let body = null;
      for (let a = 1; a <= 5 && !body; a++) {
        try {
          const r = await fetch(u);
          const j = JSON.parse(await r.text());
          if (j.response && j.response.header && String(j.response.header.resultCode) === '00') body = j.response.body;
          else if (a < 5) await pause(a * 3000);
        } catch {
          if (a < 5) await pause(a * 3000);
        }
      }
      if (!body) break;
      const it = body.items && body.items.item;
      const arr = Array.isArray(it) ? it : it ? [it] : [];
      for (const x of arr) if (x.sidoCd) set.add(String(x.sidoCd));
      if (page * 500 >= (Number(body.totalCount) || 0)) break;
    }
  }
  return [...set].sort();
}

async function fetchAll() {
  const codeXml = await call('getNonPaymentItemCodeList2', { pageNo: 1, numOfRows: 5000 });
  const codes = new Map();
  for (const c of parseItems(codeXml)) codes.set(c.npayCd, { n: c.npayKorNm, m: c.npayMdivCdNm || '기타' });
  console.log(`항목 코드 ${codes.size}개`);

  // 가격 목록은 필터 없이 한 번에 달라고 하면 공공데이터포털 게이트웨이의 60초 제한(504 SERVICETIMEOUT)에 걸려 한 줄도 못 받는 일이 잦다
  // (2026-11-21 실측: 1줄 요청도 504). 시도 코드(sidoCd)로 나눠 작은 범위씩 받으면 응답이 빨라 통과한다.
  // 시도 코드는 병원정보서비스 목록에서 실제로 쓰이는 값을 모은다(행정구역이 바뀌어도 따라간다).
  const sidoCodes = await fetchSidoCodes();
  console.log(`시도 코드 ${sidoCodes.length}개: ${sidoCodes.join(', ')}`);
  const xmls = [];
  const SIZE = Number(process.env.NPAY_PAGE || 3000);
  const jobs = [];
  for (const sc of sidoCodes) jobs.push(sc);
  let next = 0;
  let rowsSeen = 0;
  const getRange = async (sc) => {
    for (let page = 1; page <= 60; page++) {
      if (MAX_PAGES && page > MAX_PAGES) return;
      const xml = await call('getNonPaymentItemHospDtlList', { pageNo: page, numOfRows: SIZE, sidoCd: sc }, 6);
      const n = (xml.match(/<item>/g) || []).length;
      const tot = Number(tag(xml, 'totalCount')) || 0;
      xmls.push(xml);
      rowsSeen += n;
      console.log(`  시도 ${sc} ${page}쪽 ${n}줄 (전체 ${tot.toLocaleString()})`);
      if (!n || page * SIZE >= tot) return;
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, sidoCodes.length) }, async () => {
      while (next < jobs.length) await getRange(jobs[next++]);
    })
  );
  const total = rowsSeen;

  const hospIdx = new Map();
  const hospitals = [];
  const byItem = new Map();
  let rowsN = 0;
  for (const xml of xmls) {
    for (const r of parseItems(xml)) {
      const price = Number(String(r.curAmt).replace(/,/g, ''));
      if (!r.ykiho || !r.npayCd || !Number.isFinite(price)) continue;
      let hi = hospIdx.get(r.ykiho);
      if (hi === undefined) {
        hi = hospitals.length;
        hospIdx.set(r.ykiho, hi);
        hospitals.push({ n: r.yadmNm, c: r.clCdNm, s: normSido(r.sidoCdNm), g: normSgg(r.sgguCdNm, r.sidoCdNm), u: /^https?:\/\//.test(r.urlAddr || '') ? r.urlAddr : '' });
      }
      if (!byItem.has(r.npayCd)) byItem.set(r.npayCd, []);
      byItem.get(r.npayCd).push([hi, price, r.yadmNpayCdNm || '', r.adtFrDd || '']);
      rowsN++;
      if (!codes.has(r.npayCd)) codes.set(r.npayCd, { n: r.npayKorNm || r.npayCd, m: '기타' });
    }
  }
  const items = [...byItem.keys()]
    .map((c) => ({ c, n: codes.get(c).n, m: codes.get(c).m, h: new Set(byItem.get(c).map((x) => x[0])).size, r: byItem.get(c).length }))
    .sort((a, b) => a.m.localeCompare(b.m, 'ko') || a.n.localeCompare(b.n, 'ko'));
  return { total, hospitals, items, byItem, rowsN };
}

async function main() {
  if (!KEYS.length) {
    console.log('DATA_GO_KR_KEY가 없어 건너뜁니다.');
    return;
  }
  const out = path.resolve(process.argv[2] || 'npay-out');
  const t0 = Date.now();
  const all = await fetchAll();
  if (!MAX_PAGES && (all.rowsN < 100000 || all.items.length < 300)) throw new Error(`받은 자료가 너무 적습니다(${all.rowsN}줄, 항목 ${all.items.length}개) — 저장하지 않습니다.`);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'items'), { recursive: true });
  for (const [code, rows] of all.byItem) {
    if (!/^[A-Za-z0-9_-]{1,20}$/.test(code)) continue;
    fs.writeFileSync(path.join(out, 'items', `${code}.json`), JSON.stringify(rows));
  }
  fs.writeFileSync(
    path.join(out, 'index.json'),
    JSON.stringify({ updatedAt: new Date().toISOString(), source: '건강보험심사평가원 비급여진료비정보조회서비스(공공데이터포털 OpenAPI)', rows: all.rowsN, hospitals: all.hospitals, items: all.items }) + '\n'
  );
  console.log(`저장 완료: 병원 ${all.hospitals.length}곳 · 항목 ${all.items.length}개 · 가격 ${all.rowsN.toLocaleString()}줄 · ${Math.round((Date.now() - t0) / 1000)}초 → ${out}`);
  const sidos = {};
  all.hospitals.forEach((h) => { sidos[h.s] = (sidos[h.s] || 0) + 1; });
  console.log('시도별 병원', JSON.stringify(sidos));
  console.log('시군구 샘플', JSON.stringify(all.hospitals.slice(0, 6).map((h) => `${h.s}|${h.g}|${h.c}|${h.n}`)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('비급여 진료비 수집 실패:', e.message);
    process.exit(1);
  });
}
