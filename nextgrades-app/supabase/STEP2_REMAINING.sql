-- STEP 2: Run AFTER RLS_FIX_ONLY.sql succeeded
-- Paste this entire file into Supabase SQL Editor and click Run
-- Idempotent — safe to re-run if a section partially failed

-- ========== Teacher CMS (00003) ==========

CREATE TABLE IF NOT EXISTS public.resource_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resource_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resource_tag_relations (
  resource_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.resource_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'free';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.resource_categories(id);
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS student_reach INTEGER DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS revenue_generated NUMERIC(10,2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.resource_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resource_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'preview', 'share')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resource_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_folder_id UUID REFERENCES public.resource_folders(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.resource_folders(id);

ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS resource_categories_select ON public.resource_categories;
DROP POLICY IF EXISTS resource_categories_admin ON public.resource_categories;
CREATE POLICY resource_categories_select ON public.resource_categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY resource_categories_admin ON public.resource_categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS resource_tags_select ON public.resource_tags;
DROP POLICY IF EXISTS resource_tags_admin ON public.resource_tags;
CREATE POLICY resource_tags_select ON public.resource_tags FOR SELECT USING (TRUE);
CREATE POLICY resource_tags_admin ON public.resource_tags FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS resource_tag_relations_select ON public.resource_tag_relations;
DROP POLICY IF EXISTS resource_tag_relations_manage ON public.resource_tag_relations;
CREATE POLICY resource_tag_relations_select ON public.resource_tag_relations FOR SELECT USING (TRUE);
CREATE POLICY resource_tag_relations_manage ON public.resource_tag_relations FOR ALL USING (public.is_teacher_or_admin());

DROP POLICY IF EXISTS resource_analytics_teacher ON public.resource_analytics;
DROP POLICY IF EXISTS resource_analytics_admin ON public.resource_analytics;
DROP POLICY IF EXISTS resource_analytics_insert ON public.resource_analytics;
CREATE POLICY resource_analytics_teacher ON public.resource_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.materials m WHERE m.id = resource_analytics.resource_id AND m.created_by = auth.uid())
);
CREATE POLICY resource_analytics_admin ON public.resource_analytics FOR SELECT USING (public.is_admin());
CREATE POLICY resource_analytics_insert ON public.resource_analytics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS resource_folders_teacher ON public.resource_folders;
DROP POLICY IF EXISTS resource_folders_admin ON public.resource_folders;
CREATE POLICY resource_folders_teacher ON public.resource_folders FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY resource_folders_admin ON public.resource_folders FOR ALL USING (public.is_admin());

INSERT INTO public.resource_categories (name, description, icon, sort_order)
SELECT * FROM (VALUES
  ('Worksheets', 'Printable worksheets and exercises', 'file-text', 1),
  ('Videos', 'Video lessons and tutorials', 'video', 2),
  ('Notes', 'Study notes and summaries', 'book-open', 3),
  ('Quizzes', 'Practice quizzes and tests', 'clipboard-check', 4),
  ('Past Papers', 'Previous exam papers', 'archive', 5),
  ('Assignments', 'Homework assignments', 'pen-tool', 6),
  ('Courses', 'Complete course materials', 'layers', 7),
  ('Other', 'Other educational resources', 'more-horizontal', 8)
) AS v(name, description, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.resource_categories LIMIT 1);

INSERT INTO public.resource_tags (name, slug, color)
SELECT v.name, v.slug, v.color FROM (VALUES
  ('Mathematics', 'mathematics', '#4DA3FF'),
  ('English', 'english', '#22C55E'),
  ('German', 'german', '#F97316'),
  ('Physics', 'physics', '#A855F7'),
  ('Chemistry', 'chemistry', '#EC4899'),
  ('Exam Prep', 'exam-prep', '#EF4444')
) AS v(name, slug, color)
WHERE NOT EXISTS (SELECT 1 FROM public.resource_tags LIMIT 1);

CREATE INDEX IF NOT EXISTS idx_materials_status ON public.materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_category_id ON public.materials(category_id);
CREATE INDEX IF NOT EXISTS idx_materials_folder_id ON public.materials(folder_id);

DROP POLICY IF EXISTS materials_public_published ON public.materials;
CREATE POLICY materials_public_published ON public.materials FOR SELECT USING (
  status = 'published' AND moderation_status = 'approved'
);

-- ========== Quiz system (00004) ==========

INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-materials', 'learning-materials', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.uploaded_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt', 'paste', 'other')),
  storage_path TEXT,
  file_size BIGINT,
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  semester INTEGER CHECK (semester IN (1, 2)),
  topic TEXT,
  chapter TEXT,
  difficulty_default TEXT DEFAULT 'medium' CHECK (difficulty_default IN ('easy', 'medium', 'hard')),
  extracted_text TEXT,
  extraction_status TEXT NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'ready', 'failed')),
  extraction_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.generated_quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  material_id UUID REFERENCES public.uploaded_materials(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  semester INTEGER CHECK (semester IN (1, 2)),
  topic TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_types JSONB NOT NULL DEFAULT '["mcq"]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  time_limit_minutes INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  generation_cache_key TEXT,
  ai_model TEXT,
  raw_generation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.generated_quizzes(id) ON DELETE CASCADE NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'fill_blank', 'short_answer', 'exercise', 'revision')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flashcard_sets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  material_id UUID REFERENCES public.uploaded_materials(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_published BOOLEAN DEFAULT FALSE,
  generation_cache_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  set_id UUID REFERENCES public.flashcard_sets(id) ON DELETE CASCADE NOT NULL,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.generated_quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score_percent NUMERIC(5,2),
  correct_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  answers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  material_id UUID REFERENCES public.uploaded_materials(id) ON DELETE SET NULL,
  quiz_id UUID REFERENCES public.generated_quizzes(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.uploaded_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS uploaded_materials_teacher ON public.uploaded_materials;
DROP POLICY IF EXISTS uploaded_materials_admin ON public.uploaded_materials;
CREATE POLICY uploaded_materials_teacher ON public.uploaded_materials FOR ALL
  USING (uploaded_by = auth.uid() AND public.is_teacher_or_admin())
  WITH CHECK (uploaded_by = auth.uid() AND public.is_teacher_or_admin());
CREATE POLICY uploaded_materials_admin ON public.uploaded_materials FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS generated_quizzes_teacher ON public.generated_quizzes;
DROP POLICY IF EXISTS generated_quizzes_admin ON public.generated_quizzes;
DROP POLICY IF EXISTS generated_quizzes_student_read ON public.generated_quizzes;
CREATE POLICY generated_quizzes_teacher ON public.generated_quizzes FOR ALL
  USING (created_by = auth.uid() AND public.is_teacher_or_admin())
  WITH CHECK (created_by = auth.uid() AND public.is_teacher_or_admin());
CREATE POLICY generated_quizzes_admin ON public.generated_quizzes FOR ALL USING (public.is_admin());
CREATE POLICY generated_quizzes_student_read ON public.generated_quizzes FOR SELECT USING (is_published = TRUE AND public.is_student());

DROP POLICY IF EXISTS quiz_attempts_student ON public.quiz_attempts;
CREATE POLICY quiz_attempts_student ON public.quiz_attempts FOR ALL USING (student_id = auth.uid());

-- ========== Quiz performance (00008) ==========

CREATE TABLE IF NOT EXISTS public.quiz_generation_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  material_id UUID REFERENCES public.uploaded_materials(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('quiz', 'flashcards')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  params JSONB NOT NULL DEFAULT '{}',
  result_quiz_id UUID REFERENCES public.generated_quizzes(id) ON DELETE SET NULL,
  result_flashcard_set_id UUID REFERENCES public.flashcard_sets(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.student_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.generated_quizzes(id) ON DELETE CASCADE NOT NULL,
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE SET NULL,
  score_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quiz_generation_jobs_select ON public.quiz_generation_jobs;
DROP POLICY IF EXISTS quiz_generation_jobs_insert ON public.quiz_generation_jobs;
CREATE POLICY quiz_generation_jobs_select ON public.quiz_generation_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY quiz_generation_jobs_insert ON public.quiz_generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_teacher_or_admin());

DROP POLICY IF EXISTS student_scores_select ON public.student_scores;
DROP POLICY IF EXISTS student_scores_insert ON public.student_scores;
CREATE POLICY student_scores_select ON public.student_scores FOR SELECT USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY student_scores_insert ON public.student_scores FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ========== Chatbot (00009) ==========

CREATE TABLE IF NOT EXISTS public.chatbot_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN NOT NULL DEFAULT true,
  streaming_enabled BOOLEAN NOT NULL DEFAULT true,
  rag_enabled BOOLEAN NOT NULL DEFAULT true,
  max_messages_per_minute INTEGER NOT NULL DEFAULT 20,
  default_model TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  system_prompt_override TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.chatbot_settings (enabled, streaming_enabled, rag_enabled)
SELECT true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.chatbot_settings LIMIT 1);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New chat',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  material_id UUID REFERENCES public.uploaded_materials(id) ON DELETE SET NULL,
  semester TEXT,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chatbot_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_model TEXT,
  show_suggestions BOOLEAN NOT NULL DEFAULT true,
  compact_mode BOOLEAN NOT NULL DEFAULT false,
  theme TEXT NOT NULL DEFAULT 'auto' CHECK (theme IN ('auto', 'light', 'dark')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  model TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_sessions_own ON public.chat_sessions;
CREATE POLICY chat_sessions_own ON public.chat_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chat_messages_own ON public.chat_messages;
CREATE POLICY chat_messages_own ON public.chat_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = chat_messages.session_id AND s.user_id = auth.uid())
);

DROP POLICY IF EXISTS chatbot_preferences_own ON public.chatbot_preferences;
CREATE POLICY chatbot_preferences_own ON public.chatbot_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chatbot_settings_read ON public.chatbot_settings;
DROP POLICY IF EXISTS chatbot_settings_admin ON public.chatbot_settings;
CREATE POLICY chatbot_settings_read ON public.chatbot_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY chatbot_settings_admin ON public.chatbot_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS chat_usage_own ON public.chat_usage_logs;
DROP POLICY IF EXISTS chat_usage_insert ON public.chat_usage_logs;
DROP POLICY IF EXISTS chat_usage_admin ON public.chat_usage_logs;
CREATE POLICY chat_usage_own ON public.chat_usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_usage_insert ON public.chat_usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_usage_admin ON public.chat_usage_logs FOR SELECT USING (public.is_admin());
