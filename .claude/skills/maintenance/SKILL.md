---
name: maintenance
description: 월간 정기 점검 표준 절차. "월간 점검" 요청 시 사용.
disable-model-invocation: true
---

maintainer 서브에이전트로 수행:

1. npm run build 성공 확인
2. 최근 배포 상태 확인 (gh run list)
3. 사이트 내 링크 깨짐 검사
4. npm outdated / npm audit 확인 → 보안 패치만 적용 후 재빌드
5. reports/YYYY-MM.md 보고서 작성·커밋
6. [오너 확인 필요] 항목만 추려 마지막에 요약 보고
