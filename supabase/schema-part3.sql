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
