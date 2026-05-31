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
