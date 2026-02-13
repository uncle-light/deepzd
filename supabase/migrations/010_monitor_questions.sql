-- 扩展 brand_monitors 表：增加品牌官网和简介字段
ALTER TABLE public.brand_monitors
  ADD COLUMN IF NOT EXISTS brand_website text DEFAULT '',
  ADD COLUMN IF NOT EXISTS brand_description text DEFAULT '';

-- 监控问题表：预配置的 AI 查询问题
CREATE TABLE IF NOT EXISTS public.monitor_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL REFERENCES public.brand_monitors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  core_keyword text NOT NULL,
  question text NOT NULL,
  intent_type text NOT NULL DEFAULT 'recommendation',
  search_volume integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monitor_questions_monitor
  ON public.monitor_questions(monitor_id, core_keyword);

ALTER TABLE public.monitor_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own questions" ON public.monitor_questions
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER set_monitor_questions_updated_at
  BEFORE UPDATE ON public.monitor_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
