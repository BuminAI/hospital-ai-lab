-- 마이그레이션: 구글·카카오 로그인 지원 추가
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요. (전부 재실행해도 안전하지만
-- "already exists" 오류가 나면 이 파일만 실행하면 됩니다)
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(v3, 이 내용이 이미 포함됨)를 실행하면 됩니다.

-- 이름 필드 후보를 여러 개 시도하도록 갱신 (구글·카카오는 필드 키가 다름)
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

-- 구글·카카오 최초 로그인 시 로그인 화면에서 동의를 받은 뒤 호출하는 함수
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
