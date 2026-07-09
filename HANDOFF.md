# 인수인계 가이드 (HANDOFF)

다른 컴퓨터 · 다른 Claude 세션에서 이 프로젝트를 이어서 작업할 때 읽는 문서입니다.
(사이트 운영 규칙은 [CLAUDE.md](CLAUDE.md), 사실의 원천은 [briefing.md](briefing.md), 회원 기능 개통은 [supabase/SETUP-GUIDE.md](supabase/SETUP-GUIDE.md) 참조)

**마지막 갱신: 2026-07-08.** 이 날짜 이후 코드가 바뀌었다면 이 문서보다 실제 코드가 우선입니다.

## 0. 새 컴퓨터로 옮길 때 — 무엇이 자동으로 따라오고, 무엇이 안 따라오는가

| 항목 | 새 컴퓨터로 자동 이전됨? | 비고 |
| --- | --- | --- |
| 사이트 코드 전체, 이 문서, CLAUDE.md, briefing.md | ✅ (git clone) | GitHub에 있음 |
| GitHub Actions 자동화(뉴스·영상 수집, 배포) | ✅ | GitHub 클라우드에서 실행, 컴퓨터와 무관 |
| Supabase(회원·DB·Storage·GitHub 토큰 저장) | ✅ | 클라우드 서비스, 컴퓨터와 무관. 로그인만 다시 하면 됨 |
| **예약 블로그 자동 작성(daily-blog-post)** | ❌ | Claude 앱의 로컬 예약 작업이라 **이 컴퓨터에서만** 실행됨. 새 컴퓨터에서 §4-2 참고해 다시 만들어야 함 |
| **Claude의 프로젝트 기억(memory, 이 대화의 교훈들)** | ❌ | `C:\Users\a\.claude\projects\...\memory\`에 로컬 저장. 아래 §6에 핵심만 옮겨 적어 둠 |
| `gh` CLI 로그인, `.claude/run-npm.cmd` | ❌ | 컴퓨터별 로컬 설정(gitignore됨). §2 참고해 새로 설정 |

**결론**: 코드와 클라우드 서비스는 그대로 이어지지만, **예약 블로그 자동 작성만은 반드시 새 컴퓨터에서 다시 설정**해야 계속 매일 발행됩니다. 이 문서(HANDOFF.md)를 새 Claude 세션에게 보여주면 나머지는 대부분 알아서 파악합니다.

## 1. 이 프로젝트가 무엇인가

- 사이트: **병원 AI 연구소** — https://hospital-ai-lab.com
- 목적: 병원 행정·간호 등 병원 종사자를 위한 의료 AI 콘텐츠(임상의 전용 관점 아님)
- 오너: 비개발자, 종합병원 17년 근무(그중 기획 7년) 실무자. 바이브코딩으로 운영
- 스택: **Astro 5**(정적 사이트) + **GitHub Pages**(호스팅) + **GitHub Actions**(자동 배포·수집) + **Supabase**(회원/인증/DB/Storage) + **GoatCounter**(방문자 통계)
- 저장소: https://github.com/BuminAI/hospital-ai-lab (public)

## 2. 다른 컴퓨터에서 이어가는 법

```bash
git clone https://github.com/BuminAI/hospital-ai-lab.git
cd hospital-ai-lab
npm install
npm run dev      # 개발 서버(http://localhost:4321)
npm run build    # 배포본 생성(dist/)
```

- Node 18.17+ 필요. Windows에서 node가 PATH에 없으면 아래 내용으로 `.claude/run-npm.cmd`를 새로 만드세요(gitignore 대상이라 git에는 없음):

  ```bat
  @echo off
  cd /d "%~dp0.."
  set "PATH=C:\Program Files\nodejs;%PATH%"
  if exist "C:\Program Files\nodejs\node.exe" (
    "C:\Program Files\nodejs\node.exe" "node_modules\astro\astro.js" %*
  ) else (
    node "node_modules\astro\astro.js" %*
  )
  ```
  사용법: `./.claude/run-npm.cmd build` (`run` 없이 바로 astro 하위 명령을 붙임)

- `gh` CLI(GitHub 작업용)가 새 컴퓨터에 없다면 `gh auth login`으로 로그인.
- `main`에 push하면 `.github/workflows/deploy.yml`이 자동 빌드·배포한다.
- 새 글/영상/뉴스/회원 관리는 관리자 페이지(`/admin/`)에서 이메일+비밀번호 로그인 한 번으로 전부 처리(§3 참고). 저장소를 직접 수정해도 됨.

## 3. 관리자 로그인 (2026-07-08부터 통합됨)

- 관리자 페이지(`/admin/`)는 이제 **이메일 + 비밀번호 로그인 하나**로 전체가 열립니다(예전엔 GitHub 토큰과 Supabase 로그인이 따로였음).
- 로그인 계정: `choyj80@naver.com` (오너 실제 이메일 — `src/utils/site.ts`의 `ADMIN_EMAIL`과 일치해야 함)
- GitHub 토큰은 브라우저가 아니라 **Supabase의 `admin_secrets` 테이블**(RLS로 관리자만 읽기·쓰기)에 저장됩니다. 로그인하면 자동으로 불러와 적용되므로, 어느 컴퓨터에서 로그인하든 토큰을 다시 붙여넣을 필요가 없습니다.
- 토큰이 아직 한 번도 저장된 적 없다면(신규 Supabase거나 삭제한 경우) 로그인 후 "🔑 GitHub 연동" 패널에서 한 번만 붙여넣어 저장하면 됩니다.

## 4. 자동화

### 4-1. GitHub Actions (클라우드 — 컴퓨터와 무관하게 항상 동작)

| 워크플로 | 스케줄(UTC→KST) | 하는 일 |
| --- | --- | --- |
| `deploy.yml` | main push 시 | Astro 빌드 → GitHub Pages 배포 |
| `update-news.yml` | 1시간 간격(`17 * * * *`) | 메디칼타임즈 '의료기기·AI' 지면 크롤링 → `src/data/news.json`에 신규 기사만 누적. 변경 없으면 커밋·배포 생략 |
| `update-videos.yml` | 월·수·금 KST 09:07 + 예비 12:07/15:07/18:07/21:07 | 유튜브에서 클로드·병원·의료 AI 입문 영상 최대 3개 신규 추가 → `src/data/recommended-videos.json`. 기존 항목(수동·자동·직접 제작 전부)은 절대 안 지움. 같은 주기 중복 방지: 최근 24시간 내 auto 추가 있으면 건너뜀. 수동 즉시 갱신은 `gh workflow run update-videos.yml -f force=true` |

- 수집 스크립트: `scripts/fetch-news.mjs`, `scripts/fetch-videos.mjs`
- GitHub cron은 예약을 자주 지연·누락시킴(실측: 3시간 간격 예약이 하루 2~3회만 실행, 최대 13시간 공백) → 그래서 예약을 촘촘히 걸고 "새 기사 있을 때만" 커밋하는 방식으로 설계됨 (2026-07-09 조정).
- 두 워크플로 모두 `deploy.yml`과 배포 대기열을 공유하지 않도록(오너 직접 push 배포가 취소당하지 않게) 각자 별도 concurrency 그룹 사용 + 완료 후 `gh workflow run deploy.yml`로 배포를 위임함.

### 4-2. 매일 블로그 자동 작성 (⚠️ 로컬 — 새 컴퓨터에서 반드시 재설정)

- **이건 GitHub Actions가 아니라 Claude 앱의 예약 작업(scheduled task)**입니다. 매일 KST 22:00경 이 컴퓨터의 Claude 앱이 열려 있을 때 실행되어, 주제 선정 → 작성 → 출처 검증 → 발행까지 자동으로 합니다.
- 저장 위치: `C:\Users\a\.claude\scheduled-tasks\daily-blog-post\SKILL.md` (로컬 파일 — git에 없고 새 컴퓨터에 자동으로 안 생김)
- **오너 지시(2026-07-08)**: 이 자동 글은 사실 검증(모든 주장에 객관적 출처, 확인 안 되면 무발행)을 통과하면 **오너 승인 없이 바로 발행**한다. 이 예외는 CLAUDE.md의 "작업 규칙"에도 명시되어 있음.
- **무인 실행이 멈추지 않게 하는 핵심 장치(2026-07-09, 오너 승인)**: 예약 세션이 쓰는 도구(WebFetch·WebSearch·git·gh·빌드·블로그 폴더 쓰기)를 `.claude/settings.json`(git에 커밋됨)에 사전 허용해 뒀다. 이게 없으면 무인 세션이 승인 창에 걸려 영영 멈춘다 — 실제로 2026-07-09 실행이 출처 확인(WebFetch) 승인 대기에 걸려 멈춘 것을 확인하고 넣은 조치다. 예약 작업에 새 도구를 쓰게 하려면 이 허용 목록도 함께 갱신할 것.
- 실행이 끝날 때마다 알림이 오도록 설정되어 있다(notifyOnCompletion). 알림이 안 오면 그 날 실행이 안 된 것.
- 같은 날짜 글이 이미 있으면 중복 발행하지 않고 건너뛴다(작업 프롬프트에 명시).
- **새 컴퓨터에서 이어가려면**: 새 Claude 세션에게 "매일 오후 10시에 병원 AI 연구소 블로그 글 1개를 주제 선정부터 작성·검증·발행까지 자동으로 수행하는 예약 작업을 다시 만들어줘. CLAUDE.md와 이 HANDOFF.md를 참고해서"라고 요청하면 된다. (schedule 스킬로 재생성. 도구 허용 목록은 저장소에 있어 자동으로 적용됨)
- 앱이 꺼져 있으면 그 날은 건너뛰지 않고 다음에 앱을 열 때 실행됨(하루 밀릴 수 있음). 밤 10시에 컴퓨터와 Claude 앱이 켜져 있어야 정시에 발행된다.

### 4-3. 매일 사이트 자가 점검 (⚠️ 로컬 — 새 컴퓨터에서 재설정 필요)

- **매일 오전 9시경** 실행되는 Claude 예약 작업(`site-health-check`). **보고 전용**(수리 안 함, 오너 지시 2026-07-10) — 주요 페이지 접속, 뉴스·영상·블로그 자동화 신선도, GitHub Actions 실패, Supabase 서버 상태(마이그레이션 누락 감지 포함), 최근 글 출처 링크 생존을 점검하고 결과를 보고한다.
- **보고 전달(오너 지시 2026-07-10)**: 이메일(choyj80@naver.com, 네이버 SMTP 자기 발송) + 앱 알림. 발송 스크립트와 자격 증명은 `C:\Users\a\.claude\scheduled-tasks\site-health-check\` 폴더의 `send-report.ps1` / `naver-smtp.xml`(Windows DPAPI 암호화, 이 컴퓨터·이 Windows 계정 전용). 새 컴퓨터에서는 자격 증명을 다시 만들어야 이메일이 나간다(네이버 앱 비밀번호 재입력).
- 저장 위치: `C:\Users\a\.claude\scheduled-tasks\site-health-check\SKILL.md` (로컬 파일 — git에 없음)
- 새 컴퓨터에서는 새 Claude 세션에게 "HANDOFF.md 4-3 참고해서 매일 아침 사이트 자가 점검(보고 전용) 예약 작업을 다시 만들어줘"라고 요청하면 된다.

## 5. 외부 서비스 · 크리덴셜 위치

| 서비스 | 용도 | 크리덴셜 / 설정 위치 |
| --- | --- | --- |
| GitHub | 저장소·호스팅·자동화 | 계정: BuminAI. 관리자 페이지의 GitHub 토큰은 이제 Supabase `admin_secrets`에 저장(§3) |
| 도메인(가비아) | hospital-ai-lab.com | A레코드 4개(185.199.108~111.153) + www CNAME. `astro.config.mjs`의 `CUSTOM_DOMAIN` |
| Supabase | 회원·인증·DB·Storage·GitHub 토큰 보관 | `src/utils/site.ts`의 `SUPABASE_URL`·`SUPABASE_ANON_KEY`(anon 키는 공개용, RLS로 보호). **service_role 키는 절대 코드에 넣지 말 것** |
| GoatCounter | 방문자 통계 | `src/utils/site.ts`의 `GOATCOUNTER_CODE = 'hospital-ai-lab'` |
| 네이버/구글 | 검색 등록 | `src/utils/site.ts`의 `NAVER_SITE_VERIFICATION`·`GOOGLE_SITE_VERIFICATION` |

### Supabase 마이그레이션 체크리스트

`setup.sql`을 처음부터 새로 실행한다면 아래 전부 포함되어 있어 신경 쓸 필요 없음. **기존 Supabase 프로젝트를 계속 쓰는 경우** 아래 마이그레이션들이 실제로 실행됐는지 불확실하면 다시 실행해도 안전함(대부분 `create or replace`/`if not exists` 사용):

- `migrate-oauth.sql` — 구글 로그인 대응
- `migrate-org-email.sql` — 소속 기관 이메일(선택 항목)
- `migrate-ai-apps.sql` — "AI로 만든 앱" 회원 전용 Storage 버킷·테이블
- `migrate-admin-delete-member.sql` — 관리자의 회원 완전삭제 RPC
- `migrate-admin-github-token.sql` — 관리자 로그인 통합용 `admin_secrets` 테이블

## 6. 이 프로젝트에서 배운 것들 (반복하지 않으려고 적어 둠)

- **Node가 PATH에 없을 수 있다**: `.claude/run-npm.cmd` 래퍼로 절대경로 실행(§2).
- **PowerShell 5.1 큰따옴표 버그**: git commit 메시지에 큰따옴표를 넣으면 인자가 깨져 커밋이 실패한다. 커밋 메시지에 큰따옴표를 쓰지 말 것(작은따옴표나 낫표 「」 사용).
- **GitHub Pages 배포가 가끔 실패한다**: "Deployment failed, try again later"가 간헐적으로 뜬다. 같은 run을 반복 rerun하기보다 `gh workflow run deploy.yml`로 새로 실행하는 편이 더 잘 통한다.
- **preview_screenshot 툴이 자주 타임아웃난다**: 사이트 문제가 아니라 툴 자체 문제. `preview_eval`(getComputedStyle 등)·`preview_snapshot`·`preview_inspect`로 대체 검증할 것.
- **무인 예약 세션은 승인 창에 걸리면 영영 멈춘다**: 예약 작업이 "실행됐다"고 기록되는데 결과물이 없으면 십중팔구 도구 승인 대기다. 해결은 `.claude/settings.json`의 permissions.allow에 그 도구를 사전 등록하는 것(§4-2 참조).
- **GitHub 예약(cron)은 크게 못 믿는다**: 예약 횟수의 상당 부분이 실행되지 않거나 9~13시간 늦게 돈다. 특정 시각 보장이 필요하면 예약을 촘촘히 여러 개 걸고 스크립트를 멱등(변경 없으면 아무것도 안 함)하게 만들 것.
- **Astro 스코프드 스타일은 `innerHTML`로 넣은 요소에 안 먹는다**: admin.astro처럼 목록을 JS로 그리는 페이지는 `<style is:global>`을 써야 한다(안 그러면 `.btn.ghost` 같은 규칙이 무시되고 전역 기본 스타일로 떨어진다).
- **Astro 컴포넌트의 `<details>`로 "데스크톱은 항상 펼침" 흉내내지 말 것**: 최신 Chrome이 닫힌 `<details>`의 자식(요약 제외)을 `content-visibility`로 강제 숨겨 CSS `display:block`으로도 못 되돌린다. 토글이 필요하면 버튼+JS로 만들 것.
- **정적 사이트에는 진짜 파일 접근 제어가 없다**: `public/`에 넣은 건 전부 공개된다. "로그인한 사람만 다운로드"가 필요하면 Supabase Storage의 비공개 버킷 + RLS를 써야 한다(AI로 만든 앱 기능이 이 패턴).
- **비밀값(GitHub 토큰 등)을 사이트 코드나 localStorage에 하드코딩하지 말 것**: 정적 사이트는 방문자 전원에게 코드가 공개된다. 서버(Supabase) + RLS만이 실제 방어선이다.

## 7. 주요 파일 지도

```
src/
├── pages/
│   ├── index.astro, about.astro, contact.astro, privacy.astro
│   ├── blog/index.astro, blog/[id].astro
│   ├── news.astro          # AI 뉴스 (메디칼타임즈 자동 수집)
│   ├── youtube.astro       # 추천 영상 + 연구소장 직접 제작 영상
│   ├── notes.astro         # 강의노트 (회원 전용, Supabase)
│   ├── ai-apps.astro       # AI로 만든 앱 (회원 전용, Supabase Storage)
│   ├── glossary.astro, faq.astro, checklist.astro, guide.astro   # 입문 가이드 4종
│   ├── login.astro / signup.astro   # 회원 기능(Supabase, 구글 OAuth 포함)
│   ├── admin.astro          # 관리자 대시보드 (이메일+비번 로그인 하나로 통합, §3)
│   ├── rss.xml.js, robots.txt.ts
├── content/blog/            # 블로그 글(마크다운) — _writing-template.md 참고
├── data/                    # research.ts, glossary.ts, faq.ts, checklist.ts, guide.ts,
│                             # news.json, recommended-videos.json
├── layouts/BaseLayout.astro # 헤더(모바일 메뉴 버튼)·푸터·다크모드·OG 이미지
├── components/              # PostCard, ResearchIcon
└── utils/site.ts            # 사이트 상수·크리덴셜(한 곳에서 관리)
.claude/agents/               # planner·writer·reviewer·builder·maintainer
.claude/skills/               # new-post·maintenance·update-page
.claude/scheduled-tasks/daily-blog-post/   # 로컬 전용, §4-2 참고
supabase/                    # setup.sql + migrate-*.sql 5개 + SETUP-GUIDE.md
scripts/                     # fetch-news.mjs·fetch-videos.mjs·gen-assets.mjs
public/                      # favicon, og-default.png, fonts/(Pretendard 자체호스팅)
```

## 8. 현재 미완료 · 오너 확인 필요 (2026-07-08 기준)

- [ ] **강의노트 콘텐츠**: 실제로 몇 개 작성됐는지 관리자 페이지에서 확인 필요.
- [ ] **검색엔진 사이트맵 제출**: 네이버 서치어드바이저·구글 서치 콘솔에서 소유확인 후 `sitemap-index.xml` 제출 여부 확인.
- [ ] **관리자 비밀번호**: `whdudwns80*`로 변경 완료했는지, 위 5개 Supabase 마이그레이션을 전부 실행했는지 확인.
- [ ] (선택) 개인정보 처리방침 보호책임자 실명 기재 여부 검토.

## 9. 반드시 지키는 원칙

- **사실 검증 절대 원칙**: 모든 사실 주장에 객관적 출처. 할루시네이션 금지. 조금이라도 의심되면 싣지 않는다. (CLAUDE.md 참조)
- **누구나 이해하기 쉽게 쓴다**: 전문·통계 용어는 풀어서 설명. 블로그·소개 등 모든 글에 공통 적용.
- 저자 관련 사실은 briefing.md에 있는 것만. 통계학 석사·경제학 박사·SAS 수상 이력은 오너 지시로 비공개(briefing.md에 사유 기록됨).
- 새 글은 draft로 시작 → 브랜치 + PR → 오너 머지가 기본. 단, 예약 자동 발행 글은 사실 검증 통과 시 예외적으로 바로 발행(§4-2). 커밋 메시지는 한국어, 큰따옴표 금지(§6).
