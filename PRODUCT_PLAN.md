# DeepZD - GEO 工具平台产品规划

> **Deep Zero Distance** - 让你的内容与 AI 零距离

## 1. 产品定位

### 1.1 核心价值主张

在 AI 搜索时代，传统 SEO 正在被 GEO（Generative Engine Optimization）取代。当用户向 ChatGPT、Claude、Perplexity 提问时，**你的内容能否被引用和推荐**，决定了你的品牌在 AI 时代的可见性。

**DeepZD 帮助你：**
- 分析内容的 AI 友好度
- 监控品牌在 AI 回答中的表现
- 优化内容以获得更多 AI 引用
- 提供高效的 Prompt 工具

### 1.2 目标用户

| 用户类型 | 痛点 | 我们的解决方案 |
|----------|------|----------------|
| **内容创作者/SEO从业者** | 不知道如何让内容被 AI 引用 | 内容分析器 + 优化建议 |
| **企业/品牌方** | 无法监控品牌在 AI 中的表现 | 品牌监控 + 竞品分析 |
| **普通用户** | 不会写高效的 Prompt | Prompt 工具箱 + 模板库 |

### 1.3 竞品分析

| 竞品 | 定位 | 我们的差异化 |
|------|------|--------------|
| Originality.ai | AI 内容检测 | 我们专注 GEO 优化 |
| Surfer SEO | 传统 SEO | 我们专注 AI 搜索 |
| PromptBase | Prompt 市场 | 我们提供完整 GEO 工具链 |

---

## 2. 核心功能模块

### 2.1 内容分析器 (Content Analyzer)

**功能描述：** 分析内容的 AI 友好度，给出优化建议

**核心指标：**
- AI 可读性评分 (0-100)
- 结构化程度
- 关键信息密度
- 引用潜力评估

**输入：** URL / 文本内容
**输出：** 评分 + 详细分析报告 + 优化建议

### 2.2 品牌监控 (Brand Monitor)

**功能描述：** 监控品牌/关键词在 AI 回答中的表现

**核心功能：**
- 设置监控关键词/品牌名
- 定期查询 ChatGPT/Claude 相关问题
- 记录品牌被提及的频率和上下文
- 情感分析（正面/中性/负面）
- 趋势图表

### 2.3 Prompt 工具箱 (Prompt Toolkit)

**功能描述：** 帮助用户创建、优化、管理 Prompt

**子功能：**
- **Prompt 模板库：** 分类整理的高效 Prompt
- **Prompt 生成器：** 根据需求自动生成 Prompt
- **Prompt 优化器：** 分析并改进现有 Prompt
- **Prompt 测试器：** 对比不同 Prompt 的效果

### 2.4 AI 搜索模拟器 (AI Search Simulator)

**功能描述：** 模拟用户向 AI 提问，查看你的内容是否被引用

**使用场景：**
- 输入问题，查看 ChatGPT/Claude 的回答
- 分析回答中引用了哪些来源
- 对比你的内容与被引用内容的差异

### 2.5 竞品分析 (Competitor Analysis)

**功能描述：** 对比你和竞品在 AI 回答中的表现

**核心功能：**
- 添加竞品品牌/网站
- 对比同一问题下的引用情况
- 分析竞品内容的优势
- 给出超越建议

### 2.6 学习中心 (Learning Hub)

**功能描述：** GEO 知识库和最佳实践

**内容类型：**
- GEO 基础教程
- 案例研究
- 行业报告
- 最佳实践指南

---

## 3. 技术架构

### 3.1 技术栈

```
前端框架: Next.js 16 + TypeScript
样式方案: Tailwind CSS + shadcn/ui
状态管理: Zustand / React Query
数据库: Supabase (PostgreSQL)
认证: Supabase Auth
AI 集成: OpenAI API + Anthropic API
支付: Stripe
部署: Vercel
监控: Vercel Analytics + Sentry
```

### 3.2 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户界面层                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ 内容分析 │ │ 品牌监控 │ │ Prompt  │ │ 学习中心 │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                      API 层                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Next.js API Routes                     │   │
│  │  /api/analyze  /api/monitor  /api/prompt  ...   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                      服务层                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ OpenAI   │ │ Anthropic│ │ Scraping │               │
│  │ Service  │ │ Service  │ │ Service  │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                      数据层                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Supabase (PostgreSQL)               │   │
│  │  users | projects | analyses | monitors | ...    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. 数据库设计

### 4.1 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free', -- free, pro, enterprise
  credits INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 项目/品牌表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  domain TEXT,
  keywords TEXT[], -- 监控关键词
  competitors TEXT[], -- 竞品
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 内容分析记录
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  content_url TEXT,
  content_text TEXT,
  score INTEGER, -- 0-100
  report JSONB, -- 详细分析报告
  suggestions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 品牌监控记录
CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  query TEXT NOT NULL, -- 查询问题
  ai_provider TEXT, -- chatgpt, claude, perplexity
  response TEXT,
  mentions JSONB, -- 品牌提及详情
  sentiment TEXT, -- positive, neutral, negative
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt 模板
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户收藏
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  prompt_id UUID REFERENCES prompts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);
```

---

## 5. 页面结构

### 5.1 页面地图

```
/                       # 首页 - 产品介绍 + CTA
├── /login              # 登录页
├── /register           # 注册页
├── /dashboard          # 用户仪表盘
│   ├── /projects       # 项目列表
│   └── /settings       # 账户设置
├── /analyze            # 内容分析器
├── /monitor            # 品牌监控
│   ├── /[projectId]    # 项目监控详情
│   └── /reports        # 监控报告
├── /prompts            # Prompt 工具箱
│   ├── /templates      # 模板库
│   ├── /generator      # 生成器
│   ├── /optimizer      # 优化器
│   └── /my             # 我的 Prompt
├── /simulator          # AI 搜索模拟器
├── /learn              # 学习中心
│   ├── /guides         # 教程指南
│   ├── /cases          # 案例研究
│   └── /[slug]         # 文章详情
├── /pricing            # 定价页
└── /about              # 关于我们
```

### 5.2 核心页面设计

#### 首页 (Landing Page)
- Hero 区域：核心价值主张 + CTA
- 功能展示：四大核心功能卡片
- 社会证明：用户评价 / 数据统计
- 定价预览
- FAQ

#### 仪表盘 (Dashboard)
- 使用概览：剩余额度、最近分析
- 快捷入口：各功能模块
- 项目列表
- 通知中心

#### 内容分析器 (Analyzer)
- 输入区：URL / 文本
- 分析结果：评分仪表盘
- 详细报告：各维度分析
- 优化建议：可操作的改进点

---

## 6. 开发路线图

### Phase 1: MVP (2-3 周)

**目标：** 验证核心价值，获取早期用户

- [ ] 项目初始化 + 基础架构
- [ ] 用户认证系统
- [ ] 首页 Landing Page
- [ ] 内容分析器 (基础版)
- [ ] Prompt 模板库
- [ ] 基础 Dashboard

### Phase 2: 核心功能 (3-4 周)

**目标：** 完善核心功能，提升用户体验

- [ ] 品牌监控功能
- [ ] AI 搜索模拟器
- [ ] Prompt 生成器 + 优化器
- [ ] 学习中心
- [ ] 用户反馈系统

### Phase 3: 商业化 (2-3 周)

**目标：** 实现付费转化

- [ ] 定价页面
- [ ] Stripe 支付集成
- [ ] 订阅管理
- [ ] 使用额度系统
- [ ] 企业版功能

### Phase 4: 增长 (持续)

**目标：** 扩大用户规模

- [ ] SEO 优化
- [ ] 内容营销
- [ ] API 开放
- [ ] 社区建设
- [ ] 国际化

---

## 7. 商业模式

### 7.1 定价策略

| 计划 | 价格 | 功能 |
|------|------|------|
| **Free** | 免费 | 10次分析/月, Prompt 模板库, 基础学习内容 |
| **Pro** | ¥99/月 | 无限分析, 品牌监控(3个项目), AI 模拟器, 优先支持 |
| **Team** | ¥299/月 | Pro 全部 + 10个项目, 团队协作, API 访问 |
| **Enterprise** | 定制 | 无限制, 白标, 专属支持, SLA 保障 |

### 7.2 增长策略

1. **内容营销：** 发布 GEO 相关教程和研究报告
2. **免费工具引流：** Prompt 模板库免费使用
3. **社区建设：** 建立 GEO 从业者社区
4. **合作伙伴：** 与 SEO 工具、内容平台合作

---

## 8. 风险与挑战

| 风险 | 应对策略 |
|------|----------|
| AI API 成本高 | 实现缓存机制, 优化调用频率 |
| AI 厂商政策变化 | 多平台支持, 降低单一依赖 |
| 市场教育成本 | 通过免费内容建立认知 |
| 竞品进入 | 快速迭代, 建立用户粘性 |

---

## 9. 成功指标

### 9.1 北极星指标
- **月活跃用户 (MAU)**
- **付费转化率**
- **用户留存率 (D7/D30)**

### 9.2 关键指标

| 阶段 | 目标 |
|------|------|
| MVP (1个月) | 500 注册用户, 50 活跃用户 |
| 增长期 (3个月) | 5000 注册, 500 活跃, 50 付费 |
| 成熟期 (6个月) | 20000 注册, 2000 活跃, 200 付费 |

---

## 10. 下一步行动

1. **确认规划：** 审阅本文档，确认方向
2. **项目初始化：** 创建新项目结构
3. **设计系统：** 确定 UI 风格和组件库
4. **开始开发：** 按 Phase 1 路线图执行

---

*文档版本: v1.0*
*更新时间: 2026-02-02*
