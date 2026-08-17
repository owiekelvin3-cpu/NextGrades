-- Count a prepaid Unterrichtseinheit after a linked meeting has actually ended.

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS units_consumed BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.lessons.units_consumed IS
  'True once this lesson has deducted one remaining_units from the student package.';

-- Past lessons were tracked by hand. Do not bill them again.
UPDATE public.lessons
SET units_consumed = TRUE
WHERE units_consumed = FALSE
  AND (
    status IN ('completed', 'cancelled', 'no_show')
    OR start_time + make_interval(mins => COALESCE(duration, 60)) < NOW()
  );

CREATE INDEX IF NOT EXISTS idx_lessons_units_due
  ON public.lessons (status, units_consumed, start_time)
  WHERE units_consumed = FALSE AND status = 'scheduled';
