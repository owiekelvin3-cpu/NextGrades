-- Scale readiness: enrollment indexes + O(1) auth email lookup (no listUsers scans)

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_subject_class
  ON public.enrollments(student_id, subject_id, class_id);

CREATE OR REPLACE FUNCTION public.auth_user_id_by_email(check_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(email) = lower(trim(check_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.auth_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_id_by_email(text) TO service_role;
