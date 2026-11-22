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

while true; do
  tick=$(date +%s)
  echo "=== $(date -u +%FT%TZ) 회차 $n ==="
  if node scripts/fetch-er.mjs "$T/er.json"; then publish portal-data "$T/er.json" "응급실 사용현황 자동 갱신" || echo "응급실 게시 실패"; else echo "응급실 수집 실패(이전 자료 유지)"; fi
  if [ $((n % 2)) -eq 0 ] && [ -n "${DATA_GO_KR_KEY:-}" ]; then
    if node scripts/fetch-beds.mjs "$T/beds.json"; then publish portal-beds "$T/beds.json" "병상가동현황 자동 갱신" || echo "병상 게시 실패"; else echo "병상 수집 실패(이전 자료 유지)"; fi
  fi
  n=$((n + 1))
  now=$(date +%s)
  if [ $((now + INTERVAL)) -ge $((START + RUN_SECONDS)) ]; then break; fi
  wait_s=$((tick + INTERVAL - now))
  [ "$wait_s" -gt 0 ] && sleep "$wait_s"
done
echo "반복 종료 — 다음 실행으로 이어 갑니다."
