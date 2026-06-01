-- CMS Studio: draft/publish, revisions, activity log, page layouts

ALTER TABLE public.cms_content
  ADD COLUMN IF NOT EXISTS draft_json JSONB,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

COMMENT ON COLUMN public.cms_content.draft_json IS 'Unpublished draft values { en, de }';
COMMENT ON COLUMN public.cms_content.content_json IS 'Published live values { en, de }';

CREATE TABLE IF NOT EXISTS public.cms_revisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_id UUID REFERENCES public.cms_content(id) ON DELETE CASCADE,
  i18n_key TEXT NOT NULL,
  snapshot_json JSONB NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_revisions_i18n_key ON public.cms_revisions(i18n_key, created_at DESC);

CREATE TABLE IF NOT EXISTS public.cms_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  page_name TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES public.profiles(id),
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_activity_created ON public.cms_activity_log(created_at DESC);

CREATE TABLE IF NOT EXISTS public.cms_page_layouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_name TEXT NOT NULL,
  section_key TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_name, section_key)
);

ALTER TABLE public.cms_seo
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS structured_data JSONB;

ALTER TABLE public.cms_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_layouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage cms revisions" ON public.cms_revisions;
CREATE POLICY "Admins manage cms revisions" ON public.cms_revisions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins manage cms activity" ON public.cms_activity_log;
CREATE POLICY "Admins manage cms activity" ON public.cms_activity_log
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins manage cms page layouts" ON public.cms_page_layouts;
CREATE POLICY "Admins manage cms page layouts" ON public.cms_page_layouts
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Public read cms page layouts" ON public.cms_page_layouts;
CREATE POLICY "Public read cms page layouts" ON public.cms_page_layouts
  FOR SELECT USING (true);
