-- 마이그레이션: "AI로 만든 앱"을 이미지 카드뉴스 → 실제 배포 파일로 확장
-- setup.sql을 이미 한 번 실행한 적이 있다면, 전체를 다시 실행하지 말고
-- 이 파일만 SQL Editor에 붙여넣어 실행하세요.
--
-- 아직 setup.sql을 한 번도 실행한 적이 없다면, 이 파일은 필요 없습니다.
-- setup.sql 전체(이 내용이 이미 포함됨)를 실행하면 됩니다.
--
-- 바뀌는 것: 카드에 설명(description)을 추가하고, jpg·png 이미지만 올리던
-- 제한을 풀어 zip·apk·exe·pdf 등 실제 배포 파일을 올릴 수 있게 한다.
-- 기존에 등록된 카드(이미지)는 그대로 유지되며 계속 다운로드된다.

alter table public.ai_apps add column if not exists description text;
alter table public.ai_apps add column if not exists file_name text;
alter table public.ai_apps add column if not exists file_size bigint;

-- 형식 제한 해제(zip·apk·exe·pdf 등 허용) + 용량 상한 200MB
-- (Supabase 요금제 자체 상한이 더 낮으면 그 값이 우선 적용된다)
update storage.buckets
set allowed_mime_types = null,
    file_size_limit = 209715200
where id = 'ai-apps';
