-- Grant admin to nextgrade377@gmail.com
-- Safe to run on a fresh or partial schema (adds missing columns first)
-- Supabase SQL Editor: https://supabase.com/dashboard/project/pzavnfdhctsrhzesdvfd/sql/new
--
-- If the auth user does not exist yet:
-- Authentication → Users → Add user → nextgrade377@gmail.com → Auto Confirm User

-- ── Ensure columns added by later migrations exist ─────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- ── Preview ─────────────────────────────────────────────────────────────────
SELECT u.id, u.email AS auth_email, p.role, p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'nextgrade377@gmail.com';

-- ── Create or update profile as admin ───────────────────────────────────────
INSERT INTO public.profiles (id, full_name, role, is_active)
SELECT id, 'NextGrades Admin', 'admin', true
FROM auth.users
WHERE email = 'nextgrade377@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = COALESCE(public.profiles.full_name, 'NextGrades Admin'),
  is_active = true,
  updated_at = now();

-- Sync email from auth.users (column now guaranteed to exist)
UPDATE public.profiles p
SET
  email = u.email,
  is_active = true,
  email_verified = COALESCE(p.email_verified, true),
  updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND u.email = 'nextgrade377@gmail.com';

-- ── Confirm ─────────────────────────────────────────────────────────────────
SELECT p.id, u.email, p.full_name, p.role, p.is_active
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'nextgrade377@gmail.com';
