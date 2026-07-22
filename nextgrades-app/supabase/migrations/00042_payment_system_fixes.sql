-- Payment system fixes: guest checkout before account-setup form, Stripe subscription tracking.

ALTER TABLE public.guest_account_requests
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Active Stripe subscription ID for renewals and cancellation sync';
