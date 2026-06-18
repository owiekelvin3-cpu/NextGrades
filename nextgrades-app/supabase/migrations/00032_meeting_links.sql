-- Manual meeting links (replaces Zoom OAuth automation)
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS meeting_provider TEXT
    CHECK (
      meeting_provider IS NULL
      OR meeting_provider IN ('zoom', 'google_meet', 'microsoft_teams', 'external')
    ),
  ADD COLUMN IF NOT EXISTS meeting_verified BOOLEAN NOT NULL DEFAULT false;

-- Backfill from legacy zoom_link columns
UPDATE public.lessons
SET
  meeting_url = COALESCE(meeting_url, zoom_link),
  meeting_provider = CASE
    WHEN meeting_provider IS NOT NULL THEN meeting_provider
    WHEN zoom_link ILIKE '%zoom.us%' OR zoom_link ILIKE '%zoom.com%' THEN 'zoom'
    WHEN zoom_link ILIKE '%meet.google.com%' THEN 'google_meet'
    WHEN zoom_link ILIKE '%teams.microsoft.com%' OR zoom_link ILIKE '%teams.live.com%' THEN 'microsoft_teams'
    WHEN zoom_link IS NOT NULL THEN 'external'
    ELSE NULL
  END,
  meeting_verified = CASE
    WHEN meeting_verified = true THEN true
    WHEN zoom_link IS NOT NULL AND zoom_link LIKE 'https://%' THEN true
    ELSE meeting_verified
  END
WHERE zoom_link IS NOT NULL AND meeting_url IS NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_meeting_url
  ON public.lessons (meeting_url)
  WHERE meeting_url IS NOT NULL;

COMMENT ON COLUMN public.lessons.meeting_url IS 'Teacher-pasted HTTPS video meeting link (Zoom, Meet, Teams, etc.)';
COMMENT ON COLUMN public.lessons.meeting_provider IS 'Detected provider: zoom, google_meet, microsoft_teams, external';
COMMENT ON COLUMN public.lessons.meeting_verified IS 'True when meeting_url passed server-side HTTPS validation';
