-- Backfill storage_path from legacy public URLs after resources bucket went private.
-- Safe to re-run. Run in Supabase SQL Editor after 00017_pdf_alignment.sql.

UPDATE public.materials
SET storage_path = regexp_replace(
  url,
  '.*/storage/v1/object/public/resources/(.+)$',
  '\1'
)
WHERE storage_path IS NULL
  AND url ~ '.*/storage/v1/object/public/resources/.+';

-- Optional: clear stale public URLs once storage_path is set
UPDATE public.materials
SET url = NULL
WHERE storage_path IS NOT NULL
  AND url ~ '.*/storage/v1/object/public/resources/.+';

SELECT id, title, storage_path, left(url, 80) AS url_preview
FROM public.materials
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;
