import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 类型定义
export interface Tool {
  id: number;
  slug: string;
  name_zh: string;
  name_en: string;
  desc_zh: string | null;
  desc_en: string | null;
  content_zh: string | null;
  content_en: string | null;
  category_zh: string | null;
  category_en: string | null;
  url: string | null;
  icon: string | null;
  featured: boolean;
  created_at: string;
}

export interface News {
  id: number;
  slug: string;
  title_zh: string;
  title_en: string;
  summary_zh: string | null;
  summary_en: string | null;
  content_zh: string | null;
  content_en: string | null;
  tag_zh: string | null;
  tag_en: string | null;
  date: string | null;
  source: string | null;
  created_at: string;
}

export interface Tutorial {
  id: number;
  slug: string;
  title_zh: string;
  title_en: string;
  summary_zh: string | null;
  summary_en: string | null;
  content_zh: string | null;
  content_en: string | null;
  tag_zh: string | null;
  tag_en: string | null;
  difficulty: string;
  read_time: number;
  created_at: string;
}

export interface Prompt {
  id: number;
  slug: string;
  title_zh: string;
  title_en: string;
  desc_zh: string | null;
  desc_en: string | null;
  content_zh: string;
  content_en: string;
  category_zh: string | null;
  category_en: string | null;
  use_case_zh: string | null;
  use_case_en: string | null;
  created_at: string;
}

export interface MCP {
  id: number;
  slug: string;
  name: string;
  desc_zh: string | null;
  desc_en: string | null;
  content_zh: string | null;
  content_en: string | null;
  category: string | null;
  github_url: string | null;
  npm_package: string | null;
  author: string | null;
  stars: number;
  created_at: string;
}

export interface Skill {
  id: number;
  slug: string;
  name_zh: string;
  name_en: string;
  desc_zh: string | null;
  desc_en: string | null;
  content_zh: string | null;
  content_en: string | null;
  category_zh: string | null;
  category_en: string | null;
  level: string;
  created_at: string;
}
