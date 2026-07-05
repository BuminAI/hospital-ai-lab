---
name: update-page
description: 소개·연구 등 고정 페이지 갱신 절차 (약력 추가, 프로젝트 추가 등).
disable-model-invocation: true
---

1. 오너가 알려준 변경 내용만 반영한다. 사실 정보를 임의로 보완하지 않는다
2. builder 서브에이전트로 해당 페이지 수정
3. briefing.md에도 같은 내용을 반영해 진실의 원천을 최신으로 유지
4. npm run build 확인 후 커밋·푸시 (CLAUDE.md 작업 규칙에 따라 main 직접 가능)
