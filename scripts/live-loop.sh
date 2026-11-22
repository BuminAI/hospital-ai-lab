#!/usr/bin/env bash
# 공공 포털 실시간 자료 반복 수집기(live-loop.yml 이 호출). 15분마다 응급실, 30분마다 병상가동현황을 받아 각 브랜치에 올린다.
# 한 번의 수집·게시가 실패해도 루프는 계속한다(다음 차례에 다시 시도).
set -u
T="${RUNNER_TEMP:-/tmp}"
INTERVAL=900
RUN_SECONDS=$((5 * 3600 + 40 * 60))
START=$(date +%s)
n=0

publish() { # <브랜치> <파일> <커밋 메시지>
  local branch="$1" file="$2" msg="$3" d i
  d="$T/pub-$branch"
  rm -rf "$d" && mkdir -p "$d" && cp "$file" "$d/" || return 1
  (
    cd "$d" || exit 1
    git init -q -b "$branch"
    git config user.name "github-actions[bot]"
    git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
    git add "$(basename "$file")"
    git commit -q -m "$msg"
    for i in 1 2 3; do
      if git push -q --force "https://x-access-token:${GH_TOKEN}@github.com/${REPO}.git" "$branch"; then exit 0; fi
      echo "푸시 실패($i/3) — $branch"; sleep $((i * 10))
    done
    exit 1
  )
}

# 1시간(4회차)마다: 규모·인력·비급여 진료비가 다 채워질 때까지 다음 수집을 깨우고, 다 채워지면 이슈로 알린다(2026-11-22, 오너 지시).
DONE_TITLE="공공 포털 전체 자료 수집 완료"
last_run_age_h() { # <워크플로 파일> → 가장 최근 실행이 몇 시간 전인지(없으면 999), 진행 중·대기 중이면 0
  local f="$1" busy ts
  busy=$(gh run list --repo "$REPO" --workflow "$f" --status in_progress --json databaseId -q length 2>/dev/null || echo 0)
  busy=$((busy + $(gh run list --repo "$REPO" --workflow "$f" --status queued --json databaseId -q length 2>/dev/null || echo 0)))
  if [ "$busy" -gt 0 ]; then echo 0; return; fi
  ts=$(gh run list --repo "$REPO" --workflow "$f" --limit 1 --json createdAt -q '.[0].createdAt' 2>/dev/null)
  if [ -z "$ts" ]; then echo 999; else echo $(( ($(date +%s) - $(date -d "$ts" +%s)) / 3600 )); fi
}
progress_check() {
  local j done_flag hc hu nc lastday today
  j=$(node scripts/portal-progress.mjs 2>/dev/null) || { echo "진행 점검 실패"; return; }
  echo "진행: $j"
  done_flag=$(node -e "const j=JSON.parse(process.argv[1]);console.log(j.done?'1':'0')" "$j")
  if [ "$done_flag" = "1" ]; then
    if [ "$(gh issue list --repo "$REPO" --state all --search "\"$DONE_TITLE\" in:title" --json number -q length 2>/dev/null || echo 0)" = "0" ]; then
      gh issue create --repo "$REPO" --title "$DONE_TITLE" --body "@BuminAI 공공 포털의 규모·인력 비교와 비급여 진료비 자료 수집이 모두 끝났습니다. 응급실·병상가동현황은 계속 실시간으로 갱신되고, 선별급여는 고시 스냅샷입니다. 진행 내용: \`$j\`" >/dev/null 2>&1 && echo "완료 이슈 생성" || echo "완료 이슈 생성 실패"
    fi
    return
  fi
  # 규모·인력: 공공데이터포털 호출 한도가 한국시간 자정에 새로 시작하므로, 마지막 수집이 오늘(한국시간)이 아니고 00:30 이후면 오늘치를 받는다.
  hc=$(node -e "const j=JSON.parse(process.argv[1]);console.log(j.hospitals.complete?'1':'0')" "$j")
  hu=$(node -e "const j=JSON.parse(process.argv[1]);console.log(j.hospitals.updatedAt||'')" "$j")
  if [ "$hc" = "0" ]; then
    today=$(TZ=Asia/Seoul date +%F); lastday=""
    [ -n "$hu" ] && lastday=$(TZ=Asia/Seoul date -d "$hu" +%F)
    if [ "$lastday" != "$today" ] && [ "$(TZ=Asia/Seoul date +%H%M)" -ge 0030 ] && [ "$(last_run_age_h update-hospitals.yml)" -ge 1 ]; then
      gh workflow run update-hospitals.yml --repo "$REPO" && echo "규모·인력 수집 실행"
    fi
  fi
  # 비급여: 심평원 서버 지연으로 자료가 없거나 일부 쪽이 빠졌으면 3시간 간격으로 다시 받는다.
  nc=$(node -e "const j=JSON.parse(process.argv[1]);console.log(j.npay.complete?'1':'0')" "$j")
  if [ "$nc" = "0" ] && [ "$(last_run_age_h update-npay.yml)" -ge 3 ]; then
    gh workflow run update-npay.yml --repo "$REPO" -f force=true && echo "비급여 수집 실행"
  fi
}

while true; do
  tick=$(date +%s)
  echo "=== $(date -u +%FT%TZ) 회차 $n ==="
  if node scripts/fetch-er.mjs "$T/er.json"; then publish portal-data "$T/er.json" "응급실 사용현황 자동 갱신" || echo "응급실 게시 실패"; else echo "응급실 수집 실패(이전 자료 유지)"; fi
  if [ $((n % 2)) -eq 0 ] && [ -n "${DATA_GO_KR_KEY:-}" ]; then
    if node scripts/fetch-beds.mjs "$T/beds.json"; then publish portal-beds "$T/beds.json" "병상가동현황 자동 갱신" || echo "병상 게시 실패"; else echo "병상 수집 실패(이전 자료 유지)"; fi
  fi
  if [ $((n % 4)) -eq 0 ]; then progress_check || true; fi
  n=$((n + 1))
  now=$(date +%s)
  if [ $((now + INTERVAL)) -ge $((START + RUN_SECONDS)) ]; then break; fi
  wait_s=$((tick + INTERVAL - now))
  [ "$wait_s" -gt 0 ] && sleep "$wait_s"
done
echo "반복 종료 — 다음 실행으로 이어 갑니다."
