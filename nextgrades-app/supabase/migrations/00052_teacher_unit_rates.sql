-- Per-level unit rates for teacher earnings display (Notenfabrik-style).
ALTER TABLE public.teacher_stats
  ADD COLUMN IF NOT EXISTS rate_lower_level NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS rate_upper_level NUMERIC(10, 2);

COMMENT ON COLUMN public.teacher_stats.rate_lower_level IS 'Unterstufen tariff per Unterrichtseinheit (EUR)';
COMMENT ON COLUMN public.teacher_stats.rate_upper_level IS 'Oberstufen tariff per Unterrichtseinheit (EUR)';
