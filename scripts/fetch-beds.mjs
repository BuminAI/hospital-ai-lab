// 공공 포털 › 병상가동현황 수집기 (2026-11-21, 오너 지시).
//
// 국립중앙의료원 중앙응급의료센터 공개 OpenAPI(공공데이터포털 '전국 응급의료기관 정보 조회 서비스')에서
//   - getEgytListInfoInqire              : 응급의료기관 목록(이름·주소·종류)
//   - getEmrrmRltmUsefulSckbdInfoInqire  : 입원실 병상 기준·가용(실시간)
// 를 전국 단위로 받아 병원별 병상수·재원·가동률을 계산하고 src/data/portal/beds.json 에 쓴다.
// 특정 병원을 기준으로 삼지 않는다(반경·기준 병원·고정 병원 없음). 전국 응급의료기관 전체를 지자체(시도·시군구)별로 보여 주는 용도다.
//
// 인증키: 환경변수 DATA_GO_KR_KEY (GitHub 저장소 Secret). 쉼표·공백으로 여러 개 적어도 된다
//   (서비스마다 활용신청이 승인된 키가 다를 때 '등록되지 않은 서비스키' 응답이 오면 다음 키로 넘어간다).
//   출력 경로를 인자로 주면(node scripts/fetch-beds.mjs <경로>) 그 파일에 항상 새로 쓴다 — 워크플로가 `portal-beds` 브랜치로 올려 페이지가 브라우저에서 읽는다.
//   키가 없거나 호출이 실패하면 아무것도 쓰지 않고 정상 종료한다(기존 파일 유지 — 워크플로에서 변경 없음으로 처리).
//
// 병상수·가동률 계산 규칙은 개인 대시보드(bumin-dashboard)의 scripts/lib/beds.js 와 같은 규칙을 쓴다:
//   병상수 = 입원실 기준병상(hvs38) + 중환자실 계열 기준병상(hvs05~21, 24, 25, 50~52, 54, 56, 58)
//   재원 = 병상수 − 입원실 가용병상(hvgc), 가동률 = 재원 ÷ 병상수, 일반 병실 가동률 = (입원실 − 가용) ÷ 입원실
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BASE = 'https://apis.data.go.kr/B552657/ErmctInfoInqireService';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data/portal/beds.json');
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const FIELD = { id: 'hpid', name: 'dutyName', addr: 'dutyAddr', type: 'dutyEmclsName', base: 'hvs38', free: 'hvgc', stamp: 'hvidate' };
const ICU_FIELDS = [...Array.from({ length: 17 }, (_, i) => 'hvs' + String(i + 5).padStart(2, '0')), 'hvs24', 'hvs25', 'hvs50', 'hvs51', 'hvs52', 'hvs54', 'hvs56', 'hvs58'];

const SIDO_ORDER = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충청북', '충청남', '전북', '전라북', '전남광주', '전라남', '경상북', '경상남', '제주'];

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&amp;/g, '&');
export function parseItems(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const o = {};
    for (const f of m[1].matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) o[f[1]] = decode(f[2].trim());
    items.push(o);
  }
  return items;
}
const tag = (xml, t) => (xml.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || '';
const num = (v) => {
  const s = String(v ?? '').trim();
  const n = Number(s.replace(/,/g, ''));
  return s === '' || !Number.isFinite(n) ? null : n;
};

const isAuthErr = (m) => /NOT_REGISTERED|등록되지 않은|SERVICE_KEY_IS|SERVICE KEY/i.test(String(m));
async function callOne(op, key, params) {
  // 공공데이터포털 키는 'Decoding'과 'Encoding' 두 가지로 보인다 — 어느 쪽을 넣어도 되게 맞춘다.
  const plainKey = /%[0-9A-Fa-f]{2}/.test(key) ? decodeURIComponent(key) : key;
  const url = `${BASE}/${op}?${new URLSearchParams({ serviceKey: plainKey, ...params })}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/xml' } });
      const xml = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} ${xml.slice(0, 120)}`);
      const code = tag(xml, 'resultCode');
      if (code && code !== '00') throw new Error(`API 오류 ${code} ${tag(xml, 'resultMsg')}`);
      if (!code && /returnAuthMsg|errMsg/.test(xml)) throw new Error(`API 오류 ${tag(xml, 'errMsg')} ${tag(xml, 'returnAuthMsg')}`.trim());
      return { items: parseItems(xml), total: Number(tag(xml, 'totalCount')) || 0 };
    } catch (e) {
      if (attempt >= 3 || isAuthErr(e.message)) throw e;
      await pause(attempt * 2500);
    }
  }
}
let goodKey = '';
async function call(op, keyText, params) {
  const list = String(keyText || '').split(/[\s,;]+/).filter(Boolean);
  const keys = goodKey && list.includes(goodKey) ? [goodKey, ...list.filter((k) => k !== goodKey)] : list;
  let last;
  for (const k of keys) {
    try {
      const r = await callOne(op, k, params);
      goodKey = k;
      return r;
    } catch (e) {
      last = e;
      if (!isAuthErr(e.message)) throw e;
    }
  }
  throw last || new Error('인증키가 없습니다');
}
async function fetchAll(op, key) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const r = await call(op, key, { pageNo: page, numOfRows: 1000 });
    out.push(...r.items);
    if (!r.items.length || out.length >= r.total) break;
    await pause(250);
  }
  return out;
}

/** 주소 → [시도, 시군구]. 시군구를 알 수 없으면(세종 등 도로명이 바로 오는 경우) ''. */
export function splitAddr(addr) {
  const parts = String(addr || '').trim().split(/\s+/);
  const sido = parts[0] || '';
  const second = parts[1] || '';
  return { sido, sigungu: /[시군구]$/.test(second) ? second : '' };
}
const sidoRank = (s) => {
  const i = SIDO_ORDER.findIndex((p) => s.startsWith(p));
  return i < 0 ? 99 : i;
};

/** 기관 목록 + 실시간 병상 → 화면용 행. 입원실 병상 자료가 없는 기관은 건너뛰고 개수만 센다. */
export function buildRows(list, live) {
  const liveById = new Map(live.map((x) => [x[FIELD.id], x]));
  const rows = [];
  let withoutData = 0;
  for (const x of list) {
    const l = liveById.get(x[FIELD.id]);
    const merged = { ...x, ...(l || {}) };
    const base = num(merged[FIELD.base]);
    const free = num(merged[FIELD.free]);
    if (!l || base === null || free === null) {
      withoutData++;
      continue;
    }
    const total = base + ICU_FIELDS.reduce((a, k) => a + (num(merged[k]) || 0), 0);
    const { sido, sigungu } = splitAddr(merged[FIELD.addr]);
    const stay = total - free;
    rows.push({
      id: merged[FIELD.id],
      name: merged[FIELD.name] || '',
      sido,
      sigungu,
      type: merged[FIELD.type] || '',
      total,
      stay,
      rate: total > 0 ? stay / total : null,
      wardRate: base > 0 ? (base - free) / base : null,
      stamp: merged[FIELD.stamp] || '',
    });
  }
  rows.sort((a, b) => sidoRank(a.sido) - sidoRank(b.sido) || a.sigungu.localeCompare(b.sigungu, 'ko') || b.total - a.total || a.name.localeCompare(b.name, 'ko'));
  return { rows, withoutData };
}

async function main() {
  const liveOut = process.argv[2] ? path.resolve(process.argv[2]) : '';
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) {
    console.log('DATA_GO_KR_KEY가 없어 병상가동현황 수집을 건너뜁니다(기존 파일 유지).');
    if (liveOut) process.exit(1);
    return;
  }
  const list = await fetchAll('getEgytListInfoInqire', key);
  const live = await fetchAll('getEmrrmRltmUsefulSckbdInfoInqire', key);
  const { rows, withoutData } = buildRows(list, live);
  if (rows.length < 50) throw new Error(`병원 ${rows.length}곳뿐이라 이상 응답으로 보고 저장하지 않습니다.`);
  if (liveOut) {
    fs.mkdirSync(path.dirname(liveOut), { recursive: true });
    const live = { updatedAt: new Date().toISOString(), source: '국립중앙의료원 중앙응급의료센터 응급의료기관 정보(공공데이터포털 OpenAPI)', count: rows.length, withoutData, items: rows };
    fs.writeFileSync(liveOut, JSON.stringify(live) + '\n');
    console.log(`병상가동현황 ${rows.length}곳 저장 → ${liveOut}`);
    return;
  }
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
  const next = {
    updatedAt: new Date().toISOString(),
    source: '국립중앙의료원 중앙응급의료센터 응급의료기관 정보(공공데이터포털 OpenAPI)',
    count: rows.length,
    withoutData,
    items: rows,
  };
  // 병원 값이 하나도 안 바뀌었으면 시각만 달라진 파일을 커밋하지 않는다.
  if (prev && JSON.stringify(prev.items) === JSON.stringify(next.items)) {
    console.log(`병상 값 변동 없음(${rows.length}곳) — 파일을 바꾸지 않습니다.`);
    return;
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(next) + '\n');
  console.log(`병상가동현황 ${rows.length}곳 저장(자료 없음 ${withoutData}곳 제외)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('병상가동현황 수집 실패:', e.message);
    process.exit(1);
  });
}
