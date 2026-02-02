-- DeepZ Supabase 表结构
-- 在 Supabase Dashboard > SQL Editor 中执行

-- 1. Tools 表
CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  desc_zh TEXT,
  desc_en TEXT,
  content_zh TEXT,
  content_en TEXT,
  category_zh TEXT,
  category_en TEXT,
  url TEXT,
  icon TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. News 表
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  summary_zh TEXT,
  summary_en TEXT,
  content_zh TEXT,
  content_en TEXT,
  tag_zh TEXT,
  tag_en TEXT,
  date TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
