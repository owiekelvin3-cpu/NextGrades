-- Per-student unlocks for any library material (PDF, video, notes, etc.).

CREATE TABLE IF NOT EXISTS public.material_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  UNIQUE (student_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_material_grants_student_active
  ON public.material_grants (student_id, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_material_grants_material
  ON public.material_grants (material_id);

COMMENT ON TABLE public.material_grants IS
  'Admin-granted access to a specific library material for one student.';

ALTER TABLE public.material_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS material_grants_select_own ON public.material_grants;
CREATE POLICY material_grants_select_own ON public.material_grants
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());
