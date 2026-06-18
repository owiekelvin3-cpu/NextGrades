-- Login OTP + trusted devices (idempotent)

CREATE TABLE IF NOT EXISTS public.login_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.login_otp_challenges
  ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_login_otp_challenges_email
  ON public.login_otp_challenges (email);

CREATE INDEX IF NOT EXISTS idx_login_otp_challenges_expires
  ON public.login_otp_challenges (expires_at);

CREATE INDEX IF NOT EXISTS idx_login_otp_challenges_user
  ON public.login_otp_challenges (user_id, created_at DESC);

ALTER TABLE public.login_otp_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS login_otp_service_all ON public.login_otp_challenges;
CREATE POLICY login_otp_service_all ON public.login_otp_challenges
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.user_trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  device_label TEXT,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_trusted_devices_token
  ON public.user_trusted_devices (token_hash);

CREATE INDEX IF NOT EXISTS idx_user_trusted_devices_user
  ON public.user_trusted_devices (user_id, expires_at DESC);

ALTER TABLE public.user_trusted_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_trusted_devices_service ON public.user_trusted_devices;
CREATE POLICY user_trusted_devices_service ON public.user_trusted_devices
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
