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
  gender text,
  birth_date date,
  phone text,
  org_email text,                     -- 소속 기관 이메일 (방문자 통계 파악 목적)
  email text not null,
  consent_required_at timestamptz,    -- [필수] 동의 일시 (서버 기록, null = 동의 없음)
  consent_optional_at timestamptz,    -- [선택] 동의 일시 (서버 기록)
  policy_version text,                -- 동의 당시 처리방침 버전
  email_notify_new_post boolean not null default false, -- [선택] 새 글 발행 이메일 알림
  email_unsub_token uuid not null default gen_random_uuid(), -- 로그인 없이 수신거부하는 링크용 토큰
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
grant update (name, gender, birth_date, phone, org_email, email_notify_new_post) on public.profiles to authenticated;

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
    id, name, gender, birth_date, phone, org_email, email,
    consent_required_at, consent_optional_at, policy_version,
    email_notify_new_post
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
    nullif(new.raw_user_meta_data ->> 'policy_version', ''),
    coalesce(new.raw_user_meta_data ->> 'email_notify', '') = 'true'
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

-- 새 글 발행 이메일 알림 수신거부. 이메일 안의 링크를 누르면 로그인 없이도
-- 바로 해제되도록(표준 관행) anon 권한으로 실행 가능하게 한다. 토큰은 각
-- 회원의 profiles.email_unsub_token(추측 불가능한 uuid)이라 다른 사람의
-- 설정은 건드릴 수 없다.
create or replace function public.unsubscribe_email_notify(p_token uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set email_notify_new_post = false
  where email_unsub_token = p_token;
end
$$;

grant execute on function public.unsubscribe_email_notify(uuid) to anon, authenticated;

-- 관리자 대시보드에서 회원을 직접 삭제하는 기능. 클라이언트(anon/authenticated
-- 키)는 auth.users를 직접 지울 권한이 없어(service_role 키가 필요하며, 그
-- 키는 사이트 코드에 절대 넣으면 안 됨) 관리자만 실행 가능한 서버 함수로
-- 우회한다. auth.users를 지우면 profiles 등 연결된 행은 on delete cascade로
-- 함께 정리된다.
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

-- 관리자 로그인 통합용: GitHub 토큰 등 비밀값을 사이트 코드가 아니라
-- 여기(서버)에만 저장한다. RLS로 관리자 계정만 읽고 쓸 수 있다.
create table public.admin_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_secrets enable row level security;

create policy "admin_secrets_select_admin" on public.admin_secrets
  for select using (public.is_admin());
create policy "admin_secrets_upsert_admin" on public.admin_secrets
  for insert with check (public.is_admin());
create policy "admin_secrets_update_admin" on public.admin_secrets
  for update using (public.is_admin());
create policy "admin_secrets_delete_admin" on public.admin_secrets
  for delete using (public.is_admin());

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

-- ── AI로 만든 앱 (회원 전용 카드뉴스 이미지) ─────────────────
-- 배포 파일(zip·apk·exe·pdf 등, 형식 제한 없음)을 담을 비공개 버킷.
-- public=false이므로 URL을 알아도 로그인 없이는 파일을 받을 수 없다
-- (아래 storage.objects 정책이 실제 방어선). 용량은 50MB로 제한한다 —
-- Supabase 무료 요금제는 프로젝트 전체에 50MB 절대 상한이 걸려 있어
-- (실측 확인: 50MB 성공, 51MB 거부) 버킷 설정을 더 크게 잡아도 그대로
-- 적용된다. 유료 요금제로 전환하면 이 값을 올릴 수 있다.
insert into storage.buckets (id, name, public, file_size_limit)
values ('ai-apps', 'ai-apps', false, 52428800)
on conflict (id) do update set file_size_limit = 52428800, allowed_mime_types = null;

create table public.ai_apps (
  id bigint generated always as identity primary key,
  title text not null,
  description text,                  -- 목록에 보여줄 프로그램 설명 (비회원에게도 공개)
  storage_path text not null,        -- ai-apps 버킷 안의 경로
  file_name text,                    -- 원본 파일명(다운로드 시 그대로 사용)
  file_size bigint,                  -- 바이트 단위 (업로드 시 저장, 목록 표시용)
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.ai_apps enable row level security;

-- 목록(제목·설명)은 누구나 볼 수 있다 — 실제 방어선은 아래 storage.objects
-- 정책(파일 다운로드는 로그인·동의 완료 회원만)이라 여기서 비회원을 막을
-- 필요가 없다. 비공개(published=false) 항목만 관리자에게만 보인다.
create policy "ai_apps_select_published_or_admin" on public.ai_apps
  for select using (public.is_admin() or published);
create policy "ai_apps_insert_admin" on public.ai_apps
  for insert with check (public.is_admin());
create policy "ai_apps_update_admin" on public.ai_apps
  for update using (public.is_admin());
create policy "ai_apps_delete_admin" on public.ai_apps
  for delete using (public.is_admin());

-- 배포 파일 자체의 접근 권한 (진짜 방어선). 조회는 회원·관리자,
-- 업로드·삭제는 관리자만.
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
create policy "ai_apps_storage_insert_admin" on storage.objects
  for insert with check (bucket_id = 'ai-apps' and public.is_admin());
create policy "ai_apps_storage_delete_admin" on storage.objects
  for delete using (bucket_id = 'ai-apps' and public.is_admin());
