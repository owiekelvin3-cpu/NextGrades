-- Allow public read of published, approved materials
CREATE POLICY IF NOT EXISTS "Public can view published approved materials"
  ON public.materials FOR SELECT
  USING (
    status = 'published'
    AND moderation_status = 'approved'
  );
