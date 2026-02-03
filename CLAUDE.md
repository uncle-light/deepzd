# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

DeepZD 是一个 **GEO（Generative Engine Optimization）工具平台**，帮助内容创作者优化内容以获得 AI（ChatGPT/Claude）的引用和推荐。

## 常用命令

```bash
pnpm dev      # 启动开发服务器 (localhost:3000)
pnpm build    # 生产构建
pnpm lint     # ESLint 检查
```

## 技术栈

- **框架**: Next.js 16 (App Router)
- **前端**: React 19 + TypeScript 5
- **样式**: Tailwind CSS 4
- **国际化**: next-intl（中/英双语）
- **数据库**: Supabase (PostgreSQL)

## 架构设计

### 国际化路由

采用 `[locale]` 动态路由实现中英双语：
- 默认语言：中文 (`zh`)
- 路由前缀策略：`as-needed`（中文无前缀，英文 `/en`）
- 翻译文件：`messages/zh.json`, `messages/en.json`
- 配置入口：`src/i18n.ts` + `src/middleware.ts`

### 数据层

使用 Supabase 作为后端数据库：
- 连接配置：`src/lib/supabase.ts`
- 主要表：`prompts`（提示词模板）

### 页面结构

```
src/app/[locale]/
├── page.tsx           # 首页（Landing Page）
├── geo/               # GEO 介绍页面
├── analyze/           # 内容分析器（核心功能）
├── prompts/           # Prompt 工具箱
└── about/             # 关于页面
```

### 组件设计

核心组件位于 `src/app/components/`：
- `Nav.tsx` - 顶部导航（含语言切换）
- `Footer.tsx` - 页脚

视觉效果组件：
- `MouseGlow.tsx` - 鼠标跟随光效
- `FloatingParticles.tsx` - 浮动粒子背景
- `TypeWriter.tsx` - 打字机动画

## 开发约定

### 双语字段命名

数据库和数据结构中的双语字段统一使用 `_zh` / `_en` 后缀：
```typescript
{
  title_zh: "中文标题",
  title_en: "English Title",
  desc_zh: "中文描述",
  desc_en: "English description"
}
```

### 设计风格

- **主题**: Vercel 极简风格，支持日夜自动切换
- **深色主题**: 纯黑背景 `#000000` + 浅灰文字 `#ededed`
- **浅色主题**: 纯白背景 `#ffffff` + 深灰文字 `#171717`
- **强调色**: Vercel 蓝 `#0070f3`（仅用于链接和关键数据）
- **字体**: Geist Sans / Geist Mono

### SEO 规范

所有页面必须遵循以下 SEO 规则：

#### 1. 元数据 (Metadata)
每个页面必须包含完整的元数据：
```typescript
export const metadata: Metadata = {
  title: "页面标题 | DeepZD",
  description: "页面描述（150-160字符）",
  keywords: ["关键词1", "关键词2"],
  openGraph: {
    title: "OG标题",
    description: "OG描述",
    type: "website",
  },
};
```

#### 2. 语义化 HTML
- 每页只有一个 `<h1>` 标签
- 标题层级递进：h1 → h2 → h3
- 使用 `<section>`、`<article>`、`<nav>` 等语义标签
- 图片必须有 `alt` 属性

#### 3. 结构化数据 (JSON-LD) ⚠️ 必须

**每个新页面必须添加 JSON-LD 结构化数据**，这是 GEO/SEO 的核心要求。

**现有组件** (`src/app/components/JsonLd.tsx`)：
- `WebsiteJsonLd` - 网站级别（已在 layout.tsx 使用）
- `FAQJsonLd` - FAQ 页面

**各页面类型的 JSON-LD 要求**：

| 页面类型 | Schema 类型 | 必填字段 |
|---------|------------|---------|
| 首页 | Organization + FAQPage | name, url, description, faq |
| 文章/博客 | Article + BreadcrumbList | headline, author, datePublished, dateModified |
| 教程/指南 | HowTo 或 Article | name, step[], totalTime |
| 工具页面 | WebApplication | name, applicationCategory, offers |
| 关于页面 | AboutPage + Organization | name, description |

**新建页面检查清单**：
```typescript
// 1. 导入 JsonLd 组件
import { FAQJsonLd } from "../components/JsonLd";

// 2. 或创建页面专用的 JSON-LD
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  author: { "@type": "Organization", name: "DeepZD" },
  datePublished: "2026-02-01",
  dateModified: "2026-02-01",
};

// 3. 在页面中渲染
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
/>
```

**验证工具**：https://search.google.com/test/rich-results

#### 4. 性能优化
- 图片使用 Next.js Image 组件
- 关键 CSS 内联
- 延迟加载非关键资源

#### 5. 国际化 SEO
- 每个语言版本有独立的 URL
- 使用 `hreflang` 标签
- 翻译文件中包含 SEO 相关字段
