// 공공 포털 › 규모·인력 비교 준비용 점검기 (2026-11-21).
// 심평원 OpenAPI 두 개(병원정보서비스·의료기관별상세정보서비스 2.8)가 이 인증키로 열리는지, 응답에 어떤 항목이 오는지 확인한다.
// 결과는 Actions 로그에만 남는다(저장·커밋 없음). 병원 한 곳(종합병원 첫 번째)의 공개 정보를 샘플로 조회한다.
//   DATA_GO_KR_KEY=... node scripts/probe-hira.mjs
const KEYS = String(process.env.DATA_GO_KR_KEY || '').split(/[\s,;]+/).filter(Boolean);
if (!KEYS.length) {
  console.log('DATA_GO_KR_KEY가 없습니다.');
  process.exit(0);
}
const LIST = 'https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList';
const DTL = 'https://apis.data.go.kr/B551182/MadmDtlInfoService2.8/';
const OPS = ['getMedOftInfo2.8', 'getSpcSbjtSdrInfo2.8', 'getEtcHstInfo2.8', 'getEqpInfo2.8', 'getDgsbjtInfo2.8', 'getNursigGrdInfo2.8', 'getSpclDiagInfo2.8', 'getSpclHospAsgFldList2.8', 'getDtlInfo2.8', 'getFoepAddcInfo2.8', 'getTrnsprtInfo2.8'];
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const plain = (k) => (/%[0-9A-Fa-f]{2}/.test(k) ? decodeURIComponent(k) : k);

async function get(url, params, key) {
  const u = `${url}?${new URLSearchParams({ serviceKey: plain(key), _type: 'json', ...params })}`;
  let last = { status: 0, text: '' };
  // 심평원 서버가 '연결 풀 부족'(resultCode 99) 등 일시 오류를 자주 내므로 몇 번 다시 시도한다.
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(u, { headers: { accept: 'application/json' } });
      const text = await res.text();
      last = { status: res.status, text };
      const transient = res.status >= 500 || /"resultCode":"?99"?|ResourceLimitException|SERVICETIMEOUT|APPLICATION_ERROR/.test(text);
      if (!transient) return last;
    } catch (e) {
      last = { status: 0, text: String(e.message) };
    }
    await pause(attempt * 3000);
  }
  return last;
}
const parse = (t) => {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
};
const itemsOf = (j) => {
  const it = j && j.response && j.response.body && j.response.body.items;
  if (!it || it === '') return [];
  const x = it.item;
  return Array.isArray(x) ? x : x ? [x] : [];
};
const headerOf = (j) => (j && j.response && j.response.header) || (j && j.OpenAPI_ServiceResponse && j.OpenAPI_ServiceResponse.cmmMsgHeader) || null;

async function main() {
  let key = KEYS[0];
  console.log('=== 1) 병원정보서비스 getHospBasisList (종합병원 clCd=11, 3건)');
  let r = await get(LIST, { pageNo: 1, numOfRows: 3, clCd: '11' }, key);
  console.log('HTTP', r.status, r.text.slice(0, 700).replace(/\s+/g, ' '));
  const j = parse(r.text);
  const items = itemsOf(j);
  if (!items.length) {
    console.log('목록을 받지 못했습니다 — 활용신청 승인 여부·인증키를 확인하세요. 상세 점검을 건너뜁니다.');
    return;
  }
  console.log('목록 항목명:', Object.keys(items[0]).join(', '));
  console.log('totalCount:', j.response.body.totalCount);
  console.log('샘플 1건:', JSON.stringify(items[0]));
  for (const cl of ['01', '11', '21', '28', '29', '41', '92']) {
    const c = await get(LIST, { pageNo: 1, numOfRows: 1, clCd: cl }, key);
    const cj = parse(c.text);
    console.log(`종별 ${cl}: 총 ${cj && cj.response && cj.response.body ? cj.response.body.totalCount : '?'}곳`, itemsOf(cj)[0] ? itemsOf(cj)[0].clCdNm : '');
    await pause(300);
  }
  const ykiho = items[0].ykiho;
  console.log('\n=== 2) 의료기관별상세정보서비스 2.8 — 샘플 병원:', items[0].yadmNm);
  for (const op of OPS) {
    const d = await get(DTL + op, { ykiho, pageNo: 1, numOfRows: 50 }, key);
    const dj = parse(d.text);
    const h = headerOf(dj);
    const its = itemsOf(dj);
    console.log(`\n[${op}] HTTP ${d.status} ${h ? `resultCode=${h.resultCode} ${h.resultMsg}` : ''} 항목 ${its.length}건`);
    if (its.length) {
      console.log('  항목명:', Object.keys(its[0]).join(', '));
      console.log('  샘플:', JSON.stringify(its.slice(0, 3)).slice(0, 900));
    } else {
      console.log('  원문:', d.text.slice(0, 400).replace(/\s+/g, ' '));
    }
    await pause(400);
  }
}
main().catch((e) => {
  console.error('점검 실패:', e.message);
  process.exit(1);
});
