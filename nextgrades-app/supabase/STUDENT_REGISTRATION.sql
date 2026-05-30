-- Student registration enhancements
-- Run this entire script in Supabase SQL Editor (Dashboard → SQL → New query)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL AND username <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique
  ON public.profiles (LOWER(email))
  WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS public.student_registration_details (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  school_name TEXT,
  current_grade TEXT,
  education_level TEXT CHECK (education_level IN ('primary', 'secondary', 'university', 'other')),
  preferred_subjects TEXT[] DEFAULT '{}',
  learning_goals TEXT,
  academic_interests TEXT,
  country TEXT,
  state_province TEXT,
  city TEXT,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registration_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registration_otps_email ON public.registration_otps (LOWER(email), created_at DESC);

CREATE TABLE IF NOT EXISTS public.registration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_registration_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_details_own ON public.student_registration_details;
CREATE POLICY student_details_own ON public.student_registration_details
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS student_details_admin ON public.student_registration_details;
CREATE POLICY student_details_admin ON public.student_registration_details
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS registration_logs_admin ON public.registration_logs;
CREATE POLICY registration_logs_admin ON public.registration_logs
  FOR SELECT USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, first_name, last_name, middle_name, username,
    role, avatar_url, phone, gender, date_of_birth, email_verified, signup_source
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'middle_name',
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::DATE,
    COALESCE((NEW.raw_user_meta_data->>'email_verified')::BOOLEAN, NEW.email_confirmed_at IS NOT NULL),
    COALESCE(NEW.raw_user_meta_data->>'signup_source', 'email')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.user_units (student_id) VALUES (NEW.id)
    ON CONFLICT (student_id) DO NOTHING;
  ELSIF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_stats (teacher_id) VALUES (NEW.id)
    ON CONFLICT (teacher_id) DO NOTHING;
  END IF;

  INSERT INTO public.user_activity_log (user_id, action, metadata)
  VALUES (NEW.id, 'signup', jsonb_build_object('email', NEW.email));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
