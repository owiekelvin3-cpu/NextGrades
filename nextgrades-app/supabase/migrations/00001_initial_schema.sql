-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classes (grade levels) table
CREATE TABLE public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'excel', 'image', 'other')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  subject_id UUID REFERENCES public.subjects(id),
  class_id UUID REFERENCES public.classes(id),
  semester INTEGER CHECK (semester IN (1, 2)),
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) NOT NULL,
  class_id UUID REFERENCES public.classes(id) NOT NULL,
  semester INTEGER CHECK (semester IN (1, 2)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  start_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  zoom_link TEXT,
  zoom_meeting_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_units table
CREATE TABLE public.user_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
  total_units INTEGER NOT NULL DEFAULT 0,
  remaining_units INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teacher_stats table
CREATE TABLE public.teacher_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
  total_hours NUMERIC(10,2) DEFAULT 0,
  current_bonus_level INTEGER DEFAULT 1 CHECK (current_bonus_level IN (1, 2, 3, 4)),
  earnings_mtd NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  name TEXT,
  role TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Subjects
CREATE POLICY "Everyone can view active subjects" ON public.subjects
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Classes
CREATE POLICY "Everyone can view classes" ON public.classes
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Materials
CREATE POLICY "Everyone can view free materials" ON public.materials
  FOR SELECT USING (is_premium = FALSE);

CREATE POLICY "Premium materials require enrollment" ON public.materials
  FOR SELECT USING (
    is_premium = FALSE OR
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.student_id = auth.uid()
        AND e.subject_id = materials.subject_id
        AND (e.class_id = materials.class_id OR materials.class_id IS NULL)
        AND (e.semester = materials.semester OR materials.semester IS NULL)
        AND e.status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Admins and teachers can manage materials" ON public.materials
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'teacher')
  ));

-- RLS Policies for Enrollments
CREATE POLICY "Students can view their own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view their students' enrollments" ON public.enrollments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.lessons l WHERE l.teacher_id = auth.uid() AND l.student_id = enrollments.student_id
  ));

CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Lessons
CREATE POLICY "Students can view their own lessons" ON public.lessons
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view and manage their own lessons" ON public.lessons
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all lessons" ON public.lessons
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for User Units
CREATE POLICY "Students can view their own units" ON public.user_units
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all user units" ON public.user_units
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Teacher Stats
CREATE POLICY "Teachers can view their own stats" ON public.teacher_stats
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all teacher stats" ON public.teacher_stats
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Activity Logs
CREATE POLICY "Users can view their own activity" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" ON public.activity_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for Testimonials
CREATE POLICY "Everyone can view active testimonials" ON public.testimonials
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  IF (NEW.raw_user_meta_data->>'role') = 'student' THEN
    INSERT INTO public.user_units (student_id) VALUES (NEW.id);
  ELSIF (NEW.raw_user_meta_data->>'role') = 'teacher' THEN
    INSERT INTO public.teacher_stats (teacher_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial subjects
INSERT INTO public.subjects (name, description, icon, sort_order) VALUES
  ('Mathematik', 'Mathematik Nachhilfe für alle Klassenstufen', 'book', 1),
  ('Englisch', 'Englisch Nachhilfe und Sprachunterricht', 'globe', 2),
  ('Deutsch', 'Deutsch, Literatur und Sprachunterricht', 'file-text', 3),
  ('Physik', 'Physik und Naturwissenschaften', 'zap', 4),
  ('Chemie', 'Chemie und Experimente', 'flask', 5),
  ('Wirtschaft & BWL', 'Wirtschaft, BWL und VWL', 'trending-up', 6),
  ('Informatik', 'Informatik, Programmieren und IT', 'code', 7),
  ('Technisches Zeichnen', 'Technisches Zeichnen und CAD', 'pen-tool', 8);

-- Insert initial classes
INSERT INTO public.classes (name, level, description) VALUES
  ('1. Klasse', 1, 'Gymnasium Oberstufe'),
  ('2. Klasse', 2, 'Gymnasium Oberstufe'),
  ('3. Klasse', 3, 'Gymnasium Oberstufe'),
  ('4. Klasse', 4, 'Gymnasium Oberstufe'),
  ('5. Klasse', 5, 'Gymnasium Unterstufe'),
  ('6. Klasse', 6, 'Gymnasium Unterstufe'),
  ('7. Klasse', 7, 'Gymnasium Unterstufe'),
  ('8. Klasse', 8, 'Gymnasium Mittelstufe'),
  ('9. Klasse', 9, 'Gymnasium Mittelstufe'),
  ('10. Klasse', 10, 'Gymnasium Mittelstufe'),
  ('11. Klasse', 11, 'Gymnasium Oberstufe - 1. Halbjahr'),
  ('12. Klasse', 12, 'Gymnasium Oberstufe - 2. Halbjahr');
