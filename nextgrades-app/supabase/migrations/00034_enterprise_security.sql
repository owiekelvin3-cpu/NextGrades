-- Enterprise security: CMS draft isolation, Stripe webhook idempotency, registration OTP hash support

-- ── CMS: remove public full-table read; admins retain full access ──────────
DROP POLICY IF EXISTS cms_content_select_all ON public.cms_content;
DROP POLICY IF EXISTS "Everyone can view content" ON public.cms_content;

CREATE POLICY cms_content_admin_manage ON public.cms_content
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Published-only view for anon/authenticated direct reads (no draft_json column)
CREATE OR REPLACE VIEW public.cms_content_published AS
SELECT
  id,
  section_id,
  field_key,
  field_name,
  field_type,
  content_value,
  content_json,
  is_required,
  placeholder,
  help_text,
  sort_order,
  i18n_key,
  published_at,
  updated_at,
  created_at
FROM public.cms_content;

GRANT SELECT ON public.cms_content_published TO anon, authenticated;

-- ── Stripe webhook idempotency ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY stripe_webhook_events_service ON public.stripe_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Registration OTP: store hashed codes (code column holds sha256 hex) ─────
COMMENT ON COLUMN public.registration_otps.code IS 'SHA-256 hash of OTP (never store plaintext in new rows)';
