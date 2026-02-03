-- 博客标签功能迁移脚本
-- 运行方式: 在 Supabase SQL Editor 中执行

begin;

-- 1. 创建标签表
create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_zh text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

-- 2. 创建文章-标签关联表
create table if not exists public.blog_post_tags (
  id uuid primary key default gen_random_uuid(),
  post_id bigint not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, tag_id)
);

-- 3. 启用 RLS
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;

-- 4. 创建公开读取策略
create policy "Public read blog tags"
on public.blog_tags for select using (true);

create policy "Public read blog post tags"
on public.blog_post_tags for select using (true);

-- 5. 创建索引
create index if not exists idx_blog_post_tags_post_id on public.blog_post_tags(post_id);
create index if not exists idx_blog_post_tags_tag_id on public.blog_post_tags(tag_id);

-- 6. 插入初始标签
insert into public.blog_tags (slug, name_zh, name_en) values
  ('geo-basics', 'GEO基础', 'GEO Basics'),
  ('case-study', '案例分析', 'Case Study'),
  ('tutorial', '教程指南', 'Tutorial'),
  ('news', '行业动态', 'Industry News'),
  ('tools', '工具推荐', 'Tools')
on conflict (slug) do nothing;

commit;
