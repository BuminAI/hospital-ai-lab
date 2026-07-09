-- ============================================================
-- 통합 따라잡기 마이그레이션 (2026-07-09)
-- ============================================================
-- 대상: "맨 처음 setup.sql만 실행하고, 그 뒤 migrate-*.sql을 하나도
--       실행하지 않은" Supabase 프로젝트.
--
-- 사용법: Supabase 대시보드 → SQL Editor → New query → 이 파일 내용
--         전체를 붙여넣고 Run. "Success"가 나오면 끝.
--
-- 이 파일 하나가 아래 5개 마이그레이션을 전부 포함합니다.
--   1) migrate-oauth.sql              (구글 로그인 동의 기록 함수)
--   2) migrate-org-email.sql          (소속 기관 이메일 항목)
--   3) migrate-ai-apps.sql            (AI로 만든 앱 - 회원 전용 갤러리)
--   4) migrate-admin-delete-member.sql(관리자 회원 삭제 버튼)
--   5) migrate-admin-github-token.sql (관리자 로그인 통합 - GitHub 토큰 보관)
--
-- 여러 번 실행해도 안전합니다(이미 있는 것은 건너뜁니다).
-- ============================================================

-- ------------------------------------------------------------
-- 2) 소속 기관 이메일 (migrate-org-email)
-- ------------------------------------------------------------
alter table public.profiles add column if not exists org_email text;

grant update (name, gender, birth_date, phone, org_email) on public.profiles to authenticated;

-- 가입 시 프로필 자동 생성 함수 — 최신판(org_email 포함, 구글 로그인 이름 키 대응)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, name, gender, birth_date, phone, org_email, email,
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
    nullif(new.raw_user_meta_data ->> 'org_email', ''),
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

-- ------------------------------------------------------------
-- 1) 구글 로그인 최초 동의 기록 (migrate-oauth)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 3) AI로 만든 앱 (migrate-ai-apps)
-- ------------------------------------------------------------
-- 이미지 파일을 담을 비공개 버킷. public=false이므로 URL을 알아도
-- 로그인 없이는 파일을 받을 수 없다(아래 storage.objects 정책이 실제 방어선).
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('ai-apps', 'ai-apps', false, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

create table if not exists public.ai_apps (
  id bigint generated always as identity primary key,
  title text not null,
  storage_path text not null,        -- ai-apps 버킷 안의 경로
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.ai_apps enable row level security;

drop policy if exists "ai_apps_select_member_or_admin" on public.ai_apps;
create policy "ai_apps_select_member_or_admin" on public.ai_apps
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
drop policy if exists "ai_apps_insert_admin" on public.ai_apps;
create policy "ai_apps_insert_admin" on public.ai_apps
  for insert with check (public.is_admin());
drop policy if exists "ai_apps_update_admin" on public.ai_apps;
create policy "ai_apps_update_admin" on public.ai_apps
  for update using (public.is_admin());
drop policy if exists "ai_apps_delete_admin" on public.ai_apps;
create policy "ai_apps_delete_admin" on public.ai_apps
  for delete using (public.is_admin());

drop policy if exists "ai_apps_storage_select" on storage.objects;
create policy "ai_apps_storage_select" on storage.objects
  for select using (
    bucket_id = 'ai-apps'
    and (
      public.is_admin()
      or (
        auth.uid() is not null
        and exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.consent_required_at is not null
        )
      )
    )
  );
drop policy if exists "ai_apps_storage_insert_admin" on storage.objects;
create policy "ai_apps_storage_insert_admin" on storage.objects
  for insert with check (bucket_id = 'ai-apps' and public.is_admin());
drop policy if exists "ai_apps_storage_delete_admin" on storage.objects;
create policy "ai_apps_storage_delete_admin" on storage.objects
  for delete using (bucket_id = 'ai-apps' and public.is_admin());

-- ------------------------------------------------------------
-- 4) 관리자 회원 삭제 (migrate-admin-delete-member)
-- ------------------------------------------------------------
create or replace function public.admin_delete_member(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if target_id = auth.uid() then
    raise exception '관리자 본인 계정은 여기서 삭제할 수 없습니다';
  end if;
  delete from auth.users where id = target_id;
end;
$$;

grant execute on function public.admin_delete_member(uuid) to authenticated;

-- ------------------------------------------------------------
-- 5) 관리자 로그인 통합 - GitHub 토큰 서버 보관 (migrate-admin-github-token)
-- ------------------------------------------------------------
create table if not exists public.admin_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_secrets enable row level security;

drop policy if exists "admin_secrets_select_admin" on public.admin_secrets;
create policy "admin_secrets_select_admin" on public.admin_secrets
  for select using (public.is_admin());
drop policy if exists "admin_secrets_upsert_admin" on public.admin_secrets;
create policy "admin_secrets_upsert_admin" on public.admin_secrets
  for insert with check (public.is_admin());
drop policy if exists "admin_secrets_update_admin" on public.admin_secrets;
create policy "admin_secrets_update_admin" on public.admin_secrets
  for update using (public.is_admin());
drop policy if exists "admin_secrets_delete_admin" on public.admin_secrets;
create policy "admin_secrets_delete_admin" on public.admin_secrets
  for delete using (public.is_admin());
