-- Host start URL for teachers (join URL remains for students)
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS zoom_start_url TEXT;

COMMENT ON COLUMN public.lessons.zoom_start_url IS 'Zoom host start URL — teachers only, never expose to students';

CREATE INDEX IF NOT EXISTS idx_teacher_zoom_connections_email
  ON public.teacher_zoom_connections (zoom_email);
