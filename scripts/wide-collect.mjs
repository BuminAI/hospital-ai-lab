// 광폭 수집기 실행기 (2026-11-14)
//
// 사용: node scripts/wide-collect.mjs <ko|ja|ru|id|tw|en|in|sg|all> [news|gov|events|all] [--dry]
//
// 각 나라 유명 매체의 공개 RSS 수십 개를 읽어 AI 관련 기사·정부 지원사업·교육 행사를
// 그 언어판의 기존 JSON(src/data/…)에 중복 없이 누적한다. 기존 항목은 지우지 않는다.
// 출처 목록은 scripts/wide-sources.mjs, 판정·병합은 scripts/lib/wide.mjs.
//
// 종료 코드: 0 정상(변경 없음 포함) / 1 모든 출처가 응답하지 않음(기존 파일은 그대로 둔다)
import { fetchAll, select, mergeItems, readJson, writeJson } from './lib/wide.mjs';
import { EDITIONS } from './wide-sources.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const pos = args.filter((a) => !a.startsWith('--'));
const which = pos[0] || 'all';
const catArg = pos[1] || 'all';
const eds = which === 'all' ? Object.keys(EDITIONS) : [which];
const MAX = { news: 1000, gov: 400, events: 300 };
const MIN_RECENT = 12; // 최근 7일 뉴스가 이보다 적으면 보조 등급을 채운다
const root = new URL('..', import.meta.url);

let fatal = 0;
for (const ed of eds) {
  const cfg = EDITIONS[ed];
  if (!cfg) {
    console.error(`알 수 없는 언어판: ${ed}`);
    process.exit(2);
  }
  console.log(`\n[${ed}] 출처 ${cfg.sources.length}개`);
  const { rows, report } = await fetchAll(cfg.sources);
  if (!report.some((r) => r.ok)) {
    console.error(`[${ed}] 응답한 출처가 하나도 없습니다 — 기존 파일을 그대로 둡니다.`);
    fatal = 1;
    continue;
  }
  for (const cat of ['news', 'gov', 'events']) {
    if (catArg !== 'all' && catArg !== cat) continue;
    const file = cfg.files[cat];
    if (!file) continue;
    const url = new URL(file, root);
    const prev = (await readJson(url)) ?? { updatedAt: null, source: '', items: [] };
    const picked = select(cfg.lang, rows, cat);
    // 빈 목록 방지 안전장치(뉴스만): 최근 7일에 쌓인 항목(기존+이번 후보)이 MIN_RECENT보다 적으면,
    // 의료 전문 매체의 '디지털 헬스' 기사(AI 단어는 없지만 의료정보·보안·규제 소식)를 보조 등급(tier:'B')으로 채운다.
    // B 등급 항목에는 tier 표시가 남아 나중에 걸러낼 수 있다.
    if (cat === 'news') {
      const weekAgo = Date.now() - 7 * 86400000;
      const have = new Set(
        [...(prev.items ?? []), ...picked].filter((x) => Date.parse(x.pubDate) >= weekAgo).map((x) => x.link)
      );
      if (have.size < MIN_RECENT) {
        const extra = select(cfg.lang, rows, cat, { allowB: true }).filter((x) => x._tier === 'B');
        for (const x of extra) picked.push({ ...x, tier: 'B' });
        console.log(`  news: 최근 7일 ${have.size}건 < ${MIN_RECENT} → 디지털헬스 보조 등급 ${extra.length}건 추가 후보`);
      }
    }
    if (cat === 'gov') for (const p of picked) p.summary = '';
    const { items, added, updated } = mergeItems(prev.items ?? [], picked, { max: MAX[cat] });
    const bySrc = {};
    for (const p of picked) bySrc[p.source] = (bySrc[p.source] || 0) + 1;
    const top = Object.entries(bySrc).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' ');
    console.log(`  ${cat}: 통과 ${picked.length}건(${top || '-'}) → 신규 ${added}, 인기표시 갱신 ${updated}, 누적 ${items.length}`);
    if (added === 0 && updated === 0) continue;
    if (dry) continue;
    const labels = new Set(String(prev.source || '').split(/[·,]/).map((s) => s.trim()).filter(Boolean));
    for (const p of picked) labels.add(p.source);
    await writeJson(url, { ...prev, updatedAt: new Date().toISOString(), source: [...labels].join(' · '), items });
  }
}
process.exit(fatal);
