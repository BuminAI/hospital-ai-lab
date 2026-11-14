// PreToolUse 훅: 빌드·검수 래퍼 스크립트 호출만 사람 승인 없이 허용한다 (2026-11-14, 오너 승인).
//
// 왜 필요한가
//   .claude/settings.json 에 `Bash(./.claude/run-npm.cmd build*)`·`Bash(./.claude/run-audit.cmd*)` 허용 규칙이
//   있지만, 정기 작업(daily-update-digest)의 승인 층은 '저장된 승인'에 없는 명령을 자동 승인하지 않고
//   승인 창을 띄운 채 영영 기다린다. 2026-11-14 실행이 `run-audit.cmd 2>&1 | tail -6`에서 50분간 멈췄다.
//   (자세한 배경은 allow-content-write.cjs 머리말 참고.)
//
// 허용하는 것 (명령 전체가 아래 형태와 정확히 일치할 때만)
//   ./.claude/run-npm.cmd build            [ 2>&1 ] [ | tail -N ]
//   ./.claude/run-audit.cmd                [ 2>&1 ] [ | tail -N ]
//   - 출력 줄이기(`2>&1`, `| tail -N`)만 덧붙일 수 있다.
//   - `&&`, `;`, `|`(tail 외), 백틱, `$(`, 리다이렉트(`>`), 줄바꿈이 있으면 허용하지 않는다.
// 그 밖의 명령은 아무 말도 하지 않는다 → 기존 승인 절차 그대로.
//
// 되돌리려면: .claude/settings.json 의 hooks 에서 "Bash" 항목을 지운다.
let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    const cmd = JSON.parse(input).tool_input.command;
    if (typeof cmd !== 'string') return;
    const ok = /^\.\/\.claude\/(run-npm\.cmd build|run-audit\.cmd)(?: 2>&1)?(?: \| tail -\d{1,3})?$/.test(cmd.trim());
    if (!ok) return;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'allow',
          permissionDecisionReason: 'Build/audit wrapper auto-approved (owner-approved 2026-11-14)',
        },
      })
    );
  } catch {
    // 판단하지 않는다 — 기존 승인 절차로 돌아간다
  }
});
