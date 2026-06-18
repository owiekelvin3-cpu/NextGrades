-- Enterprise security: audit events, trusted devices, lockouts, login OTP hardening.

-- ── Security audit events ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.security_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  event_type TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_events_created
  ON public.security_audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_events_user
  ON public.security_audit_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_events_type
  ON public.security_audit_events (event_type, created_at DESC);

ALTER TABLE public.security_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read security audit events" ON public.security_audit_events;
CREATE POLICY "Admins read security audit events"
  ON public.security_audit_events FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Service role inserts security audit events" ON public.security_audit_events;
CREATE POLICY "Service role inserts security audit events"
  ON public.security_audit_events FOR INSERT
  WITH CHECK (true);

-- ── Trusted devices (remember this device) ───────────────────────────────────
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

DROP POLICY IF EXISTS "Users read own trusted devices" ON public.user_trusted_devices;
CREATE POLICY "Users read own trusted devices"
  ON public.user_trusted_devices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read trusted devices" ON public.user_trusted_devices;
CREATE POLICY "Admins read trusted devices"
  ON public.user_trusted_devices FOR SELECT
  USING (public.is_admin());

-- ── Login / signup lockouts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auth_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_lockouts_email_ip
  ON public.auth_lockouts (LOWER(email), COALESCE(ip_address, ''));

ALTER TABLE public.auth_lockouts ENABLE ROW LEVEL SECURITY;

-- ── Harden login OTP challenges ──────────────────────────────────────────────
ALTER TABLE public.login_otp_challenges
  ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_login_otp_challenges_user
  ON public.login_otp_challenges (user_id, created_at DESC);

-- ── Session activity tracking ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_label TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user
  ON public.user_sessions (user_id, last_seen_at DESC);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own sessions" ON public.user_sessions;
CREATE POLICY "Users read own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all sessions" ON public.user_sessions;
CREATE POLICY "Admins read all sessions"
  ON public.user_sessions FOR SELECT
  USING (public.is_admin());
