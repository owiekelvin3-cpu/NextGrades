-- Admin-invited users must set their own password before using the app.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_setup_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS password_set_at timestamptz;

COMMENT ON COLUMN public.profiles.password_setup_required IS
  'When true, user must complete /reset-password via invitation link before dashboard access or password login.';
COMMENT ON COLUMN public.profiles.password_set_at IS
  'Timestamp when the user chose their own password (admin invite or reset flow).';
