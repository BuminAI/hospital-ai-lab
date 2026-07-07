-- 마이그레이션: 관리자 대시보드에서 회원을 직접 삭제하는 기능 추가
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요.
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(이 내용이 이미 포함됨)를 실행하면 됩니다.

-- 클라이언트(anon/authenticated 키)는 auth.users를 직접 지울 권한이 없다
-- (service_role 키가 필요한데, 그 키는 사이트 코드에 절대 넣으면 안 된다).
-- 대신 관리자만 실행 가능한 서버 함수를 만들어, 그 함수 "안에서"만
-- auth.users를 지우게 한다. auth.users를 지우면 profiles 등 연결된 행은
-- on delete cascade로 함께 정리된다.
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
