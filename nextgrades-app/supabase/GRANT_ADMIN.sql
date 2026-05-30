-- Grant admin access to the platform owner (run once in Supabase SQL Editor)
-- Paste in: https://supabase.com/dashboard/project/pzavnfdhctsrhzesdvfd/sql/new
--
-- 1) Replace the email below with YOUR login email
-- 2) Run the script
-- 3) Log out of NextGrades and log back in
-- 4) Open: http://localhost:3000/dashboard/admin

-- Preview which account will be updated
SELECT id, email, full_name, role
FROM public.profiles
WHERE email = 'YOUR_EMAIL@example.com';

-- Promote to admin
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE email = 'YOUR_EMAIL@example.com';

-- Confirm
SELECT id, email, full_name, role
FROM public.profiles
WHERE email = 'YOUR_EMAIL@example.com';
