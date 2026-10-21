// PreToolUse 훅: 블로그 글 폴더에 새 글 파일을 만드는 Write를 사람 승인 없이 허용한다 (2026-10-21, 오너 승인).
//
// 왜 필요한가
//   .claude/settings.json 에는 `Write(src/content/blog*/**)` 허용 규칙이 있지만, 공식 문서에 따르면
//   파일 권한 검사는 `Edit(...)`·`Read(...)` 규칙만 참조하고 `Write(...)` 경로 규칙은 받아들이기만 할 뿐
//   쓰지 않는다. 그래서 정기 작업(daily-update-digest)이 그날의 새 글 파일을 처음 만드는 Write마다
//   앱의 승인 창이 떴고(앱 로그: 2026-08-26, 08-29, 09-04, 09-13, 09-16, 10-12, 10-21 …), 사람이 눌러
//   주지 않으면 그 자리에서 영영 멈췄다. 이 훅이 같은 범위(글 폴더)를 실제로 허용한다.
//
// 허용하는 것 (전부 만족해야 한다)
//   - 프로젝트 안 `src/content/blog/`, `blog-ru/`, `blog-ja/`, `blog-id/`, `blog-tw/` 바로 아래
//   - 파일 이름이 `YYYY-MM-DD-영문슬러그.md` 형식 (CLAUDE.md의 글 파일명 규칙)
//   - 경로에 `..`가 없음
// 그 밖의 경로는 아무 말도 하지 않는다 → 기존 승인 절차 그대로(다른 파일은 여전히 승인이 필요하다).
//
// 되돌리려면: .claude/settings.json 의 hooks 에서 "Write" 항목을 지우면 된다.
let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    const filePath = JSON.parse(input).tool_input.file_path;
    if (typeof filePath !== 'string' || filePath.includes('\0')) return;
    const norm = (p) => p.replace(/\\/g, '/').replace(/\/+/g, '/').toLowerCase();
    const root = norm(process.env.CLAUDE_PROJECT_DIR || process.cwd()).replace(/\/$/, '');
    const target = norm(filePath);
    if (target.split('/').includes('..')) return;
    const dirs = ['blog', 'blog-ru', 'blog-ja', 'blog-id', 'blog-tw'];
    const ok = dirs.some((d) => {
      const prefix = `${root}/src/content/${d}/`;
      if (!target.startsWith(prefix)) return false;
      const rest = target.slice(prefix.length);
      return /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/.test(rest);
    });
    if (!ok) return;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'allow',
          permissionDecisionReason:
            'New post file under src/content/blog*/ auto-approved (owner-approved 2026-10-21)',
        },
      })
    );
  } catch {
    // 판단하지 않는다 — 기존 승인 절차로 돌아간다
  }
});
