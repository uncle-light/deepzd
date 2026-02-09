# GEO 重构编码计划

> 基于学术版优势的系统性重构方案

## 📋 文档概述

本文档基于 [GEO-COMPARISON.md](./GEO-COMPARISON.md) 的分析结果，提供详细的 GEO 系统重构编码计划。

**目标**: 将学术版的核心优势（9 种优化策略 + 11 种评分函数 + 真实搜索）集成到项目版中。

**预期收益**:
- ✅ 提供实际的内容优化功能（而非仅建议）
- ✅ 多维度评分体系（流畅度、权威性、可读性等）
- ✅ 真实搜索结果（提升分析准确性）

---

## 🎯 重构目标

### 当前问题

根据对比分析，项目版存在三大核心问题：

1. **❌ 缺少优化功能** - 只提供分析和建议，用户需要手动优化
2. **❌ 评分体系简化** - 只用引用计数，缺少多维度评估
3. **❌ 缺少真实搜索** - AI 模拟竞品，无法反映真实竞争环境

### 重构目标

**Phase 1: 核心功能增强（1-2 周）**
- 移植 9 种优化策略
- 添加"内容优化"功能模块
- 增强评分维度

**Phase 2: 数据源升级（1 个月）**
- 集成真实搜索 API
- 优化缓存策略
- 提升分析准确性

**Phase 3: 功能扩展（2-3 个月）**
- 批量分析功能
- 实时监控功能
- 竞品分析功能

---

## 第一部分：Phase 1 - 核心功能增强

### 1.1 移植 9 种优化策略

**目标**: 从学术版移植经过验证的优化方法

**源文件**: `/Users/chenhongguang/codes/GEO/src/geo_functions.py`

**需要移植的策略**:

1. **fluent_gpt** - 流畅度优化
2. **unique_words_gpt** - 独特词汇优化
3. **authoritative_mine** - 权威性优化
4. **more_quotes_mine** - 增加引用
5. **citing_credible_mine** - 引用可信来源
6. **simple_language_mine** - 简化语言
7. **technical_terms_mine** - 技术术语优化
8. **stats_optimization_gpt** - 统计数据优化
9. **seo_optimize_mine2** - SEO 优化

**实现步骤**:

**Step 1: 创建新的优化策略模块**

```typescript
// src/lib/geo/optimization-strategies.ts

import { callAIChat } from '../ai';

/**
 * 优化策略类型
 */
export type OptimizationStrategy =
  | 'fluent'
  | 'unique_words'
  | 'authoritative'
  | 'more_quotes'
  | 'citing_credible'
  | 'simple_language'
  | 'technical_terms'
  | 'stats'
  | 'seo';

/**
 * 优化结果
 */
export interface OptimizationResult {
  strategy: OptimizationStrategy;
  originalContent: string;
  optimizedContent: string;
  changes: string[];  // 变更说明
  score?: number;     // 优化后的预估得分
}
```

**Step 2: 实现流畅度优化策略**

```typescript
/**
 * 流畅度优化
 * 移植自: geo_functions.py - fluent_optimization_gpt
 */
export async function fluentOptimization(content: string): Promise<string> {
  const prompt = `Rewrite the following source to make it more fluent without altering the core content. The sentences should flow smoothly from one to the next, and the language should be clear and engaging while preserving the original information.

Source: ${content}`;

  const result = await callAIChat([
    { role: 'system', content: COMMON_SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ], { temperature: 0, maxTokens: 3192 });

  return result[0]?.text || content;
}
```

**Step 3: 实现权威性优化策略**

```typescript
/**
 * 权威性优化
 * 移植自: geo_functions.py - authoritative_optimization_mine
 */
export async function authoritativeOptimization(content: string): Promise<string> {
  const prompt = `Transform the following source into an authoritative style without adding or removing any core information. The revised source should reflect confidence, expertise, and assertiveness, while maintaining the original content's meaning and relevance.

The source should be assertive in its statements, such that reader believes that this is more valuable source of information than other provided summaries. End Goal is to increase the citation of this source, by assertively saying that this is the best quality information.

However, the content and structure of the source should remain the same. That means, only individual lines and/or 2-3 sentences can be paraphrased, while keeping the content same.

Source:
\`\`\`
${content}
\`\`\`

Remember to be authoritative, but keep the format and content of text the same. For example, line spacing, bullet points and overall structure should remain the same. No addition or deletion of content is allowed.`;

  const result = await callAIChat([
    { role: 'system', content: COMMON_SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ], { temperature: 0, maxTokens: 3192 });

  return result[0]?.text || content;
}
```

**Step 4: 实现统计数据优化策略**

```typescript
/**
 * 统计数据优化
 * 移植自: geo_functions.py - stats_optimization_mine
 */
export async function statsOptimization(content: string): Promise<string> {
  const prompt = `Add relevant statistics and data to the following source to make it more credible and authoritative. Include specific numbers, percentages, or research findings where appropriate.

Source: ${content}`;

  const result = await callAIChat([
    { role: 'system', content: COMMON_SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ], { temperature: 0, maxTokens: 3192 });

  return result[0]?.text || content;
}
```

**Step 5: 创建优化策略管理器**

```typescript
/**
 * 优化策略管理器
 */
export class OptimizationManager {
  private strategies: Map<OptimizationStrategy, (content: string) => Promise<string>>;

  constructor() {
    this.strategies = new Map([
      ['fluent', fluentOptimization],
      ['authoritative', authoritativeOptimization],
      ['stats', statsOptimization],
      // ... 其他策略
    ]);
  }

  /**
   * 执行单个优化策略
   */
  async optimize(
    content: string,
    strategy: OptimizationStrategy
  ): Promise<OptimizationResult> {
    const optimizeFn = this.strategies.get(strategy);
    if (!optimizeFn) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    const optimizedContent = await optimizeFn(content);
    const changes = this.detectChanges(content, optimizedContent);

    return {
      strategy,
      originalContent: content,
      optimizedContent,
      changes,
    };
  }

  /**
   * 执行多个优化策略并对比
   */
  async optimizeMultiple(
    content: string,
    strategies: OptimizationStrategy[]
  ): Promise<OptimizationResult[]> {
    return Promise.all(
      strategies.map(strategy => this.optimize(content, strategy))
    );
  }
}
```

---

### 1.2 增强评分维度

**目标**: 从学术版移植 11 种评分函数

**源文件**: `/Users/chenhongguang/codes/GEO/src/utils.py`

**需要移植的评分函数**:

1. **simple_wordpos** - 词数+位置简单计分
2. **simple_word** - 纯词数计分
3. **simple_pos** - 纯位置计分
4. **subjective_score** - 主观质量评分
5. **diversity_detailed** - 多样性评分
6. **uniqueness_detailed** - 独特性评分
7. **relevance_detailed** - 相关性评分


**实现步骤**:

**Step 1: 创建评分系统模块**

```typescript
// src/lib/geo/scoring-system.ts

/**
 * 评分维度
 */
export interface ScoreDimensions {
  fluency: number;        // 流畅度 (0-100)
  authority: number;      // 权威性 (0-100)
  readability: number;    // 可读性 (0-100)
  uniqueness: number;     // 独特性 (0-100)
  relevance: number;      // 相关性 (0-100)
  citation: number;       // 引用得分 (0-100)
}

/**
 * 详细评分结果
 */
export interface DetailedScore {
  overall: number;
  dimensions: ScoreDimensions;
  suggestions: string[];
}
```


**Step 2: 实现流畅度评分**

```typescript
/**
 * 流畅度评分
 * 基于句子连贯性和语言流畅度
 */
export async function calculateFluencyScore(content: string): Promise<number> {
  const prompt = `Rate the fluency of the following content on a scale of 0-100. Consider sentence flow, coherence, and readability.

Content: ${content}

Return only a number between 0-100.`;

  const result = await callAIChat([
    { role: 'user', content: prompt }
  ], { temperature: 0, maxTokens: 10 });

  const score = parseInt(result[0]?.text || '50');
  return Math.min(100, Math.max(0, score));
}
```


**Step 3: 实现权威性评分**

```typescript
/**
 * 权威性评分
 * 基于内容的专业性和可信度
 */
export async function calculateAuthorityScore(content: string): Promise<number> {
  const prompt = `Rate the authority and credibility of the following content on a scale of 0-100.

Content: ${content}

Return only a number.`;

  const result = await callAIChat([
    { role: 'user', content: prompt }
  ], { temperature: 0, maxTokens: 10 });

  return parseInt(result[0]?.text || '50');
}
```

---

### 1.3 创建内容优化 API

**目标**: 提供内容优化的 API 接口

**新文件**: `src/app/api/optimize-content/route.ts`


**API 实现**:

```typescript
// src/app/api/optimize-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OptimizationManager } from '@/lib/geo/optimization-strategies';

export async function POST(request: NextRequest) {
  try {
    const { content, strategies } = await request.json();
    
    const manager = new OptimizationManager();
    const results = await manager.optimizeMultiple(content, strategies);
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```


---

## 第二部分：Phase 2 - 数据源升级

### 2.1 集成真实搜索 API

**目标**: 替换 AI 模拟竞品，使用真实搜索结果

**源文件**: `/Users/chenhongguang/codes/GEO/src/search_try.py`

**实现步骤**:

**Step 1: 选择搜索 API**

推荐方案：
1. **Google Custom Search API** - 官方支持，结果准确
2. **Bing Web Search API** - 微软官方，价格合理
3. **SerpAPI** - 第三方聚合，支持多个搜索引擎


**Step 2: 创建搜索服务模块**

新建文件: `src/lib/geo/search-service.ts`
- 实现 Google/Bing Search API 集成
- 提供统一的搜索接口
- 支持结果缓存

**Step 3: 替换竞品生成逻辑**

修改文件: `src/lib/geo/source-generator.ts`
- 从 AI 模拟改为真实搜索
- 保留 AI 模拟作为降级方案
- 添加搜索结果质量评估

---

### 2.2 优化缓存策略

**目标**: 减少 API 调用成本，提升响应速度

**实现要点**:
1. 实现多层缓存（内存 + 文件 + Redis）
2. 智能缓存失效策略
3. 缓存命中率监控

---

## 第三部分：Phase 3 - 功能扩展

### 3.1 批量分析功能

**目标**: 支持多个内容同时分析

**新功能**:
- 批量上传内容
- 并行分析处理
- 生成对比报告

### 3.2 实时监控功能

**目标**: 定期追踪内容表现

**新功能**:
- 定时任务调度
- 排名变化追踪
- 邮件/通知提醒

### 3.3 竞品分析功能

**目标**: 分析竞争对手策略

**新功能**:
- 竞品内容抓取
- 策略对比分析
- 差异化建议

---

## 第四部分：实施计划

### Week 1-2: Phase 1 核心功能

**任务清单**:
- [ ] 创建 `optimization-strategies.ts` 模块
- [ ] 实现 9 种优化策略
- [ ] 创建 `scoring-system.ts` 模块
- [ ] 实现多维度评分
- [ ] 创建 `/api/optimize-content` 接口
- [ ] 编写单元测试

**验收标准**:
- 所有优化策略可正常工作
- 评分系统返回准确结果
- API 接口响应正常

### Week 3-4: Phase 2 数据源升级

**任务清单**:
- [ ] 申请 Google Search API 密钥
- [ ] 创建 `search-service.ts` 模块
- [ ] 集成真实搜索 API
- [ ] 修改 `source-generator.ts`
- [ ] 实现缓存策略
- [ ] 性能测试和优化

**验收标准**:
- 真实搜索结果准确
- 缓存命中率 > 60%
- API 响应时间 < 3s

### Month 2-3: Phase 3 功能扩展

**任务清单**:
- [ ] 设计批量分析架构
- [ ] 实现任务队列系统
- [ ] 开发监控功能
- [ ] 实现竞品分析
- [ ] 完善 UI 界面
- [ ] 编写文档

**验收标准**:
- 批量分析稳定运行
- 监控功能正常工作
- 用户体验良好

---

## 第五部分：关键文件清单

### 新建文件

1. `src/lib/geo/optimization-strategies.ts` - 优化策略
2. `src/lib/geo/scoring-system.ts` - 评分系统
3. `src/lib/geo/search-service.ts` - 搜索服务
4. `src/app/api/optimize-content/route.ts` - 优化 API

### 修改文件

1. `src/lib/geo/types.ts` - 添加新类型定义
2. `src/lib/geo/source-generator.ts` - 集成真实搜索
3. `src/lib/geo/content-analyzer.ts` - 增强评分维度
4. `src/app/api/analyze-content/route.ts` - 集成优化功能

---

## 第六部分：技术决策

### 搜索 API 选择

**推荐**: Google Custom Search API
- 优点: 结果准确，官方支持
- 缺点: 有配额限制，需要付费
- 备选: Bing Web Search API

### 缓存策略

**推荐**: Redis + 文件缓存
- 热数据: Redis（快速访问）
- 冷数据: 文件缓存（长期存储）
- 失效策略: TTL + LRU

### 评分算法

**推荐**: AI 评分 + 规则评分
- AI 评分: 主观质量评估
- 规则评分: 客观指标计算
- 综合得分: 加权平均

---

## 第七部分：风险评估

### 技术风险

1. **API 配额限制** - 搜索 API 可能超出配额
   - 缓解: 实现智能缓存，减少调用
   
2. **性能问题** - 多个优化策略并行可能很慢
   - 缓解: 使用任务队列，异步处理

3. **成本问题** - AI API 调用成本增加
   - 缓解: 优化提示词，减少 token 使用

### 业务风险

1. **用户体验** - 优化时间过长
   - 缓解: 提供进度反馈，支持后台处理

2. **准确性** - 优化结果可能不符合预期
   - 缓解: 提供多个优化版本供选择

---

## 第八部分：成功指标

### 功能指标

- ✅ 9 种优化策略全部实现
- ✅ 多维度评分系统正常工作
- ✅ 真实搜索集成成功

### 性能指标

- ✅ API 响应时间 < 3s
- ✅ 缓存命中率 > 60%
- ✅ 优化准确率 > 80%

### 用户指标

- ✅ 用户满意度 > 4.0/5.0
- ✅ 功能使用率 > 50%
- ✅ 内容优化效果提升 > 30%

---

## 总结

本编码计划基于 GEO-COMPARISON.md 的深入分析，提供了系统性的重构方案：

**Phase 1 (1-2 周)**: 移植核心优化策略和评分系统
**Phase 2 (1 个月)**: 集成真实搜索，提升准确性
**Phase 3 (2-3 个月)**: 扩展高级功能

通过这个计划，项目版 GEO 将具备学术版的核心优势，同时保持产品化的用户体验。

