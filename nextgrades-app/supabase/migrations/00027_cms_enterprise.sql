-- Enterprise CMS: navigation, theme, structured page content

-- Header / footer navigation
CREATE TABLE IF NOT EXISTS public.cms_navigation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location TEXT NOT NULL CHECK (location IN ('header', 'footer')),
  label_en TEXT NOT NULL,
  label_de TEXT,
  href TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  opens_new_tab BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_navigation_location ON public.cms_navigation(location, sort_order);

-- Global theme / branding (single row)
CREATE TABLE IF NOT EXISTS public.cms_theme_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  settings_key TEXT NOT NULL UNIQUE DEFAULT 'default',
  primary_color TEXT DEFAULT '#D4AF37',
  secondary_color TEXT DEFAULT '#0D1B2A',
  accent_color TEXT DEFAULT '#1B4965',
  font_heading TEXT DEFAULT 'inherit',
  font_body TEXT DEFAULT 'inherit',
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  border_radius TEXT DEFAULT '0.75rem',
  button_style TEXT DEFAULT 'rounded',
  config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

INSERT INTO public.cms_theme_settings (settings_key)
VALUES ('default')
ON CONFLICT (settings_key) DO NOTHING;

-- Programs (marketing cards)
CREATE TABLE IF NOT EXISTS public.cms_program_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_de TEXT,
  description_en TEXT,
  description_de TEXT,
  features_json JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  category TEXT,
  price_label TEXT,
  cta_label_en TEXT,
  cta_label_de TEXT,
  cta_href TEXT DEFAULT '/consultation',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.cms_subject_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_de TEXT,
  description_en TEXT,
  description_de TEXT,
  icon_key TEXT,
  image_url TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing plans
CREATE TABLE IF NOT EXISTS public.cms_pricing_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_de TEXT,
  description_en TEXT,
  description_de TEXT,
  price_monthly TEXT,
  price_annual TEXT,
  features_json JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT FALSE,
  discount_label TEXT,
  cta_label_en TEXT,
  cta_label_de TEXT,
  cta_href TEXT DEFAULT '/checkout',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing resources (CMS-managed, separate from teacher resources)
CREATE TABLE IF NOT EXISTS public.cms_marketing_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_de TEXT,
  description_en TEXT,
  description_de TEXT,
  resource_type TEXT NOT NULL DEFAULT 'article',
  file_url TEXT,
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.cms_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_program_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_subject_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_marketing_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY cms_navigation_public_read ON public.cms_navigation FOR SELECT USING (is_visible = TRUE);
CREATE POLICY cms_navigation_admin ON public.cms_navigation FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY cms_theme_public_read ON public.cms_theme_settings FOR SELECT USING (TRUE);
CREATE POLICY cms_theme_admin ON public.cms_theme_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY cms_programs_public_read ON public.cms_program_items FOR SELECT USING (is_published = TRUE);
CREATE POLICY cms_programs_admin ON public.cms_program_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY cms_subjects_public_read ON public.cms_subject_items FOR SELECT USING (is_published = TRUE);
CREATE POLICY cms_subjects_admin ON public.cms_subject_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY cms_pricing_public_read ON public.cms_pricing_plans FOR SELECT USING (is_published = TRUE);
CREATE POLICY cms_pricing_admin ON public.cms_pricing_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY cms_mresources_public_read ON public.cms_marketing_resources FOR SELECT USING (is_published = TRUE);
CREATE POLICY cms_mresources_admin ON public.cms_marketing_resources FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
