-- Quick fix: paste and run this entire file in Supabase → SQL Editor
-- Fixes admin delete error: relation "public.student_registration_details" does not exist

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user id required';
  END IF;

  IF to_regclass('public.chat_messages') IS NOT NULL AND to_regclass('public.chat_sessions') IS NOT NULL THEN
    DELETE FROM public.chat_messages
    WHERE session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = p_user_id);
  END IF;

  IF to_regclass('public.chat_sessions') IS NOT NULL THEN
    DELETE FROM public.chat_sessions WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.chatbot_preferences') IS NOT NULL THEN
    DELETE FROM public.chatbot_preferences WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.chat_usage_logs') IS NOT NULL THEN
    DELETE FROM public.chat_usage_logs WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.notifications') IS NOT NULL THEN
    DELETE FROM public.notifications WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.push_subscriptions') IS NOT NULL THEN
    DELETE FROM public.push_subscriptions WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.quiz_attempts') IS NOT NULL THEN
    DELETE FROM public.quiz_attempts WHERE student_id = p_user_id;
    IF to_regclass('public.generated_quizzes') IS NOT NULL THEN
      DELETE FROM public.quiz_attempts
      WHERE quiz_id IN (SELECT id FROM public.generated_quizzes WHERE created_by = p_user_id);
    END IF;
  END IF;

  IF to_regclass('public.student_scores') IS NOT NULL THEN
    DELETE FROM public.student_scores WHERE student_id = p_user_id;
  END IF;

  IF to_regclass('public.ai_generation_logs') IS NOT NULL THEN
    DELETE FROM public.ai_generation_logs WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.quiz_generation_jobs') IS NOT NULL THEN
    DELETE FROM public.quiz_generation_jobs WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.flashcard_sets') IS NOT NULL AND to_regclass('public.flashcards') IS NOT NULL THEN
    DELETE FROM public.flashcards
    WHERE set_id IN (SELECT id FROM public.flashcard_sets WHERE created_by = p_user_id);
    DELETE FROM public.flashcard_sets WHERE created_by = p_user_id;
  END IF;

  IF to_regclass('public.generated_quizzes') IS NOT NULL AND to_regclass('public.quiz_questions') IS NOT NULL THEN
    DELETE FROM public.quiz_questions
    WHERE quiz_id IN (SELECT id FROM public.generated_quizzes WHERE created_by = p_user_id);
    DELETE FROM public.generated_quizzes WHERE created_by = p_user_id;
  END IF;

  IF to_regclass('public.uploaded_materials') IS NOT NULL THEN
    DELETE FROM public.uploaded_materials WHERE uploaded_by = p_user_id;
  END IF;

  IF to_regclass('public.resource_analytics') IS NOT NULL THEN
    DELETE FROM public.resource_analytics WHERE user_id = p_user_id;
    IF to_regclass('public.materials') IS NOT NULL THEN
      DELETE FROM public.resource_analytics
      WHERE resource_id IN (SELECT id FROM public.materials WHERE created_by = p_user_id);
    END IF;
  END IF;

  IF to_regclass('public.resource_tag_relations') IS NOT NULL AND to_regclass('public.materials') IS NOT NULL THEN
    DELETE FROM public.resource_tag_relations
    WHERE resource_id IN (SELECT id FROM public.materials WHERE created_by = p_user_id);
  END IF;

  IF to_regclass('public.resource_files') IS NOT NULL AND to_regclass('public.materials') IS NOT NULL THEN
    DELETE FROM public.resource_files
    WHERE resource_id IN (SELECT id FROM public.materials WHERE created_by = p_user_id);
  END IF;

  IF to_regclass('public.materials') IS NOT NULL THEN
    DELETE FROM public.materials WHERE created_by = p_user_id;
    UPDATE public.materials SET moderated_by = NULL WHERE moderated_by = p_user_id;
  END IF;

  IF to_regclass('public.resource_folders') IS NOT NULL THEN
    DELETE FROM public.resource_folders WHERE teacher_id = p_user_id;
  END IF;

  IF to_regclass('public.enrollments') IS NOT NULL THEN
    DELETE FROM public.enrollments WHERE student_id = p_user_id;
  END IF;

  IF to_regclass('public.lessons') IS NOT NULL THEN
    DELETE FROM public.lessons WHERE teacher_id = p_user_id OR student_id = p_user_id;
  END IF;

  IF to_regclass('public.user_units') IS NOT NULL THEN
    DELETE FROM public.user_units WHERE student_id = p_user_id;
  END IF;

  IF to_regclass('public.teacher_stats') IS NOT NULL THEN
    DELETE FROM public.teacher_stats WHERE teacher_id = p_user_id;
  END IF;

  IF to_regclass('public.activity_logs') IS NOT NULL THEN
    DELETE FROM public.activity_logs WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.user_activity_log') IS NOT NULL THEN
    DELETE FROM public.user_activity_log WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.teacher_zoom_connections') IS NOT NULL THEN
    DELETE FROM public.teacher_zoom_connections WHERE teacher_id = p_user_id;
  END IF;

  IF to_regclass('public.student_registration_details') IS NOT NULL THEN
    DELETE FROM public.student_registration_details WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.registration_otps') IS NOT NULL AND to_regclass('public.profiles') IS NOT NULL THEN
    DELETE FROM public.registration_otps WHERE email IN (
      SELECT email FROM public.profiles WHERE id = p_user_id AND email IS NOT NULL
    );
  END IF;

  IF to_regclass('public.registration_logs') IS NOT NULL AND to_regclass('public.profiles') IS NOT NULL THEN
    DELETE FROM public.registration_logs WHERE email IN (
      SELECT email FROM public.profiles WHERE id = p_user_id AND email IS NOT NULL
    );
  END IF;

  IF to_regclass('public.cms_media') IS NOT NULL THEN
    UPDATE public.cms_media SET uploaded_by = NULL WHERE uploaded_by = p_user_id;
  END IF;

  IF to_regclass('public.scheduled_announcements') IS NOT NULL THEN
    DELETE FROM public.scheduled_announcements WHERE created_by = p_user_id;
  END IF;

  IF to_regclass('public.testimonials') IS NOT NULL THEN
    DELETE FROM public.testimonials WHERE user_id = p_user_id;
  END IF;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    DELETE FROM public.profiles WHERE id = p_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO service_role;
