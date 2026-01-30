export const tutorials = [
  {
    slug: "midjourney-guide",
    title: "Midjourney 2025 完全入门指南",
    tag: "绘画",
    content: `## 什么是 Midjourney

Midjourney 是目前最强大的 AI 图像生成工具之一，以其卓越的艺术质量和创意表现力著称。它通过 Discord 平台运行，用户只需输入文字描述，就能生成令人惊艳的图像。

## 注册与准备

### 第一步：注册 Discord
1. 访问 discord.com 注册账号
2. 下载 Discord 客户端或使用网页版
3. 完成邮箱验证

### 第二步：加入 Midjourney
1. 访问 midjourney.com
2. 点击 "Join the Beta"
3. 授权 Discord 连接

### 第三步：选择订阅方案
- **Basic Plan** ($10/月)：200张图/月
- **Standard Plan** ($30/月)：无限生成
- **Pro Plan** ($60/月)：快速模式+隐私模式

## 基础命令详解

### /imagine - 核心生成命令
\`\`\`
/imagine prompt: a beautiful sunset over mountains, oil painting style
\`\`\`

### 常用参数
- \`--ar 16:9\` 设置宽高比
- \`--v 6\` 使用 V6 版本
- \`--style raw\` 原始风格
- \`--q 2\` 高质量模式

## 提示词进阶技巧

### 结构化提示词公式
**主体 + 环境 + 风格 + 光线 + 参数**

示例：
\`\`\`
a majestic lion, in savanna at golden hour, 
cinematic photography, dramatic lighting, 
8k ultra detailed --ar 16:9 --v 6
\`\`\`

### 风格关键词库
- **艺术风格**：oil painting, watercolor, digital art, anime
- **摄影风格**：cinematic, portrait, macro, aerial
- **氛围词**：dramatic, ethereal, moody, vibrant

## 实战案例

### 案例1：人物肖像
\`\`\`
portrait of a young woman, soft natural lighting,
shallow depth of field, professional photography --ar 2:3
\`\`\`

### 案例2：风景插画
\`\`\`
fantasy landscape with floating islands,
Studio Ghibli style, warm colors --ar 16:9
\`\`\`

## 常见问题

**Q: 为什么生成的图片和描述不符？**
A: 尝试使用更具体的描述，添加风格和细节关键词。

**Q: 如何提高图片质量？**
A: 使用 --q 2 参数，选择合适的宽高比。`
  },
  {
    slug: "chatgpt-tips",
    title: "ChatGPT 高效使用技巧",
    tag: "对话",
    content: `## 模型选择指南

### GPT-4o（推荐日常使用）
- 速度快，响应及时
- 支持图片、语音输入
- 适合日常对话和简单任务

### GPT-4 Turbo
- 更强的推理能力
- 128K 上下文窗口

## 高效提问技巧

### 技巧1：让 AI 先提问
"在回答之前，请先问我几个问题来理解我的需求。"

### 技巧2：设定角色
"你是一位资深产品经理，请从专业角度..."

### 技巧3：逐步推理
"请一步一步思考，展示推理过程。"

## 实用场景

### 写作助手
请帮我写一篇关于[主题]的文章，字数1000字，语气专业易懂。

### 代码助手
请用Python实现[功能]，代码简洁，添加注释。`
  },
  {
    slug: "claude-pro",
    title: "Claude Pro 深度使用教程",
    tag: "编程",
    content: `## Claude 的核心优势

### 超大上下文窗口
- 200K tokens 上下文
- 可处理整本书或大型代码库
- 长文档分析无压力

### 强大的代码能力
- 支持多种编程语言
- 代码解释清晰
- Bug 定位准确

### 安全可靠
- 更少的幻觉
- 拒绝有害请求
- 输出更可控

## 订阅方案

### Claude Pro ($20/月)
- 优先访问最新模型
- 更高的使用限额
- Claude 3 Opus 访问权

## 使用技巧

### 充分利用长上下文
上传整个项目代码，让 Claude 理解全局后再提问。

### 使用 Artifacts
Claude 可以生成可交互的代码、图表、文档。

### 文档分析
上传 PDF、代码文件，Claude 可以深度分析。`
  },
  {
    slug: "stable-diffusion",
    title: "Stable Diffusion 本地部署指南",
    tag: "绘画",
    content: `## 什么是 Stable Diffusion

开源的 AI 图像生成模型，可完全本地运行，无需付费，无限生成。

## 硬件要求

### 最低配置
- 显卡：NVIDIA GTX 1060 6GB
- 内存：8GB RAM
- 硬盘：20GB 空间

### 推荐配置
- 显卡：NVIDIA RTX 3060 12GB
- 内存：16GB RAM
- 硬盘：50GB SSD

## 安装步骤

### 方式1：WebUI（推荐新手）
1. 安装 Python 3.10
2. 下载 Automatic1111 WebUI
3. 运行 webui-user.bat
4. 浏览器访问 localhost:7860

### 方式2：ComfyUI（推荐进阶）
节点式工作流，更灵活可控。

## 模型推荐

- **SDXL**：官方最新，质量最高
- **Realistic Vision**：写实人像
- **DreamShaper**：艺术风格`
  },
  {
    slug: "cursor-ai",
    title: "Cursor AI 编程助手使用指南",
    tag: "编程",
    content: `## 什么是 Cursor

Cursor 是一款 AI 驱动的代码编辑器，基于 VS Code，内置强大的 AI 编程能力。

## 核心功能

### Tab 自动补全
输入代码时，AI 自动预测并补全，按 Tab 接受。

### Cmd+K 代码生成
选中代码后按 Cmd+K，用自然语言描述修改需求。

### Chat 对话编程
侧边栏对话，可以引用代码文件，AI 理解上下文。

## 使用技巧

### 善用 @符号引用
- @file 引用文件
- @folder 引用文件夹
- @web 搜索网络

### 代码审查
选中代码，让 AI 检查潜在问题和优化建议。`
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering 提示词工程",
    tag: "进阶",
    content: `## 什么是提示词工程

通过优化输入提示词，获得更好的 AI 输出结果。

## 核心原则

### 1. 明确具体
❌ "写一篇文章"
✅ "写一篇1000字的科技新闻，关于AI发展趋势"

### 2. 提供上下文
告诉 AI 背景信息、目标受众、使用场景。

### 3. 指定格式
要求输出 JSON、Markdown、列表等特定格式。

### 4. 分步骤
复杂任务拆解成多个步骤，逐步完成。

## 高级技巧

### Few-shot Learning
提供几个示例，让 AI 学习模式。

### Chain of Thought
要求 AI 展示思考过程，提高推理准确性。`
  },
  {
    slug: "suno-music",
    title: "Suno AI 音乐生成教程",
    tag: "音乐",
    content: `## 什么是 Suno

Suno 是 AI 音乐生成工具，输入歌词或描述即可生成完整歌曲。

## 使用方法

### 方式1：纯描述生成
输入风格描述，AI 自动生成歌词和旋律。

### 方式2：自定义歌词
输入你写的歌词，选择风格，生成音乐。

## 风格标签

- **流行**：pop, dance, electronic
- **摇滚**：rock, metal, punk
- **古典**：classical, orchestral
- **中国风**：chinese traditional

## 技巧

### 结构标签
用 [Verse] [Chorus] [Bridge] 标记歌曲结构。`
  },
  {
    slug: "ai-video",
    title: "AI视频生成工具对比",
    tag: "视频",
    content: `## 主流工具对比

### Runway Gen-2
- 文字/图片生成视频
- 4秒视频片段
- 画质稳定

### Pika Labs
- 免费使用
- 3秒视频
- 风格多样

### Sora（OpenAI）
- 60秒长视频
- 电影级画质
- 目前限量开放

## 选择建议

- 快速测试：Pika Labs
- 商业使用：Runway
- 高质量需求：等待 Sora`
  },
  {
    slug: "ai-writing",
    title: "AI写作助手使用技巧",
    tag: "写作",
    content: `## 常用工具

### ChatGPT
通用写作，灵活度高

### Claude
长文写作，逻辑清晰

### Notion AI
集成在笔记中，随写随用

## 写作场景

### 文章创作
提供大纲，让 AI 扩展成完整文章。

### 邮件撰写
说明目的和语气，AI 生成专业邮件。

### 文案优化
粘贴原文，要求润色或改写。`
  },
  {
    slug: "ai-translation",
    title: "AI翻译工具使用指南",
    tag: "翻译",
    content: `## 推荐工具

### DeepL
- 翻译质量最高
- 支持26种语言
- 保留格式

### Google翻译
- 语种最全
- 免费使用
- 实时翻译

### ChatGPT翻译
- 可定制风格
- 理解上下文
- 解释文化差异

## 使用技巧

提供上下文信息，获得更准确的翻译结果。`
  },
  {
    slug: "ai-ppt",
    title: "AI制作PPT教程",
    tag: "办公",
    content: `## 推荐工具

### Gamma
- 输入主题自动生成
- 设计精美
- 支持导出

### Beautiful.ai
- 智能排版
- 模板丰富

## 制作流程

1. 确定主题和大纲
2. 用 AI 生成内容
3. 选择模板美化
4. 导出分享`
  },
  {
    slug: "ai-search",
    title: "AI搜索引擎使用指南",
    tag: "搜索",
    content: `## 推荐工具

### Perplexity
- 实时联网搜索
- 引用来源
- 追问深入

### You.com
- 多模式搜索
- 代码模式

## 使用技巧

善用追问功能，逐步深入获取信息。`
  },
  {
    slug: "ai-data-analysis",
    title: "AI数据分析入门",
    tag: "数据",
    content: `## 推荐工具

### ChatGPT Code Interpreter
- 上传数据文件
- 自动分析可视化

### Julius AI
- 专业数据分析
- 图表生成

## 应用场景

数据清洗、统计分析、可视化报告。`
  },
  {
    slug: "ai-voice",
    title: "AI语音克隆教程",
    tag: "音频",
    content: `## 推荐工具

### ElevenLabs
- 高质量语音合成
- 支持克隆声音

### Resemble AI
- 企业级方案

## 使用场景

配音、有声书、虚拟主播。`
  },
  {
    slug: "ai-avatar",
    title: "AI数字人制作教程",
    tag: "视频",
    content: `## 推荐工具

### HeyGen
- 数字人视频生成
- 多语言配音

### D-ID
- 照片生成说话视频

## 应用场景

营销视频、培训课程、虚拟主播。`
  },
  {
    slug: "ai-design",
    title: "AI设计工具使用指南",
    tag: "设计",
    content: `## 推荐工具

### Canva AI
- 一键生成设计
- 模板丰富

### Adobe Firefly
- 专业级生成
- 商用安全

## 应用场景

海报设计、Logo生成、UI设计。`
  },
  {
    slug: "ai-meeting",
    title: "AI会议助手使用指南",
    tag: "办公",
    content: `## 推荐工具

### Otter.ai
- 实时转录
- 自动摘要

### Fireflies
- 会议记录
- 行动项提取

## 核心功能

自动转录、摘要生成、行动项提取。`
  },
  {
    slug: "ai-copywriting",
    title: "AI文案写作技巧",
    tag: "写作",
    content: `## 推荐工具

### Copy.ai
- 营销文案生成
- 多种模板

### Jasper
- 品牌声音定制

## 写作场景

广告文案、社媒内容、营销邮件。`
  },
  {
    slug: "comfyui",
    title: "ComfyUI 工作流搭建指南",
    tag: "绘画",
    content: `## 什么是 ComfyUI

基于节点的 AI 图像生成界面，高度可定制。

## 优势

- 可视化工作流
- 支持各种模型
- 社区工作流丰富

## 入门步骤

1. 下载安装
2. 导入模型
3. 加载工作流`
  },
  {
    slug: "llm-api",
    title: "大模型API接入指南",
    tag: "开发",
    content: `## API选择

### OpenAI API
- GPT系列模型
- 文档完善

### Claude API
- 长上下文
- 代码能力强

## 接入步骤

1. 获取API Key
2. 安装SDK
3. 调用接口`
  },
  {
    slug: "mcp-guide",
    title: "MCP 模型上下文协议入门指南",
    tag: "开发",
    content: `## 什么是 MCP

MCP（Model Context Protocol）是 Anthropic 于 2024 年 11 月推出的开源标准，用于连接 AI 应用与外部系统。

被称为"AI 的 USB-C 接口"，提供标准化的 AI 与工具交互方式。

## 核心架构

- **MCP Host**：AI 系统的部署环境
- **MCP Client**：发送/接收消息的协议引擎
- **MCP Server**：处理消息并返回结构化响应

## 主要功能

- 连接数据源（本地文件、数据库）
- 调用工具（搜索引擎、计算器）
- 执行工作流（自动化任务）

## 支持的客户端

- Claude Desktop
- Cursor
- Windsurf

来源：@anthropaborat @alexalbert__ on X`
  },
  {
    slug: "ai-agent-guide",
    title: "AI Agent 智能体入门",
    tag: "进阶",
    content: `## 什么是AI Agent

AI Agent是能够自主执行任务的AI系统。

## 核心能力

- 任务规划
- 工具调用
- 记忆管理

## 代表产品

- OpenAI Operator
- Claude Computer Use`
  },
];
