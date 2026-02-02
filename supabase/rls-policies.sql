-- 启用 RLS 并设置公开读取策略
-- 在 Supabase Dashboard > SQL Editor 中执行

-- 启用 RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- 允许公开读取
CREATE POLICY "Allow public read" ON tools FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tutorials FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON prompts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON mcp FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON skills FOR SELECT USING (true);
