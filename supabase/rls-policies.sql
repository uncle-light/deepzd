begin;

-- Clear existing blog posts table (if any)
drop table if exists public.blog_posts cascade;

create table public.blog_posts (
  id bigserial primary key,
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

create policy "Public read blog posts"
on public.blog_posts
for select
using (true);

insert into public.blog_posts (
  slug,
  title_zh,
  title_en,
  excerpt_zh,
  excerpt_en,
  content_zh,
  content_en,
  published_at,
  read_time
) values
(
  'what-is-geo',
  $BLOG$什么是GEO？生成式引擎优化完整指南$BLOG$,
  $BLOG$What is GEO? Complete Guide to Generative Engine Optimization$BLOG$,
  $BLOG$深入了解GEO的概念、原理和实践方法，让你的内容被AI主动引用。$BLOG$,
  $BLOG$Deep dive into GEO concepts, principles and practices.$BLOG$,
  $BLOG$## 什么是GEO？

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

GEO是AI时代内容创作者必须掌握的新技能。通过结构化内容、权威引用、直接回答和数据支撑，你可以显著提升内容被AI引用的概率，在新的搜索格局中占据有利位置。$BLOG$,
  $BLOG$## What is GEO?

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

Provide clear answers upfront using the "inverted pyramid" writing structure to match AI's preference for direct responses.

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

GEO doesn't replace SEO—it's a necessary complement for the AI era. Both working together ensures visibility in traditional and AI search.

Good SEO foundation helps GEO because:
- Structured content benefits both
- High-quality content is the common foundation
- Technical optimization ensures content is crawlable

### Summary

GEO is an essential new skill for content creators in the AI era. Through structured content, authoritative citations, direct answers, and data support, you can significantly increase AI citation probability and secure an advantageous position in the new search landscape.$BLOG$,
  '2026-02-01',
  8
),
(
  'geo-vs-seo',
  $BLOG$GEO vs SEO：有什么区别？$BLOG$,
  $BLOG$GEO vs SEO: What's the Difference?$BLOG$,
  $BLOG$对比传统SEO和GEO的核心差异，了解为什么你需要同时关注两者。$BLOG$,
  $BLOG$Compare traditional SEO and GEO to understand why you need both.$BLOG$,
  $BLOG$## GEO与SEO的核心区别

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

SEO和GEO是互补关系，不是替代关系。在AI时代，同时掌握两种优化策略，才能确保内容获得最大曝光。$BLOG$,
  $BLOG$## GEO vs SEO: Core Differences

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

Search algorithms change frequently. Don't put all eggs in one basket.

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

SEO and GEO are complementary, not substitutes. In the AI era, mastering both optimization strategies ensures maximum content exposure.$BLOG$,
  '2026-02-02',
  6
),
(
  'ai-citation-tips',
  $BLOG$10个让AI引用你内容的实战技巧$BLOG$,
  $BLOG$10 Tips to Get Your Content Cited by AI$BLOG$,
  $BLOG$经过验证的GEO优化技巧，帮助你的内容获得更多AI引用。$BLOG$,
  $BLOG$Proven GEO optimization tips to increase AI citations.$BLOG$,
  $BLOG$## 让AI主动引用你的10个实战技巧

想让ChatGPT、Claude、Perplexity在回答问题时引用你的内容？以下是经过验证的10个GEO优化技巧，帮助你在AI搜索时代获得更多曝光。

### 1. 直接回答问题

在文章开头就给出明确、简洁的答案。AI偏爱能直接回答用户问题的内容，这种写作方式被称为"倒金字塔结构"。

**为什么有效？**

AI在生成回答时，会优先选择能直接回答用户问题的内容。如果你的文章开头就是答案，被引用的概率大大提升。

**示例**：
- ❌ "在讨论GEO之前，我们先来了解一下搜索引擎的历史..."
- ✅ "GEO是针对AI搜索引擎的内容优化策略，旨在让AI主动引用你的内容。"

### 2. 使用数据支撑

引用具体的统计数据和研究结果，增强内容可信度。研究表明，带有数据支撑的内容被AI引用的概率提升180%。

**数据来源建议**：
- 学术研究论文
- 行业调研报告
- 官方统计数据
- 权威机构发布的数据

**示例**："根据普林斯顿大学的研究，采用GEO策略的内容被AI引用的概率提升40%以上。"

### 3. 添加权威引用

引用学术论文、官方报告、行业权威来源。AI更信任有据可查的内容，引用权威来源是建立可信度的关键。

**推荐引用来源**：
- 学术论文（Google Scholar、arXiv）
- 政府和官方机构报告
- 知名研究机构的研究
- 行业领先企业的白皮书

### 4. 结构化内容

使用清晰的H2、H3标题层级，让AI更容易理解和提取信息。结构化良好的内容被引用概率提升35%。

**结构化技巧**：
- 每个章节聚焦一个主题
- 使用列表和表格整理复杂信息
- 段落简短，每段围绕一个要点
- 使用粗体突出关键信息

### 5. 保持内容新鲜

定期更新内容，添加最新信息和数据。AI偏好时效性强的内容，过时的信息很难被引用。

**更新策略**：
- 每季度审视一次核心内容
- 添加最新的数据和案例
- 更新过时的信息和链接
- 在文章中标注"最后更新时间"

### 6. 添加FAQ部分

在文章末尾添加常见问题解答，直接匹配用户可能的提问方式。FAQ格式特别适合AI提取和引用。

**FAQ设计技巧**：
- 使用用户真实会问的问题
- 答案简洁明了，直接回答
- 覆盖主题的各个方面
- 使用Schema标记增强效果

### 7. 使用Schema标记

添加结构化数据标记（JSON-LD），帮助AI更好地理解内容类型和结构。

**常用Schema类型**：
- Article：文章内容
- FAQPage：常见问题页面
- HowTo：教程指南
- Product：产品信息

### 8. 展示专业性（E-E-A-T）

展示你的专业知识、经验、权威性和可信度，这是AI判断内容质量的重要信号。

**具体做法**：
- 作者简介要详细，包含资质和经验
- 展示相关认证和成就
- 引用自己的研究或案例
- 链接到作者的社交媒体和专业档案

### 9. 优化可读性

使用简洁明了的语言，让内容易于理解。可读性高的内容更容易被AI处理和引用。

**可读性技巧**：
- 使用简单词汇，避免过多专业术语
- 句子简短，每句一个意思
- 适当使用粗体强调重点
- 使用过渡词连接段落

### 10. 多平台分发

在Reddit、Quora、知乎等平台分享内容，因为AI也会从这些平台学习和获取信息。

**分发策略**：
- 在相关社区分享有价值的内容
- 回答平台上的相关问题
- 建立个人或品牌的专业形象
- 保持活跃，持续贡献内容

### 额外技巧：监测和迭代

定期测试你的内容在AI回答中的表现：

1. 向ChatGPT、Claude等提问相关问题
2. 观察是否引用了你的内容
3. 分析竞争对手被引用的原因
4. 根据发现调整优化策略

### 总结

GEO优化是一个持续的过程，不是一次性的工作。从今天开始，在每篇新内容中应用这些技巧，逐步提升你在AI搜索中的可见度。

记住：高质量、结构化、有据可查的内容，永远是被AI引用的基础。没有捷径，只有持续的优化和改进。$BLOG$,
  $BLOG$## 10 Proven Tips to Get AI Citations

Want ChatGPT, Claude, Perplexity to cite your content? Here are 10 verified GEO tips to boost your visibility in AI search.

### 1. Answer Questions Directly

Provide clear, concise answers upfront. AI prefers content that directly addresses queries—this is called the "inverted pyramid" structure.

**Why it works:**

AI prioritizes content that directly answers user questions. If your article starts with the answer, citation probability increases significantly.

**Example:**
- ❌ "Before discussing GEO, let's explore search engine history..."
- ✅ "GEO is a content optimization strategy for AI search engines, designed to get AI to cite your content."

### 2. Use Data Support

Cite specific statistics and research results. Studies show content with data support sees 180% higher AI citation rates.

**Recommended data sources:**
- Academic research papers
- Industry survey reports
- Official statistics
- Data from authoritative institutions

### 3. Add Authoritative Citations

Reference academic papers, official reports, industry authorities. AI trusts verifiable content more.

**Recommended sources:**
- Academic papers (Google Scholar, arXiv)
- Government and official reports
- Research from renowned institutions
- White papers from industry leaders

### 4. Structure Your Content

Use clear H2, H3 heading hierarchy. Well-structured content has 35% higher citation probability.

**Structuring tips:**
- Focus each section on one topic
- Use lists and tables for complex info
- Keep paragraphs short
- Bold key information

### 5. Keep Content Fresh

Update regularly with latest information. AI prefers timely content; outdated info rarely gets cited.

**Update strategy:**
- Review core content quarterly
- Add latest data and cases
- Update outdated info and links
- Mark "last updated" date

### 6. Add FAQ Sections

Include Q&A at article end matching user query patterns. FAQ format is ideal for AI extraction.

**FAQ design tips:**
- Use questions users actually ask
- Keep answers concise and direct
- Cover various topic aspects
- Use Schema markup for enhancement

### 7. Use Schema Markup

Add JSON-LD structured data to help AI understand content type and structure.

**Common Schema types:**
- Article: Article content
- FAQPage: FAQ pages
- HowTo: Tutorial guides
- Product: Product information

### 8. Demonstrate Expertise (E-E-A-T)

Show your expertise, experience, authority, and trustworthiness—key signals AI uses to judge quality.

**How to demonstrate:**
- Detailed author bios with credentials
- Display relevant certifications
- Reference your own research or cases
- Link to author social profiles

### 9. Optimize Readability

Use clear, simple language. Highly readable content is easier for AI to process and cite.

**Readability tips:**
- Use simple vocabulary, avoid jargon
- Keep sentences short, one idea each
- Bold key points appropriately
- Use transition words between paragraphs

### 10. Distribute Widely

Share on Reddit, Quora, forums—AI learns from these platforms too.

**Distribution strategy:**
- Share valuable content in relevant communities
- Answer related questions on platforms
- Build professional personal/brand image
- Stay active, contribute consistently

### Bonus: Monitor and Iterate

Regularly test your content performance in AI answers:

1. Ask ChatGPT, Claude related questions
2. Check if your content is cited
3. Analyze why competitors get cited
4. Adjust strategy based on findings

### Summary

GEO is an ongoing process, not a one-time task. Apply these tips to every new piece of content to gradually improve AI search visibility.

Remember: High-quality, structured, well-sourced content is the foundation for AI citations. No shortcuts—only continuous optimization.$BLOG$,
  '2026-02-03',
  10
);

commit;
