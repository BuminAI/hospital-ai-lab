---
name: new-post
description: 새 블로그 글을 기획→집필→검수→PR까지 진행하는 표준 절차. 새 글 요청 시 사용.
disable-model-invocation: true
---

주제: $ARGUMENTS (비어 있으면 planner가 후보를 제안하고 오너에게 선택을 요청)

1. planner 서브에이전트: 주제 확정 + 개요 작성
2. writer 서브에이전트: draft: true 초안 작성
3. reviewer 서브에이전트: 검수·수정. [오너 확인 필요]가 있으면 여기서 멈추고 보고
4. npm run build 성공 확인
5. 브랜치 post/YYYY-MM-DD-슬러그 에 커밋 → gh pr create (PR 제목 "글: 제목", 본문에 3줄 요약과 검수 결과)
6. 오너에게 보고: 제목, 3줄 요약, PR 링크, "머지하면 발행됩니다"
