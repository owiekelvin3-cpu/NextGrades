-- Teachers need to see student names when scheduling a lesson.
CREATE POLICY profiles_select_teacher_students
ON public.profiles
FOR SELECT
TO authenticated
USING (
  role = 'student'
  AND public.is_teacher_or_admin()
);
