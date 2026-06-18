-- Verify-before-create: hold signup data until email link is confirmed.

CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_secret TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_token_hash
  ON public.pending_registrations (token_hash);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires
  ON public.pending_registrations (expires_at);

ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Service role only (API routes use admin client).
