-- Per-student quiz unlocks (same pattern as material_grants).
-- Applied remotely as quiz_grants_per_student.

CREATE TABLE IF NOT EXISTS public.quiz_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.generated_quizzes(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  UNIQUE (student_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_grants_student_active
  ON public.quiz_grants (student_id, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_quiz_grants_quiz
  ON public.quiz_grants (quiz_id);

ALTER TABLE public.quiz_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quiz_grants_select_own ON public.quiz_grants;
CREATE POLICY quiz_grants_select_own ON public.quiz_grants
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS generated_quizzes_student_read ON public.generated_quizzes;
CREATE POLICY generated_quizzes_student_read ON public.generated_quizzes
  FOR SELECT
  TO authenticated
  USING (
    is_published = true
    AND is_student()
    AND EXISTS (
      SELECT 1 FROM public.quiz_grants g
      WHERE g.quiz_id = generated_quizzes.id
        AND g.student_id = auth.uid()
        AND g.status = 'active'
        AND (g.expires_at IS NULL OR g.expires_at > now())
    )
  );

DROP POLICY IF EXISTS quiz_questions_student_read ON public.quiz_questions;
CREATE POLICY quiz_questions_student_read ON public.quiz_questions
  FOR SELECT
  TO authenticated
  USING (
    is_student()
    AND EXISTS (
      SELECT 1 FROM public.generated_quizzes q
      JOIN public.quiz_grants g ON g.quiz_id = q.id
      WHERE q.id = quiz_questions.quiz_id
        AND q.is_published = true
        AND g.student_id = auth.uid()
        AND g.status = 'active'
        AND (g.expires_at IS NULL OR g.expires_at > now())
    )
  );
