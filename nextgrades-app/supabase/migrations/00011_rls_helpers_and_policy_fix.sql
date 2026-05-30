-- Fix infinite recursion in RLS policies and reset policies to use SECURITY DEFINER helpers.
-- Run after base migrations (00001–00010). Safe to re-run: drops and recreates public policies.

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    ''
  ) = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    ''
  ) = 'teacher';
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    ''
  ) IN ('teacher', 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    ''
  ) = 'student';
$$;

GRANT EXECUTE ON FUNCTION public.auth_user_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_teacher() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_teacher_or_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_student() TO authenticated, anon;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- subjects
CREATE POLICY subjects_select_active ON public.subjects
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY subjects_admin_all ON public.subjects
  FOR ALL USING (public.is_admin());

-- classes
CREATE POLICY classes_select_all ON public.classes
  FOR SELECT USING (TRUE);

CREATE POLICY classes_admin_all ON public.classes
  FOR ALL USING (public.is_admin());

-- materials
CREATE POLICY materials_select_free ON public.materials
  FOR SELECT USING (is_premium = FALSE);

CREATE POLICY materials_select_premium ON public.materials
  FOR SELECT USING (
    is_premium = FALSE
    OR public.is_admin()
    OR public.is_teacher()
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.student_id = auth.uid()
        AND e.subject_id = materials.subject_id
        AND (e.class_id = materials.class_id OR materials.class_id IS NULL)
        AND (e.semester = materials.semester OR materials.semester IS NULL)
        AND e.status = 'active'
    )
  );

CREATE POLICY materials_teacher_manage ON public.materials
  FOR ALL USING (public.is_teacher_or_admin());

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'materials'
      AND column_name = 'status'
  ) THEN
    EXECUTE $p$
      CREATE POLICY materials_public_published ON public.materials
        FOR SELECT USING (
          status = 'published'
          AND moderation_status = 'approved'
        )
    $p$;
  END IF;
END $$;

-- enrollments
CREATE POLICY enrollments_select_own ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY enrollments_select_teacher ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.teacher_id = auth.uid()
        AND l.student_id = enrollments.student_id
    )
  );

CREATE POLICY enrollments_admin_all ON public.enrollments
  FOR ALL USING (public.is_admin());

-- lessons
CREATE POLICY lessons_select_student ON public.lessons
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY lessons_teacher_all ON public.lessons
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY lessons_admin_all ON public.lessons
  FOR ALL USING (public.is_admin());

-- user_units
CREATE POLICY user_units_select_own ON public.user_units
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY user_units_admin_all ON public.user_units
  FOR ALL USING (public.is_admin());

-- teacher_stats
CREATE POLICY teacher_stats_select_own ON public.teacher_stats
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY teacher_stats_admin_all ON public.teacher_stats
  FOR ALL USING (public.is_admin());

-- activity_logs
CREATE POLICY activity_logs_select_own ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY activity_logs_select_admin ON public.activity_logs
  FOR SELECT USING (public.is_admin());

-- notifications
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- testimonials (app table)
CREATE POLICY testimonials_select_active ON public.testimonials
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY testimonials_admin_all ON public.testimonials
  FOR ALL USING (public.is_admin());

-- user_activity_log
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_activity_log'
  ) THEN
    EXECUTE $p$
      CREATE POLICY user_activity_log_select_own ON public.user_activity_log
        FOR SELECT USING (auth.uid() = user_id)
    $p$;
    EXECUTE $p$
      CREATE POLICY user_activity_log_select_admin ON public.user_activity_log
        FOR SELECT USING (public.is_admin())
    $p$;
    EXECUTE $p$
      CREATE POLICY user_activity_log_insert ON public.user_activity_log
        FOR INSERT WITH CHECK (true)
    $p$;
  END IF;
END $$;

-- CMS tables
CREATE POLICY cms_media_admin ON public.cms_media
  FOR ALL USING (public.is_admin());

CREATE POLICY cms_sections_select_active ON public.cms_sections
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY cms_sections_admin ON public.cms_sections
  FOR ALL USING (public.is_admin());

CREATE POLICY cms_content_select_all ON public.cms_content
  FOR SELECT USING (TRUE);

CREATE POLICY cms_content_admin ON public.cms_content
  FOR ALL USING (public.is_admin());

CREATE POLICY cms_testimonials_select_active ON public.cms_testimonials
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY cms_testimonials_admin ON public.cms_testimonials
  FOR ALL USING (public.is_admin());

CREATE POLICY cms_team_select_active ON public.cms_team
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY cms_team_admin ON public.cms_team
  FOR ALL USING (public.is_admin());

CREATE POLICY cms_faqs_select_active ON public.cms_faqs
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY cms_faqs_admin ON public.cms_faqs
  FOR ALL USING (public.is_admin());

CREATE POLICY cms_seo_select_all ON public.cms_seo
  FOR SELECT USING (TRUE);

CREATE POLICY cms_seo_admin ON public.cms_seo
  FOR ALL USING (public.is_admin());

-- Teacher CMS (00003) — only if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resource_categories') THEN
    EXECUTE 'CREATE POLICY resource_categories_select ON public.resource_categories FOR SELECT USING (is_active = TRUE)';
    EXECUTE 'CREATE POLICY resource_categories_admin ON public.resource_categories FOR ALL USING (public.is_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resource_tags') THEN
    EXECUTE 'CREATE POLICY resource_tags_select ON public.resource_tags FOR SELECT USING (TRUE)';
    EXECUTE 'CREATE POLICY resource_tags_admin ON public.resource_tags FOR ALL USING (public.is_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resource_tag_relations') THEN
    EXECUTE 'CREATE POLICY resource_tag_relations_select ON public.resource_tag_relations FOR SELECT USING (TRUE)';
    EXECUTE 'CREATE POLICY resource_tag_relations_manage ON public.resource_tag_relations FOR ALL USING (public.is_teacher_or_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resource_analytics') THEN
    EXECUTE $p$
      CREATE POLICY resource_analytics_teacher ON public.resource_analytics
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.materials m
            WHERE m.id = resource_analytics.resource_id
              AND m.created_by = auth.uid()
          )
        )
    $p$;
    EXECUTE 'CREATE POLICY resource_analytics_admin ON public.resource_analytics FOR SELECT USING (public.is_admin())';
    EXECUTE 'CREATE POLICY resource_analytics_insert ON public.resource_analytics FOR INSERT WITH CHECK (true)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resource_folders') THEN
    EXECUTE 'CREATE POLICY resource_folders_teacher ON public.resource_folders FOR ALL USING (teacher_id = auth.uid())';
    EXECUTE 'CREATE POLICY resource_folders_admin ON public.resource_folders FOR ALL USING (public.is_admin())';
  END IF;
END $$;

-- Quiz system (00004+)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'uploaded_materials') THEN
    EXECUTE $p$
      CREATE POLICY uploaded_materials_teacher ON public.uploaded_materials
        FOR ALL USING (uploaded_by = auth.uid() AND public.is_teacher_or_admin())
        WITH CHECK (uploaded_by = auth.uid() AND public.is_teacher_or_admin())
    $p$;
    EXECUTE 'CREATE POLICY uploaded_materials_admin ON public.uploaded_materials FOR ALL USING (public.is_admin())';
    EXECUTE 'CREATE POLICY uploaded_materials_teacher_read ON public.uploaded_materials FOR SELECT USING (public.is_teacher_or_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generated_quizzes') THEN
    EXECUTE $p$
      CREATE POLICY generated_quizzes_teacher ON public.generated_quizzes
        FOR ALL USING (created_by = auth.uid() AND public.is_teacher_or_admin())
        WITH CHECK (created_by = auth.uid() AND public.is_teacher_or_admin())
    $p$;
    EXECUTE 'CREATE POLICY generated_quizzes_admin ON public.generated_quizzes FOR ALL USING (public.is_admin())';
    EXECUTE 'CREATE POLICY generated_quizzes_student_read ON public.generated_quizzes FOR SELECT USING (is_published = TRUE AND public.is_student())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_questions') THEN
    EXECUTE $p$
      CREATE POLICY quiz_questions_teacher ON public.quiz_questions
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.generated_quizzes q
            WHERE q.id = quiz_questions.quiz_id
              AND q.created_by = auth.uid()
          ) AND public.is_teacher_or_admin()
        )
    $p$;
    EXECUTE 'CREATE POLICY quiz_questions_admin ON public.quiz_questions FOR ALL USING (public.is_admin())';
    EXECUTE $p$
      CREATE POLICY quiz_questions_student_read ON public.quiz_questions
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.generated_quizzes q
            WHERE q.id = quiz_questions.quiz_id
              AND q.is_published = TRUE
          ) AND public.is_student()
        )
    $p$;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flashcard_sets') THEN
    EXECUTE $p$
      CREATE POLICY flashcard_sets_teacher ON public.flashcard_sets
        FOR ALL USING (created_by = auth.uid() AND public.is_teacher_or_admin())
        WITH CHECK (created_by = auth.uid() AND public.is_teacher_or_admin())
    $p$;
    EXECUTE 'CREATE POLICY flashcard_sets_admin ON public.flashcard_sets FOR ALL USING (public.is_admin())';
    EXECUTE 'CREATE POLICY flashcard_sets_student_read ON public.flashcard_sets FOR SELECT USING (is_published = TRUE AND public.is_student())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flashcards') THEN
    EXECUTE $p$
      CREATE POLICY flashcards_teacher ON public.flashcards
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.flashcard_sets s
            WHERE s.id = flashcards.set_id
              AND s.created_by = auth.uid()
          ) AND public.is_teacher_or_admin()
        )
    $p$;
    EXECUTE 'CREATE POLICY flashcards_admin ON public.flashcards FOR ALL USING (public.is_admin())';
    EXECUTE $p$
      CREATE POLICY flashcards_student_read ON public.flashcards
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.flashcard_sets s
            WHERE s.id = flashcards.set_id
              AND s.is_published = TRUE
          ) AND public.is_student()
        )
    $p$;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_attempts') THEN
    EXECUTE 'CREATE POLICY quiz_attempts_student ON public.quiz_attempts FOR ALL USING (student_id = auth.uid())';
    EXECUTE $p$
      CREATE POLICY quiz_attempts_teacher_read ON public.quiz_attempts
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.generated_quizzes q
            WHERE q.id = quiz_attempts.quiz_id
              AND q.created_by = auth.uid()
          )
        )
    $p$;
    EXECUTE 'CREATE POLICY quiz_attempts_admin ON public.quiz_attempts FOR SELECT USING (public.is_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_generation_logs') THEN
    EXECUTE 'CREATE POLICY ai_generation_logs_insert ON public.ai_generation_logs FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY ai_generation_logs_read ON public.ai_generation_logs FOR SELECT USING (public.is_teacher_or_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_generation_jobs') THEN
    EXECUTE 'CREATE POLICY quiz_generation_jobs_select ON public.quiz_generation_jobs FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY quiz_generation_jobs_insert ON public.quiz_generation_jobs FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_teacher_or_admin())';
    EXECUTE 'CREATE POLICY quiz_generation_jobs_update ON public.quiz_generation_jobs FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_scores') THEN
    EXECUTE 'CREATE POLICY student_scores_select ON public.student_scores FOR SELECT USING (auth.uid() = student_id OR public.is_admin())';
    EXECUTE 'CREATE POLICY student_scores_insert ON public.student_scores FOR INSERT WITH CHECK (auth.uid() = student_id)';
  END IF;
END $$;

-- Chatbot (00009)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_sessions') THEN
    EXECUTE 'CREATE POLICY chat_sessions_own ON public.chat_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
    EXECUTE $p$
      CREATE POLICY chat_messages_own ON public.chat_messages
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.chat_sessions s
            WHERE s.id = chat_messages.session_id
              AND s.user_id = auth.uid()
          )
        )
    $p$;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chatbot_preferences') THEN
    EXECUTE 'CREATE POLICY chatbot_preferences_own ON public.chatbot_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chatbot_settings') THEN
    EXECUTE 'CREATE POLICY chatbot_settings_read ON public.chatbot_settings FOR SELECT USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY chatbot_settings_admin ON public.chatbot_settings FOR ALL USING (public.is_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_usage_logs') THEN
    EXECUTE 'CREATE POLICY chat_usage_own ON public.chat_usage_logs FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY chat_usage_insert ON public.chat_usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY chat_usage_admin ON public.chat_usage_logs FOR SELECT USING (public.is_admin())';
  END IF;
END $$;

-- Schema columns from 00007
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

ALTER TABLE public.cms_content
  ADD COLUMN IF NOT EXISTS i18n_key TEXT;

CREATE INDEX IF NOT EXISTS idx_cms_content_i18n_key ON public.cms_content(i18n_key) WHERE i18n_key IS NOT NULL;

UPDATE public.cms_content
SET i18n_key = field_key
WHERE i18n_key IS NULL AND field_key IS NOT NULL;
