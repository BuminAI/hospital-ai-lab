// 공공 포털 › 응급실 사용현황 수집기 (2026-11-21, 오너 지시).
//
// 중앙응급의료센터 mediboard('내 손안의 응급실') 공개 자료를 시도별로 받아 전국 응급의료기관의 응급실 가용 병상·격리실·분만실·진료 불가 안내를
// 한 파일(er.json)로 묶는다. 인증키가 필요 없다. 특정 병원을 기준으로 삼지 않으며(고정·우선 표시 없음) 전국을 같은 기준으로 담는다.
//
//   node scripts/fetch-er.mjs [출력경로]     (기본 ./er.json)
//
// ⚠️ 이 값은 몇 분 단위로 바뀌는 '실시간' 자료라, 사이트를 다시 빌드·배포하지 않는다.
//    워크플로(update-er.yml)가 결과를 `portal-data` 브랜치의 er.json 으로 올리고, 페이지(/portal/er/)가 브라우저에서 그 파일을 읽는다.
// ⚠️ 호출은 시도 하나씩 순서대로(요청 사이 0.4초)·한 번에 17회 안팎으로 상대 서버 부담을 줄인다. 응답이 비정상이면 저장하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const API = 'https://mediboard.nemc.or.kr/api/v1/search/handy?searchCondition=regional&bjdcd1=';
const HEAD = {
  Referer: 'https://mediboard.nemc.or.kr/emergency_room_in_hand',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
};
// 법정동 시도 코드(2026-11-21 실측: 서울 11, 전남광주통합특별시 12, 부산 26, 대구 27, 인천 28, 대전 30, 울산 31, 세종 36, 경기 41, 충북 43, 충남 44, 경북 47, 경남 48, 제주 50, 강원 51, 전북 52).
// 행정구역이 바뀌면 코드가 달라질 수 있어, 합계가 모자라면 10~60 전체를 훑는다.
const CODES = ['11', '12', '26', '27', '28', '30', '31', '36', '41', '43', '44', '47', '48', '50', '51', '52'];
const MIN_TOTAL = 350;
const SIDO_ORDER = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충청북', '충청남', '전북', '전라북', '전남광주', '전라남', '경상북', '경상남', '제주'];
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const listOf = (p) => (p && p.result && Array.isArray(p.result.data) ? p.result.data : p && Array.isArray(p.data) ? p.data : []);

async function one(code) {
  for (let attempt = 1; ; attempt++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 12000);
    try {
      const r = await fetch(API + code, { headers: HEAD, signal: ctl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return listOf(await r.json());
    } catch (e) {
      if (attempt >= 3) throw e;
      await pause(attempt * 2000);
    } finally {
      clearTimeout(t);
    }
  }
}

const sidoRank = (s) => {
  const i = SIDO_ORDER.findIndex((p) => s.startsWith(p));
  return i < 0 ? 99 : i;
};
/** 주소 → 시도·시군구(세종처럼 도로명이 바로 오면 시군구 ''). */
export function splitAddr(addr) {
  const parts = String(addr || '').trim().split(/\s+/);
  const second = parts[1] || '';
  return { sido: parts[0] || '', sigungu: /[시군구]$/.test(second) ? second : '' };
}
const int = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};
// [가용, 전체] 쌍. 전체가 없거나 0이면 null(화면에서 '-').
const pair = (a, t) => {
  const total = int(t);
  if (!total || total <= 0) return null;
  const avail = int(a);
  return avail === null ? null : [avail, total];
};
const clip = (s, n) => {
  const x = String(s ?? '').trim();
  return x.length > n ? x.slice(0, n - 1) + '…' : x;
};
const uniq = (a) => [...new Set(a.filter(Boolean))];

/** mediboard 한 곳 → 화면용 행(필요한 값만, 안내 문구는 길이를 제한). */
export function toRow(x) {
  const { sido, sigungu } = splitAddr(x.address);
  const deliveryTotal = int(x.deliveryRoomTotal);
  const deliveryOk = x.deliveryRoomAvailable === 'Y' || x.deliveryRoomAvailable === true || x.deliveryRoomAvailable === '1' || x.deliveryRoomAvailable === 1;
  const er = (Array.isArray(x.erMessages) ? x.erMessages : [])
    .filter((m) => m && typeof m === 'object' && (m.message || m.reason))
    .slice(0, 12)
    .map((m) => ({ reason: clip(m.reason || m.category, 20), detail: clip(m.detail, 24), message: clip(m.message, 140) }));
  const unavail = uniq((Array.isArray(x.unavailableMessages) ? x.unavailableMessages : []).map((m) => clip(m && (m.category || m.message), 40))).slice(0, 30);
  const bypass = (Array.isArray(x.adMessages) ? x.adMessages : [])
    .map((a) => (typeof a === 'string' ? clip(a, 120) : a && typeof a === 'object' ? clip(a.message || a.reason || a.detail, 120) : ''))
    .filter(Boolean)
    .slice(0, 5);
  return {
    id: x.emogCode,
    name: x.emergencyRoomNickname || x.emergencyRoomName || '',
    fullName: x.emergencyRoomName || '',
    sido,
    sigungu,
    type: x.emergencyInstitutionType || '',
    tel: x.hotlineTel || '',
    blocked: !!x.isBlocked,
    gen: pair(x.generalEmergencyAvailable, x.generalEmergencyTotal),
    ped: pair(x.childEmergencyAvailable, x.childEmergencyTotal),
    deliv: deliveryTotal ? { ok: deliveryOk, total: deliveryTotal } : null,
    neg: pair(x.npirAvailable, x.npirTotal),
    iso: pair(x.generalAvailable, x.generalTotal),
    coh: pair(x.cohortAvailable, x.cohortTotal),
    er,
    unavail,
    bypass,
  };
}

export function sortRows(rows) {
  return rows.sort((a, b) => sidoRank(a.sido) - sidoRank(b.sido) || a.sigungu.localeCompare(b.sigungu, 'ko') || a.name.localeCompare(b.name, 'ko'));
}

async function collect() {
  const seen = new Map();
  const run = async (codes) => {
    for (const c of codes) {
      try {
        for (const x of await one(c)) if (x && x.emogCode) seen.set(x.emogCode, x);
      } catch (e) {
        console.error(`시도 코드 ${c} 실패:`, e.message);
      }
      await pause(400);
    }
  };
  await run(CODES);
  if (seen.size < MIN_TOTAL) {
    console.error(`합계 ${seen.size}곳 — 시도 코드가 바뀐 것으로 보고 10~60 전체를 훑습니다.`);
    await run(Array.from({ length: 51 }, (_, i) => String(i + 10)).filter((c) => !CODES.includes(c)));
  }
  return [...seen.values()];
}

async function main() {
  const out = path.resolve(process.argv[2] || 'er.json');
  const raw = await collect();
  if (raw.length < MIN_TOTAL) throw new Error(`응급의료기관 ${raw.length}곳뿐이라 이상 응답으로 보고 저장하지 않습니다.`);
  const items = sortRows(raw.map(toRow));
  const data = {
    updatedAt: new Date().toISOString(),
    source: '국립중앙의료원 중앙응급의료센터 mediboard(내 손안의 응급실)',
    count: items.length,
    items,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data) + '\n');
  console.log(`응급실 사용현황 ${items.length}곳 저장 → ${out} (${Math.round(JSON.stringify(data).length / 1024)}KB)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('응급실 사용현황 수집 실패:', e.message);
    process.exit(1);
  });
}
