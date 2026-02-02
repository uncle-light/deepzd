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
