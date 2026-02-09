# 引用算法系统审查报告

> 对 GEO 引用分析系统的全面技术审查

## 📋 审查概述

**审查日期**: 2026-02-04
**审查范围**: 引用提取 → 统计计算 → 评分算法
**核心问题**: 评分系统总是返回 100 分

---

## 第一部分：系统架构分析

### 1.1 数据流程

```
AI 答案文本
    ↓
[citation-extractor.ts] 提取引用
    ↓
CitationExtractionResult {
  citations: CitationInfo[]
  sourceStats: Map<number, SourceCitationStats>
  totalSentences: number
}
    ↓
[impression-calculator.ts] 计算评分
    ↓
ImpressionResult {
  scores: SourceScore[]
  targetScore: SourceScore
  targetRank: number
}
```

### 1.2 模块职责

| 模块 | 职责 | 输入 | 输出 |
|------|------|------|------|
| `citation-extractor.ts` | 提取 [1][2][3] 引用 | AI 答案文本 | 引用统计数据 |
| `impression-calculator.ts` | 计算可见度评分 | 引用统计数据 | 0-100 分数 + 排名 |

---

## 第二部分：citation-extractor.ts 审查

### 2.1 核心功能

✅ **句子分割** (splitSentences)
- 正则: `/(?<=[.!?。！？])\s+/`
- 支持中英文标点
- 过滤空句子
- **评价**: 实现正确

✅ **引用提取** (extractCitationIndices)
- 正则: `/\[(\d+)\]/g`
- 范围限制: 1-10
- 去重处理
- **评价**: 实现正确

✅ **词数统计** (countWords)
- 中文字符: `/[\u4e00-\u9fa5]/g`
- 英文单词: `/[a-zA-Z]{3,}/g` (过滤噪音)
- **评价**: 实现合理

### 2.2 统计计算逻辑

```typescript
// 第 119-121 行
stats.citationCount++;
stats.totalWordCount += wordCount / indices.length; // 分摊词数
stats.positions.push(i);
```

**关键设计决策**:
- `citationCount`: 引用次数（一个句子引用多次只算一次）
- `totalWordCount`: 词数按引用数量分摊
- `positions`: 记录所有引用位置

**示例**:
```
句子: "根据来源 [1][2]，这是一个例子。" (10 个词)
→ 来源 1: citationCount=1, totalWordCount=5, positions=[0]
→ 来源 2: citationCount=1, totalWordCount=5, positions=[0]
```

✅ **评价**: 分摊逻辑合理，避免重复计数

### 2.3 潜在问题

⚠️ **问题 1: 句子分割可能不准确**
```typescript
// 当前实现
const sentences = text.split(/(?<=[.!?。！？])\s+/);

// 问题场景
"Dr. Smith said..." → 会被错误分割
"3.14 is pi..." → 会被错误分割
```

**建议**: 添加更智能的句子分割逻辑

⚠️ **问题 2: 引用范围限制过小**
```typescript
if (index > 0 && index <= 10) { // 只支持 1-10
```

**建议**: 根据实际 totalSources 动态调整范围

---

## 第三部分：impression-calculator.ts 审查（旧版）

### 3.1 核心 BUG 分析

**问题代码** (第 89-95 行):
```typescript
// Normalize scores to 0-100
const totalScore = scores.reduce((sum, s) => sum + s.rawScore, 0);
if (totalScore > 0) {
  for (const score of scores) {
    score.normalizedScore = Math.round((score.rawScore / totalScore) * 100);
  }
}
```

**BUG 本质**:
- 这是**百分比分配算法**，不是**绝对质量评分**
- 公式: `normalizedScore = (rawScore / totalScore) * 100`
- 结果: 所有来源的分数总和永远是 100

**问题场景**:
```typescript
// 场景 1: 用户内容是唯一被引用的来源
来源 1 (用户): rawScore = 10
来源 2-5: rawScore = 0
totalScore = 10
→ 用户得分 = (10/10) * 100 = 100 分 ❌

// 场景 2: 用户内容被引用 1 次，竞品被引用 9 次
来源 1 (用户): rawScore = 1
来源 2: rawScore = 9
totalScore = 10
→ 用户得分 = (1/10) * 100 = 10 分 ✅ (这个是对的)
```

**为什么会有这个 BUG**:
1. 学术版的原始算法是计算"相对占比"
2. 项目版误用了这个算法来表示"绝对质量"
3. 当只有一个来源被引用时，占比 100% ≠ 质量 100 分

### 3.2 旧版算法的其他问题

⚠️ **问题 1: rawScore 计算过于复杂**
```typescript
// 第 66-76 行
let rawScore = 0;
for (const position of stats.positions) {
  const positionWeight = totalSentences > 1
    ? Math.exp(-position / (totalSentences - 1))
    : 1;
  rawScore += positionWeight;
}
rawScore *= stats.totalWordCount / stats.citationCount;
```

**问题**:
- 指数衰减函数 `exp(-position / totalSentences)` 难以理解
- 词数权重的作用不明确
- 最终分数的含义模糊

⚠️ **问题 2: 缺少对引用频率的直接评估**
- 被引用 1 次 vs 被引用 10 次，差异不够明显
- 位置权重掩盖了引用次数的重要性

---

## 第四部分：impression-calculator-fixed.ts 审查（新版）

### 4.1 新算法设计

**核心思想**: 从"相对占比"改为"绝对质量评分"

```typescript
// 基础分：引用频率
const baseScore = Math.min((stats.citationCount / totalSources) * 100, 100);

// 位置加成：引用位置
const positionBonus = totalSentences > 1
  ? (1 - avgPosition / (totalSentences - 1)) * 20
  : 20;

// 最终得分
const finalScore = Math.min(baseScore + positionBonus, 100);
```

### 4.2 算法优势

✅ **优势 1: 语义清晰**
- 基础分直接反映引用频率
- 位置加成反映引用位置的重要性
- 最终分数有明确的物理意义

✅ **优势 2: 合理的分数范围**
```typescript
// 场景 1: 被引用 1 次，位置靠前
citationCount = 1, totalSources = 5, avgPosition = 0
baseScore = (1/5) * 100 = 20
positionBonus = (1 - 0/10) * 20 = 20
finalScore = 20 + 20 = 40 分 ✅

// 场景 2: 被引用 5 次，位置靠前
citationCount = 5, totalSources = 5, avgPosition = 0
baseScore = (5/5) * 100 = 100
positionBonus = 20
finalScore = min(100 + 20, 100) = 100 分 ✅

// 场景 3: 被引用 1 次，位置靠后
citationCount = 1, totalSources = 5, avgPosition = 10
baseScore = 20
positionBonus = (1 - 10/10) * 20 = 0
finalScore = 20 + 0 = 20 分 ✅
```

✅ **优势 3: 避免了旧版的 BUG**
- 不再使用百分比分配
- 每个来源独立评分
- 分数总和不再固定为 100

### 4.3 新算法的潜在问题

⚠️ **问题 1: baseScore 的分母选择**
```typescript
const baseScore = Math.min((stats.citationCount / totalSources) * 100, 100);
```

**当前设计**:
- 分母是 `totalSources` (来源总数，通常是 5)
- 含义: "被引用次数 / 来源数量"

**问题分析**:
```typescript
// 场景: AI 答案有 20 个句子，用户内容被引用 10 次
citationCount = 10, totalSources = 5
baseScore = (10/5) * 100 = 200 → min(200, 100) = 100 分

// 这意味着：只要被引用次数 ≥ 来源数，就能拿满分
```

**替代方案**:
```typescript
// 方案 A: 使用 totalSentences 作为分母
const baseScore = Math.min((stats.citationCount / totalSentences) * 100, 100);
// 含义: "被引用的句子占比"

// 方案 B: 使用固定阈值
const baseScore = Math.min((stats.citationCount / 10) * 100, 100);
// 含义: "被引用 10 次 = 满分"
```

⚠️ **问题 2: 位置加成的权重**
- 当前位置加成最高 20 分 (占总分的 20%)
- 是否合理需要实际数据验证
- 建议: 可以设计为可配置参数

---

## 第五部分：算法对比与建议

### 5.1 旧版 vs 新版对比

| 维度 | 旧版算法 | 新版算法 |
|------|---------|---------|
| **评分语义** | 相对占比 (百分比分配) | 绝对质量 (独立评分) |
| **分数总和** | 固定 100 | 不固定 |
| **主要问题** | 单一来源总是 100 分 | baseScore 分母选择 |
| **复杂度** | 高 (指数衰减) | 低 (线性计算) |
| **可解释性** | 差 | 好 |

### 5.2 推荐的最终算法

基于以上分析，我推荐以下改进版本：

```typescript
/**
 * 改进版评分算法
 *
 * 设计原则：
 * 1. 引用频率是核心指标 (70% 权重)
 * 2. 引用位置是辅助指标 (30% 权重)
 * 3. 使用 totalSentences 作为基准
 */
function calculateImprovedScore(
  stats: SourceCitationStats,
  totalSentences: number
): number {
  // 1. 引用频率分 (0-70)
  // 被引用次数 / 总句子数 * 70
  const frequencyScore = Math.min(
    (stats.citationCount / totalSentences) * 70,
    70
  );

  // 2. 位置分 (0-30)
  // 平均位置越靠前，分数越高
  const avgPosition = stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length;
  const positionScore = totalSentences > 1
    ? (1 - avgPosition / (totalSentences - 1)) * 30
    : 30;

  // 3. 最终得分
  return Math.round(frequencyScore + positionScore);
}
```

**优势**:
- ✅ 使用 `totalSentences` 作为基准，更合理
- ✅ 明确的权重分配 (70% 频率 + 30% 位置)
- ✅ 避免了"单一来源 100 分"的问题
- ✅ 分数范围合理 (0-100)

### 5.3 实际场景测试

让我们用实际场景测试三种算法：

**场景**: AI 生成了 10 个句子的答案，用户内容被引用 3 次，平均位置在第 2 句

| 算法版本 | 计算过程 | 最终得分 |
|---------|---------|---------|
| **旧版** | rawScore=复杂计算, 占比=100% | **100 分** ❌ |
| **新版 (fixed)** | base=3/5*100=60, bonus=8/9*20=17.8 | **78 分** |
| **改进版** | freq=3/10*70=21, pos=8/9*30=26.7 | **48 分** ✅ |

**分析**:
- 旧版: 完全错误，无法使用
- 新版: 分数偏高，因为用 totalSources 作为分母
- 改进版: 分数合理，反映了"30% 引用率"的实际情况

---

## 第六部分：实施建议

### 6.1 立即修复 (优先级 P0)

**任务**: 替换 impression-calculator.ts 中的 BUG 算法

**步骤**:
1. 备份旧版文件
2. 使用改进版算法更新 `calculateImpression` 函数
3. 更新单元测试
4. 验证所有调用点

**预期影响**:
- ✅ 修复"总是 100 分"的 BUG
- ✅ 提供更准确的评分
- ⚠️ 现有用户的历史分数会发生变化

### 6.2 短期优化 (1-2 周)

**任务 1: 改进句子分割**
```typescript
// 添加更智能的句子分割逻辑
function splitSentencesImproved(text: string): string[] {
  // 处理缩写 (Dr., Mr., etc.)
  // 处理数字 (3.14, etc.)
  // 处理引号内的句子
}
```

**任务 2: 动态引用范围**
```typescript
// 根据实际来源数量调整范围
if (index > 0 && index <= totalSources) {
  indices.push(index);
}
```

**任务 3: 添加配置参数**
```typescript
interface ScoringConfig {
  frequencyWeight: number;  // 默认 0.7
  positionWeight: number;   // 默认 0.3
}
```

### 6.3 中期优化 (1-2 月)

**任务 1: 添加多维度评分**
- 引用频率分
- 引用位置分
- 引用质量分 (基于词数)
- 引用分布分 (是否集中在某几句)

**任务 2: 对比学术版算法**
- 研究学术版的 11 种评分函数
- 评估哪些适合项目版
- 实现 2-3 种最有价值的评分维度

---

## 第七部分：总结与行动计划

### 7.1 核心发现

**BUG 根因**:
- 旧版算法使用百分比分配，导致单一来源总是 100 分
- 评分语义错误：占比 ≠ 质量

**解决方案**:
- 改用绝对质量评分
- 使用 totalSentences 作为基准
- 明确频率和位置的权重分配

### 7.2 推荐的实施方案

**方案 A: 保守修复** (推荐)
- 使用 impression-calculator-fixed.ts 的逻辑
- 将 baseScore 的分母改为 totalSentences
- 调整权重为 70% 频率 + 30% 位置

**方案 B: 激进重构**
- 完全重写评分系统
- 实现多维度评分
- 对标学术版的 11 种评分函数

### 7.3 立即行动清单

- [ ] 备份现有的 impression-calculator.ts
- [ ] 更新评分算法（使用改进版）
- [ ] 编写单元测试验证新算法
- [ ] 在测试环境验证分数合理性
- [ ] 部署到生产环境
- [ ] 监控用户反馈

---

## 附录：代码实现

### A.1 推荐的最终实现

```typescript
/**
 * Impression calculator for GEO analysis (IMPROVED VERSION)
 *
 * 改进内容：
 * 1. 使用 totalSentences 作为基准
 * 2. 明确的权重分配 (70% 频率 + 30% 位置)
 * 3. 避免"单一来源 100 分"问题
 */

export function calculateImpression(
  extraction: CitationExtractionResult,
  totalSources: number,
  targetSourceIndex: number
): ImpressionResult {
  const { sourceStats, totalSentences } = extraction;
  const scores: SourceScore[] = [];

  // 配置参数
  const FREQUENCY_WEIGHT = 70;  // 引用频率权重
  const POSITION_WEIGHT = 30;   // 引用位置权重

  // Calculate scores for each source
  for (let i = 1; i <= totalSources; i++) {
    const stats = sourceStats.get(i);

    if (!stats || stats.citationCount === 0) {
      scores.push({
        sourceIndex: i,
        rawScore: 0,
        normalizedScore: 0,
        citationCount: 0,
        avgPosition: totalSentences,
      });
      continue;
    }

    // 计算平均位置
    const avgPosition = stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length;

    // 1. 引用频率分 (0-70)
    const frequencyScore = Math.min(
      (stats.citationCount / totalSentences) * FREQUENCY_WEIGHT,
      FREQUENCY_WEIGHT
    );

    // 2. 引用位置分 (0-30)
    const positionScore = totalSentences > 1
      ? (1 - avgPosition / (totalSentences - 1)) * POSITION_WEIGHT
      : POSITION_WEIGHT;

    // 3. 最终得分
    const finalScore = frequencyScore + positionScore;

    scores.push({
      sourceIndex: i,
      rawScore: stats.citationCount,
      normalizedScore: Math.round(finalScore),
      citationCount: stats.citationCount,
      avgPosition,
    });
  }

  // Sort by score to get ranks
  const sortedScores = [...scores].sort((a, b) => b.normalizedScore - a.normalizedScore);

  // Find target source
  const targetScore = scores.find(s => s.sourceIndex === targetSourceIndex) || null;
  const targetRank = targetScore
    ? sortedScores.findIndex(s => s.sourceIndex === targetSourceIndex) + 1
    : totalSources;

  return {
    scores,
    targetScore,
    targetRank,
  };
}
```

---

## 审查结论

**当前状态**: 🔴 严重 BUG，需要立即修复

**推荐方案**: 使用改进版算法（70% 频率 + 30% 位置）

**预期效果**:
- ✅ 修复"总是 100 分"的问题
- ✅ 提供更准确、更有区分度的评分
- ✅ 为后续多维度评分打下基础

**风险评估**: 低风险，算法逻辑清晰，易于测试和验证

