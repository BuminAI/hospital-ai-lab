-- 마이그레이션: 관리자 로그인 통합 (GitHub 토큰을 서버에 안전하게 보관)
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요.
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(이 내용이 이미 포함됨)를 실행하면 됩니다.

-- GitHub 토큰 등 관리자 전용 비밀값을 담는 테이블. 사이트 코드(공개 정적
-- 파일)에는 절대 넣지 않고 여기 서버(Supabase)에만 저장한다. RLS로
-- 관리자 계정만 읽고 쓸 수 있게 막아 둔다 — 일반 방문자·회원은 조회 자체가
-- 안 된다(같은 코드가 실행돼도 결과가 빈 값으로 온다).
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
