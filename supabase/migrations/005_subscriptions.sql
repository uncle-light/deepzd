-- 005_subscriptions.sql
-- 订阅计划、用户订阅、使用量追踪、API Keys

-- 订阅计划定义
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  name_zh text NOT NULL,
  name_en text NOT NULL,
  price_monthly integer NOT NULL,
  price_yearly integer NOT NULL,
  analysis_limit integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]',
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  created_at timestamptz DEFAULT now()
);

-- 用户订阅
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id text REFERENCES public.plans(id) NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 使用量追踪
CREATE TABLE IF NOT EXISTS public.usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period text NOT NULL,
  analysis_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period)
);

-- API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON public.usage(user_id, period);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Users manage own subscription" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own usage" ON public.usage FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own api keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);

-- 新用户自动创建 free 订阅和当月使用量记录
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active');
  INSERT INTO public.usage (user_id, period, analysis_count)
  VALUES (NEW.id, to_char(now(), 'YYYY-MM'), 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- subscriptions updated_at 自动更新
CREATE TRIGGER on_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 初始化计划数据
INSERT INTO public.plans (id, name_zh, name_en, price_monthly, price_yearly, analysis_limit, features) VALUES
  ('free', '免费版', 'Free', 0, 0, 5, '["basic_analysis", "history"]'),
  ('pro', '专业版', 'Pro', 4900, 39900, 100, '["basic_analysis", "history", "export", "api_access", "priority_support"]'),
  ('enterprise', '企业版', 'Enterprise', 19900, 159900, -1, '["basic_analysis", "history", "export", "api_access", "priority_support", "custom_engines", "team_management"]')
ON CONFLICT (id) DO NOTHING;
