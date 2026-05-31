-- Zoom OAuth connections (server-only via service role)
CREATE TABLE IF NOT EXISTS public.teacher_zoom_connections (
  teacher_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  zoom_user_id TEXT NOT NULL,
  zoom_email TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.teacher_zoom_connections ENABLE ROW LEVEL SECURITY;

-- No policies: only service role accesses tokens

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS meeting_title TEXT,
  ADD COLUMN IF NOT EXISTS meeting_description TEXT,
  ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'private_session'
    CHECK (meeting_type IN ('live_class', 'webinar', 'private_session', 'group_session')),
  ADD COLUMN IF NOT EXISTS zoom_passcode TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Berlin';

CREATE INDEX IF NOT EXISTS idx_lessons_zoom_meeting_id ON public.lessons(zoom_meeting_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_start ON public.lessons(teacher_id, start_time);
CREATE INDEX IF NOT EXISTS idx_lessons_student_start ON public.lessons(student_id, start_time);

COMMENT ON TABLE public.teacher_zoom_connections IS 'Zoom OAuth tokens for teachers — service role access only';
