-- 마이그레이션: 직접 가입 시 "소속 기관 이메일" 항목 추가 (방문자 통계 파악 목적)
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요.
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(이 내용이 이미 포함됨)를 실행하면 됩니다.

alter table public.profiles add column if not exists org_email text;

grant update (name, gender, birth_date, phone, org_email) on public.profiles to authenticated;

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
