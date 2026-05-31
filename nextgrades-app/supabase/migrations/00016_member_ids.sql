-- Human-readable member IDs on profiles (STU-2026-XXXX / TCH-2026-XXXX)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_id TEXT,
  ADD COLUMN IF NOT EXISTS teacher_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_student_id_unique
  ON public.profiles (student_id)
  WHERE student_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_teacher_id_unique
  ON public.profiles (teacher_id)
  WHERE teacher_id IS NOT NULL;
