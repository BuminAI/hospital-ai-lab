# 인수인계 가이드 (HANDOFF)

다른 컴퓨터 · 다른 Claude 세션에서 이 프로젝트를 이어서 작업할 때 읽는 문서입니다.
(사이트 운영 규칙은 [CLAUDE.md](CLAUDE.md), 사실의 원천은 [briefing.md](briefing.md), 회원 기능 개통은 [supabase/SETUP-GUIDE.md](supabase/SETUP-GUIDE.md) 참조)

**마지막 갱신: 2026-08-13.** 이 날짜 이후 코드가 바뀌었다면 이 문서보다 실제 코드가 우선입니다.

> **2026-07-16 이사 완료.** 새 컴퓨터(Windows 계정 `choyj`, 저장소 `D:\hospital-ai-lab`)로 옮겼다.
> 클론 · 의존성 · 빌드(39페이지 성공) · 예약 작업 2개 재생성까지 끝났고, 옛 컴퓨터의 예약 작업은 삭제했다.
> 이 문서의 로컬 경로는 전부 새 컴퓨터 기준으로 고쳐 뒀다(옛 경로는 `C:\Users\a\...`였음).
>
> `gh` CLI 설치(2.96.0) · `gh auth login`(BuminAI) · git identity 설정까지 끝냈고, push와 배포가 정상 동작하는 것을 확인했다.
> **네이버 SMTP도 앱 비밀번호를 새로 발급해 `naver-smtp.xml`을 재생성했고, 실제 발송까지 확인했다.** 즉 이사 관련 미결 항목은 없다.
>
> **이사하며 겪은 함정 4가지 (다음 이사 때 참고 — 전부 이 문서에 없던 것들이다)**
> - **git identity가 아예 없어 첫 커밋이 거부된다**(`Author identity unknown`). §0 표에 없던 항목이다. `git config --global user.name 'BuminAI'` / `user.email 'busanbuminfutures1004@gmail.com'`로 해결.
> - **이 컴퓨터에는 다른 GitHub 계정(`cyhodr-dotcom`)이 로그인돼 있었다.** 그 상태로는 push가 403(`Permission ... denied to cyhodr-dotcom`)으로 막힌다. gh는 **브라우저에 현재 로그인된 계정**을 그대로 가져가므로, 브라우저를 BuminAI로 바꾸는 것만으로는 부족하고 `gh auth logout` → `gh auth login`으로 저장된 토큰을 갈아끼워야 한다. (이 계정의 정체는 아직 확인되지 않음 — 오너 확인 필요, §8)
> - **`gh auth login`은 브라우저에서 "Congratulations"가 떠도 끝난 게 아니다.** 명령창이 그 승인을 받아 토큰을 저장해야 완료된다. 승인 후 명령창에 `✓ Logged in as ...`가 뜰 때까지 창을 닫지 말 것. `gh auth status`로 확인하는 게 확실하다.
> - **PowerShell 실행 정책 때문에 `.ps1`이 실행되지 않는다**(`PSSecurityException / UnauthorizedAccess`). 새 Windows의 기본값이라 `send-report.ps1`이 막힌다. `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`로 해결(2026-07-16 오너가 직접 적용). 이러면 자동화에 우회 옵션을 넣지 않아도 된다.
>
> **npm 참고**: 최신 npm은 설치 스크립트를 기본 차단해 `esbuild`·`sharp`에 경고가 뜨지만, 빌드에는 지장 없었다(승인 불필요).

> **2026-08-12 계정 이름 정정.** 이 문서 곳곳의 `choyj` 계정 경로가 실제 컴퓨터와 맞지 않는 것을 발견했다 — 지금 컴퓨터의 Windows 계정은 `a`다(`C:\Users\a\...`). 확인해 보니 `.claude/run-npm.cmd`·`launch.json`·예약 작업 2개(`daily-blog-post`·`site-health-check`)·`gh` 로그인(BuminAI)·네이버 SMTP 자격 증명까지 전부 이미 이 계정에서 정상 동작 중이었다. 즉 실제로 뭔가 고장 난 건 없고, 문서의 경로 표기만 실제와 다르게 남아 있던 것이라 `a`로 맞췄다. (계정이 언제·왜 바뀌었는지는 확인되지 않음 — 참고만 할 것)

## 0. 새 컴퓨터로 옮길 때 — 무엇이 자동으로 따라오고, 무엇이 안 따라오는가

| 항목 | 새 컴퓨터로 자동 이전됨? | 비고 |
| --- | --- | --- |
| 사이트 코드 전체, 이 문서, CLAUDE.md, briefing.md | ✅ (git clone) | GitHub에 있음 |
| `.claude/agents/`, `.claude/skills/`, `.claude/settings.json`(도구 사전 허용) | ✅ | git에 커밋됨 |
| GitHub Actions 자동화(뉴스·영상 수집, 배포) | ✅ | GitHub 클라우드에서 실행, 컴퓨터와 무관 |
| Supabase(회원·DB·Storage·GitHub 토큰 저장) | ✅ | 클라우드 서비스, 컴퓨터와 무관. 로그인만 다시 하면 됨 |
| **예약 작업 2개(daily-blog-post, site-health-check)** | ❌ | Claude 앱의 로컬 예약 작업이라 **이 컴퓨터에서만** 실행됨. 새 컴퓨터에서 §4-2·4-3 참고해 다시 만들어야 함 |
| **네이버 SMTP 자격 증명(`naver-smtp.xml`)** | ❌ **(복사해도 소용없음)** | Windows DPAPI로 암호화돼 **이 컴퓨터·이 Windows 계정에서만 복호화**된다. 새 컴퓨터에서 앱 비밀번호를 새로 발급받아 다시 만들어야 함(§4-3) |
| **Claude의 프로젝트 기억(memory, 이 대화의 교훈들)** | ❌ | `C:\Users\a\.claude\projects\...\memory\`에 로컬 저장. 아래 §6에 핵심만 옮겨 적어 둠 |
| **Claude Code 대화 기록** | ❌ | 로컬 저장. 새 컴퓨터에서는 새 세션으로 시작된다(이 문서를 보여주면 대부분 파악함) |
| `gh` CLI 로그인, `.claude/run-npm.cmd`, `.claude/launch.json`, `.claude/settings.local.json` | ❌ | 컴퓨터별 로컬 설정(gitignore됨). §2 참고해 새로 만들 것 |

**결론**: 코드와 클라우드 서비스는 그대로 이어진다. 새 컴퓨터에서 **반드시 다시 해야 하는 것은 예약 작업 2개 재생성과 네이버 SMTP 앱 비밀번호 재발급** 두 가지뿐이다.

### 0-1. 이동 순서 (이 순서대로 하면 됨)

1. **(옛 컴퓨터) 남은 작업을 push한다.** `git status`로 커밋 안 된 게 없는지 확인 → 있으면 커밋·push. 이게 안 되면 그 작업은 안 따라온다.
2. **(새 컴퓨터) Node.js 설치** — 18.17 이상. 기본 경로(`C:\Program Files\nodejs`)에 설치하면 §2의 래퍼가 그대로 동작한다.
3. **(새 컴퓨터) 저장소 복제 + 의존성 설치** — §2의 명령 4줄.
4. **(새 컴퓨터) `.claude/run-npm.cmd`와 `.claude/launch.json`을 새로 만든다** — §2에 내용 그대로 있음(git에 없는 파일이라 직접 만들어야 함).
5. **`npm run build`가 성공하는지 확인.** 여기까지 되면 사이트 작업은 바로 이어갈 수 있다.
6. **`gh auth login`으로 GitHub CLI 로그인** — 배포 상태 확인·워크플로 수동 실행에 필요.
7. **관리자 페이지(`/admin/`) 로그인 확인** — 이메일+비밀번호만 있으면 되고, GitHub 토큰은 Supabase에 저장돼 있어 자동으로 따라온다(§3).
8. **예약 작업 2개 재생성** — 새 Claude 세션에게 §4-2·§4-3의 요청 문구를 그대로 말하면 된다.
9. **네이버 SMTP 앱 비밀번호 재발급 후 자격 증명 재생성**(§4-3). 이걸 안 하면 매일 아침 점검 메일만 안 온다(점검 자체는 됨).
10. **(옛 컴퓨터) 정리** — 예약 작업 2개를 지운다. 안 지우면 두 컴퓨터가 같은 글을 중복 발행하려 할 수 있다.

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

- **`.claude/launch.json`도 gitignore 대상**이라 새로 만들어야 한다(Claude가 미리보기 서버를 띄울 때 씀):

  ```json
  {
    "version": "0.0.1",
    "configurations": [
      {
        "name": "preview",
        "runtimeExecutable": "D:\\hospital-ai-lab\\.claude\\run-npm.cmd",
        "runtimeArgs": ["preview"],
        "port": 4321
      },
      {
        "name": "dev",
        "runtimeExecutable": "D:\\hospital-ai-lab\\.claude\\run-npm.cmd",
        "runtimeArgs": ["dev"],
        "port": 4321
      }
    ]
  }
  ```
  (새 컴퓨터의 저장소 경로가 다르면 `runtimeExecutable` 경로를 그에 맞게 고칠 것)

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
| `update-news.yml` | 1시간 간격(`17 * * * *`) | **메디칼타임즈 '의료기기·AI' 지면 + 병원신문 전체 기사** 크롤링 → `src/data/news.json`에 신규 기사만 누적. 변경 없으면 커밋·배포 생략 |
| `update-videos.yml` | **매일** KST 09:07 + 예비 12:07/15:07/18:07/21:07 | 유튜브에서 클로드·병원·의료 AI 영상 최대 3개 신규 추가 → `src/data/recommended-videos.json`. 기존 항목(수동·자동·직접 제작 전부)은 절대 안 지움. 하루 1회 제한: 최근 24시간 내 auto 추가 있으면 건너뜀. 수동 즉시 갱신은 `gh workflow run update-videos.yml -f force=true` |
| `update-events.yml` | 매일 KST 09:37 + 예비 13:37/17:37 | 메디칼타임즈(의료기기·AI·학술 지면)·병원신문·대한병원협회·한국보건산업진흥원에서 **병원·의료 AI 교육·세미나·컨퍼런스·학술대회** 소식 크롤링 → `src/data/events.json` (2026-07-27 신설). 제목에 행사 표현 + AI·디지털 표현이 함께 있어야 채택하고 수상·인사·MOU는 제외. ⚠️ **수확량이 원래도 적다(실측 주 1건 안팎)** — 국내에 병원 AI 행사 자체가 아직 적다. 2026-08-20: 8/15~8/20 5일간 완전히 멈춘 걸 조사해 보니 '전시회'가 아닌 '전시'(동사형)·행사명 'KHF'를 EVENT_RE가 못 잡던 게 원인이라 두 패턴을 추가했다(누적 8→18건). 더 넓히려면 `AI_RE`/`EVENT_RE`를 손볼 것. 최초 1회는 `news.json` 누적분에서 시드를 끌어왔다. |
| `update-jgrants.yml` | 매일 JST 09:07 + 예비 13:07/17:07 | **일본어판** — jGrants(디지털청) 공개 API에서 의료기관 관련 **모집 중** 보조금 수집 → `src/data/ja/subsidies.json` (2026-07-31 신설). 인증 불필요. |
| `update-ru-news.yml` | 매시 :37 | **러시아어판** — Медвестник(АИ 태그 페이지)·Vademecum(/ai/ 섹션)에서 의료 AI 기사 크롤링 → `src/data/ru/news.json` (2026-08-13 신설). 두 매체 다 AI 전용 지면이라 한국어판 병원신문과 달리 제목 재필터링 불필요. |
| `update-gov-programs.yml` | 매일 KST 09:07 + 예비 12:07/15:07 | 보건복지부·한국보건산업진흥원(KHIDI)·**정보통신산업진흥원(NIPA)**·**대한병원협회** 공고 크롤링 → `src/data/gov-programs.json`. 병원·의료 관련 지원사업만 담고 채용·입찰·시상·선정결과·지침개정은 제외 (2026-07-20 신설, 07-22 아침 9시로 조정, 07-27 대한병원협회 추가, 08-20 NIPA 추가). NIPA는 ICT 전반 기관이라 MED_RE 필터로 AI+의료 교집합만 남긴다(skipMedCheck 미적용). 병원협회는 복지부 공고를 회원 병원에 전달하는 글이 많아 **수집 순서 맨 뒤**에 두고, 제목 정규화(「」·[]·끝의 '안내/공고' 제거)로 원문과 중복되지 않게 한다. 병원협회 '협회공고' 게시판은 100% 자체 입찰공고라 쓰지 않는다. |

- 수집 스크립트: `scripts/fetch-news.mjs`, `scripts/fetch-videos.mjs`
- GitHub cron은 예약을 자주 지연·누락시킴(실측: 3시간 간격 예약이 하루 2~3회만 실행, 최대 13시간 공백) → 그래서 예약을 촘촘히 걸고 "새 기사 있을 때만" 커밋하는 방식으로 설계됨 (2026-07-09 조정).
- 두 워크플로 모두 `deploy.yml`과 배포 대기열을 공유하지 않도록(오너 직접 push 배포가 취소당하지 않게) 각자 별도 concurrency 그룹 사용 + 완료 후 `gh workflow run deploy.yml`로 배포를 위임함.

### 4-1-1. `daily-update-digest` (⚠️ 로컬 — 2026-08-15 신설, 8/15 무인 정지 사고 이후 4-2를 흡수·확장)

- 저장 위치: `C:\Users\a\.claude\scheduled-tasks\daily-update-digest\SKILL.md` (로컬 파일, git에 없음). 매일 KST 08:05경 실행.
- 하는 일: ①한국어 블로그 확인·작성(4-2와 같은 방식, daily-blog-post와 중복 방지 확인 포함) ②**러시아어 블로그 확인·작성(2026-08-20 신설, 오너 지시)** — src/content/blog-ru/에 오늘 글이 없으면 152-FZ·Roszdravnadzor·GOST R 72484 등 아직 안 쓴 러시아 제도 주제나 src/data/ru/news.json 최신 기사 중에서 새로 조사해 쓴다. 사실 검증 통과 시에만 draft:false로 자동 발행(CLAUDE.md 2026-08-20 오너 지시로 예외를 러시아어판까지 확대). **일본어판 blogJa는 이 자동화 대상이 아니다** — draft:true+PR만. ③뉴스·지원사업·행사·영상 24시간 집계 ④Gmail 연동(cyhodr@gmail.com)으로 choyh1004@bumin.co.kr에 결과 이메일(2026-08-17부로 네이버 SMTP 대신 이걸 씀 — 네이버 인증 실패).
- 무인 정지 방지: `.claude/settings.json`(git 커밋됨)에 Bash 명령·`Write/Edit(src/content/blog/**)`·`Write/Edit(src/content/blog-ru/**)`를 사전 허용해 뒀다. **blog-ja는 의도적으로 허용 목록에 넣지 않았다** — 이 작업이 일본어판을 건드리지 못하게 막는 안전장치다.
- `daily-blog-post`(4-2)·`site-health-check`(4-3)이 예약 목록에서 안 보이는 시점이 있었다(2026-08-16 확인, 원인 미상 — 폴더는 남아 있음). `mcp__scheduled-tasks__list_scheduled_tasks`로 현재 등록된 작업을 항상 먼저 확인할 것.

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
- **보고 전달(오너 지시 2026-07-10)**: 이메일(choyj80@naver.com, 네이버 SMTP 자기 발송) + 앱 알림. 발송 스크립트와 자격 증명은 `C:\Users\a\.claude\scheduled-tasks\site-health-check\` 폴더의 `send-report.ps1` / `naver-smtp.xml`(Windows DPAPI 암호화, 이 컴퓨터·이 Windows 계정 전용). 새 컴퓨터에서는 자격 증명을 다시 만들어야 이메일이 나간다.
  - **네이버 SMTP는 일반 로그인 비밀번호로는 인증이 안 된다(2026-07-11 확인, `5.5.1 Authentication Required`).** 반드시 "앱 비밀번호"를 따로 발급해야 함: 네이버 계정 → 보안설정 → **2단계 인증** → **애플리케이션 비밀번호 관리** 화면에서 이름(아무 값이나) 입력 후 "생성하기" → 영문 대문자+숫자 12자리 발급. 이 값을 `naver-smtp.xml`에 저장해야 한다(2단계 인증 자체가 꺼져 있어도 이 화면은 그대로 쓸 수 있었음). 일반 비밀번호나 2단계 인증 OTP(6자리 숫자)는 여기 쓸 수 없다 — 반드시 이 화면에서 생성된 값이어야 한다.
  - **`naver-smtp.xml` 재생성 방법(2026-07-16 실제로 이렇게 했음)**: 오너가 직접 PowerShell 창에서 아래 두 줄을 실행한다. 앱 비밀번호는 가려진 입력창에 직접 넣으므로 대화나 파일에 평문으로 남지 않는다. (Claude에게 앱 비밀번호를 불러주지 말 것 — 대화 기록에 평문으로 남는다. 실수로 노출했다면 네이버에서 그 항목을 삭제하고 새로 발급할 것.)

    ```powershell
    cd "$env:USERPROFILE\.claude\scheduled-tasks\site-health-check"
    Get-Credential -UserName 'choyj80@naver.com' -Message '네이버 앱 비밀번호' | Export-Clixml naver-smtp.xml
    ```

  - **실행 정책 주의**: 이걸 만들어도 `.ps1` 실행이 Windows 기본 정책에 막혀 있으면 메일이 안 나간다(`PSSecurityException`). `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 한 번이면 해결된다(보안 설정이라 오너가 직접). 시험: `.\send-report.ps1 -Subject '시험' -Body '시험'` → `발송 완료:`가 뜨면 정상.
- 저장 위치: `C:\Users\a\.claude\scheduled-tasks\site-health-check\SKILL.md` (로컬 파일 — git에 없음). 같은 폴더에 `send-report.ps1`(자격 증명 없음 — `naver-smtp.xml`에서 읽음)도 있다.
- 새 컴퓨터에서는 새 Claude 세션에게 "HANDOFF.md 4-3 참고해서 매일 아침 사이트 자가 점검(보고 전용) 예약 작업을 다시 만들어줘"라고 요청하면 된다.

### 4-4. 실무 팁 (수동 — 자동화 아님, 2026-07-16 신설)

- `/tips/`(카드 목록) + `/tips/1~10/`(상세). 데이터는 **`src/data/tips.ts` 하나**에 다 들어 있고, 페이지 두 개가 그 파일만 읽는다. 항목을 고치려면 이 파일만 고치면 된다.
- 원본은 오너가 준 `업무TIP10선.docx`. **제목과 목록만 옮겼고, 원문 각 항목 첫머리의 "핵심" 요약 문장은 오너 지시로 제외**했다.
- 카드에 보이는 `title`·`hook`은 후킹용으로 새로 쓴 것이고, 상세 페이지 제목(`fullTitle`)이 원문 제목이다.
- 도구 이름에는 공식 사이트 링크가 붙어 있다(`links`). **링크 42개는 2026-07-16에 전부 실제 접속해 확인**했다. 새 링크를 추가할 때도 반드시 접속 확인할 것(§6의 curl 403 함정 참고).
- 항목 이름이 `A · B`처럼 두 도구를 담으면 `links`에 각각 넣는다(라벨을 ` · `로 이어 붙이면 이름과 정확히 같아야 함).
- 관리자 페이지에서 편집하는 기능은 **없다**(코드 직접 수정). 새 팁을 추가하려면 `tips.ts`에 항목을 넣으면 페이지가 자동 생성된다.

## 5. 외부 서비스 · 크리덴셜 위치

| 서비스 | 용도 | 크리덴셜 / 설정 위치 |
| --- | --- | --- |
| GitHub | 저장소·호스팅·자동화 | 계정: BuminAI. 관리자 페이지의 GitHub 토큰은 이제 Supabase `admin_secrets`에 저장(§3) |
| 도메인(가비아) | hospital-ai-lab.com | A레코드 4개(185.199.108~111.153) + www CNAME. `astro.config.mjs`의 `CUSTOM_DOMAIN` |
| Supabase | 회원·인증·DB·Storage·GitHub 토큰 보관 | `src/utils/site.ts`의 `SUPABASE_URL`·`SUPABASE_ANON_KEY`(anon 키는 공개용, RLS로 보호). **service_role 키는 절대 코드에 넣지 말 것** |
| GoatCounter | 방문자 통계 | `src/utils/site.ts`의 `GOATCOUNTER_CODE = 'hospital-ai-lab'` |
| 네이버/구글 | 검색 등록 | `src/utils/site.ts`의 `NAVER_SITE_VERIFICATION`·`GOOGLE_SITE_VERIFICATION` |
| 유튜브 채널 | 영상 | `src/utils/site.ts`의 `YOUTUBE_CHANNEL_URL` (추천 영상 페이지·푸터에서 링크) |
| Resend | 새 글 이메일 알림 | **아직 미설정**(§8). GitHub Secrets에 `RESEND_API_KEY`·`SUPABASE_SERVICE_ROLE_KEY` 필요 — `supabase/SETUP-GUIDE.md` 4-1 |
| 네이버 메일 | 자가 점검 보고 발송 | 앱 비밀번호(§4-3). 이 컴퓨터의 `naver-smtp.xml`에만 있고 **이전 불가** |

### Supabase 마이그레이션 (2026-07-11부터 — 파일 하나로 통합)

예전에는 기능이 추가될 때마다 `migrate-*.sql` 파일을 따로 실행해야 했다.
이제 `setup.sql`이 완전히 재실행 안전(idempotent)하게 바뀌어서 그럴 필요가
없다 — **`setup.sql` 전체를 다시 실행하면 항상 최신 상태로 맞춰진다**(이미
있는 테이블·정책·컬럼은 건드리지 않고 없는 것만 채움). 개별
`migrate-*.sql` 파일들은 전부 지웠다(git 이력에서는 여전히 볼 수 있음).

관리자 화면에서 "Supabase에 이 기능의 설치가 아직 안 된 상태입니다" 같은
오류가 보이면 `setup.sql`을 SQL Editor에 다시 붙여넣고 Run 하면 된다.

## 5-1. SEO / AEO 구조 (2026-07-27~28 구축)

검색엔진과 AI 답변 엔진(ChatGPT·Perplexity·Gemini) 노출을 위한 장치들이다.
**손대기 전에 이 절을 읽을 것** — 서로 물려 있어 하나만 지우면 정책 위반이 되는 것이 있다.

| 장치 | 위치 | 주의 |
| --- | --- | --- |
| AI 크롤러 명시 허용 | `src/pages/robots.txt.ts` | `public/robots.txt`를 만들면 충돌. **Disallow 쓰지 말 것**(noindex를 못 읽게 됨) |
| 저자·연구소·사이트 엔티티 | `src/components/SchemaOrg.astro` → BaseLayout에서 전 페이지 | 실명·학력은 `/about/` 화면에도 **반드시 함께** 있어야 한다(비가시 마크업 = 구글 정책 위반) |
| BreadcrumbList | `BaseLayout.astro` (경로에서 자동 생성) | 메뉴 목록(`nav`·`footerNav`)의 label을 이름으로 쓴다 |
| BlogPosting | `src/pages/blog/[id].astro` | author를 `@id`로 참조. 글 화면에도 저자 표시가 있어야 한다 |
| FAQPage | `src/pages/faq.astro` | 구글 FAQ 리치결과는 2026-05부터 사실상 미노출. **AI 인용용**이지 검색 장식이 아니다 |
| DefinedTermSet + 용어 앵커 | `src/pages/glossary.astro`, `src/data/glossary.ts`의 `id` | **슬러그는 바꾸지 말 것**(외부 링크가 깨진다). `.term { scroll-margin-top }` 없으면 앵커가 헤더에 가림 |
| ItemList | `src/pages/checklist.astro` | HowTo 아님(순서 있는 방법이 아니라 점검 항목) |
| CollectionPage | `news`·`gov-support`·`events` | 자동 수집 목록임을 명시. 본문은 안 옮기고 링크만 |
| 글별 OG 이미지 | `src/pages/og/[...route].ts` | 키는 `post.id`(Astro 5에 `slug` 없음), 폰트 지정 필수(한글), `await` 필수 |
| llms.txt | `public/llms.txt` | AI 엔진용 사이트 안내 |
| 분류별 아카이브 | `src/pages/blog/category/[slug].astro`·`index.astro`, `src/data/blog-categories.ts` | 2026-08-12 신설. **슬러그는 바꾸지 말 것**(외부 링크가 깨진다). `/blog/`의 필터 칩이 이 주소를 가리키는 링크이고, JS는 preventDefault로 화면 내 필터만 한다 — JS 없이도 분류별 페이지에 닿게 하려는 구조다 |
| 페이지별 실제 수정일 | `src/utils/git-lastmod.mjs` | 2026-08-12 신설. 사이트맵 lastmod·일본어판 「更新日」·글의 dateModified가 전부 이걸 쓴다. `git log -1 -- <파일>`로 구한다 |
| RSS 검증 항목 | `src/pages/rss.xml.js` | `atom:link rel=self`·`lastBuildDate`. lastBuildDate는 **최신 글 발행일**(빌드 시각 쓰면 매 배포마다 바뀜) |
| 관련글 모듈 | `src/pages/blog/[id].astro` | 같은 분류 우선 3편. 이게 없으면 글 절반이 문맥 인바운드 링크 0건이 된다 |

**남은 것 (오너가 직접 해야 함)**: 구글 서치콘솔·네이버 서치어드바이저·Bing 웹마스터에
사이트맵(`sitemap-index.xml`)과 RSS 제출. 소유확인 메타 태그는 이미 둘 다 들어가 있다.

### 2026-08-12 보강 — 여기서 배운 것 두 가지 (되돌리지 말 것)

- **빌드 시각을 수정일로 쓰면 안 된다.** 예전에는 사이트맵 lastmod와 일본어판
  「更新日」이 모두 빌드 시각이었다. 이 사이트는 뉴스 자동 수집으로 하루에도
  수십 번 배포되므로, 몇 달째 그대로인 페이지까지 매번 "오늘 수정됨"이 됐다.
  검색엔진은 lastmod가 실제와 어긋나는 사이트의 값을 아예 무시해 버리고,
  일본어판은 **화면에 보이는 날짜가 사실과 달라 사실 검증 원칙에도 어긋났다.**
  지금은 `src/utils/git-lastmod.mjs`가 파일별 마지막 커밋 시각을 구한다.
- **⚠️ 그래서 `deploy.yml`의 체크아웃에 `fetch-depth: 0`이 반드시 필요하다.**
  기본값인 얕은 클론(depth=1)은 커밋이 하나뿐이라 모든 파일이 같은 날짜로
  나온다 — 로컬에서는 멀쩡한데 배포본만 전 페이지가 빌드 시각으로 돌아간다
  (2026-08-12에 실제로 이 증상을 겪고 원인을 찾았다). 이 옵션을 지우면 위
  기능이 통째로 무력화되므로 절대 지우지 말 것.
- **hreflang은 양쪽이 서로를 가리켜야 한다** — 이 문서에 원래 적혀 있던
  주의사항인데, 실제로는 한국어판 9개 중 6개(`checklist`·`faq`·`glossary`·
  `guide`·`tips`·`youtube`)에 `jaPath`가 빠져 한쪽만 걸린 상태였다.
  2026-08-12에 전부 채워 9쌍 모두 양방향이 됐다. **일본어 페이지를 새로
  만들면 대응하는 한국어 페이지의 `jaPath`도 반드시 같이 넣을 것.**

## 5-2. 일본어판 `/ja/` (2026-07-31 신설)

일본 의료기관 종사자를 대상으로 한 별도 언어판이다. **한국어판과 코드가 분리돼 있다.**

| 항목 | 위치 | 주의 |
| --- | --- | --- |
| i18n 라우팅 | `astro.config.mjs` | **`prefixDefaultLocale: false` 절대 바꾸지 말 것.** true가 되면 기존 한국어 URL이 전부 `/ko/` 아래로 밀려 검색 자산이 통째로 날아간다 |
| 레이아웃 | `src/layouts/JaLayout.astro` | 한국어 `BaseLayout`과 **완전히 분리**했다. 한 파일에 조건문으로 합치지 말 것 |
| 디자인 토큰 | `src/styles/ja-tokens.css` | 선택자는 반드시 `[data-locale='ja'] body` — `html`에만 걸면 `global.css`의 `body` 규칙이 이겨서 일본어 조판이 적용되지 않는다(실제로 한 번 겪음) |
| 운영자 이름 | `src/i18n/ja.json`의 `profile.name`/`nameShort` | 한자 **曺永熩**(2026-07-31 오너 확인). JSON-LD `name`에는 한자만 넣고 요미가나·한글·영문은 `alternateName`에 둔다 — 괄호까지 이름으로 읽히지 않게 |
| 본문 콘텐츠 | `src/data/ja/content/*.json` (JSON) | 2026-08-03에 TS→JSON으로 옮김. `pages.ts`·`glossary.ts`·`faq.ts`는 **JSON을 읽어 타입만 붙이는 얇은 로더**다. 관리자가 브라우저에서 편집하므로 TS로 되돌리지 말 것 |
| 일본어판 관리자 | `/admin-ja/` (`src/pages/admin-ja.astro`) | 한국어판과 **같은 계정**으로 로그인. 화면은 한국어, 편집 대상만 일본어. 한국어판 `/admin/`에서 링크 |
| 메뉴 노출 | `src/data/ja/content/nav.json` | 관리자 '공개 상태' 패널이 여기를 고친다. JaLayout이 `enabled`인 것만 표시(홈은 항상 표시) |
| 제작 영상 | `src/data/ja/pages.ts`의 `videosJa` | 한국어판 `recommended-videos.json`의 `source:'own'`과 videoId 동기화. **VideoObject 스키마 금지** — `addedAt`은 사이트 추가일이지 유튜브 공개일이 아니라 `uploadDate`로 쓰면 거짓이 된다 |
| 문자열 | `src/i18n/ja.json` | です・ます조 통일. である조 섞지 말 것. 용어 대역 준수(`政府支援事業`✗→`補助金・助成金`, `電子医務記録`✗→`電子カルテ`, `院務課`✗→`医事課`, `生成型AI`✗→`生成AI`) |
| 補助金 수집 | `scripts/fetch-jgrants.mjs` + `update-jgrants.yml` | jGrants(디지털청) 공개 API, 인증 불필요. 매일 JST 09:07 |
| hreflang | `JaLayout` + `BaseLayout`의 `jaPath` prop | **양쪽이 서로를 가리켜야** 구글이 인정한다. 한쪽만 넣으면 무시된다 |

### jGrants API 사용법 (실측으로 알아낸 것)

- `GET https://api.jgrants-portal.go.jp/exp/v1/public/subsidies`
- **`keyword`·`sort`·`order`·`acceptance` 4개가 전부 필수.** 하나라도 빠지면 400이 나는데
  응답 본문에 이유가 안 적혀 있어 원인을 찾기 어렵다. (작업지시서 예제 코드가 이 때문에 실패했다.)
- `keyword`는 2글자 이상. 목록에 "전건 조회" 파라미터가 없어 키워드를 순회하며 id로 중복 제거한다.
- 목록은 v1만 동작(v2는 404), 상세는 v1·v2 둘 다 동작.
- ⚠️ `institution_name`은 **기관명이 아니라 사업명 변형**이다(예: `医療機関におけるAI技術活用促進事業1`).
  실시기관으로 표기하면 사실 오류가 된다.

### 아직 안 만든 것 (작업지시서 §4 중)

- **医療AIニュース**: 후생노동성 RSS 이용조건이 **재배포를 금지**한다. 한국어판처럼 자동 미러링하면
  규약 위반이라 만들지 않았다. 만들려면 "원문 링크 + 직접 쓴 해설"만 게시하는 방식이어야 한다.
- **おすすめ動画 / AI教育・イベント**: YouTube Data API 키와 connpass API 키가 필요하다.
  connpass는 **개인 자격으로만** 신청 가능하고(법인 불가) 승인에 수일 걸린다. 오너가 직접 신청해야 한다.
- A계층 번역(用語集·FAQ·導入チェックリスト 등): 홈·소개·補助金 3페이지만 먼저 공개했다.

## 5-3. 러시아어판 `/ru/` (2026-08-13 신설, Phase B까지 완료)

일본어판과 마찬가지로 한국어판과 완전히 분리된 별도 언어판이다. **번역이 아니라 러시아
제도를 새로 조사해 쓴 콘텐츠**다. 계획 원본: `C:\Users\a\.claude\plans\mighty-booping-kernighan.md`.

| 장치 | 위치 | 주의 |
| --- | --- | --- |
| i18n 라우팅 | `astro.config.mjs` | `locales: ['ko','ja','ru']`. `prefixDefaultLocale:false` 절대 변경 금지 |
| 레이아웃 | `src/layouts/RuLayout.astro` | ja판과 동일한 2컬럼+브레드크럼+상시 사이드바 구조 재사용(설계 판단, 사실 아님). `koPath`뿐 아니라 `jaPath?`도 받아 3자 hreflang 지원 |
| hreflang 3자 상호참조 | `BaseLayout.astro`(`alternates` prop, `jaPath`는 레거시 호환용으로 유지)·`JaLayout.astro`(`ruPath` prop 추가) | ko/ja/ru 6쌍(ko→ja,ko→ru,ja→ko,ja→ru,ru→ko,ru→ja)이 전부 서로를 가리켜야 유효. 페이지를 새로 만들 때마다 6쌍 체크리스트로 확인할 것 |
| 디자인 토큰 | `src/styles/ru-tokens.css` | 선택자는 `[data-locale='ru'] body`(html에만 걸면 global.css에 짐, ja가 실제로 겪은 버그). **폰트 재정의 없음** — Pretendard가 키릴을 이미 지원해 ja처럼 시스템 폰트로 전환할 필요가 없었다(실측 확인) |
| 운영자 이름 키릴 표기 | `Чо Ёнхо` | 콘체비치 표기법 기준, 2026-08-13 오너가 직접 확인·확정(ja의 曺永熩 확인 절차와 동일 원칙 — briefing.md에 없는 값을 임의로 만들지 않음) |
| 본문 콘텐츠 | `src/data/ru/content/*.json` + 얇은 로더(`pages.ts`·`glossary.ts`·`faq.ts`) | 관리자가 브라우저에서 편집 |
| 러시아어판 관리자 | `/admin-ru/` (`src/pages/admin-ru.astro`) | 한국어판과 **같은 계정**으로 로그인. 화면은 한국어, 편집 대상만 러시아어. 한국어판 `/admin/`에서 링크 |
| 메뉴 노출 | `src/data/ru/content/nav.json` | RuLayout이 `enabled`인 것만 표시(홈은 항상 표시) |

### Phase B 콘텐츠의 사실 근거 (전부 WebFetch로 직접 접속해 재확인한 것만 사용)

- **152-ФЗ 개인정보보호법**: 데이터 현지화 의무, 민감·생체정보 및 자동화된 결정에는 서면 동의 필요, Roskomnadzor 집행(반복 위반 시 법인 6만~30만 루블 벌금). 출처: securiti.ai
- **Roszdravnadzor 의료기기(AI/SaMD) 등록**: 정부령 №1684(2024-11-30). 등록 기간 — 임상시험 필요 시 최대 50영업일, 불필요 시 31영업일, 국내 제품 1차 심사 25영업일, 저위험 제품 5영업일. 2026-06 기준 AI 탑재 의료기기 57건 등록(국내 SW 레지스트리 41건·미포함 11건·해외 5건, Roszdravnadzor 청장 발표). 출처: roszdravnadzor.gov.ru, tatar-inform.ru
- **AI 규제법(2026-09-01 시행, 일부 2027-03-01)**: 대규모 기초 AI모델 규제. **최종안에서 의료 등 분야별 규제는 연기됨**(21개 조항→13개로 축소) — 법은 통과됐지만 병원 대상 구체적 의무는 아직 없다는 점이 핵심. 출처: gxpnews.net
- **ГОСТ Р 72484-2025**: 의료 AI 공통 용어·분류 표준. 출처: healthcaremea.com
- **뺀 것**: FSTEC/187-FZ 핵심정보기반시설 규제, "건강 보전을 위한 신기술" 국가 프로젝트(2조 루블), ФОМС의 AI 진단 지출 수치 — 전부 재확인 시도했으나 원 출처를 확인하지 못했거나(FSTEC) 소스 신뢰도가 의심되어(국가 프로젝트 건, thedefensenews.com이라는 출처 자체가 의심스러움) 게재하지 않았다. 근거를 다시 찾으면 추가할 것.

### Phase C 완료 (2026-08-13)

- **실무 팁**: `/ru/tips/` 4개 항목. 한국어판 10개 번역이 아니라 **러시아 자체 서비스(GigaChat·YandexGPT)** 로 새로 조사했다 — 152-ФЗ 데이터 현지화 요건상 러시아 기업 서비스가 더 적합하다는 판단. 공식 링크(giga.chat, ya.ru/ai/gpt) 실접속 확인. 환자 데이터 입력 금지 주의사항 포함.
- **추천 영상**: `/ru/videos/` — 연구소장이 만든 12강 시리즈(한국어 음성)에 러시아어 제목만 추가(ja판과 동일 패턴). `src/data/ru/content/videos.json`.
- **뉴스 자동 수집**: `/ru/news/`, `scripts/fetch-ru-news.mjs`, `.github/workflows/update-ru-news.yml`(매시 :37, `update-ru-news` 그룹으로 다른 워크플로와 분리). Медвестник(medvestnik.ru, "искусственный интеллект" 태그 페이지)·Vademecum(vademec.ru/ai/, 전용 섹션) 두 곳 다 raw HTML을 curl로 직접 확인한 뒤(WebFetch 요약만으로는 정규식 파싱 가능 여부를 알 수 없었다) 정규식 파싱기를 작성했다. 로컬 실행에서 실제 기사 17건(Медвестник 13·Vademecum 4) 수집 확인. 두 매체 모두 AI 전용 지면이 있어 병원신문처럼 전체 목록을 제목으로 다시 거를 필요가 없었다.
- **지원사업(補助金 대응) 자동화**: 일본 jGrants 같은 공개 API형 소스를 러시아에서 찾지 못했다. **2026-08-13 오너 지시로 완전히 포기** — 후속 조사도 하지 않는다. `/ru/subsidies/` 같은 페이지는 만들지 않는다.

### Phase D 완료 (2026-08-13, PR 대기 중)

- `src/content.config.ts`에 `blogRu` 컬렉션 신설(`src/content/blog-ru/`, 기존 `blog`와 완전히 별개). `src/pages/ru/blog/{index,[id]}.astro` 신설. hreflang은 안 건다(뉴스와 같은 이유 — ko↔ru 글은 번역이 아니라 독립 집필).
- 검증된 사실 3건(152-ФЗ 데이터 현지화, Roszdravnadzor 의료기기 등록, AI 규제법의 의료 분야 유예)으로 글 3편 작성. **한국어판과 달리 러시아어판은 자동 발행 예외를 적용하지 않는다** — `draft: true`로 커밋해 브랜치 `post/2026-08-13-ru-blog-phase-d`에 PR을 올렸다. 오너 머지 후 각 글의 `draft`를 `false`로 바꿔야 실제로 발행된다.
- ⚠️ 검증 중 실제 버그 발견: `blog/[id].astro`에 한국어판 공용 `formatDate`(ko-KR 로케일 고정)를 그대로 가져다 써서 날짜가 "2026년 8월 13일"처럼 한국어로 나왔다. 임시로 글 하나를 `draft:false`로 바꿔 브라우저로 직접 확인하다 발견 — 러시아어판 페이지에서 한국어판 유틸을 가져다 쓸 때는 로케일이 박혀 있는 함수가 없는지 꼭 확인할 것. `ru-RU` 로케일의 자체 `Intl.DateTimeFormat`으로 고쳤다.
- `nav.json`에 `blog` 추가(오너 확인 없이 진행 — 메뉴 없이 두면 고아 페이지가 된다는 판단, 계획서에는 "오너 결정 필요"로 남겨뒀던 항목).

### 아직 안 만든 것

- 없음(Phase A~D 전부 완료). 다음은 콘텐츠 확장(용어·FAQ·글 추가)과 위 PR 머지.
- **영상 신규 등록 도구**: admin-ru에는 아직 "한국어판에 새로 생긴 '직접 만든 영상' 자동 발견" 기능이 없다(ja의 jv-sync에 해당). 지금은 12개 전량 수동 입력했다. 13강이 생기면 개발자에게 요청하거나 admin-ja의 jv-sync 패턴을 이식할 것.

## 6. 이 프로젝트에서 배운 것들 (반복하지 않으려고 적어 둠)

- **Node가 PATH에 없을 수 있다**: `.claude/run-npm.cmd` 래퍼로 절대경로 실행(§2).
- **PowerShell 5.1 큰따옴표 버그**: git commit 메시지에 큰따옴표를 넣으면 인자가 깨져 커밋이 실패한다. 커밋 메시지에 큰따옴표를 쓰지 말 것(작은따옴표나 낫표 「」 사용).
- **GitHub Pages 배포가 가끔 실패한다**: "Deployment failed, try again later"가 간헐적으로 뜬다. 같은 run을 반복 rerun하기보다 `gh workflow run deploy.yml`로 새로 실행하는 편이 더 잘 통한다.
- **preview_screenshot 툴이 자주 타임아웃난다**: 사이트 문제가 아니라 툴 자체 문제. `preview_eval`(getComputedStyle 등)·`preview_snapshot`·`preview_inspect`로 대체 검증할 것.
- **무인 예약 세션은 승인 창에 걸리면 영영 멈춘다**: 예약 작업이 "실행됐다"고 기록되는데 결과물이 없으면 십중팔구 도구 승인 대기다. 해결은 `.claude/settings.json`의 permissions.allow에 그 도구를 사전 등록하는 것(§4-2 참조).
- **GitHub 예약(cron)은 크게 못 믿는다**: 예약 횟수의 상당 부분이 실행되지 않거나 9~13시간 늦게 돈다. 특정 시각 보장이 필요하면 예약을 촘촘히 여러 개 걸고 스크립트를 멱등(변경 없으면 아무것도 안 함)하게 만들 것.
- **Astro 스코프드 스타일은 `innerHTML`로 넣은 요소에 안 먹는다**: admin.astro처럼 목록을 JS로 그리는 페이지는 `<style is:global>`을 써야 한다(안 그러면 `.btn.ghost` 같은 규칙이 무시되고 전역 기본 스타일로 떨어진다).
- **`hidden` 속성은 같은 요소에 `display:` CSS가 걸려 있으면 무시된다**: 작성자 CSS(`form { display:flex }` 등)가 브라우저 기본 `[hidden]{display:none}`보다 우선이라, JS로 hidden을 붙여도 요소가 계속 보인다. ai-apps 라이트박스(07-10)와 login 페이지의 "새 비밀번호 설정" 카드(07-11)에서 두 번 실제 발생. **2026-07-12에 `global.css`에 `[hidden] { display:none !important; }` 전역 가드를 넣어 원천 차단했으니 이제 페이지마다 따로 넣을 필요는 없다.**
- **`curl`이 403·401을 줘도 죽은 링크가 아닐 수 있다**: Claude·Perplexity·Unsplash·Pexels·Make는 curl에 봇 차단으로 403/401을 주지만 브라우저에서는 멀쩡하다. 반대로 Adobe Express는 curl에서 연결 자체가 실패(000)했지만 정상이었다. **링크 검증은 curl로 1차만 거르고, 이상한 코드가 나오면 반드시 브라우저로 확인할 것**(2026-07-16 실무 팁 링크 42개 검증에서 확인).
- **JSX(.astro)에서 `<a>` 태그 안에 줄바꿈을 두면 그 공백까지 밑줄이 그어진다**: `<a>\n  {label}\n</a>`처럼 쓰면 앞뒤 공백이 링크 텍스트에 포함된다. 링크는 `<a href={..}>{label}</a>`로 붙여 쓸 것(tips/[no].astro 참고).
- **스크린샷 도구(`computer` action:screenshot)가 자주 30초 타임아웃난다**: 사이트 문제가 아니라 도구 문제. `javascript_tool`로 `getComputedStyle`·DOM 값을 직접 읽어 검증하는 편이 빠르고 확실하다.
- **Astro 컴포넌트의 `<details>`로 "데스크톱은 항상 펼침" 흉내내지 말 것**: 최신 Chrome이 닫힌 `<details>`의 자식(요약 제외)을 `content-visibility`로 강제 숨겨 CSS `display:block`으로도 못 되돌린다. 토글이 필요하면 버튼+JS로 만들 것.
- **정적 사이트에는 진짜 파일 접근 제어가 없다**: `public/`에 넣은 건 전부 공개된다. "로그인한 사람만 다운로드"가 필요하면 Supabase Storage의 비공개 버킷 + RLS를 써야 한다(AI로 만든 앱 기능이 이 패턴).
- **비밀값(GitHub 토큰 등)을 사이트 코드나 localStorage에 하드코딩하지 말 것**: 정적 사이트는 방문자 전원에게 코드가 공개된다. 서버(Supabase) + RLS만이 실제 방어선이다.
- **크롤러는 "지면 상단 헤드라인 영역"을 놓치기 쉽다**: 메디칼타임즈 수집기가 `newsListWrap` 이후만 읽어, 그 위 `listTop_wrap`(최신 기사가 배치되는 헤드라인 블록)을 통째로 빠뜨리고 있었다. 헤드라인에 걸린 기사는 아래 일반 목록에 중복해 나오지 않아 **영영 수집되지 않는다**. 나흘간 "새 기사 없음"으로 조용히 지나간 원인이었다(2026-07-20 수정). **"소스가 조용하다"는 판단은 반드시 소스 원문을 직접 확인하고 내릴 것** — 같은 눈으로 두 번 보면 놓친 것을 또 놓친다.
- **CDATA는 태그를 지우기 전에 벗겨야 한다**: `stripTags`가 `<[^>]+>`로 태그를 먼저 지우면 `<![CDATA[제목]]>` 전체가 한 덩어리로 매칭돼 제목이 빈 문자열이 된다. 보건복지부 RSS가 0건으로 나오던 원인(2026-07-20).
- **정부 사이트(.go.kr)는 GitHub Actions 러너에서 간헐적으로 연결이 끊긴다**: 보건복지부가 러너에서만 `UND_ERR_CONNECT_TIMEOUT`으로 실패했다(국내 PC·다른 해외 인프라에서는 정상). 완전 차단은 아니고 간헐적이므로 **재시도 + 대체 경로(https/http, www 유무)**로 흡수한다. 한 수집원이 실패해도 나머지는 계속 진행하고, 전부 실패할 때만 기존 파일을 지키며 중단하도록 짤 것.
- **검색어를 넓히면 필터의 숨은 허점이 드러난다**: 영상 수집기의 주제 필터가 주제어(`병원|의료|요양`…)만 보고 AI 여부는 확인하지 않았다. 검색어가 전부 클로드 중심일 때는 문제가 없었지만 `병원 인공지능` 같은 넓은 검색어를 넣자 「요양병원의 잠든 노인들(추적60분)」 같은 AI 무관 다큐가 통과했다. **필터를 넓힐 때는 기존 조건이 무엇을 전제하고 있었는지 함께 볼 것**(2026-07-20).
- **구조화 데이터는 화면에 보이는 사실만 마크업해야 한다**: 구글은 비가시 콘텐츠 마크업을 정책 위반으로 본다. 2026-07-27에 저자 Person JSON-LD(실명·학력)를 넣고 `/about/` 화면에는 안 넣은 상태가 잠깐 있었는데, push 전에 발견해 화면 표시를 함께 넣어 해소했다. **JSON-LD를 고치면 대응하는 화면 블록도 같이 고칠 것.**
- **`@astrojs/rss`의 `lastBuildDate`에 빌드 시각을 쓰면 안 된다**: 이 사이트는 뉴스 수집으로 하루에도 여러 번 배포돼, 내용이 안 바뀌어도 피드가 갱신된 것처럼 보인다. 최신 글 발행일을 쓴다.
- **Supabase 무료 요금제는 파일당 50MB가 절대 상한이다**(공식 문서로 확인, 실측으로도 재현: 50MB 성공/51MB 거부). 버킷의 `file_size_limit`을 그보다 크게 설정해도 서버가 조용히 50MB에서 막는다 — 오류가 "파일 형식" 문제처럼 보여도 실제로는 용량 문제일 수 있으니 먼저 파일 크기부터 의심할 것. 올리려면 유료 요금제 전환이 유일한 방법이다.

## 7. 주요 파일 지도

```
src/
├── pages/
│   ├── index.astro, about.astro, contact.astro, privacy.astro
│   ├── blog/index.astro, blog/[id].astro   # 목록에 카테고리 필터(순수 JS)
│   ├── news.astro          # AI 뉴스 (메디칼타임즈·병원신문 자동 수집)
│   ├── gov-support.astro   # 정부 지원사업 (2026-07-20 신설, 자동 수집)
│   ├── events.astro        # AI 교육·행사 (2026-07-27 신설, 자동 수집)
│   ├── youtube.astro       # 추천 영상 — 연구소장 제작분이 위, 각 섹션 6개까지만 보이고 더보기로 펼침
│   ├── tips.astro          # 실무 팁 카드 목록 (2026-07-16 신설)
│   ├── tips/[no].astro     # 실무 팁 상세 (/tips/1/ ~ /tips/10/)
│   ├── notes.astro         # 강의노트 (회원 전용, Supabase)
│   ├── ai-apps.astro       # AI로 만든 앱 (2026-07-22 비공개 처리 — 메뉴·홈·검색에서 뺐고 직접 주소로만 접근. Supabase Storage, 파일 형식 제한 없음·최대 50MB — 요금제 절대 상한)
│   ├── glossary.astro, faq.astro, checklist.astro, guide.astro   # 입문 가이드 4종
│   ├── login.astro / signup.astro   # 회원 기능(Supabase, 구글 OAuth 포함)
│   ├── admin.astro          # 관리자 대시보드 (이메일+비번 로그인 하나로 통합, §3)
│   ├── rss.xml.js, robots.txt.ts    # robots.txt는 파일이 아니라 이 라우트가 생성함
├── content/blog/            # 블로그 글(마크다운). 현재 16편(매일 자동 발행으로 계속 늘어남)
├── data/                    # research.ts, glossary.ts, faq.ts, checklist.ts, guide.ts,
│                             # tips.ts(실무 팁 — 링크 포함), news.json,
│                             # recommended-videos.json, gov-programs.json(정부 지원사업), events.json(AI 교육·행사),
│                             # notified-posts.json(알림 발송 이력)
├── layouts/BaseLayout.astro # 헤더(로고 SVG·모바일 메뉴)·푸터(2열+사이트맵)·다크모드·OG
├── components/              # PostCard, ResearchIcon
├── styles/global.css        # 디자인 토큰(색·그림자·타이포·간격) — 2026-07-12 전면 개편
└── utils/site.ts            # 사이트 상수·크리덴셜(한 곳에서 관리)
.claude/agents/               # planner·writer·reviewer·builder·maintainer (git에 있음)
.claude/skills/               # new-post·maintenance·update-page (git에 있음)
.claude/settings.json         # 무인 예약 세션용 도구 사전 허용 (git에 있음 — §4-2)
supabase/                    # setup.sql(재실행 안전, 이거 하나만 유지) + SETUP-GUIDE.md
scripts/                     # fetch-news.mjs·fetch-videos.mjs·fetch-gov-programs.mjs·fetch-events.mjs·gen-assets.mjs
public/                      # favicon, og-default.png, fonts/(Pretendard 자체호스팅)
```

> **예약 작업은 저장소 안이 아니라 `C:\Users\a\.claude\scheduled-tasks\`에 있다**
> (`daily-blog-post/`, `site-health-check/`). git에 없으므로 새 컴퓨터에서 재생성 필요(§4-2·4-3).

## 7-1. 상단 메뉴 구성 (2026-07-27 기준, 10개)

홈 · 소개 · 블로그 · AI 뉴스 · 정부 지원사업 · AI 교육·행사 · 강의노트 · 추천 영상 · 실무 팁 · 입문 가이드

- **'AI로 만든 앱'을 메뉴에서 뺐다(오너 지시 2026-07-22, 비공개 처리).** 상단 메뉴·홈 피드·입문가이드 링크에서 제거하고 `noindex`+사이트맵 제외했다. **페이지(`/ai-apps/`)·관리자 업로드 기능·Supabase 데이터는 그대로 살아 있다** — 직접 주소로만 접근되며 언제든 되돌릴 수 있다(공개 노출 5곳 복구). 자세한 위치는 그 커밋 참조.
- **메뉴 개수 10개 유지가 오너 결정(2026-07-20)이다.** 07-22에 'AI로 만든 앱'을 비공개로 내려 9개가 됐다가, 07-27에 'AI 교육·행사'가 들어와 다시 10개가 됐다. **10개를 넘기려면 오너에게 확인할 것.**
- **문의는 상단 메뉴에서 뺐다**(2026-07-12, 메뉴 밀도 완화). 페이지(`/contact/`)와 주소는 그대로 살아 있고, 푸터 사이트맵과 홈 하단 밴드로 들어간다.
- 용어사전·FAQ·체크리스트는 상단에 없다 — 입문 가이드의 "더 볼 자료"와 푸터 사이트맵에서 연결한다.

## 8. 현재 미완료 · 오너 확인 필요 (2026-07-16 기준)

- [x] ~~**네이버 SMTP 앱 비밀번호 재발급**~~ — 2026-07-16 완료. 새 앱 비밀번호로 `naver-smtp.xml` 재생성 + 실제 발송 확인.
- [ ] (오너 확인 필요) **`cyhodr-dotcom` 계정의 정체**: 이사 때 이 컴퓨터에 이 GitHub 계정이 로그인돼 있어 push가 403으로 막혔다. gh는 BuminAI로 다시 로그인해 해결했지만, 이 계정이 오너의 다른 계정인지 제3자 것인지는 확인되지 않았다. 브라우저 쪽에도 남아 있을 수 있다.
- [ ] **`setup.sql` 재실행**: 홈 화면 "이어지는 소식"에 강의노트가 뜨려면 비회원에게 제목·날짜만 공개하는 정책이 필요하다(본문은 계속 회원 전용). Supabase SQL Editor에 `setup.sql`을 다시 붙여넣고 Run 하면 적용된다. **안 해도 사이트는 정상**이고 블로그·AI 앱만 표시된다.
- [ ] **새 글 이메일 알림(Resend)이 아직 한 번도 동작한 적 없음**: GitHub 저장소에 `RESEND_API_KEY`·`SUPABASE_SERVICE_ROLE_KEY`가 등록되지 않아 배포 때마다 조용히 건너뛴다(사이트 배포 자체는 정상). 켜려면 `supabase/SETUP-GUIDE.md` 4-1 참고.
- [ ] **검색엔진 사이트맵 제출**: 네이버 서치어드바이저·구글 서치 콘솔에서 소유확인 후 `sitemap-index.xml` 제출 여부 확인.
- [ ] **관리자 비밀번호**: `whdudwns80*`로 변경 완료했는지 확인.
- [ ] (선택) 개인정보 처리방침 보호책임자 실명 기재 여부 검토.
- [ ] (오너 결정 대기) **소개 페이지 약력 타임라인**: 항목이 2개뿐이라 오히려 빈약해 보인다는 진단. "경력 17년(기획 7년)" 한 줄로 대체할지 결정 필요.
- [x] ~~(오너 결정 대기) **상단 메뉴 추가 축소**~~ — 2026-07-20 오너 결정: **10개로 유지**(축소하지 않음). §7-1 참조.
- [ ] (오너 확인 필요) **정부 지원사업에 시·도 자치단체 추가**: 현재 보건복지부·한국보건산업진흥원·정보통신산업진흥원(NIPA, 2026-08-20 추가)·대한병원협회를 수집한다. 자치단체 17곳은 사이트 구조가 제각각이라 개별 파서가 필요하고, 중앙·지방을 한 번에 주는 **기업마당/공공데이터포털 오픈API는 오너 명의 회원가입 후 인증키 발급**이 필요하다(키는 GitHub Secrets에 넣어야 함). 발급해 주면 붙일 수 있다.
- [ ] (후속 조사 필요) **러시아어판 지원사업 자동화**: jGrants급 공개 API를 못 찾았다. 러시아 연방/지역 보조금 포털에 병원 대상 공개 신청형 프로그램이 있는지 별도 조사 필요(§5-3 참조).
- [ ] (오너 확인 필요) **러시아어판 메뉴 개수 정책**: 한국어판은 10개 상한이 오너 결정 사항이다(§7-1). 러시아어판도 같은 상한을 적용할지 확인 필요 — 현재는 6개(홈·소개·용어집·FAQ·체크리스트·가이드).

## 9. 반드시 지키는 원칙

- **사실 검증 절대 원칙**: 모든 사실 주장에 객관적 출처. 할루시네이션 금지. 조금이라도 의심되면 싣지 않는다. (CLAUDE.md 참조)
- **누구나 이해하기 쉽게 쓴다**: 전문·통계 용어는 풀어서 설명. 블로그·소개 등 모든 글에 공통 적용.
- 저자 관련 사실은 briefing.md에 있는 것만.
  - **실명(조영호)·학력(통계학 석사·경제학 박사)은 2026-07-27 오너 지시로 공개 전환**했다(SEO/GEO 작업).
    현재 `/about/` 화면, JSON-LD(SchemaOrg.astro), `llms.txt` 세 곳에 나간다. 근거는 briefing.md에 기록됨.
  - **SAS KOREA 수상 이력은 계속 비공개.** 위 공개 전환의 승인 범위가 아니었다. 공개하려면 오너에게 따로 확인할 것.
  - ⚠️ 구조화 데이터·llms.txt는 검색엔진·AI가 기계 수집하므로, 되돌려도 외부 캐시·학습분은 남을 수 있다.
- 새 글은 draft로 시작 → 브랜치 + PR → 오너 머지가 기본. 단, 예약 자동 발행 글은 사실 검증 통과 시 예외적으로 바로 발행(§4-2). 커밋 메시지는 한국어, 큰따옴표 금지(§6).
