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

## 3. 인증 설정

1. 왼쪽 메뉴 **Authentication → URL Configuration**
   - Site URL: `https://hospital-ai-lab.com`
   - Redirect URLs에 추가: `https://hospital-ai-lab.com/login/`
2. (기본값 확인) **Authentication → Sign In / Up** 에서 Email 로그인이 켜져 있고,
   "Confirm email"이 켜져 있는지 확인 (가입 시 이메일 인증)

## 3-1. (선택) 구글·카카오 로그인 연결

이메일 가입 없이 구글·카카오 계정으로 바로 로그인할 수 있게 합니다. 둘 다
Supabase가 공식 지원하는 방식입니다. 하나만 켜도 되고 둘 다 켜도 됩니다.

### 구글

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **사용자 인증 정보 만들기 → OAuth 클라이언트 ID → 웹 애플리케이션**
2. **승인된 리디렉션 URI**에 Supabase 대시보드 **Authentication → Providers → Google** 화면에 표시된 콜백 URL(`https://xxxx.supabase.co/auth/v1/callback` 형태)을 그대로 붙여넣기
3. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀**을 Supabase의 같은 화면(Google Provider)에 입력하고 저장, **Enable Sign in with Google**을 켜기

### 카카오 (2026-07 카카오 공식 문서 기준 — 콘솔 왼쪽 사이드바에 "앱 설정"과 "제품 설정" 두 카테고리가 분리되어 있습니다)

1. [카카오 디벨로퍼스](https://developers.kakao.com/console/app) → **애플리케이션 추가**로 앱 생성
2. 왼쪽 사이드바 **앱 설정 → 앱 → 플랫폼 키 / 어드민 키** 탭에서 **REST API 키** 복사 (이것이 client_id). 같은 탭 안에 있는 항목:
   - **카카오 로그인 Redirect URI**(같은 페이지에 "비즈니스 인증 리다이렉트 URI"라는 비슷한 이름의 다른 칸도 있으니 헷갈리지 말 것) 에 Supabase 대시보드 **Authentication → Providers → Kakao** 화면에 표시된 콜백 URL(`https://xxxx.supabase.co/auth/v1/callback` 형태) 입력
   - 같은 탭에서 **Client Secret 코드** 생성·활성화 후 복사 (이것이 client_secret)
3. 왼쪽 사이드바 **제품 설정 → 카카오 로그인 → 사용 설정**에서 상태를 **ON**으로 켜기
4. **제품 설정 → 카카오 로그인 → 동의항목**에서 닉네임(profile_nickname)과 카카오계정(이메일, account_email)을 "필수 동의" 또는 "선택 동의"로 설정 (이메일을 받아야 회원 관리가 되므로 최소 "선택 동의"는 켜기)
5. Supabase 대시보드 **Authentication → Providers → Kakao**에 2단계에서 복사한 REST API 키(client_id)와 Client Secret 코드(client_secret)를 입력하고 저장, 활성화

> 콘솔 화면은 카카오 쪽에서 종종 바뀝니다. 위 메뉴 이름과 다른 화면이 보이면,
> 화면을 캡처해서 보여주시면 정확히 어디를 눌러야 하는지 다시 확인해 드립니다.

> 구글·카카오로 처음 로그인한 사람은 우리 동의 체크박스(가입 폼)를 거치지
> 않으므로, 로그인 화면이 최초 1회 별도 동의 화면을 자동으로 보여줍니다.
> 이 동작을 위해 `migrate-oauth.sql`(또는 최신 `setup.sql`)이 DB에
> 반영되어 있어야 합니다 — 아래 참고.

## 3-2. 이미 setup.sql을 실행했다면 — 마이그레이션 1개 추가 실행

구글·카카오 지원을 위해 `setup.sql`에 함수가 하나 추가됐습니다
(`record_consent`). setup.sql을 **이미 한 번 실행한 적이 있다면**, 전체를
다시 실행하지 말고 `migrate-oauth.sql` 내용만 SQL Editor에 붙여넣어
실행하세요. 아직 한 번도 실행한 적이 없다면 이 단계는 건너뛰어도 됩니다
(2단계에서 최신 setup.sql을 실행하면 이미 포함되어 있습니다).

## 4. 관리자 계정 만들기

- 사이트 회원가입 페이지에서 **choyj80@naver.com** 으로 가입 →
  메일 인증 → 이 계정으로 로그인하면 관리자 대시보드에서 회원·강의노트 관리 가능
- (setup.sql의 is_admin()이 이 이메일만 관리자로 인정합니다.
  관리자 이메일을 바꾸려면 setup.sql의 이메일과 src/utils/site.ts의 ADMIN_EMAIL을 함께 수정)

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
