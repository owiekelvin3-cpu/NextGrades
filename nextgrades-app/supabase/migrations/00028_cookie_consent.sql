-- Cookie consent audit records + admin configuration
CREATE TABLE IF NOT EXISTS public.cookie_consent_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  policy_version text NOT NULL DEFAULT '1.0',
  analytics_enabled boolean NOT NULL DEFAULT true,
  marketing_enabled boolean NOT NULL DEFAULT false,
  functional_enabled boolean NOT NULL DEFAULT true,
  google_analytics_id text,
  analytics_script_url text,
  marketing_script_url text,
  cookie_max_age_days int NOT NULL DEFAULT 365,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.cookie_consent_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.cookie_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id text NOT NULL,
  preferences jsonb NOT NULL,
  action text NOT NULL CHECK (action IN ('accept_all', 'reject_non_essential', 'custom', 'withdraw')),
  locale text,
  policy_version text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cookie_consent_records_created_at_idx
  ON public.cookie_consent_records (created_at DESC);

CREATE INDEX IF NOT EXISTS cookie_consent_records_consent_id_idx
  ON public.cookie_consent_records (consent_id);

ALTER TABLE public.cookie_consent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consent_records ENABLE ROW LEVEL SECURITY;

-- Public read settings (no secrets beyond GA id which is public in browser anyway)
CREATE POLICY cookie_consent_settings_public_read ON public.cookie_consent_settings
  FOR SELECT USING (true);

-- Anyone can insert consent records (anonymous audit)
CREATE POLICY cookie_consent_records_insert ON public.cookie_consent_records
  FOR INSERT WITH CHECK (true);

-- Admins read all records
CREATE POLICY cookie_consent_records_admin_read ON public.cookie_consent_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY cookie_consent_settings_admin_update ON public.cookie_consent_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
