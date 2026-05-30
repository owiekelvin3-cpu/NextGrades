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
