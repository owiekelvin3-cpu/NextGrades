-- OTP verification for signup (pending registrations) and login challenges.

ALTER TABLE public.pending_registrations
  ADD COLUMN IF NOT EXISTS otp_hash TEXT,
  ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.login_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_otp_challenges_email
  ON public.login_otp_challenges (email);

CREATE INDEX IF NOT EXISTS idx_login_otp_challenges_expires
  ON public.login_otp_challenges (expires_at);

ALTER TABLE public.login_otp_challenges ENABLE ROW LEVEL SECURITY;
