// 공공 포털 전체 자료 수집 진행 점검기 (2026-11-22, 오너 지시: 모든 항목이 다 채워질 때까지 계속 진행하고, 끝나면 알린다).
// 규모·인력 비교(hospitals)와 비급여 진료비(npay)는 공공데이터포털 하루 호출 한도·서버 지연 때문에 며칠에 걸쳐 채워진다.
// 이 스크립트가 두 자료의 진행 상황을 읽어 JSON 한 줄로 알려 주고, live-loop.sh 가 그 결과로 다음 수집을 깨우거나 완료 알림을 낸다.
// 응급실·병상가동현황은 매번 전체를 받으므로 '완료' 개념이 없다. 선별급여는 고시 스냅샷이라 대상이 아니다.
const REPO = process.env.REPO || 'BuminAI/hospital-ai-lab';
const raw = async (branch, file) => {
  const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${branch}/${file}?t=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } });
  if (!r.ok) throw new Error(`${branch}/${file} HTTP ${r.status}`);
  return r.json();
};
const out = { hospitals: null, npay: null, done: false };
try {
  const h = await raw('portal-hospitals', 'hospitals.json');
  const keys = Object.keys(h.progress || {});
  const filled = keys.reduce((a, k) => a + (h.progress[k] || 0), 0);
  const need = (h.count || 0) * keys.length;
  out.hospitals = { updatedAt: h.updatedAt, count: h.count, filled, need, complete: h.count > 3000 && need > 0 && filled >= need, pct: need ? Math.round((filled / need) * 1000) / 10 : 0 };
} catch (e) {
  out.hospitals = { error: e.message, complete: false };
}
try {
  const n = await raw('portal-npay', 'index.json');
  const missing = Array.isArray(n.missingPages) ? n.missingPages.length : 0;
  out.npay = { updatedAt: n.updatedAt, rows: n.rows, missing, complete: (n.rows || 0) >= 100000 && missing === 0 };
} catch (e) {
  out.npay = { error: e.message, complete: false };
}
out.done = !!(out.hospitals.complete && out.npay.complete);
console.log(JSON.stringify(out));
