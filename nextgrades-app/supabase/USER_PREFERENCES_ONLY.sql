-- Theme + language columns — run in Supabase SQL Editor if not applied yet.
-- Paste in: https://supabase.com/dashboard/project/pzavnfdhctsrhzesdvfd/sql/new

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ui_theme TEXT DEFAULT 'dark' CHECK (ui_theme IN ('light', 'dark')),
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'de'));

COMMENT ON COLUMN public.profiles.ui_theme IS 'User interface theme: light or dark';
COMMENT ON COLUMN public.profiles.preferred_language IS 'User interface language: en or de';
