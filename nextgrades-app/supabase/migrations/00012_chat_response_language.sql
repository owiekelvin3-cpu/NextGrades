-- AI chat response language preference (de = German default, en = English)
ALTER TABLE public.chatbot_preferences
  ADD COLUMN IF NOT EXISTS response_language TEXT NOT NULL DEFAULT 'de'
  CHECK (response_language IN ('de', 'en'));

COMMENT ON COLUMN public.chatbot_preferences.response_language IS 'Preferred language for AI assistant replies';
