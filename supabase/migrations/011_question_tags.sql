-- 问题自定义标签
ALTER TABLE public.monitor_questions
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
