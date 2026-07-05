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
