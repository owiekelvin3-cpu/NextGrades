-- PDF alignment: private resource storage, subject catalog, class levels

ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS subjects_slug_key ON public.subjects (slug) WHERE slug IS NOT NULL;

ALTER TABLE public.materials ALTER COLUMN url DROP NOT NULL;

-- Eight core subjects from product spec
INSERT INTO public.subjects (name, slug, sort_order, is_active)
SELECT v.name, v.slug, v.sort_order, v.is_active
FROM (VALUES
  ('Mathematics', 'math', 1, true),
  ('English', 'english', 2, true),
  ('German', 'german', 3, true),
  ('Physics', 'physics', 4, true),
  ('Chemistry', 'chemistry', 5, true),
  ('Business Studies', 'business', 6, true),
  ('Computer Science', 'computer-science', 7, true),
  ('Technical Drawing', 'technical-drawing', 8, true)
) AS v(name, slug, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.subjects s WHERE s.slug = v.slug);

UPDATE public.subjects SET slug = 'math', sort_order = 1 WHERE slug IS NULL AND (sort_order = 1 OR lower(name) LIKE '%math%' OR lower(name) LIKE '%mathem%');
UPDATE public.subjects SET slug = 'english', sort_order = 2 WHERE slug IS NULL AND (sort_order = 2 OR lower(name) LIKE '%english%' OR lower(name) LIKE '%englisch%');
UPDATE public.subjects SET slug = 'german', sort_order = 3 WHERE slug IS NULL AND (sort_order = 3 OR lower(name) LIKE '%german%' OR lower(name) LIKE '%deutsch%');
UPDATE public.subjects SET slug = 'physics', sort_order = 4 WHERE slug IS NULL AND (sort_order = 4 OR lower(name) LIKE '%phys%');
UPDATE public.subjects SET slug = 'chemistry', sort_order = 5 WHERE slug IS NULL AND (sort_order = 5 OR lower(name) LIKE '%chem%');
UPDATE public.subjects SET slug = 'business', sort_order = 6 WHERE slug IS NULL AND (sort_order = 6 OR lower(name) LIKE '%business%' OR lower(name) LIKE '%wirtschaft%' OR lower(name) LIKE '%bwl%');
UPDATE public.subjects SET slug = 'computer-science', sort_order = 7 WHERE slug IS NULL AND (sort_order = 7 OR lower(name) LIKE '%computer%' OR lower(name) LIKE '%informatik%');
UPDATE public.subjects SET slug = 'technical-drawing', sort_order = 8 WHERE slug IS NULL AND (sort_order = 8 OR lower(name) LIKE '%technical%' OR lower(name) LIKE '%technisch%' OR lower(name) LIKE '%zeichnen%');

INSERT INTO public.classes (name, level)
SELECT 'Grade ' || g, g FROM generate_series(1, 12) AS g
WHERE NOT EXISTS (SELECT 1 FROM public.classes c WHERE c.level = g);

-- Premium files must not be served from a public bucket
UPDATE storage.buckets SET public = false WHERE id = 'resources';

DROP POLICY IF EXISTS resources_public_read ON storage.objects;

DROP POLICY IF EXISTS resources_teacher_read ON storage.objects;
CREATE POLICY resources_teacher_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );

DROP POLICY IF EXISTS thumbnails_public_read ON storage.objects;
CREATE POLICY thumbnails_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'resource-thumbnails');
