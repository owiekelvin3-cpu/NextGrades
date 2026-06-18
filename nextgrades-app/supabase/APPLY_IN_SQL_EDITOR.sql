-- =============================================================================
-- NextGrades: paste and run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/pzavnfdhctsrhzesdvfd/sql/new
-- =============================================================================

-- ========== migrations/00007_schema_columns.sql ==========

-- Schema drift fixes referenced by application code

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learning_goal TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

ALTER TABLE public.cms_content
  ADD COLUMN IF NOT EXISTS i18n_key TEXT;

CREATE INDEX IF NOT EXISTS idx_cms_content_i18n_key ON public.cms_content(i18n_key) WHERE i18n_key IS NOT NULL;

COMMENT ON COLUMN public.profiles.learning_goal IS 'Student learning goal shown on dashboard overview';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Membership state: inactive, active, canceled, past_due';
COMMENT ON COLUMN public.cms_content.i18n_key IS 'i18n key for CMS field overrides';


-- ========== migrations/00003_teacher_cms.sql ==========

-- Teacher CMS Extensions
-- This migration adds tables and features for the Teacher Content Management System

-- Resource categories table
CREATE TABLE public.resource_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource tags table
CREATE TABLE public.resource_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for resource-tag relationships
CREATE TABLE public.resource_tag_relations (
  resource_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.resource_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- Enhanced materials table with CMS features
ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'pending_review', 'private', 'scheduled', 'archived')),
ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'free' CHECK (access_type IN ('free', 'premium', 'locked', 'members_only')),
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.resource_categories(id),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS student_reach INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_generated NUMERIC(10,2) DEFAULT 0;

-- Resource analytics table
CREATE TABLE public.resource_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resource_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'preview', 'share')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource folders/organization table
CREATE TABLE public.resource_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_folder_id UUID REFERENCES public.resource_folders(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link materials to folders
ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.resource_folders(id);

-- Enable RLS for new tables
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Resource Categories
CREATE POLICY "Everyone can view active categories" ON public.resource_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage categories" ON public.resource_categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Resource Tags
CREATE POLICY "Everyone can view tags" ON public.resource_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage tags" ON public.resource_tags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Resource Tag Relations
CREATE POLICY "Everyone can view tag relations" ON public.resource_tag_relations
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins and teachers can manage tag relations" ON public.resource_tag_relations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'teacher')
  ));

-- RLS Policies for Resource Analytics
CREATE POLICY "Teachers can view analytics for their resources" ON public.resource_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.materials m 
    WHERE m.id = resource_analytics.resource_id 
    AND m.created_by = auth.uid()
  ));

CREATE POLICY "Admins can view all analytics" ON public.resource_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "System can create analytics" ON public.resource_analytics
  FOR INSERT WITH CHECK (TRUE);

-- RLS Policies for Resource Folders
CREATE POLICY "Teachers can view their own folders" ON public.resource_folders
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can manage their own folders" ON public.resource_folders
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all folders" ON public.resource_folders
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Update materials RLS to include folder ownership
DROP POLICY IF EXISTS "Admins and teachers can manage materials" ON public.materials;

CREATE POLICY "Teachers can manage their own materials" ON public.materials
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.resource_folders f 
      WHERE f.id = materials.folder_id 
      AND f.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all materials" ON public.materials
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Insert initial resource categories
INSERT INTO public.resource_categories (name, description, icon, sort_order) VALUES
  ('Worksheets', 'Printable worksheets and exercises', 'file-text', 1),
  ('Videos', 'Video lessons and tutorials', 'video', 2),
  ('Notes', 'Study notes and summaries', 'book-open', 3),
  ('Quizzes', 'Practice quizzes and tests', 'clipboard-check', 4),
  ('Past Papers', 'Previous exam papers', 'archive', 5),
  ('Assignments', 'Homework assignments', 'pen-tool', 6),
  ('Courses', 'Complete course materials', 'layers', 7),
  ('Other', 'Other educational resources', 'more-horizontal', 8);

-- Insert initial resource tags
INSERT INTO public.resource_tags (name, slug, color) VALUES
  ('Mathematics', 'mathematics', '#4DA3FF'),
  ('English', 'english', '#22C55E'),
  ('German', 'german', '#F97316'),
  ('Physics', 'physics', '#A855F7'),
  ('Chemistry', 'chemistry', '#EC4899'),
  ('Biology', 'biology', '#14B8A6'),
  ('Economics', 'economics', '#F59E0B'),
  ('Computer Science', 'computer-science', '#6366F1'),
  ('Grade 1-5', 'grade-1-5', '#8B5CF6'),
  ('Grade 6-8', 'grade-6-8', '#06B6D4'),
  ('Grade 9-12', 'grade-9-12', '#10B981'),
  ('Exam Prep', 'exam-prep', '#EF4444'),
  ('Beginner', 'beginner', '#84CC16'),
  ('Intermediate', 'intermediate', '#FBBF24'),
  ('Advanced', 'advanced', '#F97316');

-- Create indexes for better performance
CREATE INDEX idx_materials_status ON public.materials(status);
CREATE INDEX idx_materials_access_type ON public.materials(access_type);
CREATE INDEX idx_materials_category_id ON public.materials(category_id);
CREATE INDEX idx_materials_folder_id ON public.materials(folder_id);
CREATE INDEX idx_materials_created_by ON public.materials(created_by);
CREATE INDEX idx_resource_analytics_resource_id ON public.resource_analytics(resource_id);
CREATE INDEX idx_resource_analytics_user_id ON public.resource_analytics(user_id);
CREATE INDEX idx_resource_analytics_action ON public.resource_analytics(action);
CREATE INDEX idx_resource_analytics_created_at ON public.resource_analytics(created_at);
CREATE INDEX idx_resource_folders_teacher_id ON public.resource_folders(teacher_id);
CREATE INDEX idx_resource_folders_parent_folder_id ON public.resource_folders(parent_folder_id);

-- Function to automatically track resource views
CREATE OR REPLACE FUNCTION public.track_resource_view()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.resource_analytics (resource_id, user_id, action, metadata)
  VALUES (
    NEW.id,
    auth.uid(),
    'view',
    jsonb_build_object(
      'title', NEW.title,
      'type', NEW.type,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger should be enabled selectively, not on every material update
-- It's meant to be called when a resource is viewed/downloaded


-- ========== migrations/00004_ai_quiz_system.sql ==========

-- AI Quiz & Exercise Generator

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
  question_type TEXT NOT NULL CHECK (question_type IN (
    'mcq', 'true_false', 'fill_blank', 'short_answer', 'exercise', 'revision'
  )),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (quiz_id, student_id, id)
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

CREATE INDEX IF NOT EXISTS idx_uploaded_materials_user ON public.uploaded_materials(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_generated_quizzes_creator ON public.generated_quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_quizzes_published ON public.generated_quizzes(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_set ON public.flashcards(set_id);

ALTER TABLE public.uploaded_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Helper: admin or teacher
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- uploaded_materials
CREATE POLICY "Teachers manage own materials" ON public.uploaded_materials
  FOR ALL USING (uploaded_by = auth.uid() AND public.is_teacher_or_admin())
  WITH CHECK (uploaded_by = auth.uid() AND public.is_teacher_or_admin());

CREATE POLICY "Admins manage all materials" ON public.uploaded_materials
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students cannot access raw materials" ON public.uploaded_materials
  FOR SELECT USING (public.is_teacher_or_admin());

-- generated_quizzes
CREATE POLICY "Teachers manage own quizzes" ON public.generated_quizzes
  FOR ALL USING (created_by = auth.uid() AND public.is_teacher_or_admin())
  WITH CHECK (created_by = auth.uid() AND public.is_teacher_or_admin());

CREATE POLICY "Admins manage all quizzes" ON public.generated_quizzes
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students read published quizzes" ON public.generated_quizzes
  FOR SELECT USING (is_published = TRUE AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student'
  ));

-- quiz_questions
CREATE POLICY "Teachers manage questions for own quizzes" ON public.quiz_questions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.generated_quizzes q
    WHERE q.id = quiz_id AND q.created_by = auth.uid()
  ) AND public.is_teacher_or_admin());

CREATE POLICY "Admins manage all questions" ON public.quiz_questions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students read published quiz questions" ON public.quiz_questions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.generated_quizzes q
    WHERE q.id = quiz_id AND q.is_published = TRUE
  ) AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student'));

-- flashcard_sets & flashcards (similar)
CREATE POLICY "Teachers manage own flashcard sets" ON public.flashcard_sets
  FOR ALL USING (created_by = auth.uid() AND public.is_teacher_or_admin())
  WITH CHECK (created_by = auth.uid() AND public.is_teacher_or_admin());

CREATE POLICY "Admins manage all flashcard sets" ON public.flashcard_sets
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students read published flashcard sets" ON public.flashcard_sets
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Teachers manage flashcards" ON public.flashcards
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.flashcard_sets s WHERE s.id = set_id AND s.created_by = auth.uid()
  ) AND public.is_teacher_or_admin());

CREATE POLICY "Admins manage all flashcards" ON public.flashcards
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students read published flashcards" ON public.flashcards
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.flashcard_sets s WHERE s.id = set_id AND s.is_published = TRUE
  ));

-- quiz_attempts
CREATE POLICY "Students manage own attempts" ON public.quiz_attempts
  FOR ALL USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers view attempts for their quizzes" ON public.quiz_attempts
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.generated_quizzes q
    WHERE q.id = quiz_id AND q.created_by = auth.uid()
  ));

CREATE POLICY "Admins view all attempts" ON public.quiz_attempts
  FOR SELECT USING (public.is_admin());

-- ai logs
CREATE POLICY "Users insert own ai logs" ON public.ai_generation_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers and admins read ai logs" ON public.ai_generation_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Storage policies
CREATE POLICY "Teachers upload learning materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'learning-materials'
  AND auth.uid() IS NOT NULL
  AND public.is_teacher_or_admin()
);

CREATE POLICY "Teachers read own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'learning-materials'
  AND auth.uid() IS NOT NULL
  AND (public.is_teacher_or_admin() OR public.is_admin())
);

CREATE POLICY "Teachers delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'learning-materials'
  AND auth.uid() IS NOT NULL
  AND public.is_teacher_or_admin()
);


-- ========== migrations/00008_quiz_performance.sql ==========

-- Quiz generation jobs queue + student scores + performance indexes

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

CREATE INDEX IF NOT EXISTS idx_quiz_generation_jobs_user ON public.quiz_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_generation_jobs_status ON public.quiz_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_quiz_generation_jobs_created ON public.quiz_generation_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_scores_student ON public.student_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_student_scores_quiz ON public.student_scores(quiz_id);
CREATE INDEX IF NOT EXISTS idx_student_scores_created ON public.student_scores(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_quizzes_cache ON public.generated_quizzes(generation_cache_key);
CREATE INDEX IF NOT EXISTS idx_generated_quizzes_published ON public.generated_quizzes(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_materials_user ON public.uploaded_materials(uploaded_by);

ALTER TABLE public.quiz_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generation jobs"
  ON public.quiz_generation_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert generation jobs"
  ON public.quiz_generation_jobs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
  );

CREATE POLICY "Users can update own generation jobs"
  ON public.quiz_generation_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Students view own scores"
  ON public.student_scores FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students insert own scores"
  ON public.student_scores FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins view all scores"
  ON public.student_scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ========== migrations/00009_chatbot.sql ==========

-- AI Chatbot: sessions, messages, preferences, settings, usage logs

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

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_usage_user ON public.chat_usage_logs(user_id, created_at DESC);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_sessions_own ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY chat_messages_own ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = chat_messages.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY chatbot_preferences_own ON public.chatbot_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY chatbot_settings_read ON public.chatbot_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY chatbot_settings_admin ON public.chatbot_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY chat_usage_own ON public.chat_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY chat_usage_insert ON public.chat_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY chat_usage_admin ON public.chat_usage_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ========== migrations/00010_materials_public_read.sql ==========

-- Allow public read of published, approved materials
CREATE POLICY IF NOT EXISTS "Public can view published approved materials"
  ON public.materials FOR SELECT
  USING (
    status = 'published'
    AND moderation_status = 'approved'
  );


-- ========== migrations/00011_rls_helpers_and_policy_fix.sql ==========

-- Fix infinite recursion in RLS policies and reset policies to use SECURITY DEFINER helpers.
-- Run after base migrations (00001â€“00010). Safe to re-run: drops and recreates public policies.

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

-- Teacher CMS (00003) â€” only if tables exist
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

