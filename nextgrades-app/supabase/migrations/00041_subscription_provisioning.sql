-- Subscription plan metadata on profiles + guest request fulfillment tracking.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
  ADD COLUMN IF NOT EXISTS subscription_billing TEXT,
  ADD COLUMN IF NOT EXISTS subscription_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

COMMENT ON COLUMN public.profiles.subscription_plan IS 'Paid plan: resource, group, premium';
COMMENT ON COLUMN public.profiles.subscription_billing IS 'Billing cycle: monthly, yearly';
COMMENT ON COLUMN public.profiles.subscription_ends_at IS 'When paid access expires; null = legacy unlimited active';

ALTER TABLE public.guest_account_requests
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'payment_received',
  ADD COLUMN IF NOT EXISTS billing TEXT,
  ADD COLUMN IF NOT EXISTS subject_id UUID,
  ADD COLUMN IF NOT EXISTS class_id UUID,
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fulfilled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_guest_account_requests_status
  ON public.guest_account_requests (status, created_at DESC);
