-- Allow a library material to belong to more than one grade.
ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS class_ids UUID[] NOT NULL DEFAULT '{}';

UPDATE public.materials
SET class_ids = ARRAY[class_id]
WHERE class_id IS NOT NULL
  AND cardinality(class_ids) = 0;

CREATE INDEX IF NOT EXISTS materials_class_ids_gin
  ON public.materials
  USING GIN (class_ids);
