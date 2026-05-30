-- NextGrades notification system: extended schema, prefs, push, announcements

-- Extend notifications table
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id UUID,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'delivered'
    CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'scheduled')),
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Relax type constraint (keep legacy values, allow any text)
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, created_at DESC)
  WHERE is_read = FALSE;

-- Allow users to delete their own notifications
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

-- Notification preferences on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
    "pushEnabled": true,
    "soundEnabled": true,
    "emailEnabled": true,
    "categories": {
      "resource": true,
      "course": true,
      "live_class": true,
      "assignment": true,
      "grade": true,
      "exam": true,
      "message": true,
      "announcement": true,
      "account": true,
      "enrollment": true,
      "submission": true,
      "system": true
    },
    "emailLessons": true,
    "emailMaterials": true,
    "emailMarketing": false
  }'::jsonb;

-- Web push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subscriptions_select_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_select_own" ON public.push_subscriptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_insert_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_insert_own" ON public.push_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_delete_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_delete_own" ON public.push_subscriptions
  FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions (user_id);

-- Admin scheduled announcements
CREATE TABLE IF NOT EXISTS public.scheduled_announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  audience TEXT NOT NULL DEFAULT 'all'
    CHECK (audience IN ('all', 'students', 'teachers', 'admins')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scheduled_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_admin_all" ON public.scheduled_announcements;
CREATE POLICY "announcements_admin_all" ON public.scheduled_announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Enable realtime for notifications (ignore if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
