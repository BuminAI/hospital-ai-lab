// 병원 AI 연구소 주간 상태 점검 (2026-09-13 신설).
//
// 원래는 로컬 PC의 예약 작업(Claude Code 앱, 매주 월요일 09:00 KST)이었다.
// 그런데 그 방식은 트리거 시각에 컴퓨터·앱이 꺼져 있으면 세션 자체가 아예
// 생기지 않는다(로컬 타이머의 구조적 한계) — 실제로 2026-08-10 이후 약 5주간
// 한 번도 실행되지 않은 채 아무도 몰랐다. GitHub Actions cron은 컴퓨터 전원과
// 무관하게 도니까 이 점검을 여기로 옮긴다.
//
// ⚠️ 이 스크립트는 보고 전용이다. 어떤 파일도 쓰지 않고, git 커밋도 하지 않는다
//    (로컬 SKILL.md의 "절대 규칙"을 그대로 유지). 문제가 있으면 exit code 1로
//    끝내 Actions 탭에서 실패(빨간 X)로 보이게 한다 — 이메일이 씹혀도 GitHub 자체
//    알림으로 이중 안전망이 되게 하려는 의도다.
//
// 로컬 SKILL.md 대비 이관하면서 넓힌 점:
//  - 점검 대상 페이지에 /ja/ /ru/ /id/ /tw/ 홈을 추가했다(로컬판은 한국어판만
//    있던 시절 목록이 그대로 남아 있었다).
//  - 블로그 신선도·뉴스 신선도를 5개 언어판 전부에 대해 확인한다(로컬판은
//    한국어만 봤다).
//  - "최근 48시간 내 발행된 글에 외부 출처 링크가 하나도 없는가"를 새로 본다.
//    2026-09-12에 실제로 이 상태(출처 각주 누락)가 발생했었는데, 원래 5번
//    항목(출처 링크 생존)은 "있는 링크가 살아있나"만 보고 "링크가 아예
//    없는 경우"는 못 잡았다.

const SITE = 'https://hospital-ai-lab.com';
const SUPABASE_URL = 'https://qasjbbkegjqilrqylvdb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2piYmtlZ2pxaWxycXlsdmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNDQwMzgsImV4cCI6MjA5ODcyMDAzOH0.s9KhnZjvcIaPxOdiT0yFwcR2VeAXzJMqdLZn0TiQvdg';

const PAGES = [
  '/', '/blog/', '/news/', '/youtube/', '/glossary/', '/faq/', '/checklist/',
  '/guide/', '/ai-apps/', '/login/', '/signup/', '/admin/', '/rss.xml', '/sitemap-index.xml',
  '/ja/', '/ru/', '/id/', '/tw/',
];

const LOCALES = [
  { code: 'ko', label: '한국어', blogDir: 'src/content/blog', newsJson: 'src/data/news.json' },
  { code: 'ru', label: '러시아어', blogDir: 'src/content/blog-ru', newsJson: 'src/data/ru/news.json' },
  { code: 'ja', label: '일본어', blogDir: 'src/content/blog-ja', newsJson: 'src/data/ja/news.json' },
  { code: 'id', label: '인도네시아어', blogDir: 'src/content/blog-id', newsJson: 'src/data/id/news.json' },
  { code: 'tw', label: '대만어', blogDir: 'src/content/blog-tw', newsJson: 'src/data/tw/news.json' },
];

const HOUR = 3600000;
const DAY = 24 * HOUR;
const TIMEOUT = 15000;

import { readFile, readdir } from 'node:fs/promises';

const problems = [];
const normals = [];

function addProblem(symptom, cause, action) {
  problems.push({ symptom, cause, action });
}

async function fetchWithTimeout(url, opts = {}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(TIMEOUT) });
}

// ── 1. 주요 페이지 접속 ──────────────────────────────────────
async function checkPages() {
  const bad = [];
  for (const path of PAGES) {
    try {
      const res = await fetchWithTimeout(`${SITE}${path}`, { redirect: 'follow' });
      if (res.status !== 200) bad.push(`${path} (HTTP ${res.status})`);
    } catch (e) {
      bad.push(`${path} (요청 실패: ${e.message})`);
    }
  }
  if (bad.length === 0) {
    normals.push(`주요 페이지 ${PAGES.length}개 모두 200 정상`);
  } else {
    addProblem(
      `주요 페이지 접속 실패: ${bad.join(', ')}`,
      '배포 실패, 라우팅 변경, 또는 GitHub Pages 자체 장애일 수 있음',
      '해당 경로를 직접 열어 원인을 확인하고 필요하면 배포를 다시 실행'
    );
  }
}

// ── frontmatter 파서 (notify-new-posts.mjs와 동일 규칙) ──────
function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let [, key, value] = kv;
    value = value.trim();
    if (/^".*"$/.test(value)) value = value.slice(1, -1).replace(/\\"/g, '"');
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    fm[key] = value;
  }
  return fm;
}

async function loadPublishedPosts(dir) {
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const posts = [];
  for (const file of files) {
    const raw = await readFile(`${dir}/${file}`, 'utf8');
    const fm = parseFrontmatter(raw);
    if (!fm || fm.draft === true || !fm.pubDate) continue;
    const pubDate = new Date(fm.pubDate);
    if (isNaN(pubDate)) continue;
    posts.push({ file, path: `${dir}/${file}`, title: fm.title, pubDate, body: raw.slice(raw.indexOf('---', 3) + 3) });
  }
  posts.sort((a, b) => b.pubDate - a.pubDate);
  return posts;
}

// ── 2. 자동화 신선도 (뉴스 수집 + 블로그 발행, 5개 언어판) ──
async function checkFreshness() {
  const now = Date.now();

  // 뉴스 수집 신선도: 한국어판만 본다. 나머지 언어판(ru/ja/id/tw)은 수집
  // 워크플로가 3시간 간격으로 계속 돌아도 매체 자체의 AI 기사 발행이 하루
  // 몇 건 수준이라 updatedAt이 며칠씩 안 바뀌는 게 정상일 수 있다(각 워크플로
  // 파일의 주석 참고). 그 언어판들의 실행 자체가 실패하는지는 3번 항목
  // (GitHub Actions 실패 목록)이 대신 잡아준다.
  try {
    const raw = await readFile(LOCALES[0].newsJson, 'utf8');
    const json = JSON.parse(raw);
    const ageH = (now - new Date(json.updatedAt)) / HOUR;
    if (ageH <= 26) {
      normals.push(`한국어판 뉴스 수집: ${ageH.toFixed(1)}시간 전 갱신 (정상)`);
    } else if (ageH <= 48) {
      addProblem(
        `한국어판 뉴스 수집이 ${ageH.toFixed(0)}시간째 안 갱신됨 (주의 단계)`,
        '단순히 새 기사가 없어서 updatedAt이 안 바뀐 것일 수도 있고, 수집기 워크플로가 실패하고 있을 수도 있음',
        'gh run list로 update-news 워크플로의 최근 실행 결과를 확인'
      );
    } else {
      addProblem(
        `한국어판 뉴스 수집이 ${ageH.toFixed(0)}시간째 안 갱신됨`,
        '수집 워크플로가 계속 실패하고 있을 가능성이 높음',
        'gh run list로 update-news 워크플로를 확인하고 실패 로그를 봐서 원인을 고쳐줘'
      );
    }
  } catch (e) {
    addProblem('한국어판 뉴스 데이터(src/data/news.json)를 읽을 수 없음', `파일 누락 또는 형식 오류: ${e.message}`, '해당 파일이 저장소에 있는지, JSON 형식이 맞는지 확인');
  }

  for (const loc of LOCALES) {
    // 블로그 발행 신선도
    const posts = await loadPublishedPosts(loc.blogDir);
    if (posts.length === 0) {
      addProblem(`${loc.label}판 블로그(${loc.blogDir})에 발행된 글이 없음`, '디렉터리 누락 또는 전부 draft 상태', '디렉터리와 draft 값을 확인');
      continue;
    }
    const ageH = (now - posts[0].pubDate) / HOUR;
    if (ageH <= 48) {
      normals.push(`${loc.label}판 블로그: 최신 글이 ${ageH.toFixed(0)}시간 전 발행 (정상)`);
    } else {
      addProblem(
        `${loc.label}판 블로그가 ${(ageH / 24).toFixed(1)}일째 새 글 없음 (최신: ${posts[0].file})`,
        '매일 밤 예약 작업(daily-update-digest)이 이 언어판만 건너뛰었거나, 예약 작업 자체가 그날 실행되지 않았을 가능성',
        '해당 언어판의 daily-update-digest 실행 기록을 확인하고, 검증된 주제 후보가 고갈됐는지 점검'
      );
    }
  }
}

// ── 2b. 최근 발행 글에 출처 링크가 아예 없는지 (2026-09-12 사고 재발 방지) ──
async function checkRecentPostsHaveCitations() {
  const now = Date.now();
  for (const loc of LOCALES) {
    const posts = await loadPublishedPosts(loc.blogDir);
    const recent = posts.filter((p) => now - p.pubDate <= 2 * DAY);
    for (const post of recent) {
      const links = [...post.body.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)]
        .map((m) => m[1])
        .filter((u) => !u.includes('hospital-ai-lab.com'));
      if (links.length === 0) {
        addProblem(
          `${loc.label}판 "${post.title}"(${post.file})에 외부 출처 링크가 하나도 없음`,
          '사실 검증 없이 발행됐거나, 출처 각주를 붙이는 단계를 건너뛰었을 가능성 (CLAUDE.md 사실 검증 절대 원칙 위반 소지)',
          '글 본문의 사실 주장을 원문 출처로 직접 재검증하고, 확인되면 출처 각주를 추가'
        );
      }
    }
  }
}

// ── 3. GitHub Actions 실패 (최근 24시간) ─────────────────────
async function checkActionsFailures() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) {
    normals.push('GitHub Actions 실패 점검: 건너뜀(저장소·토큰 정보 없음)');
    return;
  }
  try {
    const res = await fetchWithTimeout(`https://api.github.com/repos/${repo}/actions/runs?per_page=40`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const now = Date.now();
    const recent = (json.workflow_runs || []).filter((r) => now - new Date(r.created_at) <= DAY);
    const failed = recent.filter((r) => ['failure', 'cancelled', 'timed_out'].includes(r.conclusion));
    if (failed.length === 0) {
      normals.push(`GitHub Actions: 최근 24시간 실행 ${recent.length}건 중 실패 없음`);
    } else {
      const list = failed.map((r) => `${r.name} (${r.conclusion}, ${r.created_at})`).join(' / ');
      addProblem(
        `GitHub Actions 워크플로 실패 ${failed.length}건: ${list}`,
        '수집기 API 응답 형식 변경, 속도 제한, 또는 스크립트 버그',
        '실패한 워크플로의 실행 로그를 열어 오류 메시지를 확인'
      );
    }
  } catch (e) {
    addProblem('GitHub Actions 실행 목록을 가져오지 못함', e.message, 'GITHUB_TOKEN 권한(actions: read)이 걸려 있는지 확인');
  }
}

// ── 4. Supabase 서버 상태 ─────────────────────────────────────
async function checkSupabase() {
  const checks = [
    { name: 'profiles', url: `${SUPABASE_URL}/rest/v1/profiles?select=id&limit=0&apikey=${SUPABASE_ANON_KEY}` },
    { name: 'admin_secrets', url: `${SUPABASE_URL}/rest/v1/admin_secrets?select=key&apikey=${SUPABASE_ANON_KEY}` },
    { name: 'ai_apps', url: `${SUPABASE_URL}/rest/v1/ai_apps?select=id&limit=0&apikey=${SUPABASE_ANON_KEY}` },
  ];
  for (const c of checks) {
    try {
      const res = await fetchWithTimeout(c.url);
      const text = await res.text();
      if (text.includes('PGRST205') || text.includes('Could not find the table')) {
        addProblem(
          `Supabase 테이블 '${c.name}'을 찾을 수 없음`,
          '해당 마이그레이션 SQL이 아직 실행되지 않음',
          'supabase/ 아래 최신 마이그레이션 SQL을 Supabase 대시보드에서 실행'
        );
      } else {
        normals.push(`Supabase '${c.name}': 정상 응답 (HTTP ${res.status})`);
      }
    } catch (e) {
      addProblem(`Supabase '${c.name}' 요청 실패`, e.message, 'Supabase 프로젝트 상태(일시 중지 여부 등)를 대시보드에서 확인');
    }
  }
}

// ── 5. 최신 글 출처 링크 생존 (언어판별 최신 1편) ────────────
async function checkSourceLinksAlive() {
  for (const loc of LOCALES) {
    const posts = await loadPublishedPosts(loc.blogDir);
    if (posts.length === 0) continue;
    const post = posts[0];
    const links = [...new Set(
      [...post.body.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)]
        .map((m) => m[1])
        .filter((u) => !u.includes('hospital-ai-lab.com'))
    )];
    for (const link of links) {
      try {
        const res = await fetchWithTimeout(link, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'user-agent': 'Mozilla/5.0 (compatible; HospitalAiLabHealthCheck/1.0)' },
        });
        if ([403, 429, 999].includes(res.status)) {
          addProblem(
            `${loc.label}판 "${post.title}"의 출처 링크가 HTTP ${res.status} 응답: ${link}`,
            'GitHub Actions 서버의 IP를 매체가 봇으로 보고 차단했을 가능성이 높음(CNN Indonesia 사례와 동일 패턴 — HANDOFF.md 참고). 실제로 죽은 링크가 아닐 수 있음',
            '이 링크를 브라우저로 직접 열어 실제로 살아있는지 먼저 확인하고, 정말 죽었을 때만 문장을 고치거나 삭제'
          );
        } else if (!res.ok) {
          addProblem(
            `${loc.label}판 "${post.title}"의 출처 링크 접속 불가 (HTTP ${res.status}): ${link}`,
            '원문 기사가 삭제됐거나 URL이 바뀜',
            '해당 문장을 대체 출처로 바꾸거나, 대체 출처가 없으면 문장을 삭제'
          );
        }
      } catch (e) {
        addProblem(
          `${loc.label}판 "${post.title}"의 출처 링크 요청 실패: ${link}`,
          `접속 오류: ${e.message} (도메인 소멸 가능성 포함)`,
          '해당 문장을 대체 출처로 바꾸거나, 대체 출처가 없으면 문장을 삭제'
        );
      }
    }
    normals.push(`${loc.label}판 최신 글 출처 링크 ${links.length}건 확인`);
  }
}

function buildReport(today) {
  const lines = [];
  if (problems.length === 0) {
    lines.push(`✅ 모두 정상 (${today} 점검)`);
    lines.push('');
    for (const n of normals) lines.push(`- ${n}`);
  } else {
    lines.push(`⚠️ 문제 ${problems.length}건 발견 (${today} 점검)`);
    lines.push('');
    problems.forEach((p, i) => {
      lines.push(`${i + 1}. ${p.symptom}`);
      lines.push(`   - 원인 추정: ${p.cause}`);
      lines.push(`   - 권장 조치: ${p.action}`);
    });
    lines.push('');
    lines.push('정상 항목:');
    for (const n of normals) lines.push(`- ${n}`);
  }
  return lines.join('\n');
}

async function sendEmail(subject, textBody) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log('RESEND_API_KEY 없음 — 이메일 발송 건너뜀(Actions 요약에만 남음)');
    return;
  }
  const html = `<pre style="font-family: -apple-system, sans-serif; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color:#1a1a1a;">${escapeHtml(textBody)}</pre>`;
  try {
    const res = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: '병원 AI 연구소 상태 점검 <status@hospital-ai-lab.com>',
        to: ['choyj80@naver.com'],
        subject,
        html,
      }),
    });
    const body = await res.text();
    if (!res.ok) console.error(`Resend 발송 실패: HTTP ${res.status} ${body}`);
    else console.log('이메일 발송 요청 완료.');
  } catch (e) {
    console.error(`Resend 발송 요청 자체가 실패: ${e.message}`);
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main() {
  await checkPages();
  await checkFreshness();
  await checkRecentPostsHaveCitations();
  await checkActionsFailures();
  await checkSupabase();
  await checkSourceLinksAlive();

  const today = new Date().toISOString().slice(0, 10);
  const report = buildReport(today);
  console.log(report);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const { appendFile } = await import('node:fs/promises');
    await appendFile(summaryPath, `## 병원 AI 연구소 상태 점검 (${today})\n\n\`\`\`\n${report}\n\`\`\`\n`);
  }

  const subject = problems.length === 0 ? `[병원 AI 연구소] 주간 점검 정상 (${today})` : `[병원 AI 연구소] ⚠️ 점검에서 문제 ${problems.length}건 발견 (${today})`;
  await sendEmail(subject, report);

  process.exitCode = problems.length === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
