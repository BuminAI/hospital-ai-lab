-- 마이그레이션: "AI로 만든 앱" 카드뉴스 섹션 추가 (회원 전용, 이미지 다운로드)
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요.
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(이 내용이 이미 포함됨)를 실행하면 됩니다.

-- 이미지 파일을 담을 비공개 버킷. public=false이므로 URL을 알아도
-- 로그인 없이는 파일을 받을 수 없다(아래 storage.objects 정책이 실제 방어선).
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('ai-apps', 'ai-apps', false, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- 카드 메타데이터(제목, 이미지 경로)
create table if not exists public.ai_apps (
  id bigint generated always as identity primary key,
  title text not null,
  storage_path text not null,        -- ai-apps 버킷 안의 경로
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.ai_apps enable row level security;

-- 목록 조회: 관리자 또는 (동의 완료한) 회원만, 공개된 카드만
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
create policy "ai_apps_insert_admin" on public.ai_apps
  for insert with check (public.is_admin());
create policy "ai_apps_update_admin" on public.ai_apps
  for update using (public.is_admin());
create policy "ai_apps_delete_admin" on public.ai_apps
  for delete using (public.is_admin());

-- 이미지 파일 자체의 접근 권한 (진짜 방어선 — 파일 URL을 알아도 이 정책을
-- 통과 못 하면 다운로드할 수 없다). 조회는 회원·관리자, 업로드·삭제는 관리자만.
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
