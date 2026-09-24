-- Structured schedule fields for tutoring groups (admin group management).

ALTER TABLE public.tutoring_groups
  ADD COLUMN IF NOT EXISTS max_students INT,
  ADD COLUMN IF NOT EXISTS day_of_week INT CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS start_date DATE;
