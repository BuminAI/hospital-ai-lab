// 공공 포털 › 선별급여·한정급여 조회 자료 갱신기 (2026-11-21, 오너 지시).
//
// 선별급여·한정급여·평가유예 신의료기술(한시적 비급여) 항목은 보건복지부 고시를 사람이 정리한 구글 시트에서 오며,
// 그 시트를 내려주는 구글 앱스스크립트 웹 앱 주소를 GitHub Secret `BENEFIT_GAS_URL`로 받아 읽는다(공개 저장소에 주소를 적지 않는다).
// 받은 자료에서 법제처 API 주소에 섞인 신청자 식별값(OC)을 지우고(공개 주소로 바꿈), 파일 안에서만 의미 있는 상대 경로(./….pdf)는 비워
// src/data/portal/benefit.json 에 쓴다. 주소가 없거나 받기에 실패하면 아무것도 바꾸지 않는다(기존 파일 유지).
//
//   BENEFIT_GAS_URL=... node scripts/fetch-benefit.mjs
//   node scripts/fetch-benefit.mjs --file 내려받은.json     (이미 받은 파일로 만들기)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data/portal/benefit.json');
const TYPES = new Set(['선별급여', '한정급여', '한시적비급여']);
const LAW_API = /law\.go\.kr\/DRF\/lawService\.do\?[^\s]*?\bID=(\d+)/;
const str = (v) => (v == null ? '' : String(v).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

/** 구글 시트 한 줄 → 화면용 항목. 공개해도 되는 형태로 주소를 정리한다. */
export function cleanItem(it) {
  const o = {
    type: str(it.type),
    name: str(it.name),
    code: str(it.code),
    startDate: str(it.startDate),
    endDate: str(it.endDate),
    usage: str(it.usage),
    reason: str(it.reason),
    target: str(it.target),
    source: str(it.source),
    url: str(it.url),
  };
  const m = LAW_API.exec(o.url);
  if (m) o.url = 'https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=' + m[1];
  for (const k of Object.keys(o)) o[k] = o[k].replace(/([?&])OC=[^&\s]*&?/gi, '$1');
  if (!/^https?:\/\//i.test(o.url)) o.url = ''; // './….pdf#page=32' 같은 시트 안의 상대 경로는 이 사이트에서 열리지 않는다
  return o;
}

async function main() {
  let raw;
  const fi = process.argv.indexOf('--file');
  if (fi > 0) {
    raw = JSON.parse(fs.readFileSync(process.argv[fi + 1], 'utf8'));
  } else {
    const url = process.env.BENEFIT_GAS_URL;
    if (!url) {
      console.log('BENEFIT_GAS_URL이 없어 건너뜁니다(기존 파일 유지).');
      return;
    }
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    raw = await res.json();
  }
  const list = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
  const items = list.map(cleanItem).filter((x) => x.name && TYPES.has(x.type));
  if (items.length < 50) throw new Error(`항목이 ${items.length}건뿐이라 이상 응답으로 보고 저장하지 않습니다.`);
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
  if (prev && JSON.stringify(prev.items) === JSON.stringify(items)) {
    console.log(`변동 없음(${items.length}건) — 파일을 바꾸지 않습니다.`);
    return;
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), count: items.length, items }, null, 1) + '\n');
  console.log(`선별급여·한정급여 ${items.length}건 저장`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('선별급여 자료 갱신 실패:', e.message);
    process.exit(1);
  });
}
