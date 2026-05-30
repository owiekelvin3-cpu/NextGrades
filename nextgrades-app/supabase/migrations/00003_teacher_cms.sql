-- Teacher CMS Extensions
-- This migration adds tables and features for the Teacher Content Management System

-- Resource categories table
CREATE TABLE public.resource_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource tags table
CREATE TABLE public.resource_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for resource-tag relationships
CREATE TABLE public.resource_tag_relations (
  resource_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.resource_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- Enhanced materials table with CMS features
ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'pending_review', 'private', 'scheduled', 'archived')),
ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'free' CHECK (access_type IN ('free', 'premium', 'locked', 'members_only')),
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.resource_categories(id),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS student_reach INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_generated NUMERIC(10,2) DEFAULT 0;

-- Resource analytics table
CREATE TABLE public.resource_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resource_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'preview', 'share')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource folders/organization table
CREATE TABLE public.resource_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_folder_id UUID REFERENCES public.resource_folders(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link materials to folders
ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.resource_folders(id);

-- Enable RLS for new tables
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Resource Categories
CREATE POLICY "Everyone can view active categories" ON public.resource_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage categories" ON public.resource_categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Resource Tags
CREATE POLICY "Everyone can view tags" ON public.resource_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage tags" ON public.resource_tags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Resource Tag Relations
CREATE POLICY "Everyone can view tag relations" ON public.resource_tag_relations
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins and teachers can manage tag relations" ON public.resource_tag_relations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'teacher')
  ));

-- RLS Policies for Resource Analytics
CREATE POLICY "Teachers can view analytics for their resources" ON public.resource_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.materials m 
    WHERE m.id = resource_analytics.resource_id 
    AND m.created_by = auth.uid()
  ));

CREATE POLICY "Admins can view all analytics" ON public.resource_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "System can create analytics" ON public.resource_analytics
  FOR INSERT WITH CHECK (TRUE);

-- RLS Policies for Resource Folders
CREATE POLICY "Teachers can view their own folders" ON public.resource_folders
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can manage their own folders" ON public.resource_folders
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all folders" ON public.resource_folders
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Update materials RLS to include folder ownership
DROP POLICY IF EXISTS "Admins and teachers can manage materials" ON public.materials;

CREATE POLICY "Teachers can manage their own materials" ON public.materials
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.resource_folders f 
      WHERE f.id = materials.folder_id 
      AND f.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all materials" ON public.materials
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Insert initial resource categories
INSERT INTO public.resource_categories (name, description, icon, sort_order) VALUES
  ('Worksheets', 'Printable worksheets and exercises', 'file-text', 1),
  ('Videos', 'Video lessons and tutorials', 'video', 2),
  ('Notes', 'Study notes and summaries', 'book-open', 3),
  ('Quizzes', 'Practice quizzes and tests', 'clipboard-check', 4),
  ('Past Papers', 'Previous exam papers', 'archive', 5),
  ('Assignments', 'Homework assignments', 'pen-tool', 6),
  ('Courses', 'Complete course materials', 'layers', 7),
  ('Other', 'Other educational resources', 'more-horizontal', 8);

-- Insert initial resource tags
INSERT INTO public.resource_tags (name, slug, color) VALUES
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
  ('Advanced', 'advanced', '#F97316');

-- Create indexes for better performance
CREATE INDEX idx_materials_status ON public.materials(status);
CREATE INDEX idx_materials_access_type ON public.materials(access_type);
CREATE INDEX idx_materials_category_id ON public.materials(category_id);
CREATE INDEX idx_materials_folder_id ON public.materials(folder_id);
CREATE INDEX idx_materials_created_by ON public.materials(created_by);
CREATE INDEX idx_resource_analytics_resource_id ON public.resource_analytics(resource_id);
CREATE INDEX idx_resource_analytics_user_id ON public.resource_analytics(user_id);
CREATE INDEX idx_resource_analytics_action ON public.resource_analytics(action);
CREATE INDEX idx_resource_analytics_created_at ON public.resource_analytics(created_at);
CREATE INDEX idx_resource_folders_teacher_id ON public.resource_folders(teacher_id);
CREATE INDEX idx_resource_folders_parent_folder_id ON public.resource_folders(parent_folder_id);

-- Function to automatically track resource views
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

-- Note: This trigger should be enabled selectively, not on every material update
-- It's meant to be called when a resource is viewed/downloaded
