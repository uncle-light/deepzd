-- 007_full_schema_bootstrap.sql
-- DeepZD full schema bootstrap (idempotent)
-- Safe to run multiple times; does not drop existing user data.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Shared trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1) Auth/Profile domain
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  locale text NOT NULL DEFAULT 'zh',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS locale text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

ALTER TABLE public.profiles
  ALTER COLUMN locale SET DEFAULT 'zh',
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.profiles SET locale = 'zh' WHERE locale IS NULL;
UPDATE public.profiles SET created_at = now() WHERE created_at IS NULL;
UPDATE public.profiles SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN locale SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_locale_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_locale_check CHECK (locale IN ('zh', 'en'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2) Analysis domain
-- ============================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content text,
  url text,
  score integer,
  results jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS url text,
  ADD COLUMN IF NOT EXISTS score integer,
  ADD COLUMN IF NOT EXISTS results jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

ALTER TABLE public.analyses
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.analyses SET created_at = now() WHERE created_at IS NULL;
UPDATE public.analyses SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.analyses
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'analyses_content_type_check'
      AND conrelid = 'public.analyses'::regclass
  ) THEN
    ALTER TABLE public.analyses
      ADD CONSTRAINT analyses_content_type_check
      CHECK (content_type IN ('url', 'text'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'analyses_score_check'
      AND conrelid = 'public.analyses'::regclass
  ) THEN
    ALTER TABLE public.analyses
      ADD CONSTRAINT analyses_score_check
      CHECK (score IS NULL OR (score >= 0 AND score <= 100));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created_at ON public.analyses(user_id, created_at DESC);

DROP TRIGGER IF EXISTS on_analyses_updated ON public.analyses;
CREATE TRIGGER on_analyses_updated
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analyses" ON public.analyses;
CREATE POLICY "Users can view own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;
CREATE POLICY "Users can delete own analyses"
  ON public.analyses FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own analyses" ON public.analyses;
CREATE POLICY "Users can update own analyses"
  ON public.analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3) Subscription/Quota/API key domain
-- ============================================
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  name_zh text NOT NULL,
  name_en text NOT NULL,
  price_monthly integer NOT NULL,
  price_yearly integer NOT NULL,
  analysis_limit integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL DEFAULT 'free' REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'active',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS billing_cycle text,
  ADD COLUMN IF NOT EXISTS status text;

ALTER TABLE public.subscriptions
  ALTER COLUMN plan_id SET DEFAULT 'free',
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN billing_cycle SET DEFAULT 'monthly',
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.subscriptions SET status = 'active' WHERE status IS NULL;
UPDATE public.subscriptions SET billing_cycle = 'monthly' WHERE billing_cycle IS NULL;
UPDATE public.subscriptions SET created_at = now() WHERE created_at IS NULL;
UPDATE public.subscriptions SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.subscriptions
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN billing_cycle SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscriptions_status_check'
      AND conrelid = 'public.subscriptions'::regclass
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_status_check
      CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscriptions_billing_cycle_check'
      AND conrelid = 'public.subscriptions'::regclass
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_billing_cycle_check
      CHECK (billing_cycle IN ('monthly', 'yearly'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL,
  analysis_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, period)
);

ALTER TABLE public.usage
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz;

ALTER TABLE public.usage
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.usage SET created_at = now() WHERE created_at IS NULL;
UPDATE public.usage SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.usage
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'usage_period_check'
      AND conrelid = 'public.usage'::regclass
  ) THEN
    ALTER TABLE public.usage
      ADD CONSTRAINT usage_period_check
      CHECK (period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Dedupe legacy data before adding unique indexes.
WITH ranked_subscriptions AS (
  SELECT
    ctid,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
    ) AS rn
  FROM public.subscriptions
)
DELETE FROM public.subscriptions s
USING ranked_subscriptions r
WHERE s.ctid = r.ctid
  AND r.rn > 1;

WITH ranked_stripe_subscriptions AS (
  SELECT
    ctid,
    ROW_NUMBER() OVER (
      PARTITION BY stripe_subscription_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
    ) AS rn
  FROM public.subscriptions
  WHERE stripe_subscription_id IS NOT NULL
)
DELETE FROM public.subscriptions s
USING ranked_stripe_subscriptions r
WHERE s.ctid = r.ctid
  AND r.rn > 1;

WITH ranked_api_keys AS (
  SELECT
    ctid,
    ROW_NUMBER() OVER (
      PARTITION BY key_hash
      ORDER BY created_at DESC NULLS LAST
    ) AS rn
  FROM public.api_keys
)
DELETE FROM public.api_keys k
USING ranked_api_keys r
WHERE k.ctid = r.ctid
  AND r.rn > 1;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_user_id ON public.subscriptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_stripe_subscription_id
  ON public.subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usage_user_period ON public.usage(user_id, period);
CREATE INDEX IF NOT EXISTS idx_usage_updated_at ON public.usage(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE UNIQUE INDEX IF NOT EXISTS uq_api_keys_key_hash ON public.api_keys(key_hash);

DROP TRIGGER IF EXISTS on_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER on_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_usage_updated ON public.usage;
CREATE TRIGGER on_usage_updated
  BEFORE UPDATE ON public.usage
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read plans" ON public.plans;
CREATE POLICY "Public read plans"
  ON public.plans FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users manage own subscription" ON public.subscriptions;
CREATE POLICY "Users manage own subscription"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own usage" ON public.usage;
CREATE POLICY "Users view own usage"
  ON public.usage FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own api keys" ON public.api_keys;
CREATE POLICY "Users manage own api keys"
  ON public.api_keys FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status, billing_cycle)
  VALUES (NEW.id, 'free', 'active', 'monthly')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.usage (user_id, period, analysis_count)
  VALUES (NEW.id, to_char(now(), 'YYYY-MM'), 0)
  ON CONFLICT (user_id, period) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON public.profiles;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

INSERT INTO public.plans (id, name_zh, name_en, price_monthly, price_yearly, analysis_limit, features)
VALUES
  ('free', '免费版', 'Free', 0, 0, 5, '["basic_analysis", "history"]'::jsonb),
  ('pro', '专业版', 'Pro', 4900, 39900, 100, '["basic_analysis", "history", "export", "api_access", "priority_support"]'::jsonb),
  ('enterprise', '企业版', 'Enterprise', 19900, 159900, -1, '["basic_analysis", "history", "export", "api_access", "priority_support", "custom_engines", "team_management"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  analysis_limit = EXCLUDED.analysis_limit,
  features = EXCLUDED.features;

-- ============================================
-- 4) Chat thread domain
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  analysis_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_threads
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS messages jsonb,
  ADD COLUMN IF NOT EXISTS analysis_id uuid,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

ALTER TABLE public.chat_threads
  ALTER COLUMN messages SET DEFAULT '[]'::jsonb,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.chat_threads SET messages = '[]'::jsonb WHERE messages IS NULL;
UPDATE public.chat_threads SET created_at = now() WHERE created_at IS NULL;
UPDATE public.chat_threads SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.chat_threads
  ALTER COLUMN messages SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chat_threads_analysis_id_fkey'
      AND conrelid = 'public.chat_threads'::regclass
  ) THEN
    ALTER TABLE public.chat_threads
      ADD CONSTRAINT chat_threads_analysis_id_fkey
      FOREIGN KEY (analysis_id)
      REFERENCES public.analyses(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON public.chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_updated_at ON public.chat_threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_updated_at ON public.chat_threads(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_analysis_id ON public.chat_threads(analysis_id);

DROP TRIGGER IF EXISTS chat_threads_updated_at ON public.chat_threads;
CREATE TRIGGER chat_threads_updated_at
  BEFORE UPDATE ON public.chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own chat threads" ON public.chat_threads;
CREATE POLICY "Users manage own chat threads"
  ON public.chat_threads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5) LangGraph checkpoint persistence tables
-- ============================================
-- These tables are compatible with the common PostgreSQL checkpointer shape.
CREATE TABLE IF NOT EXISTS public.langgraph_checkpoints (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT '',
  checkpoint_id text NOT NULL,
  parent_checkpoint_id text,
  type text,
  checkpoint jsonb NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

CREATE TABLE IF NOT EXISTS public.langgraph_writes (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT '',
  checkpoint_id text NOT NULL,
  task_id text NOT NULL,
  idx integer NOT NULL,
  channel text NOT NULL,
  type text,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

CREATE INDEX IF NOT EXISTS idx_langgraph_checkpoints_thread_id
  ON public.langgraph_checkpoints(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_langgraph_writes_thread_id
  ON public.langgraph_writes(thread_id, created_at DESC);

ALTER TABLE public.langgraph_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.langgraph_writes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own langgraph checkpoints" ON public.langgraph_checkpoints;
CREATE POLICY "Users can access own langgraph checkpoints"
  ON public.langgraph_checkpoints FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id::text = langgraph_checkpoints.thread_id
        AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id::text = langgraph_checkpoints.thread_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can access own langgraph writes" ON public.langgraph_writes;
CREATE POLICY "Users can access own langgraph writes"
  ON public.langgraph_writes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id::text = langgraph_writes.thread_id
        AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id::text = langgraph_writes.thread_id
        AND t.user_id = auth.uid()
    )
  );

-- ============================================
-- 6) Blog domain
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_zh text NOT NULL,
  title_en text NOT NULL,
  excerpt_zh text,
  excerpt_en text,
  content_zh text,
  content_en text,
  published_at date,
  read_time integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_zh text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id ON public.blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON public.blog_post_tags(tag_id);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read blog posts" ON public.blog_posts;
CREATE POLICY "Public read blog posts"
  ON public.blog_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read blog tags" ON public.blog_tags;
CREATE POLICY "Public read blog tags"
  ON public.blog_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read blog post tags" ON public.blog_post_tags;
CREATE POLICY "Public read blog post tags"
  ON public.blog_post_tags FOR SELECT
  USING (true);

INSERT INTO public.blog_tags (slug, name_zh, name_en)
VALUES
  ('geo-basics', 'GEO基础', 'GEO Basics'),
  ('case-study', '案例分析', 'Case Study'),
  ('tutorial', '教程指南', 'Tutorial'),
  ('news', '行业动态', 'Industry News'),
  ('tools', '工具推荐', 'Tools')
ON CONFLICT (slug) DO UPDATE SET
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en;

-- ============================================
-- 7) Storage bucket for avatars
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatar images are publicly readable" ON storage.objects;
CREATE POLICY "Avatar images are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

COMMIT;
