-- 병원 AI 연구소 회원 기능 초기 설정
-- Supabase 대시보드 → SQL Editor에 전체를 붙여넣고 Run 하세요. (1회)

-- 관리자 판별: 이 이메일로 로그인한 계정만 관리자 권한을 갖는다.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'choyj80@naver.com'
$$;

-- ── 회원 프로필 ──────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  gender text,                        -- 선택 항목
  birth_date date,                    -- 선택 항목
  phone text,                         -- 선택 항목
  email text not null,
  consent_required_at timestamptz not null,  -- [필수] 수집·이용 동의 일시
  consent_optional_at timestamptz,           -- [선택] 항목 동의 일시 (없으면 미동의)
  policy_version text not null,              -- 동의 당시 처리방침 버전
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own_or_admin" on public.profiles
  for delete using (auth.uid() = id or public.is_admin());

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

-- 로그인한 회원(프로필 보유)만 공개된 노트를 읽을 수 있다
create policy "notes_select_member_or_admin" on public.lecture_notes
  for select using (
    public.is_admin()
    or (
      published
      and auth.uid() is not null
      and exists (select 1 from public.profiles p where p.id = auth.uid())
    )
  );
create policy "notes_insert_admin" on public.lecture_notes
  for insert with check (public.is_admin());
create policy "notes_update_admin" on public.lecture_notes
  for update using (public.is_admin());
create policy "notes_delete_admin" on public.lecture_notes
  for delete using (public.is_admin());
