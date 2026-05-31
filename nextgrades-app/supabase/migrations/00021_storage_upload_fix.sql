-- Fix teacher resource uploads: expand MIME types and ensure buckets + policies exist.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resource-thumbnails',
  'resource-thumbnails',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS resources_teacher_upload ON storage.objects;
CREATE POLICY resources_teacher_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );

DROP POLICY IF EXISTS resources_teacher_read ON storage.objects;
CREATE POLICY resources_teacher_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );

DROP POLICY IF EXISTS resources_teacher_update ON storage.objects;
CREATE POLICY resources_teacher_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  )
  WITH CHECK (
    bucket_id = 'resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );

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

DROP POLICY IF EXISTS thumbnails_public_read ON storage.objects;
CREATE POLICY thumbnails_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'resource-thumbnails');

DROP POLICY IF EXISTS thumbnails_teacher_delete ON storage.objects;
CREATE POLICY thumbnails_teacher_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'resource-thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_teacher_or_admin()
  );
