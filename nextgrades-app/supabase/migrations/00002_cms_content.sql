-- CMS Database Schema

-- Media library table
CREATE TABLE public.cms_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- image, video, pdf
    file_size BIGINT,
    thumbnail_url TEXT,
    url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages/sections table
CREATE TABLE public.cms_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_key TEXT NOT NULL UNIQUE, -- e.g., 'home-hero', 'about-page'
    section_name TEXT NOT NULL,
    page_name TEXT NOT NULL, -- e.g., 'home', 'about', 'contact'
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content fields table
CREATE TABLE public.cms_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES public.cms_sections(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL, -- e.g., 'hero-title', 'hero-description'
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text', -- text, textarea, image, video, url, boolean, number
    content_value TEXT,
    content_json JSONB, -- for structured content
    media_id UUID REFERENCES public.cms_media(id),
    is_required BOOLEAN DEFAULT FALSE,
    placeholder TEXT,
    help_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, field_key)
);

-- Testimonials table
CREATE TABLE public.cms_testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    avatar_url TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE public.cms_team (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    social_links JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs table
CREATE TABLE public.cms_faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO settings table
CREATE TABLE public.cms_seo (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_name TEXT NOT NULL UNIQUE,
    title TEXT,
    description TEXT,
    keywords TEXT,
    og_image_url TEXT,
    twitter_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all CMS tables
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_seo ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CMS (only admins can manage content)
CREATE POLICY "Admins can manage CMS media" ON public.cms_media
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage CMS sections" ON public.cms_sections
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage CMS content" ON public.cms_content
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage testimonials" ON public.cms_testimonials
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage team" ON public.cms_team
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage FAQs" ON public.cms_faqs
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage SEO" ON public.cms_seo
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- View policies (everyone can view active content)
CREATE POLICY "Everyone can view active testimonials" ON public.cms_testimonials
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Everyone can view active team" ON public.cms_team
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Everyone can view active FAQs" ON public.cms_faqs
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Everyone can view SEO" ON public.cms_seo
  FOR SELECT USING (TRUE);

CREATE POLICY "Everyone can view active sections" ON public.cms_sections
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Everyone can view content" ON public.cms_content
  FOR SELECT USING (TRUE);

-- Insert initial CMS sections
INSERT INTO public.cms_sections (section_key, section_name, page_name, description, sort_order) VALUES
  ('home-hero', 'Hero Section', 'Home Page', 'Main hero section on home page', 1),
  ('home-features', 'Features Section', 'Home Page', 'Features displayed on home page', 2),
  ('home-testimonials', 'Testimonials Section', 'Home Page', 'Testimonials displayed on home page', 3),
  ('home-cta', 'CTA Section', 'Home Page', 'Call to action section', 4),
  ('about-hero', 'About Page Hero', 'About Page', 'Hero section on about page', 1),
  ('about-story', 'Our Story', 'About Page', 'Story section on about page', 2),
  ('about-team', 'Our Team', 'About Page', 'Team members section', 3),
  ('contact-info', 'Contact Information', 'Contact Page', 'Contact details', 1),
  ('navbar-content', 'Navbar Content', 'Global', 'Navbar links and branding', 1),
  ('footer-content', 'Footer Content', 'Global', 'Footer links and branding', 2);

-- Insert initial content fields
INSERT INTO public.cms_content (section_id, field_key, field_name, field_type, content_value, is_required, placeholder, help_text, sort_order)
SELECT
  s.id,
  'hero-title',
  'Hero Title',
  'text',
  'Wissen, das dich weiterbringt.',
  true,
  'Enter hero title',
  'Main heading in hero section',
  1
FROM public.cms_sections s WHERE s.section_key = 'home-hero';

INSERT INTO public.cms_content (section_id, field_key, field_name, field_type, content_value, is_required, placeholder, help_text, sort_order)
SELECT
  s.id,
  'hero-subtitle',
  'Hero Subtitle',
  'textarea',
  'Entdecke kostenlose Materialien, nützliche Guides und wertvolle Tipps, die dich beim Lernen unterstützen.',
  true,
  'Enter hero subtitle',
  'Subheading in hero section',
  2
FROM public.cms_sections s WHERE s.section_key = 'home-hero';
