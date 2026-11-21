// 공공 포털 › 규모·인력 비교 수집기 (2026-11-21, 오너 지시).
//
// 건강보험심사평가원(심평원) OpenAPI 두 개로 전국 병원급 이상 요양기관의 규모·인력 자료를 모은다(요양기관이 심평원에 신고한 현황).
//   · 병원정보서비스 getHospBasisList        : 병원 목록 + 의사 구성(의과 일반의·인턴·레지던트·전문의, 치과·한방, 조산사) — 종별 한 번에 수백 곳
//   · 의료기관별상세정보서비스 2.8(병원 1곳당 1회 호출)
//       getEqpInfo2.8          시설(병상·수술실·응급실·분만실·물리치료실 등)  ← 이름과 달리 병상 자료가 여기에 있다
//       getSpcSbjtSdrInfo2.8   전문과목별 전문의 수
//       getEtcHstInfo2.8       기타 인력(물리치료사·작업치료사·약사·사회복지사 등)
//       getMedOftInfo2.8       의료장비
//       getNursigGrdInfo2.8    간호등급
//       getSpclDiagInfo2.8     특수진료·지정(응급의료기관 등)
//       getFoepAddcInfo2.8     식대가산 인력(영양사·조리사)
//       getSpclHospAsgFldList2.8 전문병원 지정 분야
// 특정 병원을 기준으로 삼지 않는다(반경·기준 병원·고정 병원 없음). 병원급 이상 전체를 같은 기준으로 담는다.
//
// ⚠️ 상세정보는 병원 한 곳에 항목마다 1회씩 호출해야 하고 하루 호출 한도(기본 1,000건)가 있어, 한 번에 다 채우지 못한다.
//    그래서 항목 하나를 전 병원에 채운 뒤 다음 항목으로 넘어가는 순서로, 실행마다 예산(HIRA_DAILY_BUDGET, 기본 900) 안에서 이어 채운다.
//    큰 병원(상급종합→종합병원→병원…)부터 받는다. 이전 결과는 첫 번째 인자로 넘긴 파일에서 읽어 이어 붙이고(없으면 처음부터),
//    한 항목이 전 병원에 채워진 뒤에는 90일이 지난 병원부터 다시 받는다.
//
//   DATA_GO_KR_KEY=... node scripts/fetch-hospitals.mjs <이전 hospitals.json 경로(없어도 됨)> <출력 경로>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const LIST = 'https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList';
const DTL = 'https://apis.data.go.kr/B551182/MadmDtlInfoService2.8/';
const CLASSES = [
  ['01', '상급종합'],
  ['11', '종합병원'],
  ['21', '병원'],
  ['29', '정신병원'],
  ['92', '한방병원'],
  ['41', '치과병원'],
  ['28', '요양병원'],
];
const CLASS_RANK = Object.fromEntries(CLASSES.map(([c], i) => [c, i]));
const REFRESH_DAYS = 90;
const CONCURRENCY = Number(process.env.HIRA_CONCURRENCY || 4);
const BUDGET = Number(process.env.HIRA_DAILY_BUDGET || 900);
const TIME_CAP_MS = Number(process.env.HIRA_TIME_CAP_MIN || 110) * 60000;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const KEYS = String(process.env.DATA_GO_KR_KEY || '').split(/[\s,;]+/).filter(Boolean);
const plain = (k) => (/%[0-9A-Fa-f]{2}/.test(k) ? decodeURIComponent(k) : k);

let calls = 0;
const t0 = Date.now();
let quotaHit = false;
let authFail = '';

/** 심평원 호출 1회(일시 오류는 몇 번 다시 시도). 호출 횟수는 재시도까지 센다. */
async function call(url, params) {
  const u = `${url}?${new URLSearchParams({ serviceKey: plain(KEYS[0]), _type: 'json', ...params })}`;
  let lastErr = '';
  for (let attempt = 1; attempt <= 4; attempt++) {
    calls++;
    try {
      const res = await fetch(u, { headers: { accept: 'application/json' } });
      const text = await res.text();
      let j = null;
      try {
        j = JSON.parse(text);
      } catch {}
      const err = j && j.OpenAPI_ServiceResponse && j.OpenAPI_ServiceResponse.cmmMsgHeader;
      if (err) {
        const code = String(err.returnReasonCode || '');
        lastErr = `${err.errMsg} ${err.returnAuthMsg || ''}`.trim();
        if (code === '22' || /LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS/.test(lastErr)) {
          quotaHit = true;
          throw Object.assign(new Error('일일 호출 한도 초과'), { fatal: true });
        }
        if (['30', '31', '20'].includes(code) || /NOT_REGISTERED|ACCESS_DENIED|PERMISSION/.test(lastErr)) {
          authFail = lastErr;
          throw Object.assign(new Error(lastErr), { fatal: true });
        }
        // 그 밖의 게이트웨이 오류는 재시도
      } else if (j && j.response && j.response.header) {
        const rc = String(j.response.header.resultCode);
        if (rc === '00') return j.response.body || {};
        lastErr = `resultCode ${rc} ${String(j.response.header.resultMsg).slice(0, 80)}`; // 99(연결 풀 부족) 등은 재시도
      } else {
        lastErr = `HTTP ${res.status} ${text.slice(0, 80).replace(/\s+/g, ' ')}`;
      }
    } catch (e) {
      if (e.fatal) throw e;
      lastErr = e.message;
    }
    await pause(attempt * 2500);
  }
  throw new Error(lastErr || '호출 실패');
}
const itemsOf = (body) => {
  const it = body && body.items;
  if (!it || it === '') return [];
  const x = it.item;
  return Array.isArray(x) ? x : x ? [x] : [];
};

/** 주소 → 시도·시군구(세종처럼 도로명이 바로 오면 시군구 ''). */
export function splitAddr(addr) {
  const parts = String(addr || '').trim().split(/\s+/);
  const second = parts[1] || '';
  return { sido: parts[0] || '', sigungu: /[시군구]$/.test(second) ? second : '' };
}
const int = (v) => {
  const n = Number(v);
  return v === null || v === undefined || v === '' || !Number.isFinite(n) ? null : n;
};
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/** 목록 한 줄 → 기본 정보 + 의사 구성(의과·치과·한방). */
export function baseRow(x) {
  const { sido, sigungu } = splitAddr(clean(x.addr));
  const grp = (p) => ({ gen: int(x[p + 'GdrCnt']), intern: int(x[p + 'IntnCnt']), res: int(x[p + 'ResdntCnt']), sp: int(x[p + 'SdrCnt']) });
  const m = grp('mdept');
  const sum = (g) => (g.gen || 0) + (g.intern || 0) + (g.res || 0) + (g.sp || 0);
  return {
    id: x.ykiho,
    name: clean(x.yadmNm),
    cl: x.clCd !== undefined ? String(x.clCd).padStart(2, '0') : '',
    clName: clean(x.clCdNm),
    sido,
    sigungu,
    addr: clean(x.addr),
    tel: clean(x.telno),
    url: clean(x.hospUrl),
    estb: int(x.estbDd),
    doc: { total: int(x.drTotCnt), med: sum(m), medGen: m.gen, medIntern: m.intern, medRes: m.res, medSp: m.sp, dent: sum(grp('dety')), dentSp: grp('dety').sp, kor: sum(grp('cmdc')), korSp: grp('cmdc').sp, midwife: int(x.pnursCnt) },
  };
}

// 상세 항목 정의: 저장 키, 호출 이름, 응답 → 저장값
const BED_FIELDS = ['permSbdCnt', 'stdSickbdCnt', 'hghrSickbdCnt', 'aduChldSprmCnt', 'chldSprmCnt', 'nbySprmCnt', 'isnrSbdCnt', 'anvirTrrmSbdCnt', 'dtrmSbdCnt', 'psydeptOpenGnlSbdCnt', 'psydeptOpenHigSbdCnt', 'psydeptClsGnlSbdCnt', 'psydeptClsHigSbdCnt', 'emymCnt', 'soprmCnt', 'partumCnt', 'ptrmCnt'];
const countMap = (items, nameKey, cntKey) => {
  const o = {};
  for (const it of items) {
    const n = clean(it[nameKey]);
    const c = int(it[cntKey]);
    if (n && c !== null) o[n] = (o[n] || 0) + c;
  }
  return o;
};
export const OPS = [
  {
    key: 'beds',
    op: 'getEqpInfo2.8',
    map: (items) => {
      const it = items[0];
      if (!it) return {};
      const o = {};
      for (const f of BED_FIELDS) o[f] = int(it[f]);
      o.org = clean(it.orgTyCdNm);
      return o;
    },
  },
  { key: 'spec', op: 'getSpcSbjtSdrInfo2.8', map: (items) => countMap(items, 'dgsbjtCdNm', 'dtlSdrCnt') },
  { key: 'etc', op: 'getEtcHstInfo2.8', map: (items) => countMap(items, 'dtlGnlNopCdNm', 'gnlNopCnt') },
  { key: 'eq', op: 'getMedOftInfo2.8', map: (items) => countMap(items, 'oftCdNm', 'oftCnt') },
  { key: 'nurs', op: 'getNursigGrdInfo2.8', map: (items) => items.map((it) => ({ t: clean(it.tyCdNm), g: String(it.careGrd ?? '') })).filter((x) => x.t) },
  { key: 'sp', op: 'getSpclDiagInfo2.8', map: (items) => [...new Set(items.map((it) => clean(it.srchCdNm)).filter(Boolean))] },
  { key: 'food', op: 'getFoepAddcInfo2.8', map: (items) => countMap(items, 'tyCdNm', 'calcNopCnt') },
  { key: 'asg', op: 'getSpclHospAsgFldList2.8', map: (items) => items.map((it) => Object.values(it).filter((v) => typeof v === 'string' && v).join(' · ').slice(0, 120)).filter(Boolean) },
];

async function fetchList() {
  const rows = new Map();
  for (const [cl] of CLASSES) {
    for (let page = 1; page <= 20; page++) {
      const body = await call(LIST, { pageNo: page, numOfRows: 500, clCd: cl });
      const items = itemsOf(body);
      for (const x of items) if (x.ykiho) rows.set(x.ykiho, baseRow(x));
      const total = Number(body.totalCount) || 0;
      if (!items.length || page * 500 >= total) break;
      await pause(200);
    }
  }
  return rows;
}

const todayKst = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const daysAgo = (d) => (Date.parse(todayKst()) - Date.parse(d)) / 86400e3;

async function main() {
  if (!KEYS.length) {
    console.log('DATA_GO_KR_KEY가 없어 건너뜁니다.');
    return;
  }
  const prevPath = process.argv[2];
  const out = path.resolve(process.argv[3] || 'hospitals.json');
  let prev = null;
  try {
    if (prevPath && fs.existsSync(prevPath)) prev = JSON.parse(fs.readFileSync(prevPath, 'utf8'));
  } catch {}
  const prevById = new Map(((prev && prev.items) || []).map((h) => [h.id, h]));

  // 1) 목록 새로 받기(기존 상세 값은 유지)
  let list;
  try {
    list = await fetchList();
  } catch (e) {
    console.error('병원 목록 수집 실패:', e.message);
    if (!prevById.size) process.exit(1);
    list = new Map([...prevById].map(([id, h]) => [id, { ...h }]));
  }
  if (list.size < 3000 && !prevById.size) throw new Error(`병원 ${list.size}곳뿐이라 이상 응답으로 보고 저장하지 않습니다.`);
  const items = [...list.values()].map((b) => {
    const old = prevById.get(b.id) || {};
    const h = { ...b };
    for (const o of OPS) if (old[o.key] !== undefined) h[o.key] = old[o.key];
    h.ts = old.ts || {};
    return h;
  });
  console.log(`목록 ${items.length}곳 (호출 ${calls}회)`);

  // 2) 상세 항목 채우기: 항목 하나를 전 병원에 채운 뒤 다음 항목으로
  const order = [...items].sort((a, b) => (CLASS_RANK[a.cl] ?? 9) - (CLASS_RANK[b.cl] ?? 9) || a.name.localeCompare(b.name, 'ko'));
  const today = todayKst();
  let stopped = '';
  outer: for (const o of OPS) {
    const missing = order.filter((h) => !h.ts[o.key]);
    const stale = order.filter((h) => h.ts[o.key] && daysAgo(h.ts[o.key]) >= REFRESH_DAYS).sort((a, b) => a.ts[o.key].localeCompare(b.ts[o.key]));
    const todo = missing.length ? missing : stale;
    // 심평원 응답이 호출마다 수 초씩 걸려(실측 평균 10초 안팎) 순서대로만 받으면 예산을 못 채운다 — 동시에 4건씩 받는다.
    let next = 0;
    const worker = async () => {
      while (!stopped) {
        const h = todo[next++];
        if (!h) return;
        if (calls >= BUDGET) { stopped = '오늘 호출 예산 소진'; return; }
        if (Date.now() - t0 > TIME_CAP_MS) { stopped = '실행 시간 제한'; return; }
        try {
          const body = await call(DTL + o.op, { ykiho: h.id, pageNo: 1, numOfRows: 100 });
          h[o.key] = o.map(itemsOf(body));
          h.ts[o.key] = today;
        } catch (e) {
          if (e.fatal) { stopped = quotaHit ? '일일 한도 초과' : '인증 오류: ' + authFail; return; }
          console.error(`  ${o.op} ${h.name}: ${e.message}`);
        }
        await pause(100);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    if (stopped) break outer;
  }

  // 3) 저장
  const progress = {};
  for (const o of OPS) progress[o.key] = items.filter((h) => h.ts[o.key]).length;
  const data = {
    updatedAt: new Date().toISOString(),
    source: '건강보험심사평가원 병원정보서비스·의료기관별상세정보서비스(요양기관 신고 현황)',
    count: items.length,
    progress,
    items: order,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data) + '\n');
  console.log(`저장 ${items.length}곳 · 진행 ${JSON.stringify(progress)} · 호출 ${calls}회${stopped ? ' · 중단: ' + stopped : ''} → ${out} (${Math.round(fs.statSync(out).size / 1024)}KB)`);
  if (authFail && !items.some((h) => h.ts.beds)) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('규모·인력 수집 실패:', e.message);
    process.exit(1);
  });
}
