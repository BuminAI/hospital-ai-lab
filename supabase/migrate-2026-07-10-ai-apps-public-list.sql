-- 마이그레이션: "AI로 만든 앱" 목록(제목·설명)을 비회원에게도 공개
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요.
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(이 내용이 이미 포함됨)를 실행하면 됩니다.
--
-- 바뀌는 것: 지금까지는 로그인+동의 완료한 회원만 목록을 볼 수 있었다.
-- 이제 목록(제목·설명)은 비회원도 볼 수 있고, 실제 파일 다운로드만
-- 로그인+동의 완료 회원으로 제한한다(storage.objects 정책은 그대로라
-- 이 마이그레이션으로 다운로드 가능 범위는 바뀌지 않는다).
drop policy if exists "ai_apps_select_member_or_admin" on public.ai_apps;
drop policy if exists "ai_apps_select_published_or_admin" on public.ai_apps;

create policy "ai_apps_select_published_or_admin" on public.ai_apps
  for select using (public.is_admin() or published);
