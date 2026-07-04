---
title: "(템플릿) 새 글은 이 파일을 복사해서 시작하세요"
description: "새 글 작성용 템플릿입니다. draft: true 상태이므로 사이트에는 표시되지 않습니다."
pubDate: 2026-07-05
category: "칼럼"
draft: true
---

이 파일은 새 글을 쓸 때 복사해서 쓰는 템플릿입니다. `draft: true`인 글은 블로그 목록·RSS·사이트맵 어디에도 나타나지 않습니다.

## 새 글 쓰는 법

1. 이 파일을 복사해 `src/content/blog/` 아래에 새 이름으로 저장합니다. 파일 이름이 곧 글 주소(URL)가 되므로 영문 소문자와 하이픈을 권장합니다. 예: `ai-tools-for-planners.md`
2. 맨 위 frontmatter를 채웁니다.
   - `title`: 글 제목
   - `description`: 목록과 검색 결과에 보이는 한두 문장 요약
   - `pubDate`: 발행일 (예: 2026-07-15)
   - `category`: `논문리뷰`, `AI도구`, `칼럼`, `소식` 중 하나
   - `draft`: 작성 중에는 `true`, 발행할 때 `false`로 변경
3. 본문은 이 문단처럼 마크다운으로 자유롭게 작성합니다.

발행 준비가 되면 `draft: false`로 바꾸고 GitHub에 push하면 자동으로 배포됩니다.
