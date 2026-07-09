-- Guest checkout account setup requests (paid, awaiting manual account creation).

CREATE TABLE IF NOT EXISTS public.guest_account_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  parent_name TEXT,
  notes TEXT,
  subject_slug TEXT,
  subject_name TEXT,
  grade TEXT,
  semester TEXT,
  plan_id TEXT,
  payment_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_account_requests_email
  ON public.guest_account_requests (email);

ALTER TABLE public.guest_account_requests ENABLE ROW LEVEL SECURITY;
