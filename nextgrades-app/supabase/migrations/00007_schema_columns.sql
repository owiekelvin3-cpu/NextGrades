-- Schema drift fixes referenced by application code

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

ALTER TABLE public.cms_content
  ADD COLUMN IF NOT EXISTS i18n_key TEXT;

CREATE INDEX IF NOT EXISTS idx_cms_content_i18n_key ON public.cms_content(i18n_key) WHERE i18n_key IS NOT NULL;

COMMENT ON COLUMN public.profiles.learning_goal IS 'Student learning goal shown on dashboard overview';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Membership state: inactive, active, canceled, past_due';
COMMENT ON COLUMN public.cms_content.i18n_key IS 'i18n key for CMS field overrides';
