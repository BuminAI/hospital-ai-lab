// 비급여 진료비 API 점검(임시, 로그만). 가격 목록 호출이 시간 초과(504)가 나는 원인을 찾기 위해 여러 호출 형태를 시험한다.
const KEY = String(process.env.DATA_GO_KR_KEY || '').split(/[\s,;]+/).filter(Boolean)[0];
const BASE = 'https://apis.data.go.kr/B551182/nonPaymentDamtInfoService/';
const kp = (k) => (/%[0-9A-Fa-f]{2}/.test(k) ? k : encodeURIComponent(k));
async function t(op, params, label) {
  const url = `${BASE}${op}?ServiceKey=${kp(KEY)}&${new URLSearchParams(params)}`;
  const t0 = Date.now();
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 90000);
    const r = await fetch(url, { signal: ctl.signal });
    const x = await r.text();
    clearTimeout(to);
    console.log(`\n[${label}] ${op} ${JSON.stringify(params)} → HTTP ${r.status} ${Math.round((Date.now() - t0) / 1000)}초`);
    console.log(x.replace(/\s+/g, ' ').slice(0, 900));
  } catch (e) {
    console.log(`\n[${label}] ${op} ${JSON.stringify(params)} → 실패 ${e.message} ${Math.round((Date.now() - t0) / 1000)}초`);
  }
}
const code = await (async () => {
  const r = await fetch(`${BASE}getNonPaymentItemCodeList2?ServiceKey=${kp(KEY)}&pageNo=1&numOfRows=3`);
  const x = await r.text();
  console.log('코드표 샘플:', x.replace(/\s+/g, ' ').slice(0, 700));
  return (x.match(/<npayCd>([^<]*)<\/npayCd>/) || [])[1];
})();
console.log('첫 항목 코드:', code);
const tests = [
  [{ pageNo: 1, numOfRows: 3, sidoCd: '11' }, 'a sidoCd=11'],
  [{ pageNo: 1, numOfRows: 3, sidoCd: '110000' }, 'b sidoCd=110000'],
  [{ pageNo: 1, numOfRows: 3, sidoCdNm: '서울' }, 'c sidoCdNm=서울'],
  [{ pageNo: 1, numOfRows: 3, yadmNm: '서울대학교병원' }, 'd yadmNm'],
  [{ pageNo: 1, numOfRows: 3, clCd: '01' }, 'e clCd=01'],
  [{ pageNo: 1, numOfRows: 3, npayCd: code }, 'f npayCd'],
  [{ pageNo: 1, numOfRows: 3, npayMdivCd: '1032A' }, 'g npayMdivCd'],
  [{ pageNo: 1, numOfRows: 3 }, 'h 필터 없음'],
];
await Promise.all(tests.map(([p, l]) => t('getNonPaymentItemHospDtlList', p, l)));
await t('getNonPaymentItemHospList2', { pageNo: 1, numOfRows: 3, sidoCd: '110000' }, 'i HospList2 sido');
await t('getNonPaymentItemHospList2', { pageNo: 1, numOfRows: 3, npayCd: code, sidoCd: '110000' }, 'j HospList2 item+sido');
