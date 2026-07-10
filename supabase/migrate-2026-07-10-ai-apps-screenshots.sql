-- 마이그레이션: "AI로 만든 앱"에 카드뉴스 미리보기 이미지(앱 화면·결과물 화면) 추가
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요.
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(이 내용이 이미 포함됨)를 실행하면 됩니다.

-- 미리보기 이미지를 담을 공개 버킷. public=true라 로그인 없이도 바로
-- 보인다 — 배포 파일이 들어가는 'ai-apps'(비공개) 버킷과는 목적이 달라
-- 분리했다. 업로드·삭제는 관리자만 가능하다(아래 정책).
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values ('ai-app-images', 'ai-app-images', true, array['image/jpeg', 'image/png', 'image/webp'], 10485760)
on conflict (id) do update set
  public = true,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
  file_size_limit = 10485760;

drop policy if exists "ai_app_images_insert_admin" on storage.objects;
create policy "ai_app_images_insert_admin" on storage.objects
  for insert with check (bucket_id = 'ai-app-images' and public.is_admin());
drop policy if exists "ai_app_images_delete_admin" on storage.objects;
create policy "ai_app_images_delete_admin" on storage.objects
  for delete using (bucket_id = 'ai-app-images' and public.is_admin());

alter table public.ai_apps add column if not exists screenshot_app_path text;
alter table public.ai_apps add column if not exists screenshot_result_path text;
