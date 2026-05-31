-- Teacher content publishing enhancements
-- Run in Supabase SQL Editor: supabase/TEACHER_PUBLISHING.sql

ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS full_description TEXT,
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'learning_material',
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS age_range TEXT DEFAULT 'all_ages',
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Relax legacy type constraint (keep column for backward compatibility)
ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS materials_type_check;

CREATE TABLE IF NOT EXISTS public.resource_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  kind TEXT NOT NULL DEFAULT 'primary' CHECK (kind IN ('primary', 'attachment', 'thumbnail')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_files_resource_id ON public.resource_files(resource_id);

-- Storage buckets for published resources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true,
  52428800,
  ARRAY['application/pdf','video/mp4','video/webm','image/jpeg','image/png','image/webp','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resource-thumbnails',
  'resource-thumbnails',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS resources_teacher_upload ON storage.objects;
CREATE POLICY resources_teacher_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );

DROP POLICY IF EXISTS resources_public_read ON storage.objects;
CREATE POLICY resources_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('resources', 'resource-thumbnails'));

DROP POLICY IF EXISTS resources_teacher_delete ON storage.objects;
CREATE POLICY resources_teacher_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );

DROP POLICY IF EXISTS thumbnails_teacher_upload ON storage.objects;
CREATE POLICY thumbnails_teacher_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resource-thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );

DROP POLICY IF EXISTS thumbnails_teacher_delete ON storage.objects;
CREATE POLICY thumbnails_teacher_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'resource-thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );

-- RLS: teachers manage only their own materials
DROP POLICY IF EXISTS materials_teacher_manage ON public.materials;
DROP POLICY IF EXISTS "Teachers can manage their own materials" ON public.materials;
CREATE POLICY materials_teacher_own ON public.materials
  FOR ALL TO authenticated
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS materials_public_published ON public.materials;
CREATE POLICY materials_public_published ON public.materials
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND COALESCE(moderation_status, 'approved') = 'approved'
  );

CREATE INDEX IF NOT EXISTS idx_materials_content_type ON public.materials(content_type);
CREATE INDEX IF NOT EXISTS idx_materials_difficulty ON public.materials(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_materials_age_range ON public.materials(age_range);
CREATE INDEX IF NOT EXISTS idx_materials_language ON public.materials(language);

ALTER TABLE public.resource_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS resource_files_teacher ON public.resource_files;
CREATE POLICY resource_files_teacher ON public.resource_files
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.id = resource_id AND (m.created_by = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.id = resource_id AND (m.created_by = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS resource_files_public_read ON public.resource_files;
CREATE POLICY resource_files_public_read ON public.resource_files
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.id = resource_id AND m.status = 'published'
    )
  );
