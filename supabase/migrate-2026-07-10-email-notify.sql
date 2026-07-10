-- 마이그레이션: 새 글 발행 이메일 알림
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요.
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(이 내용이 이미 포함됨)를 실행하면 됩니다.

alter table public.profiles
  add column if not exists email_notify_new_post boolean not null default false;
alter table public.profiles
  add column if not exists email_unsub_token uuid not null default gen_random_uuid();

grant update (name, gender, birth_date, phone, org_email, email_notify_new_post)
  on public.profiles to authenticated;

-- 가입 시 프로필 자동 생성 함수 — 최신판(email_notify_new_post 포함)
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

-- 이메일 안의 링크로 로그인 없이 수신거부 (표준 관행)
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
