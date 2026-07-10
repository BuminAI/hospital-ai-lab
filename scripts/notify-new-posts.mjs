// 새 글 발행 이메일 알림 발송기
// .github/workflows/deploy.yml의 배포 성공 뒤 단계에서 실행된다.
//
// 동작:
//  1) src/content/blog의 발행글(draft:false) 목록과 src/data/notified-posts.json
//     (이미 알림을 보낸 글의 슬러그 목록)을 비교해 "새로 발행된 글"만 뽑는다.
//  2) 새 글이 없으면 아무 것도 하지 않는다(누적 파일이 안 바뀌므로 커밋도 없음).
//  3) Supabase profiles 테이블에서 email_notify_new_post=true(+ 가입 동의 완료)인
//     회원 이메일을 가져와, Resend로 새 글마다 이메일을 발송한다.
//  4) 발송 요청 자체가 성공(도메인·API 키 정상)하면 그 글을 "알림 보냄"으로
//     기록한다. 요청 자체가 실패(예: 도메인 미인증)하면 기록하지 않고 다음
//     실행에서 다시 시도한다 — 그래야 설정을 고친 뒤 놓친 글이 나가지 않고
//     사라지는 일이 없다.
import { readFile, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';

// site.ts의 값과 반드시 같아야 한다(관리자 이메일과 같은 이유로 이 프로젝트는
// 이런 상수를 astro 코드와 순수 Node 스크립트 양쪽에 중복 보관한다).
const SUPABASE_URL = 'https://qasjbbkegjqilrqylvdb.supabase.co';
const SITE_URL = 'https://hospital-ai-lab.com';
const SITE_TITLE = '병원 AI 연구소';
const DISCLAIMER =
  '본 사이트의 콘텐츠는 일반적인 정보 제공과 연구·교육 목적이며, 특정 환자에 대한 의학적 진단이나 조언을 대신하지 않습니다.';
// Resend에 도메인 인증을 마쳐야 이 주소로 실제 발송이 된다(SETUP-GUIDE.md 참고).
const FROM = `${SITE_TITLE} <news@hospital-ai-lab.com>`;

const BLOG_DIR = new URL('../src/content/blog/', import.meta.url);
const NOTIFIED_PATH = new URL('../src/data/notified-posts.json', import.meta.url);
const BATCH_SIZE = 100; // Resend 배치 발송 1회 최대 건수

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

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

async function loadPublishedPosts() {
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.md'));
  const posts = [];
  for (const file of files) {
    const raw = await readFile(new URL(file, BLOG_DIR), 'utf8');
    const fm = parseFrontmatter(raw);
    if (!fm || fm.draft === true) continue;
    posts.push({ slug: file.replace(/\.md$/, ''), title: fm.title, description: fm.description || '' });
  }
  return posts;
}

async function loadNotifiedSlugs() {
  try {
    const arr = JSON.parse(await readFile(NOTIFIED_PATH, 'utf8'));
    if (!Array.isArray(arr)) throw new Error('notified-posts.json이 배열이 아닙니다');
    return new Set(arr);
  } catch (e) {
    if (e.code === 'ENOENT') return new Set();
    console.error(`notified-posts.json 읽기/파싱 실패 — 기존 기록 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

async function fetchSubscribers() {
  const url =
    `${SUPABASE_URL}/rest/v1/profiles` +
    `?select=email,email_unsub_token&email_notify_new_post=eq.true&consent_required_at=not.is.null`;
  const res = await fetch(url, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase 구독자 조회 실패: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

function emailHtml(post, unsubToken) {
  const link = `${SITE_URL}/blog/${post.slug}/`;
  const unsubLink = `${SITE_URL}/unsubscribe/?token=${unsubToken}`;
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <p style="font-size: 13px; color: #888;">${SITE_TITLE} 새 글 알림</p>
      <h2 style="font-size: 20px; line-height: 1.4;">${escapeHtml(post.title)}</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #444;">${escapeHtml(post.description)}</p>
      <p><a href="${link}" style="display:inline-block; margin-top:8px; padding:10px 18px; background:#1a56db; color:#fff; text-decoration:none; border-radius:8px;">이어 읽기</a></p>
      <hr style="margin:32px 0; border:none; border-top:1px solid #eee;" />
      <p style="font-size: 12px; color: #999; line-height: 1.6;">${escapeHtml(DISCLAIMER)}</p>
      <p style="font-size: 12px; color: #999;"><a href="${unsubLink}" style="color:#999;">이메일 수신거부</a></p>
    </div>`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 배치 요청 자체(인증·도메인 등)가 실패하면 예외를 던진다 — 이 글은 "발송
// 시도"로 기록하지 않고 다음 실행에서 재시도한다. 개별 수신자 실패(잘못된
// 주소 등)는 예외로 취급하지 않고 로그만 남긴다.
async function sendBatch(items) {
  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend 발송 요청 실패: HTTP ${res.status} ${body}`);
  try {
    const parsed = JSON.parse(body);
    const failed = (parsed.data || []).filter((d) => d?.error);
    if (failed.length) console.error(`  일부 수신자 발송 실패(${failed.length}건):`, JSON.stringify(failed));
  } catch {
    // 응답 형식이 달라도 여기서는 요청 자체 성공 여부만 중요하므로 무시
  }
}

async function main() {
  if (!SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY 또는 RESEND_API_KEY 환경변수가 없습니다. 발송을 건너뜁니다.');
    process.exit(1);
  }

  const [published, notified] = [await loadPublishedPosts(), await loadNotifiedSlugs()];
  const fresh = published.filter((p) => !notified.has(p.slug));

  if (fresh.length === 0) {
    console.log('새로 발행된 글이 없습니다. 알림을 보내지 않습니다.');
    return;
  }

  const subscribers = await fetchSubscribers();
  console.log(`새 글 ${fresh.length}건, 구독자 ${subscribers.length}명.`);

  const sentSlugs = [];
  for (const post of fresh) {
    if (subscribers.length === 0) {
      console.log(`- ${post.slug}: 구독자가 없어 발송을 건너뛰고 발송완료로 기록합니다.`);
      sentSlugs.push(post.slug);
      continue;
    }
    try {
      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const chunk = subscribers.slice(i, i + BATCH_SIZE);
        const items = chunk.map((s) => ({
          from: FROM,
          to: [s.email],
          subject: `[${SITE_TITLE}] ${post.title}`,
          html: emailHtml(post, s.email_unsub_token),
        }));
        await sendBatch(items);
        if (i + BATCH_SIZE < subscribers.length) await sleep(500);
      }
      console.log(`- ${post.slug}: ${subscribers.length}명에게 발송 요청 완료.`);
      sentSlugs.push(post.slug);
    } catch (e) {
      console.error(`- ${post.slug}: 발송 실패, 이 글은 다음 실행에서 재시도합니다. (${e.message})`);
    }
  }

  if (sentSlugs.length === 0) return; // 전부 실패 — 파일 변경 없음(재시도 유지)

  const updated = [...notified, ...sentSlugs];
  await writeFile(NOTIFIED_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  console.log(`notified-posts.json 갱신 완료 (${sentSlugs.length}건 추가).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
