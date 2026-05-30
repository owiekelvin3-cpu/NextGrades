-- Minimal RLS fix — run this first if the full migration bundle fails.
-- Paste in: https://supabase.com/dashboard/project/pzavnfdhctsrhzesdvfd/sql/new

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), '') = 'admin'; $$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), '') = 'teacher'; $$;

CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), '') IN ('teacher', 'admin'); $$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), '') = 'student'; $$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_teacher() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_teacher_or_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_student() TO authenticated, anon;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- subjects & classes
CREATE POLICY subjects_select_active ON public.subjects FOR SELECT USING (is_active = TRUE);
CREATE POLICY subjects_admin_all ON public.subjects FOR ALL USING (public.is_admin());
CREATE POLICY classes_select_all ON public.classes FOR SELECT USING (TRUE);
CREATE POLICY classes_admin_all ON public.classes FOR ALL USING (public.is_admin());

-- materials
CREATE POLICY materials_select_free ON public.materials FOR SELECT USING (is_premium = FALSE);
CREATE POLICY materials_select_premium ON public.materials FOR SELECT USING (
  is_premium = FALSE OR public.is_admin() OR public.is_teacher()
  OR EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.student_id = auth.uid() AND e.subject_id = materials.subject_id
      AND (e.class_id = materials.class_id OR materials.class_id IS NULL)
      AND (e.semester = materials.semester OR materials.semester IS NULL)
      AND e.status = 'active'
  )
);
CREATE POLICY materials_teacher_manage ON public.materials FOR ALL USING (public.is_teacher_or_admin());

-- enrollments, lessons, units, stats, logs, notifications, testimonials
CREATE POLICY enrollments_select_own ON public.enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY enrollments_select_teacher ON public.enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lessons l WHERE l.teacher_id = auth.uid() AND l.student_id = enrollments.student_id)
);
CREATE POLICY enrollments_admin_all ON public.enrollments FOR ALL USING (public.is_admin());
CREATE POLICY lessons_select_student ON public.lessons FOR SELECT USING (student_id = auth.uid());
CREATE POLICY lessons_teacher_all ON public.lessons FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY lessons_admin_all ON public.lessons FOR ALL USING (public.is_admin());
CREATE POLICY user_units_select_own ON public.user_units FOR SELECT USING (student_id = auth.uid());
CREATE POLICY user_units_admin_all ON public.user_units FOR ALL USING (public.is_admin());
CREATE POLICY teacher_stats_select_own ON public.teacher_stats FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY teacher_stats_admin_all ON public.teacher_stats FOR ALL USING (public.is_admin());
CREATE POLICY activity_logs_select_own ON public.activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY activity_logs_select_admin ON public.activity_logs FOR SELECT USING (public.is_admin());
CREATE POLICY notifications_select_own ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY testimonials_select_active ON public.testimonials FOR SELECT USING (is_active = TRUE);
CREATE POLICY testimonials_admin_all ON public.testimonials FOR ALL USING (public.is_admin());

-- CMS
CREATE POLICY cms_media_admin ON public.cms_media FOR ALL USING (public.is_admin());
CREATE POLICY cms_sections_select_active ON public.cms_sections FOR SELECT USING (is_active = TRUE);
CREATE POLICY cms_sections_admin ON public.cms_sections FOR ALL USING (public.is_admin());
CREATE POLICY cms_content_select_all ON public.cms_content FOR SELECT USING (TRUE);
CREATE POLICY cms_content_admin ON public.cms_content FOR ALL USING (public.is_admin());
CREATE POLICY cms_testimonials_select_active ON public.cms_testimonials FOR SELECT USING (is_active = TRUE);
CREATE POLICY cms_testimonials_admin ON public.cms_testimonials FOR ALL USING (public.is_admin());
CREATE POLICY cms_team_select_active ON public.cms_team FOR SELECT USING (is_active = TRUE);
CREATE POLICY cms_team_admin ON public.cms_team FOR ALL USING (public.is_admin());
CREATE POLICY cms_faqs_select_active ON public.cms_faqs FOR SELECT USING (is_active = TRUE);
CREATE POLICY cms_faqs_admin ON public.cms_faqs FOR ALL USING (public.is_admin());
CREATE POLICY cms_seo_select_all ON public.cms_seo FOR SELECT USING (TRUE);
CREATE POLICY cms_seo_admin ON public.cms_seo FOR ALL USING (public.is_admin());

ALTER TABLE public.cms_content ADD COLUMN IF NOT EXISTS i18n_key TEXT;
UPDATE public.cms_content SET i18n_key = field_key WHERE i18n_key IS NULL AND field_key IS NOT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
