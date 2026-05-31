-- Run in Supabase SQL Editor if migration 00024 was not applied yet
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS zoom_start_url TEXT;

COMMENT ON COLUMN public.lessons.zoom_start_url IS 'Zoom host start URL — teachers only';
