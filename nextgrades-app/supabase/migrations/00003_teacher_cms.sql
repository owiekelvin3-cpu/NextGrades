-- Teacher CMS Extensions (idempotent — safe to re-run in Supabase SQL Editor)
-- Prerequisites: run 00001_initial_schema.sql first (materials + profiles must exist)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS resource_categories_name_unique ON public.resource_categories (name);

CREATE TABLE IF NOT EXISTS public.resource_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resource_tag_relations (
  resource_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.resource_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.resource_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resource_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'preview', 'share')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resource_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_folder_id UUID REFERENCES public.resource_folders(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Materials CMS columns (skip download_count — already on materials in 00001)
-- ---------------------------------------------------------------------------
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'free';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.resource_categories(id);
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS student_reach INTEGER DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS revenue_generated NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.resource_folders(id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active categories" ON public.resource_categories;
CREATE POLICY "Everyone can view active categories" ON public.resource_categories
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.resource_categories;
CREATE POLICY "Admins can manage categories" ON public.resource_categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Everyone can view tags" ON public.resource_tags;
CREATE POLICY "Everyone can view tags" ON public.resource_tags
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage tags" ON public.resource_tags;
CREATE POLICY "Admins can manage tags" ON public.resource_tags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Everyone can view tag relations" ON public.resource_tag_relations;
CREATE POLICY "Everyone can view tag relations" ON public.resource_tag_relations
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins and teachers can manage tag relations" ON public.resource_tag_relations;
CREATE POLICY "Admins and teachers can manage tag relations" ON public.resource_tag_relations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'teacher')
  ));

DROP POLICY IF EXISTS "Teachers can view analytics for their resources" ON public.resource_analytics;
CREATE POLICY "Teachers can view analytics for their resources" ON public.resource_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.materials m
    WHERE m.id = resource_analytics.resource_id
    AND m.created_by = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.resource_analytics;
CREATE POLICY "Admins can view all analytics" ON public.resource_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "System can create analytics" ON public.resource_analytics;
CREATE POLICY "System can create analytics" ON public.resource_analytics
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Teachers can view their own folders" ON public.resource_folders;
CREATE POLICY "Teachers can view their own folders" ON public.resource_folders
  FOR SELECT USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can manage their own folders" ON public.resource_folders;
CREATE POLICY "Teachers can manage their own folders" ON public.resource_folders
  FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all folders" ON public.resource_folders;
CREATE POLICY "Admins can manage all folders" ON public.resource_folders
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins and teachers can manage materials" ON public.materials;
DROP POLICY IF EXISTS "Teachers can manage their own materials" ON public.materials;
CREATE POLICY "Teachers can manage their own materials" ON public.materials
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.resource_folders f
      WHERE f.id = materials.folder_id
      AND f.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all materials" ON public.materials;
CREATE POLICY "Admins can manage all materials" ON public.materials
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ---------------------------------------------------------------------------
-- Seed data (skip if already present)
-- ---------------------------------------------------------------------------
INSERT INTO public.resource_categories (name, description, icon, sort_order)
SELECT v.name, v.description, v.icon, v.sort_order
FROM (VALUES
  ('Worksheets', 'Printable worksheets and exercises', 'file-text', 1),
  ('Videos', 'Video lessons and tutorials', 'video', 2),
  ('Notes', 'Study notes and summaries', 'book-open', 3),
  ('Quizzes', 'Practice quizzes and tests', 'clipboard-check', 4),
  ('Past Papers', 'Previous exam papers', 'archive', 5),
  ('Assignments', 'Homework assignments', 'pen-tool', 6),
  ('Courses', 'Complete course materials', 'layers', 7),
  ('Other', 'Other educational resources', 'more-horizontal', 8)
) AS v(name, description, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.resource_categories c WHERE c.name = v.name
);

INSERT INTO public.resource_tags (name, slug, color)
SELECT v.name, v.slug, v.color
FROM (VALUES
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
  ('Advanced', 'advanced', '#F97316')
) AS v(name, slug, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.resource_tags t WHERE t.slug = v.slug
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_materials_status ON public.materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_access_type ON public.materials(access_type);
CREATE INDEX IF NOT EXISTS idx_materials_category_id ON public.materials(category_id);
CREATE INDEX IF NOT EXISTS idx_materials_folder_id ON public.materials(folder_id);
CREATE INDEX IF NOT EXISTS idx_materials_created_by ON public.materials(created_by);
CREATE INDEX IF NOT EXISTS idx_resource_analytics_resource_id ON public.resource_analytics(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_analytics_user_id ON public.resource_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_analytics_action ON public.resource_analytics(action);
CREATE INDEX IF NOT EXISTS idx_resource_analytics_created_at ON public.resource_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_resource_folders_teacher_id ON public.resource_folders(teacher_id);
CREATE INDEX IF NOT EXISTS idx_resource_folders_parent_folder_id ON public.resource_folders(parent_folder_id);

-- ---------------------------------------------------------------------------
-- Helper (optional analytics hook)
-- ---------------------------------------------------------------------------
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
