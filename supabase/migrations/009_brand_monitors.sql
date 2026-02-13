-- 品牌监控配置
CREATE TABLE IF NOT EXISTS public.brand_monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand_names text[] NOT NULL,
  competitor_brands jsonb NOT NULL DEFAULT '[]',
  industry_keywords text[] NOT NULL,
  locale text NOT NULL DEFAULT 'zh',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 每次检查的结果快照
CREATE TABLE IF NOT EXISTS public.monitor_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL REFERENCES public.brand_monitors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'running',
  summary jsonb,
  detail jsonb,
  query_count integer NOT NULL DEFAULT 0,
  engine_count integer NOT NULL DEFAULT 0,
  duration integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_brand_monitors_user ON public.brand_monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_monitor_checks_monitor ON public.monitor_checks(monitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitor_checks_user ON public.monitor_checks(user_id);

-- RLS
ALTER TABLE public.brand_monitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own monitors" ON public.brand_monitors
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.monitor_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checks" ON public.monitor_checks
  FOR ALL USING (auth.uid() = user_id);

-- updated_at 触发器（复用现有 handle_updated_at 函数）
CREATE TRIGGER set_brand_monitors_updated_at
  BEFORE UPDATE ON public.brand_monitors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_monitor_checks_updated_at
  BEFORE UPDATE ON public.monitor_checks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
