-- Admin user suspend/delete support

-- Ensure profile row is removed when auth user is deleted
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Permanently remove a user and related rows (called before auth.admin.deleteUser)
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

  -- Chat
  DELETE FROM public.chat_messages
  WHERE session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = p_user_id);
  DELETE FROM public.chat_sessions WHERE user_id = p_user_id;
  DELETE FROM public.chatbot_preferences WHERE user_id = p_user_id;
  DELETE FROM public.chat_usage_logs WHERE user_id = p_user_id;

  -- Notifications & push
  DELETE FROM public.notifications WHERE user_id = p_user_id;
  DELETE FROM public.push_subscriptions WHERE user_id = p_user_id;

  -- Quiz / AI content created by or belonging to user
  DELETE FROM public.quiz_attempts WHERE student_id = p_user_id;
  DELETE FROM public.quiz_attempts
  WHERE quiz_id IN (SELECT id FROM public.generated_quizzes WHERE created_by = p_user_id);
  DELETE FROM public.student_scores WHERE student_id = p_user_id;
  DELETE FROM public.ai_generation_logs WHERE user_id = p_user_id;
  DELETE FROM public.quiz_generation_jobs WHERE user_id = p_user_id;

  DELETE FROM public.flashcards
  WHERE set_id IN (SELECT id FROM public.flashcard_sets WHERE created_by = p_user_id);
  DELETE FROM public.flashcard_sets WHERE created_by = p_user_id;

  DELETE FROM public.quiz_questions
  WHERE quiz_id IN (SELECT id FROM public.generated_quizzes WHERE created_by = p_user_id);
  DELETE FROM public.generated_quizzes WHERE created_by = p_user_id;
  DELETE FROM public.uploaded_materials WHERE uploaded_by = p_user_id;

  -- Teacher resources & analytics
  DELETE FROM public.resource_analytics WHERE user_id = p_user_id;
  DELETE FROM public.resource_analytics
  WHERE resource_id IN (SELECT id FROM public.materials WHERE created_by = p_user_id);

  DELETE FROM public.resource_tag_relations
  WHERE resource_id IN (SELECT id FROM public.materials WHERE created_by = p_user_id);

  DELETE FROM public.resource_files
  WHERE resource_id IN (SELECT id FROM public.materials WHERE created_by = p_user_id);

  DELETE FROM public.materials WHERE created_by = p_user_id;
  UPDATE public.materials SET moderated_by = NULL WHERE moderated_by = p_user_id;

  DELETE FROM public.resource_folders WHERE teacher_id = p_user_id;

  -- Learning records
  DELETE FROM public.enrollments WHERE student_id = p_user_id;
  DELETE FROM public.lessons WHERE teacher_id = p_user_id OR student_id = p_user_id;
  DELETE FROM public.user_units WHERE student_id = p_user_id;
  DELETE FROM public.teacher_stats WHERE teacher_id = p_user_id;
  DELETE FROM public.activity_logs WHERE user_id = p_user_id;

  -- Zoom & registration
  DELETE FROM public.teacher_zoom_connections WHERE teacher_id = p_user_id;
  DELETE FROM public.student_registration_details WHERE user_id = p_user_id;
  DELETE FROM public.registration_otps WHERE email IN (
    SELECT email FROM public.profiles WHERE id = p_user_id AND email IS NOT NULL
  );

  -- CMS uploads
  UPDATE public.cms_media SET uploaded_by = NULL WHERE uploaded_by = p_user_id;

  -- Announcements authored by user
  DELETE FROM public.scheduled_announcements WHERE created_by = p_user_id;

  -- Profile testimonials linked to user (legacy table)
  DELETE FROM public.testimonials WHERE user_id = p_user_id;

  DELETE FROM public.profiles WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO service_role;
