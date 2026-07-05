-- 병원 AI 연구소 회원 기능 초기 설정 (v3 — 구글·카카오 로그인 대응)
-- Supabase 대시보드 → SQL Editor에 전체를 붙여넣고 Run 하세요. (1회)

-- 관리자 판별: 이 이메일로 로그인한 계정만 관리자 권한을 갖는다.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'choyj80@naver.com'
$$;

-- ── 회원 프로필 ──────────────────────────────────────────────
-- 프로필 행은 클라이언트가 아니라 아래 트리거(서버)가 생성한다.
-- 동의 일시는 서버 시각(now())으로 기록되어 위·변조가 불가능하다.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  gender text,                        -- 선택 항목
  birth_date date,                    -- 선택 항목
  phone text,                         -- 선택 항목
  email text not null,
  consent_required_at timestamptz,    -- [필수] 동의 일시 (서버 기록, null = 동의 없음)
  consent_optional_at timestamptz,    -- [선택] 동의 일시 (서버 기록)
  policy_version text,                -- 동의 당시 처리방침 버전
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 조회: 본인 또는 관리자만
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
-- 수정: 본인만 + 아래 컬럼 단위 권한으로 이름·선택항목만 수정 가능
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- 삭제: 본인(잊힐 권리) 또는 관리자
create policy "profiles_delete_own_or_admin" on public.profiles
  for delete using (auth.uid() = id or public.is_admin());
-- insert 정책 없음: 클라이언트는 프로필을 만들 수 없다 (트리거 전용)

-- 컬럼 단위 권한: 동의 증적·이메일·가입일은 클라이언트가 수정 불가
revoke insert, update on public.profiles from anon, authenticated;
grant update (name, gender, birth_date, phone) on public.profiles to authenticated;

-- 가입 시 서버가 프로필을 생성 (가입 폼의 동의 표시를 서버 시각으로 기록).
-- 이메일 가입: 폼의 동의 플래그를 그대로 반영해 동의 일시를 즉시 기록한다.
-- 구글·카카오 로그인: 우리 동의 화면을 거치지 않았으므로 동의 컬럼은 비워
-- 두고(consent_required_at = null), 로그인 직후 화면에서 record_consent()로
-- 별도 동의를 받는다. 제공자별로 이름 필드 키가 달라 여러 후보를 순서대로 시도한다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, name, gender, birth_date, phone, email,
    consent_required_at, consent_optional_at, policy_version
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'nickname', ''),
      nullif(new.email, ''),
      '(이름 없음)'
    ),
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.email, ''),
    case when coalesce(new.raw_user_meta_data ->> 'consent_required', '') = 'true'
         then now() else null end,
    case when coalesce(new.raw_user_meta_data ->> 'consent_optional', '') = 'true'
         then now() else null end,
    nullif(new.raw_user_meta_data ->> 'policy_version', '')
  );
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 구글·카카오 로그인 최초 진입 시, 로그인 화면에서 동의를 받은 뒤 호출한다.
-- 서버 시각으로 기록하므로 클라이언트가 동의 일시를 위조할 수 없다.
-- (선택 항목 동의는 대상이 없음 — 소셜 로그인은 이름·이메일만 수집한다)
create or replace function public.record_consent(p_policy_version text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  update public.profiles
  set consent_required_at = coalesce(consent_required_at, now()),
      policy_version = coalesce(policy_version, p_policy_version)
  where id = auth.uid();
end
$$;

grant execute on function public.record_consent(text) to authenticated;

-- ── 강의노트 (회원 전용 콘텐츠) ──────────────────────────────
create table public.lecture_notes (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,               -- 마크다운 (##, ###, -, **굵게**, [링크](url))
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lecture_notes enable row level security;

-- 필수 동의가 기록된 회원만 공개 노트를 읽을 수 있다
create policy "notes_select_member_or_admin" on public.lecture_notes
  for select using (
    public.is_admin()
    or (
      published
      and auth.uid() is not null
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.consent_required_at is not null
      )
    )
  );
create policy "notes_insert_admin" on public.lecture_notes
  for insert with check (public.is_admin());
create policy "notes_update_admin" on public.lecture_notes
  for update using (public.is_admin());
create policy "notes_delete_admin" on public.lecture_notes
  for delete using (public.is_admin());
