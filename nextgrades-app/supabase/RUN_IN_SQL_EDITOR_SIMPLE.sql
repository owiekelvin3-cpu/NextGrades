-- Optional one-time fix (only if npm run db:backfill-storage is not used)
-- Supabase Dashboard → SQL Editor → New query → paste all → Run

UPDATE public.materials
SET storage_path = regexp_replace(
  url,
  '.*/storage/v1/object/public/resources/(.+)$',
  '\1'
)
WHERE storage_path IS NULL
  AND url ~ '.*/storage/v1/object/public/resources/.+';

SELECT id, title, storage_path FROM public.materials WHERE status = 'published';
