-- Align catalog with marketing /subjects page (Fächer)

INSERT INTO public.subjects (name, slug, sort_order, is_active)
SELECT v.name, v.slug, v.sort_order, true
FROM (VALUES
  ('Französisch', 'french', 4, true),
  ('Italienisch', 'italian', 5, true),
  ('Latein', 'latin', 6, true),
  ('Biologie', 'biology', 9, true),
  ('Rechnungswesen', 'accounting', 10, true),
  ('Betriebswirtschaft', 'business-admin', 11, true)
) AS v(name, slug, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.subjects s WHERE s.slug = v.slug);

UPDATE public.subjects SET name = 'Mathematik', slug = 'math', sort_order = 1, is_active = true
WHERE slug = 'math' OR lower(name) LIKE '%mathem%';

UPDATE public.subjects SET name = 'Deutsch', slug = 'german', sort_order = 2, is_active = true
WHERE slug = 'german' OR lower(name) LIKE '%deutsch%';

UPDATE public.subjects SET name = 'Englisch', slug = 'english', sort_order = 3, is_active = true
WHERE slug = 'english' OR lower(name) LIKE '%englisch%';

UPDATE public.subjects SET sort_order = 7, is_active = true WHERE slug = 'chemistry';
UPDATE public.subjects SET sort_order = 8, is_active = true WHERE slug = 'physics';
