-- DeepZ 完整建表 SQL
-- 复制全部内容到 Supabase Dashboard > SQL Editor 执行

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

-- 3. Tutorials 表
CREATE TABLE IF NOT EXISTS tutorials (
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
  difficulty TEXT DEFAULT 'beginner',
  read_time INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Prompts 表
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  desc_zh TEXT,
  desc_en TEXT,
  content_zh TEXT NOT NULL,
  content_en TEXT NOT NULL,
  category_zh TEXT,
  category_en TEXT,
  use_case_zh TEXT,
  use_case_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MCP 表
CREATE TABLE IF NOT EXISTS mcp (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  desc_zh TEXT,
  desc_en TEXT,
  content_zh TEXT,
  content_en TEXT,
  category TEXT,
  github_url TEXT,
  npm_package TEXT,
  author TEXT,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Skills 表
CREATE TABLE IF NOT EXISTS skills (
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
  level TEXT DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
