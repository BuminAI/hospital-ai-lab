# 회원 기능 개통 가이드 (Supabase)

회원가입·로그인·강의노트가 동작하려면 아래를 한 번만 하면 됩니다. 약 10분.

## 1. Supabase 프로젝트 만들기 (무료)

1. https://supabase.com 에서 GitHub 계정으로 가입 → **New project**
2. 프로젝트 이름: 아무거나 (예: hospital-ai-lab)
3. **Region: Northeast Asia (Seoul)** 을 반드시 선택 (개인정보가 국내에 저장되도록 — 처리방침에 그렇게 안내되어 있음)
4. Database password는 만들어서 따로 보관 (직접 쓸 일은 거의 없음)

## 2. 테이블·보안 규칙 설치

1. 왼쪽 메뉴 **SQL Editor** → New query
2. 이 폴더의 `setup.sql` 내용 전체를 붙여넣고 **Run**
3. "Success" 가 나오면 완료

> **기능이 새로 추가되거나 관리자 화면에 "설치가 안 된 상태" 오류가
> 보이면, `setup.sql`을 처음부터 다시 통째로 붙여넣고 Run 하세요.**
> 이 파일 하나로 항상 최신 상태에 맞출 수 있습니다 — 이미 있는 테이블·
> 정책·컬럼은 건드리지 않고 없는 것만 채우도록 만들어져 있어서, 몇 번을
> 다시 실행해도 안전합니다. 예전에는 기능을 추가할 때마다 별도
> `migrate-*.sql` 파일을 따로 실행해야 했지만, 이제는 그럴 필요 없이
> 이 파일 하나만 최신 버전으로 유지됩니다.

## 3. 인증 설정

1. 왼쪽 메뉴 **Authentication → URL Configuration**
   - Site URL: `https://hospital-ai-lab.com`
   - Redirect URLs에 추가: `https://hospital-ai-lab.com/login/`
2. (기본값 확인) **Authentication → Sign In / Up** 에서 Email 로그인이 켜져 있고,
   "Confirm email"이 켜져 있는지 확인 (가입 시 이메일 인증)

## 3-1. (선택) 구글 로그인 연결

이메일 가입 없이 구글 계정으로 바로 로그인할 수 있게 합니다. Supabase가 공식
지원하는 방식입니다. (카카오 로그인은 설정이 복잡해 현재 사용하지 않습니다.)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **사용자 인증 정보 만들기 → OAuth 클라이언트 ID → 웹 애플리케이션**
2. **승인된 리디렉션 URI**에 Supabase 대시보드 **Authentication → Providers → Google** 화면에 표시된 콜백 URL(`https://xxxx.supabase.co/auth/v1/callback` 형태)을 그대로 붙여넣기
3. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀**을 Supabase의 같은 화면(Google Provider)에 입력하고 저장, **Enable Sign in with Google**을 켜기

> 로그인 버튼은 Supabase에 켜진 로그인만 자동으로 활성화됩니다. 구글을 켜면
> 사이트 코드 수정 없이 버튼이 살아납니다.

> 구글로 처음 로그인한 사람은 가입 폼의 동의 체크박스를 거치지 않으므로,
> 로그인 화면이 최초 1회 별도 동의 화면을 자동으로 보여줍니다. 이 동작은
> `setup.sql`에 이미 포함되어 있습니다.

## 4. 관리자 계정 만들기

- 사이트 회원가입 페이지에서 **choyj80@naver.com** 으로 가입 →
  메일 인증 → 이 계정으로 로그인하면 관리자 대시보드에서 회원·강의노트 관리 가능
- (setup.sql의 is_admin()이 이 이메일만 관리자로 인정합니다.
  관리자 이메일을 바꾸려면 setup.sql의 이메일과 src/utils/site.ts의 ADMIN_EMAIL을 함께 수정)

## 4-1. 새 글 이메일 알림을 실제로 보내려면 — Resend 연결 (약 10분)

새 글이 발행되면 GitHub Actions가 자동으로 이메일을 보냅니다(글 발행 즉시,
`.github/workflows/deploy.yml`의 `notify` 단계). 이메일을 실제로 보내는
서비스로 [Resend](https://resend.com)(무료, 하루 100통)를 씁니다.

1. https://resend.com 에서 가입
2. 왼쪽 메뉴 **API Keys** → **Create API Key** → 생성된 키(`re_`로 시작)를
   복사해 둠
3. 왼쪽 메뉴 **Domains** → **Add Domain** → `hospital-ai-lab.com` 입력
4. 화면에 나오는 DNS 레코드(TXT·CNAME 등 보통 3개)를 도메인을 산 곳(가비아)의
   DNS 설정 화면에 그대로 추가. (사이트 자체를 GitHub Pages로 연결할 때 이미
   가비아 DNS를 만져본 적이 있다면 같은 화면입니다)
5. 몇 분~몇 시간 뒤 Resend Domains 화면에서 **Verified**로 바뀌면 완료
   (레코드 전파는 즉시 되기도 하고 최대 하루 걸리기도 합니다)
6. GitHub 저장소 → **Settings → Secrets and variables → Actions** →
   **New repository secret**으로 아래 2개를 추가:
   - `RESEND_API_KEY`: 2번에서 복사한 키
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase **Project Settings → API**의
     `service_role` `secret` 키 (anon 키와 다른 키입니다 — 이 키는 절대
     사이트 코드나 브라우저에 넣지 마세요. GitHub Secrets에만 저장하며,
     GitHub Actions 안에서만 서버 대 서버로 쓰입니다)

> 도메인 인증 전까지는 이메일 발송이 실패로 남고(사이트 배포 자체는
> 영향 없음), 자동으로 다음 배포 때 다시 시도됩니다. 인증만 마치면 밀려
> 있던 새 글의 알림이 그다음 배포 때 나갑니다.

## 5. 사이트에 연결

1. **Project Settings → API** 에서 두 값을 복사:
   - Project URL (예: `https://xxxx.supabase.co`)
   - `anon` `public` 키
2. 두 값을 Claude Code에 알려주면 `src/utils/site.ts`에 넣고 배포합니다.
   (직접 하려면 `SUPABASE_URL`, `SUPABASE_ANON_KEY`에 붙여넣고 push)

> anon 키는 브라우저에 공개되도록 설계된 키입니다. 데이터 보호는 키가 아니라
> setup.sql의 행 수준 보안 규칙(RLS)이 담당합니다. `service_role` 키는 절대
> 사이트 코드에 넣으면 안 됩니다.

## 개인정보 관련 운영 메모

- 회원 정보는 Supabase(서울 리전)에만 저장되고 GitHub 저장소에는 저장되지 않습니다.
- **탈퇴(삭제) 요청 처리**: Supabase **Authentication → Users**에서 해당 계정을
  삭제하면 프로필까지 자동으로 완전 파기됩니다. (이 한 단계면 끝)
- **주의 — 회원 계정을 Supabase 대시보드에서 직접 만들지 마세요.** 가입 폼을
  거치지 않은 계정은 동의 기록이 없어(관리자 화면에 "동의 기록 없음" 표시)
  강의노트를 볼 수 없습니다. 동의는 반드시 본인이 가입 페이지에서 해야 합니다.
- 동의 일시는 서버(DB)가 기록하며 회원이나 브라우저가 고칠 수 없습니다 (증적 보전).
- 처리방침(/privacy/)의 보호책임자·위탁 정보가 실제 운영과 달라지면 즉시 갱신
