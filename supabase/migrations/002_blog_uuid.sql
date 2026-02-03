-- 博客文章表 ID 改为 UUID
-- 运行方式: 在 Supabase SQL Editor 中执行
-- 注意: 此脚本会删除现有数据并重建表

begin;

-- 1. 删除依赖的表（如果存在）
drop table if exists public.blog_post_tags cascade;
drop table if exists public.blog_tags cascade;
drop table if exists public.blog_posts cascade;

-- 2. 创建 blog_posts 表（UUID）
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_zh text not null,
  title_en text not null,
  excerpt_zh text,
  excerpt_en text,
  content_zh text,
  content_en text,
  published_at date,
  read_time integer,
  created_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;
create policy "Public read blog posts" on public.blog_posts for select using (true);

-- 3. 创建标签表
create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_zh text not null,
  name_en text not null,
  created_at timestamptz not null default now()
);

alter table public.blog_tags enable row level security;
create policy "Public read blog tags" on public.blog_tags for select using (true);

-- 4. 创建文章-标签关联表
create table public.blog_post_tags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, tag_id)
);

alter table public.blog_post_tags enable row level security;
create policy "Public read blog post tags" on public.blog_post_tags for select using (true);

-- 5. 创建索引
create index idx_blog_post_tags_post_id on public.blog_post_tags(post_id);
create index idx_blog_post_tags_tag_id on public.blog_post_tags(tag_id);

-- 6. 插入初始标签
insert into public.blog_tags (slug, name_zh, name_en) values
  ('geo-basics', 'GEO基础', 'GEO Basics'),
  ('case-study', '案例分析', 'Case Study'),
  ('tutorial', '教程指南', 'Tutorial'),
  ('news', '行业动态', 'Industry News'),
  ('tools', '工具推荐', 'Tools');

-- 7. 插入博客文章数据
-- 文章 1: 什么是GEO
insert into public.blog_posts (slug, title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en, published_at, read_time) values (
  'what-is-geo',
  '什么是GEO？生成式引擎优化完整指南',
  'What is GEO? Complete Guide to Generative Engine Optimization',
  '深入了解GEO的概念、原理和实践方法，让你的内容被AI主动引用。',
  'Deep dive into GEO concepts, principles and practices.',
  '## 什么是GEO？

GEO（Generative Engine Optimization，生成式引擎优化）是一种针对AI搜索引擎的内容优化策略，旨在提高内容在ChatGPT、Perplexity、Claude、Grok等生成式AI工具中的可见度和被引用率。

与传统SEO不同，GEO的目标不是在搜索结果页面获得更高排名，而是让AI在生成回答时主动引用、推荐你的内容。

### GEO的起源与学术背景

"Generative Engine Optimization"一词由普林斯顿大学、印度理工学院德里分校、佐治亚理工学院和艾伦人工智能研究所的研究人员在2023年11月发表的学术论文《GEO: Generative Engine Optimization》中首次提出。

该研究分析了数千个查询和网页，发现通过特定的优化策略，内容被AI引用的概率可以提升40%以上。这一发现为内容创作者提供了全新的优化方向。

### 为什么GEO在2024年变得如此重要？

用户获取信息的方式正在发生根本性变化：

**1. 搜索行为的转变**

越来越多用户直接向AI提问，而非使用传统搜索引擎。据统计，2024年ChatGPT的月活跃用户已超过1亿，成为仅次于Google的信息获取渠道。

**2. 零点击搜索趋势**

AI直接给出答案，用户无需点击链接即可获得所需信息。这意味着即使你的网站排名第一，也可能因为AI的存在而失去流量。

**3. 流量来源的变化**

2024年ChatGPT访问量已超过Bing，成为第二大搜索入口。忽视GEO意味着放弃一个巨大的流量来源。

**4. AI搜索引擎的崛起**

Perplexity、You.com等AI原生搜索引擎快速增长，Google也推出了AI Overview功能。AI搜索正在成为主流。

### GEO的核心原则

**1. 结构化内容**

使用清晰的标题层级（H1、H2、H3），让AI更容易理解和提取信息。研究表明，结构化良好的内容被AI引用的概率提升35%。

- 每个章节聚焦一个主题
- 使用列表和表格整理复杂信息
- 段落简短，每段围绕一个要点

**2. 权威引用**

引用学术论文、官方报告、行业数据等可信来源，增强内容可信度。AI在选择引用来源时，会优先考虑有据可查的内容。

**3. 直接回答**

在文章开头就提供明确答案，满足AI对"直接回答"的偏好。这种写作方式被称为"倒金字塔结构"。

**4. 数据支撑**

使用具体的统计数据和研究结果，让内容更具说服力。带有数据支撑的内容被引用概率提升180%。

**5. E-E-A-T信号**

展示专业知识（Expertise）、经验（Experience）、权威性（Authoritativeness）和可信度（Trustworthiness）。这是Google和AI共同看重的质量信号。

### 如何开始GEO优化？

**第一步：审视现有内容**

检查你的内容结构是否清晰，是否有明确的标题层级，段落是否简洁。

**第二步：添加权威引用**

为关键论点添加可信来源的引用，包括学术论文、官方数据、行业报告等。

**第三步：实施Schema标记**

使用JSON-LD格式添加结构化数据，帮助AI更好地理解内容类型和结构。

**第四步：优化回答方式**

确保内容直接回答用户可能提出的问题，在文章开头就给出核心答案。

**第五步：保持内容新鲜**

定期更新内容，添加最新信息和数据，AI偏好时效性强的内容。

### GEO与SEO的关系

GEO不是取代SEO，而是面向AI时代的必要补充。两者协同工作，才能确保内容在传统搜索和AI搜索中都具有可见性。

好的SEO基础有助于GEO优化，因为：
- 结构化内容对两者都有帮助
- 高质量内容是共同的基础
- 技术优化确保内容可被抓取

### 总结

GEO是AI时代内容创作者必须掌握的新技能。通过结构化内容、权威引用、直接回答和数据支撑，你可以显著提升内容被AI引用的概率，在新的搜索格局中占据有利位置。',
  '## What is GEO?

GEO (Generative Engine Optimization) is a content optimization strategy designed to improve visibility in AI-generated results from tools like ChatGPT, Perplexity, Claude, and Grok.

Unlike traditional SEO which aims for higher rankings on search result pages, GEO focuses on getting your content cited and recommended by AI when generating answers.

### Origin and Academic Background

The term was first introduced in the research paper "GEO: Generative Engine Optimization" published in November 2023 by researchers from Princeton University, IIT Delhi, Georgia Tech, and the Allen Institute for AI.

The study analyzed thousands of queries and web pages, finding that specific optimization strategies can increase AI citation probability by over 40%.

### Why GEO Matters in 2024

User behavior is fundamentally changing:

**1. Search Behavior Shift**

More users ask AI directly instead of using traditional search engines. ChatGPT now has over 100 million monthly active users, becoming the second-largest information retrieval channel after Google.

**2. Zero-Click Search Trend**

AI provides answers without requiring clicks. Even if your website ranks first, you may lose traffic due to AI-generated answers.

**3. Traffic Source Changes**

ChatGPT surpassed Bing in traffic volume in 2024. Ignoring GEO means abandoning a massive traffic source.

**4. Rise of AI Search Engines**

Perplexity, You.com and other AI-native search engines are growing rapidly. Google has also launched AI Overview. AI search is becoming mainstream.

### Core Principles of GEO

**1. Structured Content**

Use clear heading hierarchy (H1, H2, H3) so AI can easily understand and extract information. Research shows well-structured content has 35% higher citation probability.

- Focus each section on one topic
- Use lists and tables for complex information
- Keep paragraphs short, one point per paragraph

**2. Authoritative Citations**

Reference academic papers, official reports, and industry data to enhance credibility. AI prioritizes verifiable content when selecting sources.

**3. Direct Answers**

Provide clear answers upfront using the "inverted pyramid" writing structure to match AI''s preference for direct responses.

**4. Data Support**

Use specific statistics and research findings. Content with data support sees 180% higher citation rates.

**5. E-E-A-T Signals**

Demonstrate Expertise, Experience, Authoritativeness, and Trustworthiness—quality signals valued by both Google and AI.

### Getting Started with GEO

**Step 1: Audit Existing Content**

Check if your content structure is clear, has proper heading hierarchy, and concise paragraphs.

**Step 2: Add Authoritative Citations**

Add credible source citations for key arguments, including academic papers, official data, and industry reports.

**Step 3: Implement Schema Markup**

Add JSON-LD structured data to help AI better understand content type and structure.

**Step 4: Optimize Answer Format**

Ensure content directly answers potential user questions with core answers at the beginning.

**Step 5: Maintain Freshness**

Regularly update content with latest information and data. AI prefers timely content.

### GEO and SEO Relationship

GEO doesn''t replace SEO—it''s a necessary complement for the AI era. Both working together ensures visibility in traditional and AI search.

Good SEO foundation helps GEO because:
- Structured content benefits both
- High-quality content is the common foundation
- Technical optimization ensures content is crawlable

### Summary

GEO is an essential new skill for content creators in the AI era. Through structured content, authoritative citations, direct answers, and data support, you can significantly increase AI citation probability and secure an advantageous position in the new search landscape.',
  '2026-02-01',
  8
);

-- 文章 2: GEO vs SEO
insert into public.blog_posts (slug, title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en, published_at, read_time) values (
  'geo-vs-seo',
  'GEO vs SEO：有什么区别？',
  'GEO vs SEO: What''s the Difference?',
  '对比传统SEO和GEO的核心差异，了解为什么你需要同时关注两者。',
  'Compare traditional SEO and GEO to understand why you need both.',
  '## GEO与SEO的核心区别

在AI时代，内容优化不再只是SEO的事。GEO（生成式引擎优化）作为新兴策略，与传统SEO有着本质区别。理解这些区别，对于制定有效的内容策略至关重要。

### 什么是SEO？

SEO（Search Engine Optimization，搜索引擎优化）是一种通过优化网站内容和技术结构，提高在Google、Bing等传统搜索引擎中排名的策略。SEO已有超过25年的历史，是数字营销的基础技能。

### 什么是GEO？

GEO（Generative Engine Optimization，生成式引擎优化）是针对AI搜索引擎的优化策略，目标是让ChatGPT、Claude、Perplexity等AI在回答问题时引用你的内容。

### 目标的根本差异

**SEO的目标**

在搜索结果页面获得更高排名，吸引用户点击访问网站。成功的SEO意味着更多的有机流量和潜在客户。

**GEO的目标**

让AI在生成回答时引用和推荐你的内容。即使用户不点击链接，你的品牌和信息也能获得曝光。这是一种全新的"被动曝光"模式。

### 优化重点对比

| 维度 | SEO | GEO |
|------|-----|-----|
| 关键词 | 核心要素 | 次要考虑 |
| 外链建设 | 非常重要 | 影响较小 |
| 内容结构 | 有帮助 | 核心要素 |
| 引用来源 | 可选 | 必须具备 |
| 用户意图 | 重要 | 核心要素 |
| 更新频率 | 有帮助 | 非常重要 |
| 技术优化 | 核心要素 | 基础要求 |
| 内容深度 | 重要 | 非常重要 |

### SEO的核心关注点

**1. 关键词优化**

在标题、正文、meta标签、URL中合理布局目标关键词，确保搜索引擎理解页面主题。

**2. 外链建设**

获取高质量的外部链接是提升域名权重的关键。外链数量和质量直接影响排名。

**3. 技术优化**

- 网站加载速度
- 移动端适配
- Core Web Vitals指标
- 网站架构和内链

**4. 用户体验信号**

降低跳出率、提高页面停留时间、增加页面浏览深度。

### GEO的核心关注点

**1. 内容结构化**

清晰的标题层级（H1-H6），便于AI理解和提取信息。使用列表、表格等格式整理复杂内容。

**2. 权威引用**

引用学术论文、官方数据、行业报告增强可信度。AI更倾向于引用有据可查的内容。

**3. 直接回答**

开门见山给出答案，符合AI的回答模式。采用"倒金字塔"写作结构。

**4. 语义相关性**

关注用户意图而非单纯关键词匹配。AI理解语义，而非简单的关键词密度。

**5. E-E-A-T信号**

展示专业性、经验、权威性、可信度。这些信号帮助AI判断内容质量。

### 为什么需要同时做SEO和GEO？

GEO不是取代SEO，而是补充。以下是同时关注两者的原因：

**1. 流量来源多元化**

传统搜索和AI搜索都是重要流量入口。只关注一个意味着放弃另一半机会。

**2. 相互促进**

好的SEO基础有助于GEO，反之亦然。结构化内容、高质量写作对两者都有帮助。

**3. 风险分散**

搜索算法经常变化，不把所有鸡蛋放在一个篮子里是明智的策略。

**4. 用户行为多样**

不同用户有不同的搜索习惯，有人用Google，有人用ChatGPT，你需要覆盖所有人。

### 实践建议

**第一步：打好SEO基础**

确保网站技术健康，内容质量过关，基本的SEO优化到位。

**第二步：叠加GEO策略**

在现有内容基础上，添加权威引用、优化结构、增加直接回答。

**第三步：内容创作双重考虑**

新内容创作时，同时考虑SEO和GEO的需求，一次性做好优化。

**第四步：持续监测**

定期检查在传统搜索和AI回答中的表现，根据数据调整策略。

### 总结

SEO和GEO是互补关系，不是替代关系。在AI时代，同时掌握两种优化策略，才能确保内容获得最大曝光。',
  '## GEO vs SEO: Core Differences

In the AI era, content optimization goes beyond SEO. GEO is a new strategy with fundamental differences from traditional SEO. Understanding these differences is crucial for effective content strategy.

### What is SEO?

SEO (Search Engine Optimization) improves website rankings on Google, Bing and other traditional search engines. With over 25 years of history, SEO is a foundational digital marketing skill.

### What is GEO?

GEO (Generative Engine Optimization) optimizes for AI search engines, aiming to get ChatGPT, Claude, Perplexity to cite your content when answering questions.

### Fundamental Goal Differences

**SEO Goal**

Rank higher on search result pages to drive clicks and website visits. Successful SEO means more organic traffic and potential customers.

**GEO Goal**

Get AI to cite and recommend your content when generating answers. Even without clicks, your brand gains exposure—a new "passive exposure" model.

### Comparison Table

| Aspect | SEO | GEO |
|--------|-----|-----|
| Keywords | Core element | Secondary |
| Backlinks | Very important | Less impact |
| Structure | Helpful | Core element |
| Citations | Optional | Required |
| User Intent | Important | Core element |
| Freshness | Helpful | Very important |
| Technical | Core element | Basic requirement |
| Depth | Important | Very important |

### SEO Core Focus Areas

**1. Keyword Optimization**

Strategically place target keywords in titles, content, meta tags, and URLs.

**2. Link Building**

Acquire high-quality backlinks to boost domain authority. Link quantity and quality directly impact rankings.

**3. Technical Optimization**

- Page load speed
- Mobile responsiveness
- Core Web Vitals metrics
- Site architecture and internal linking

**4. User Experience Signals**

Reduce bounce rate, increase time on page, improve page view depth.

### GEO Core Focus Areas

**1. Content Structure**

Clear heading hierarchy (H1-H6) for easy AI understanding and extraction. Use lists and tables for complex content.

**2. Authoritative Citations**

Reference academic papers, official data, industry reports for credibility. AI prefers verifiable content.

**3. Direct Answers**

Provide answers upfront using "inverted pyramid" structure matching AI response patterns.

**4. Semantic Relevance**

Focus on user intent rather than keyword matching. AI understands semantics, not keyword density.

**5. E-E-A-T Signals**

Demonstrate expertise, experience, authority, trustworthiness. These signals help AI judge content quality.

### Why You Need Both

GEO complements SEO, not replaces it:

**1. Diversified Traffic**

Both traditional and AI search are important traffic sources. Focusing on one means missing half the opportunity.

**2. Mutual Benefit**

Good SEO helps GEO and vice versa. Structured content and quality writing benefit both.

**3. Risk Distribution**

Search algorithms change frequently. Don''t put all eggs in one basket.

**4. Diverse User Behavior**

Different users have different search habits. Some use Google, others use ChatGPT. Cover everyone.

### Practical Recommendations

**Step 1: Build SEO Foundation**

Ensure technical health, content quality, and basic SEO optimization.

**Step 2: Add GEO Strategies**

On existing content, add authoritative citations, optimize structure, include direct answers.

**Step 3: Dual Consideration for New Content**

When creating new content, consider both SEO and GEO requirements simultaneously.

**Step 4: Continuous Monitoring**

Regularly check performance in traditional search and AI answers. Adjust strategy based on data.

### Summary

SEO and GEO are complementary, not substitutes. In the AI era, mastering both optimization strategies ensures maximum content exposure.',
  '2026-02-02',
  6
);

-- 文章 3: 10个让AI引用你内容的实战技巧
insert into public.blog_posts (slug, title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en, published_at, read_time) values (
  'ai-citation-tips',
  '10个让AI引用你内容的实战技巧',
  '10 Tips to Get Your Content Cited by AI',
  '经过验证的GEO优化技巧，帮助你的内容获得更多AI引用。',
  'Proven GEO optimization tips to increase AI citations.',
  E'## 让AI主动引用你的10个实战技巧\n\n想让ChatGPT、Claude、Perplexity在回答问题时引用你的内容？以下是经过验证的10个GEO优化技巧。\n\n### 1. 直接回答问题\n\n在文章开头就给出明确、简洁的答案。AI偏爱能直接回答用户问题的内容。\n\n### 2. 使用数据支撑\n\n引用具体的统计数据和研究结果，增强内容可信度。\n\n### 3. 添加权威引用\n\n引用学术论文、官方报告、行业权威来源。\n\n### 4. 结构化内容\n\n使用清晰的H2、H3标题层级，让AI更容易理解和提取信息。\n\n### 5. 保持内容新鲜\n\n定期更新内容，添加最新信息和数据。\n\n### 6. 添加FAQ部分\n\n在文章末尾添加常见问题解答。\n\n### 7. 使用Schema标记\n\n添加结构化数据标记（JSON-LD）。\n\n### 8. 展示专业性（E-E-A-T）\n\n展示你的专业知识、经验、权威性和可信度。\n\n### 9. 优化可读性\n\n使用简洁明了的语言，让内容易于理解。\n\n### 10. 多平台分发\n\n在Reddit、Quora、知乎等平台分享内容。\n\n### 总结\n\nGEO优化是一个持续的过程。高质量、结构化、有据可查的内容，永远是被AI引用的基础。',
  E'## 10 Proven Tips to Get AI Citations\n\nWant ChatGPT, Claude, Perplexity to cite your content? Here are 10 verified GEO tips.\n\n### 1. Answer Questions Directly\n\nProvide clear, concise answers upfront. AI prefers content that directly addresses queries.\n\n### 2. Use Data Support\n\nCite specific statistics and research results.\n\n### 3. Add Authoritative Citations\n\nReference academic papers, official reports, industry authorities.\n\n### 4. Structure Your Content\n\nUse clear H2, H3 heading hierarchy.\n\n### 5. Keep Content Fresh\n\nUpdate regularly with latest information.\n\n### 6. Add FAQ Sections\n\nInclude Q&A at article end.\n\n### 7. Use Schema Markup\n\nAdd JSON-LD structured data.\n\n### 8. Demonstrate Expertise (E-E-A-T)\n\nShow your expertise, experience, authority, and trustworthiness.\n\n### 9. Optimize Readability\n\nUse clear, simple language.\n\n### 10. Distribute Widely\n\nShare on Reddit, Quora, forums.\n\n### Summary\n\nGEO is an ongoing process. High-quality, structured, well-sourced content is the foundation for AI citations.',
  '2026-02-03',
  10
);

-- 8. 插入文章-标签关联
-- 文章1 (what-is-geo) -> geo-basics, tutorial
insert into public.blog_post_tags (post_id, tag_id)
select p.id, t.id from public.blog_posts p, public.blog_tags t
where p.slug = 'what-is-geo' and t.slug = 'geo-basics';

insert into public.blog_post_tags (post_id, tag_id)
select p.id, t.id from public.blog_posts p, public.blog_tags t
where p.slug = 'what-is-geo' and t.slug = 'tutorial';

-- 文章2 (geo-vs-seo) -> geo-basics, case-study
insert into public.blog_post_tags (post_id, tag_id)
select p.id, t.id from public.blog_posts p, public.blog_tags t
where p.slug = 'geo-vs-seo' and t.slug = 'geo-basics';

insert into public.blog_post_tags (post_id, tag_id)
select p.id, t.id from public.blog_posts p, public.blog_tags t
where p.slug = 'geo-vs-seo' and t.slug = 'case-study';

-- 文章3 (ai-citation-tips) -> tutorial, tools
insert into public.blog_post_tags (post_id, tag_id)
select p.id, t.id from public.blog_posts p, public.blog_tags t
where p.slug = 'ai-citation-tips' and t.slug = 'tutorial';

insert into public.blog_post_tags (post_id, tag_id)
select p.id, t.id from public.blog_posts p, public.blog_tags t
where p.slug = 'ai-citation-tips' and t.slug = 'tools';

commit;
