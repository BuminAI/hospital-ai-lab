// 각 언어판 '의료 기술·논문' 메뉴용 수집기 (2026-11-14 신설, 오너 지시)
//
//   node scripts/fetch-research.mjs            9개 언어판 전부
//   node scripts/fetch-research.mjs ko ja      지정한 언어판만
//
// 그 나라 소속 저자가 쓴 **최근 365일** 논문과 임상시험을 모아 src/data/research/<언어판>.json 에 쓴다.
//   - 논문: PubMed E-utilities(esearch + esummary). 소속(Affiliation)에 그 나라 이름이 들어간 논문.
//       surgery = 수술 술기(최소침습·로봇·내시경·관절·이식 등)
//       drug    = 신약·치료제 임상(1~3상·무작위대조시험 중 약물·항체·백신 등)
//       disease = 질환(전국 코호트·등록·인구 기반·유병률·발생률)
//   - 임상시험: ClinicalTrials.gov API v2. 그 나라에 시험 장소가 있고 최근 365일 안에 시작한 약물 시험(신약 후보).
// 제목·저널·날짜·저자·링크만 복사한다 — 초록이나 본문은 복사하지 않는다(저작권). 제목은 원문(대부분 영어)이다.
// 수집이 실패하면 기존 파일을 그대로 둔다. NCBI 규칙에 따라 초당 3회 이하로 호출하고, 이메일은 보내지 않는다(tool 이름만).
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const OUT_DIR = new URL('../src/data/research/', import.meta.url);
const TOOL = 'hospital-ai-lab-research';
const PER_SECTION = 12;

const COUNTRIES = {
  ko: { name: 'Korea', affil: '"Korea"[Affiliation] OR "Republic of Korea"[Affiliation]', ct: 'South Korea' },
  ja: { name: 'Japan', affil: '"Japan"[Affiliation]', ct: 'Japan' },
  ru: { name: 'Russia', affil: '"Russia"[Affiliation] OR "Russian Federation"[Affiliation]', ct: 'Russian Federation' },
  id: { name: 'Indonesia', affil: '"Indonesia"[Affiliation]', ct: 'Indonesia' },
  tw: { name: 'Taiwan', affil: '"Taiwan"[Affiliation]', ct: 'Taiwan' },
  en: { name: 'United States', affil: '"United States"[Affiliation] OR "USA"[Affiliation]', ct: 'United States' },
  in: { name: 'India', affil: '"India"[Affiliation]', ct: 'India' },
  sg: { name: 'Singapore', affil: '"Singapore"[Affiliation]', ct: 'Singapore' },
  ph: { name: 'Philippines', affil: '"Philippines"[Affiliation]', ct: 'Philippines' },
};

const TOPICS = {
  surgery:
    '("surgical technique"[tiab] OR "novel technique"[tiab] OR "minimally invasive"[tiab] OR "robot-assisted"[tiab] OR "robotic surgery"[tiab] OR laparoscopic[tiab] OR "endoscopic surgery"[tiab] OR arthroplasty[tiab] OR transplantation[tiab])',
  drug:
    '("Clinical Trial, Phase I"[pt] OR "Clinical Trial, Phase II"[pt] OR "Clinical Trial, Phase III"[pt] OR "Randomized Controlled Trial"[pt]) AND (drug[tiab] OR inhibitor[tiab] OR antibody[tiab] OR vaccine[tiab] OR "novel therapy"[tiab] OR efficacy[tiab])',
  disease:
    '(nationwide[tiab] OR "national cohort"[tiab] OR registry[tiab] OR "population-based"[tiab] OR prevalence[tiab] OR incidence[tiab] OR "disease burden"[tiab])',
};

const ymd = (d) => d.toISOString().slice(0, 10);
const now = new Date();
const from = new Date(now.getTime() - 365 * 86400000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slash = (d) => ymd(d).replace(/-/g, '/');

async function getJson(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'hospital-ai-lab research collector (+https://hospital-ai-lab.com)' }, signal: AbortSignal.timeout(45000) });
      if (res.ok) return await res.json();
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = e;
    }
    await sleep(1500 * (i + 1));
  }
  throw last;
}

const clean = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function pubmed(affil, topic) {
  const term = `(${affil}) AND ${topic} AND hasabstract AND ("${slash(from)}"[PDAT] : "${slash(now)}"[PDAT])`;
  const s = await getJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${PER_SECTION * 2}&sort=pub_date&tool=${TOOL}&term=${encodeURIComponent(term)}`);
  const ids = s?.esearchresult?.idlist ?? [];
  await sleep(400);
  if (!ids.length) return { count: 0, items: [] };
  const sum = await getJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=${TOOL}&id=${ids.join(',')}`);
  await sleep(400);
  const items = [];
  for (const id of ids) {
    const r = sum?.result?.[id];
    if (!r || !r.title) continue;
    // 인쇄본 호 날짜는 미래일 수 있다(예: 2027-03). 온라인 게재일(epubdate)을 우선하고, 오늘보다 뒤인 날짜는 쓰지 않는다.
    const cands = [r.epubdate, r.pubdate, String(r.sortpubdate || '').slice(0, 10)]
      .map((x) => (x ? new Date(String(x).replace(/\//g, '-').replace(/ 00:00$/, '')) : null))
      .filter((d) => d && !Number.isNaN(d.getTime()) && d <= now && d >= from)
      .sort((a, b) => a - b);
    if (!cands.length) continue;
    const date = ymd(cands[0]);
    const names = (r.authors || []).map((a) => a.name).filter(Boolean);
    const doi = (r.articleids || []).find((a) => a.idtype === 'doi')?.value || '';
    items.push({
      kind: 'paper',
      id: `PMID ${id}`,
      title: clean(r.title).replace(/\.$/, ''),
      source: clean(r.source || r.fulljournalname),
      date,
      authors: names.length > 3 ? `${names.slice(0, 3).join(', ')} et al.` : names.join(', '),
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      doi,
    });
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  return { count: Number(s?.esearchresult?.count ?? items.length), items };
}

async function trials(countryName) {
  const adv = `AREA[StartDate]RANGE[${ymd(from)},${ymd(now)}] AND AREA[InterventionType]DRUG`;
  const url = `https://clinicaltrials.gov/api/v2/studies?query.locn=${encodeURIComponent(countryName)}&filter.advanced=${encodeURIComponent(adv)}&pageSize=${PER_SECTION}&sort=StartDate:desc&countTotal=true&fields=NCTId,BriefTitle,Phase,LeadSponsorName,StartDate,Condition,InterventionName&format=json`;
  const j = await getJson(url);
  const items = [];
  for (const st of j.studies ?? []) {
    const p = st.protocolSection ?? {};
    const id = p.identificationModule?.nctId;
    const title = clean(p.identificationModule?.briefTitle);
    const start = p.statusModule?.startDateStruct?.date || '';
    if (!id || !title) continue;
    items.push({
      kind: 'trial',
      id,
      title,
      source: clean(p.sponsorCollaboratorsModule?.leadSponsor?.name),
      date: /^\d{4}-\d{2}$/.test(start) ? `${start}-01` : start,
      phase: (p.designModule?.phases ?? []).map((x) => x.replace('PHASE', 'Phase ').replace('EARLY_', 'Early ').replace('NA', 'N/A')).join(' / '),
      conditions: (p.conditionsModule?.conditions ?? []).slice(0, 3).join(', '),
      intervention: (p.armsInterventionsModule?.interventions ?? []).map((i) => i.name).filter(Boolean).slice(0, 2).join(', '),
      url: `https://clinicaltrials.gov/study/${id}`,
    });
  }
  return { count: Number(j.totalCount ?? items.length), items };
}

const targets = process.argv.slice(2).filter((a) => a in COUNTRIES);
const locs = targets.length ? targets : Object.keys(COUNTRIES);
await mkdir(OUT_DIR, { recursive: true });
let failed = 0;
for (const loc of locs) {
  const c = COUNTRIES[loc];
  const file = new URL(`${loc}.json`, OUT_DIR);
  try {
    const seen = new Set();
    const sections = {};
    const totals = {};
    for (const [key, topic] of Object.entries(TOPICS)) {
      const r = await pubmed(c.affil, topic);
      totals[key] = r.count;
      sections[key] = r.items.filter((it) => !seen.has(it.id) && seen.add(it.id)).slice(0, PER_SECTION);
    }
    const t = await trials(c.ct);
    totals.trials = t.count;
    const data = {
      updatedAt: now.toISOString(),
      country: c.name,
      window: { from: ymd(from), to: ymd(now) },
      totals,
      sections: { ...sections, trials: t.items },
    };
    const n = Object.values(data.sections).reduce((a, b) => a + b.length, 0);
    if (n === 0) throw new Error('결과 0건');
    await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`${loc} (${c.name}): 수술 ${sections.surgery.length} · 신약 논문 ${sections.drug.length} · 질환 ${sections.disease.length} · 임상시험 ${t.items.length}`);
  } catch (e) {
    failed++;
    console.error(`${loc}: 수집 실패 — 기존 파일 유지 (${e.message})`);
  }
}
if (failed === locs.length) process.exit(1);
