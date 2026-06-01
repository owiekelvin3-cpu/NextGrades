-- CMS marketing images: store under public resource-thumbnails bucket (cms/* prefix)

DROP POLICY IF EXISTS cms_thumbnails_admin_insert ON storage.objects;
CREATE POLICY cms_thumbnails_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resource-thumbnails'
    AND (storage.foldername(name))[1] = 'cms'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS cms_thumbnails_admin_update ON storage.objects;
CREATE POLICY cms_thumbnails_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'resource-thumbnails'
    AND (storage.foldername(name))[1] = 'cms'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS cms_thumbnails_admin_delete ON storage.objects;
CREATE POLICY cms_thumbnails_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'resource-thumbnails'
    AND (storage.foldername(name))[1] = 'cms'
    AND public.is_admin()
  );
