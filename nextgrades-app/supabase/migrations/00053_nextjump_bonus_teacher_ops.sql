-- NextJump frequency bonus per student, loyalty periods, quiz teacher grants, group materials.

-- Per teacher-student frequency bonus cycle (resets at 200 lessons).
CREATE TABLE IF NOT EXISTS public.teacher_student_bonus (
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lessons_in_cycle INT NOT NULL DEFAULT 0,
  highest_milestone INT NOT NULL DEFAULT 0,
  total_frequency_bonus NUMERIC(10, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (teacher_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_student_bonus_teacher
  ON public.teacher_student_bonus (teacher_id);

-- Rolling 6-month loyalty periods per teacher.
CREATE TABLE IF NOT EXISTS public.teacher_loyalty_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  lessons_completed INT NOT NULL DEFAULT 0,
  bonus_per_hour NUMERIC(6, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_teacher_loyalty_periods_teacher
  ON public.teacher_loyalty_periods (teacher_id, period_end DESC);

-- Quiz assignment deadlines (teacher-assigned).
ALTER TABLE public.quiz_grants
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Teacher feedback on quiz submissions.
ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS teacher_feedback TEXT,
  ADD COLUMN IF NOT EXISTS teacher_feedback_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Optional manual score override by teacher.
ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS teacher_score_percent INT;

-- Group ↔ lesson linkage (column may exist from 00050).
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.tutoring_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_group_id ON public.lessons (group_id)
  WHERE group_id IS NOT NULL;

-- Materials assigned to tutoring groups.
CREATE TABLE IF NOT EXISTS public.group_material_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.tutoring_groups(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_group_material_assignments_group
  ON public.group_material_assignments (group_id);

ALTER TABLE public.teacher_student_bonus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_loyalty_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_material_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_student_bonus_own ON public.teacher_student_bonus;
CREATE POLICY teacher_student_bonus_own ON public.teacher_student_bonus
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR is_admin())
  WITH CHECK (teacher_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS teacher_loyalty_periods_own ON public.teacher_loyalty_periods;
CREATE POLICY teacher_loyalty_periods_own ON public.teacher_loyalty_periods
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR is_admin())
  WITH CHECK (teacher_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS group_material_assignments_read ON public.group_material_assignments;
CREATE POLICY group_material_assignments_read ON public.group_material_assignments
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM public.tutoring_groups g
      WHERE g.id = group_material_assignments.group_id
        AND g.teacher_id = auth.uid()
    )
  );
