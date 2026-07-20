# 인수인계 가이드 (HANDOFF)

다른 컴퓨터 · 다른 Claude 세션에서 이 프로젝트를 이어서 작업할 때 읽는 문서입니다.
(사이트 운영 규칙은 [CLAUDE.md](CLAUDE.md), 사실의 원천은 [briefing.md](briefing.md), 회원 기능 개통은 [supabase/SETUP-GUIDE.md](supabase/SETUP-GUIDE.md) 참조)

**마지막 갱신: 2026-07-20.** 이 날짜 이후 코드가 바뀌었다면 이 문서보다 실제 코드가 우선입니다.

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

## 0. 새 컴퓨터로 옮길 때 — 무엇이 자동으로 따라오고, 무엇이 안 따라오는가

| 항목 | 새 컴퓨터로 자동 이전됨? | 비고 |
| --- | --- | --- |
| 사이트 코드 전체, 이 문서, CLAUDE.md, briefing.md | ✅ (git clone) | GitHub에 있음 |
| `.claude/agents/`, `.claude/skills/`, `.claude/settings.json`(도구 사전 허용) | ✅ | git에 커밋됨 |
| GitHub Actions 자동화(뉴스·영상 수집, 배포) | ✅ | GitHub 클라우드에서 실행, 컴퓨터와 무관 |
| Supabase(회원·DB·Storage·GitHub 토큰 저장) | ✅ | 클라우드 서비스, 컴퓨터와 무관. 로그인만 다시 하면 됨 |
| **예약 작업 2개(daily-blog-post, site-health-check)** | ❌ | Claude 앱의 로컬 예약 작업이라 **이 컴퓨터에서만** 실행됨. 새 컴퓨터에서 §4-2·4-3 참고해 다시 만들어야 함 |
| **네이버 SMTP 자격 증명(`naver-smtp.xml`)** | ❌ **(복사해도 소용없음)** | Windows DPAPI로 암호화돼 **이 컴퓨터·이 Windows 계정에서만 복호화**된다. 새 컴퓨터에서 앱 비밀번호를 새로 발급받아 다시 만들어야 함(§4-3) |
| **Claude의 프로젝트 기억(memory, 이 대화의 교훈들)** | ❌ | `C:\Users\choyj\.claude\projects\...\memory\`에 로컬 저장. 아래 §6에 핵심만 옮겨 적어 둠 |
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
| `update-gov-programs.yml` | 매일 KST 08:23 + 예비 12:23/16:23 | 보건복지부·한국보건산업진흥원 공고 크롤링 → `src/data/gov-programs.json`. 병원·의료 관련 지원사업만 담고 채용·입찰·시상·선정결과·지침개정은 제외 (2026-07-20 신설) |

- 수집 스크립트: `scripts/fetch-news.mjs`, `scripts/fetch-videos.mjs`
- GitHub cron은 예약을 자주 지연·누락시킴(실측: 3시간 간격 예약이 하루 2~3회만 실행, 최대 13시간 공백) → 그래서 예약을 촘촘히 걸고 "새 기사 있을 때만" 커밋하는 방식으로 설계됨 (2026-07-09 조정).
- 두 워크플로 모두 `deploy.yml`과 배포 대기열을 공유하지 않도록(오너 직접 push 배포가 취소당하지 않게) 각자 별도 concurrency 그룹 사용 + 완료 후 `gh workflow run deploy.yml`로 배포를 위임함.

### 4-2. 매일 블로그 자동 작성 (⚠️ 로컬 — 새 컴퓨터에서 반드시 재설정)

- **이건 GitHub Actions가 아니라 Claude 앱의 예약 작업(scheduled task)**입니다. 매일 KST 22:00경 이 컴퓨터의 Claude 앱이 열려 있을 때 실행되어, 주제 선정 → 작성 → 출처 검증 → 발행까지 자동으로 합니다.
- 저장 위치: `C:\Users\choyj\.claude\scheduled-tasks\daily-blog-post\SKILL.md` (로컬 파일 — git에 없고 새 컴퓨터에 자동으로 안 생김)
- **오너 지시(2026-07-08)**: 이 자동 글은 사실 검증(모든 주장에 객관적 출처, 확인 안 되면 무발행)을 통과하면 **오너 승인 없이 바로 발행**한다. 이 예외는 CLAUDE.md의 "작업 규칙"에도 명시되어 있음.
- **무인 실행이 멈추지 않게 하는 핵심 장치(2026-07-09, 오너 승인)**: 예약 세션이 쓰는 도구(WebFetch·WebSearch·git·gh·빌드·블로그 폴더 쓰기)를 `.claude/settings.json`(git에 커밋됨)에 사전 허용해 뒀다. 이게 없으면 무인 세션이 승인 창에 걸려 영영 멈춘다 — 실제로 2026-07-09 실행이 출처 확인(WebFetch) 승인 대기에 걸려 멈춘 것을 확인하고 넣은 조치다. 예약 작업에 새 도구를 쓰게 하려면 이 허용 목록도 함께 갱신할 것.
- 실행이 끝날 때마다 알림이 오도록 설정되어 있다(notifyOnCompletion). 알림이 안 오면 그 날 실행이 안 된 것.
- 같은 날짜 글이 이미 있으면 중복 발행하지 않고 건너뛴다(작업 프롬프트에 명시).
- **새 컴퓨터에서 이어가려면**: 새 Claude 세션에게 "매일 오후 10시에 병원 AI 연구소 블로그 글 1개를 주제 선정부터 작성·검증·발행까지 자동으로 수행하는 예약 작업을 다시 만들어줘. CLAUDE.md와 이 HANDOFF.md를 참고해서"라고 요청하면 된다. (schedule 스킬로 재생성. 도구 허용 목록은 저장소에 있어 자동으로 적용됨)
- 앱이 꺼져 있으면 그 날은 건너뛰지 않고 다음에 앱을 열 때 실행됨(하루 밀릴 수 있음). 밤 10시에 컴퓨터와 Claude 앱이 켜져 있어야 정시에 발행된다.

### 4-3. 매일 사이트 자가 점검 (⚠️ 로컬 — 새 컴퓨터에서 재설정 필요)

- **매일 오전 9시경** 실행되는 Claude 예약 작업(`site-health-check`). **보고 전용**(수리 안 함, 오너 지시 2026-07-10) — 주요 페이지 접속, 뉴스·영상·블로그 자동화 신선도, GitHub Actions 실패, Supabase 서버 상태(마이그레이션 누락 감지 포함), 최근 글 출처 링크 생존을 점검하고 결과를 보고한다.
- **보고 전달(오너 지시 2026-07-10)**: 이메일(choyj80@naver.com, 네이버 SMTP 자기 발송) + 앱 알림. 발송 스크립트와 자격 증명은 `C:\Users\choyj\.claude\scheduled-tasks\site-health-check\` 폴더의 `send-report.ps1` / `naver-smtp.xml`(Windows DPAPI 암호화, 이 컴퓨터·이 Windows 계정 전용). 새 컴퓨터에서는 자격 증명을 다시 만들어야 이메일이 나간다.
  - **네이버 SMTP는 일반 로그인 비밀번호로는 인증이 안 된다(2026-07-11 확인, `5.5.1 Authentication Required`).** 반드시 "앱 비밀번호"를 따로 발급해야 함: 네이버 계정 → 보안설정 → **2단계 인증** → **애플리케이션 비밀번호 관리** 화면에서 이름(아무 값이나) 입력 후 "생성하기" → 영문 대문자+숫자 12자리 발급. 이 값을 `naver-smtp.xml`에 저장해야 한다(2단계 인증 자체가 꺼져 있어도 이 화면은 그대로 쓸 수 있었음). 일반 비밀번호나 2단계 인증 OTP(6자리 숫자)는 여기 쓸 수 없다 — 반드시 이 화면에서 생성된 값이어야 한다.
  - **`naver-smtp.xml` 재생성 방법(2026-07-16 실제로 이렇게 했음)**: 오너가 직접 PowerShell 창에서 아래 두 줄을 실행한다. 앱 비밀번호는 가려진 입력창에 직접 넣으므로 대화나 파일에 평문으로 남지 않는다. (Claude에게 앱 비밀번호를 불러주지 말 것 — 대화 기록에 평문으로 남는다. 실수로 노출했다면 네이버에서 그 항목을 삭제하고 새로 발급할 것.)

    ```powershell
    cd "$env:USERPROFILE\.claude\scheduled-tasks\site-health-check"
    Get-Credential -UserName 'choyj80@naver.com' -Message '네이버 앱 비밀번호' | Export-Clixml naver-smtp.xml
    ```

  - **실행 정책 주의**: 이걸 만들어도 `.ps1` 실행이 Windows 기본 정책에 막혀 있으면 메일이 안 나간다(`PSSecurityException`). `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 한 번이면 해결된다(보안 설정이라 오너가 직접). 시험: `.\send-report.ps1 -Subject '시험' -Body '시험'` → `발송 완료:`가 뜨면 정상.
- 저장 위치: `C:\Users\choyj\.claude\scheduled-tasks\site-health-check\SKILL.md` (로컬 파일 — git에 없음). 같은 폴더에 `send-report.ps1`(자격 증명 없음 — `naver-smtp.xml`에서 읽음)도 있다.
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
- **Supabase 무료 요금제는 파일당 50MB가 절대 상한이다**(공식 문서로 확인, 실측으로도 재현: 50MB 성공/51MB 거부). 버킷의 `file_size_limit`을 그보다 크게 설정해도 서버가 조용히 50MB에서 막는다 — 오류가 "파일 형식" 문제처럼 보여도 실제로는 용량 문제일 수 있으니 먼저 파일 크기부터 의심할 것. 올리려면 유료 요금제 전환이 유일한 방법이다.

## 7. 주요 파일 지도

```
src/
├── pages/
│   ├── index.astro, about.astro, contact.astro, privacy.astro
│   ├── blog/index.astro, blog/[id].astro   # 목록에 카테고리 필터(순수 JS)
│   ├── news.astro          # AI 뉴스 (메디칼타임즈·병원신문 자동 수집)
│   ├── gov-support.astro   # 정부 지원사업 (2026-07-20 신설, 자동 수집)
│   ├── youtube.astro       # 추천 영상 — 연구소장 제작분이 위, 각 섹션 6개까지만 보이고 더보기로 펼침
│   ├── tips.astro          # 실무 팁 카드 목록 (2026-07-16 신설)
│   ├── tips/[no].astro     # 실무 팁 상세 (/tips/1/ ~ /tips/10/)
│   ├── notes.astro         # 강의노트 (회원 전용, Supabase)
│   ├── ai-apps.astro       # AI로 만든 앱 (회원 전용, Supabase Storage, 파일 형식 제한 없음·최대 50MB — 요금제 절대 상한)
│   ├── glossary.astro, faq.astro, checklist.astro, guide.astro   # 입문 가이드 4종
│   ├── login.astro / signup.astro   # 회원 기능(Supabase, 구글 OAuth 포함)
│   ├── admin.astro          # 관리자 대시보드 (이메일+비번 로그인 하나로 통합, §3)
│   ├── rss.xml.js, robots.txt.ts    # robots.txt는 파일이 아니라 이 라우트가 생성함
├── content/blog/            # 블로그 글(마크다운). 현재 10편
├── data/                    # research.ts, glossary.ts, faq.ts, checklist.ts, guide.ts,
│                             # tips.ts(실무 팁 — 링크 포함), news.json,
│                             # recommended-videos.json, gov-programs.json(정부 지원사업),
│                             # notified-posts.json(알림 발송 이력)
├── layouts/BaseLayout.astro # 헤더(로고 SVG·모바일 메뉴)·푸터(2열+사이트맵)·다크모드·OG
├── components/              # PostCard, ResearchIcon
├── styles/global.css        # 디자인 토큰(색·그림자·타이포·간격) — 2026-07-12 전면 개편
└── utils/site.ts            # 사이트 상수·크리덴셜(한 곳에서 관리)
.claude/agents/               # planner·writer·reviewer·builder·maintainer (git에 있음)
.claude/skills/               # new-post·maintenance·update-page (git에 있음)
.claude/settings.json         # 무인 예약 세션용 도구 사전 허용 (git에 있음 — §4-2)
supabase/                    # setup.sql(재실행 안전, 이거 하나만 유지) + SETUP-GUIDE.md
scripts/                     # fetch-news.mjs·fetch-videos.mjs·fetch-gov-programs.mjs·gen-assets.mjs
public/                      # favicon, og-default.png, fonts/(Pretendard 자체호스팅)
```

> **예약 작업은 저장소 안이 아니라 `C:\Users\choyj\.claude\scheduled-tasks\`에 있다**
> (`daily-blog-post/`, `site-health-check/`). git에 없으므로 새 컴퓨터에서 재생성 필요(§4-2·4-3).

## 7-1. 상단 메뉴 구성 (2026-07-20 기준, 10개)

홈 · 소개 · 블로그 · AI 뉴스 · 정부 지원사업 · 강의노트 · AI로 만든 앱 · 추천 영상 · 실무 팁 · 입문 가이드

- **메뉴 개수는 10개로 유지한다(오너 결정 2026-07-20).** 예전에 6개까지 줄이는 안이 있었으나 채택하지 않았다. 새 분야를 추가할 때 이 결정을 근거로 삼되, 계속 늘리는 것은 별개 문제이므로 10개를 넘길 때는 오너에게 확인할 것.
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
- [ ] (오너 확인 필요) **정부 지원사업에 시·도 자치단체 추가**: 현재 보건복지부·한국보건산업진흥원만 수집한다. 자치단체 17곳은 사이트 구조가 제각각이라 개별 파서가 필요하고, 중앙·지방을 한 번에 주는 **기업마당/공공데이터포털 오픈API는 오너 명의 회원가입 후 인증키 발급**이 필요하다(키는 GitHub Secrets에 넣어야 함). 발급해 주면 붙일 수 있다.

## 9. 반드시 지키는 원칙

- **사실 검증 절대 원칙**: 모든 사실 주장에 객관적 출처. 할루시네이션 금지. 조금이라도 의심되면 싣지 않는다. (CLAUDE.md 참조)
- **누구나 이해하기 쉽게 쓴다**: 전문·통계 용어는 풀어서 설명. 블로그·소개 등 모든 글에 공통 적용.
- 저자 관련 사실은 briefing.md에 있는 것만. 통계학 석사·경제학 박사·SAS 수상 이력은 오너 지시로 비공개(briefing.md에 사유 기록됨).
- 새 글은 draft로 시작 → 브랜치 + PR → 오너 머지가 기본. 단, 예약 자동 발행 글은 사실 검증 통과 시 예외적으로 바로 발행(§4-2). 커밋 메시지는 한국어, 큰따옴표 금지(§6).
