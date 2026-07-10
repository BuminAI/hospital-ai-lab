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

## 3-1. (선택) 구글 로그인 연결

이메일 가입 없이 구글 계정으로 바로 로그인할 수 있게 합니다. Supabase가 공식
지원하는 방식입니다. (카카오 로그인은 설정이 복잡해 현재 사용하지 않습니다.)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **사용자 인증 정보 만들기 → OAuth 클라이언트 ID → 웹 애플리케이션**
2. **승인된 리디렉션 URI**에 Supabase 대시보드 **Authentication → Providers → Google** 화면에 표시된 콜백 URL(`https://xxxx.supabase.co/auth/v1/callback` 형태)을 그대로 붙여넣기
3. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀**을 Supabase의 같은 화면(Google Provider)에 입력하고 저장, **Enable Sign in with Google**을 켜기

> 로그인 버튼은 Supabase에 켜진 로그인만 자동으로 활성화됩니다. 구글을 켜면
> 사이트 코드 수정 없이 버튼이 살아납니다.

> 구글로 처음 로그인한 사람은 가입 폼의 동의 체크박스를 거치지 않으므로,
> 로그인 화면이 최초 1회 별도 동의 화면을 자동으로 보여줍니다. 이 동작을
> 위해 `migrate-oauth.sql`(또는 최신 `setup.sql`)이 DB에 반영되어 있어야
> 합니다 — 아래 참고.

## 3-2 ~ 3-6 공통 지름길 — 밀린 마이그레이션 한 번에 따라잡기

아래 3-2 ~ 3-6 중 무엇을 실행했는지 기억나지 않거나 여러 개가 밀렸다면,
개별 파일 대신 **`migrate-2026-07-09-catchup.sql` 하나만** SQL Editor에
붙여넣어 실행하세요. 5개 마이그레이션이 전부 들어 있고, 이미 적용된 것은
알아서 건너뛰므로 여러 번 실행해도 안전합니다.

> 확인 방법: 관리자 페이지에서 "Could not find the table ... in the schema
> cache" 같은 오류가 보이면 마이그레이션이 밀린 것입니다.

## 3-2. 이미 setup.sql을 실행했다면 — 마이그레이션 1개 추가 실행

구글 로그인 지원을 위해 `setup.sql`에 함수가 하나 추가됐습니다
(`record_consent`). setup.sql을 **이미 한 번 실행한 적이 있다면**, 전체를
다시 실행하지 말고 `migrate-oauth.sql` 내용만 SQL Editor에 붙여넣어
실행하세요. 아직 한 번도 실행한 적이 없다면 이 단계는 건너뛰어도 됩니다
(2단계에서 최신 setup.sql을 실행하면 이미 포함되어 있습니다).

## 3-3. 이미 setup.sql을 실행했다면 — "소속 기관 이메일" 마이그레이션 추가 실행

직접 가입 폼에 "소속 기관 이메일"(방문자 통계 파악 목적) 항목이 추가됐습니다.
setup.sql을 **이미 한 번 실행한 적이 있다면**, `migrate-org-email.sql` 내용만
SQL Editor에 붙여넣어 실행하세요. 아직 한 번도 실행한 적이 없다면 건너뛰어도
됩니다(최신 setup.sql에 이미 포함되어 있습니다).

## 3-4. 이미 setup.sql을 실행했다면 — "AI로 만든 앱" 마이그레이션 추가 실행

회원 전용 카드뉴스 섹션("AI로 만든 앱")이 추가됐습니다. 이미지 파일을 담을
비공개 Storage 버킷과 카드 정보 테이블이 필요합니다. setup.sql을 **이미 한
번 실행한 적이 있다면**, `migrate-ai-apps.sql` 내용만 SQL Editor에 붙여넣어
실행하세요. 아직 한 번도 실행한 적이 없다면 건너뛰어도 됩니다(최신
setup.sql에 이미 포함되어 있습니다).

> 이 마이그레이션은 Storage 버킷을 SQL로 직접 만듭니다(대시보드에서 따로
> 만들 필요 없음). 버킷은 비공개(public=false)이며, 로그인해 동의를 완료한
> 회원과 관리자만 파일을 읽을 수 있도록 정책을 함께 설정합니다.

## 3-5. 이미 setup.sql을 실행했다면 — "회원 삭제" 마이그레이션 추가 실행

관리자 대시보드에서 회원을 직접 삭제하는 버튼이 추가됐습니다. setup.sql을
**이미 한 번 실행한 적이 있다면**, `migrate-admin-delete-member.sql` 내용만
SQL Editor에 붙여넣어 실행하세요. 아직 한 번도 실행한 적이 없다면 건너뛰어도
됩니다(최신 setup.sql에 이미 포함되어 있습니다).

## 3-6. 이미 setup.sql을 실행했다면 — "관리자 로그인 통합" 마이그레이션 추가 실행

관리자 대시보드가 이제 이메일+비밀번호 로그인 하나로 통합됩니다(GitHub 토큰
입력칸이 별도로 없어짐). setup.sql을 **이미 한 번 실행한 적이 있다면**,
`migrate-admin-github-token.sql` 내용만 SQL Editor에 붙여넣어 실행하세요.
아직 한 번도 실행한 적이 없다면 건너뛰어도 됩니다(최신 setup.sql에 이미
포함되어 있습니다).

## 3-7. 이미 setup.sql을 실행했다면 — "AI로 만든 앱 파일 업로드" 마이그레이션 추가 실행

"AI로 만든 앱"이 이미지 카드뉴스에서, 실제 배포 파일(zip·apk·exe·pdf 등
형식 제한 없음, 최대 50MB — Supabase 무료 요금제 절대 상한)과 설명을
함께 올리는 기능으로 확장됩니다. setup.sql을 **이미 한 번 실행한 적이
있다면**, `migrate-2026-07-10-ai-apps-files.sql` 내용만 SQL Editor에
붙여넣어 실행하세요. 아직 한 번도 실행한 적이 없다면 건너뛰어도 됩니다
(최신 setup.sql에 이미 포함되어 있습니다).

> `migrate-2026-07-10-ai-apps-files.sql`을 이미 실행했다면(버킷 용량을
> 200MB로 설정), `migrate-2026-07-10-ai-apps-size-cap-fix.sql`도 추가로
> 실행해 실제 상한(50MB)에 맞게 표시를 바로잡으세요. 동작 자체는 이미
> 50MB로 막혀 있었으므로 이 마이그레이션으로 실제 업로드 가능 여부가
> 바뀌지는 않습니다.

## 3-8. 이미 setup.sql을 실행했다면 — "새 글 이메일 알림" 마이그레이션 추가 실행

회원이 이메일로 새 글 알림을 받을 수 있는 기능이 추가됩니다(가입 시
[선택] 동의, 또는 강의노트 페이지에서 언제든 켜고 끌 수 있음).
setup.sql을 **이미 한 번 실행한 적이 있다면**,
`migrate-2026-07-10-email-notify.sql` 내용만 SQL Editor에 붙여넣어
실행하세요. 아직 한 번도 실행한 적이 없다면 건너뛰어도 됩니다(최신
setup.sql에 이미 포함되어 있습니다).

이 기능은 DB 마이그레이션 외에 아래 4-1 단계(Resend 이메일 서비스 연결)도
함께 해야 실제로 발송됩니다.

## 3-9. 이미 setup.sql을 실행했다면 — "AI 앱 목록 비회원 공개" 마이그레이션 추가 실행

"AI로 만든 앱" 목록(제목·설명)이 이제 비회원에게도 보입니다(다운로드는
여전히 로그인+동의 완료 회원만 가능). setup.sql을 **이미 한 번 실행한
적이 있다면**, `migrate-2026-07-10-ai-apps-public-list.sql` 내용만 SQL
Editor에 붙여넣어 실행하세요. 아직 한 번도 실행한 적이 없다면
건너뛰어도 됩니다(최신 setup.sql에 이미 포함되어 있습니다).

## 3-10. 이미 setup.sql을 실행했다면 — "AI 앱 카드뉴스 이미지" 마이그레이션 추가 실행

"AI로 만든 앱" 카드에 앱 화면·결과물 화면 미리보기 이미지 2장을 올릴 수
있게 됩니다(선택, 각 최대 10MB). 이미지는 별도 공개 버킷에 저장되어
로그인 없이도 바로 보입니다. setup.sql을 **이미 한 번 실행한 적이
있다면**, `migrate-2026-07-10-ai-apps-screenshots.sql` 내용만 SQL
Editor에 붙여넣어 실행하세요. 아직 한 번도 실행한 적이 없다면
건너뛰어도 됩니다(최신 setup.sql에 이미 포함되어 있습니다).

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
