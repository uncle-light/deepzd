# GEO 开源项目参考

## 1. AI2HU/gego - GEO 追踪器

**GitHub**: https://github.com/AI2HU/gego

### 项目概述

Gego 是一个开源的生成式引擎优化 (GEO) 追踪系统，用于监测品牌和关键词在多个大语言模型中的表现。

### 核心功能

- **多模型支持**：OpenAI, Anthropic, Ollama, Google, Perplexity
- **自动关键词提取**：无需预定义列表
- **灵活调度**：基于 Cron 表达式
- **完整分析**：关键词提及、趋势分析

### 技术栈

- 语言：Go 1.21+
- 数据库：SQLite + MongoDB
- 部署：Docker 支持
- API：REST API（端口 8989）

### 适用场景

- 品牌监控（DeepZD Phase 3）
- 竞争分析
- 提示词优化

### 许可证

GPL-3.0

---

## 2. GEO-optim/GEO - 普林斯顿研究项目

**GitHub**: https://github.com/GEO-optim/GEO

### 项目概述

普林斯顿大学、Georgia Tech、Allen AI、IIT Delhi 联合研究项目，提出 GEO 优化策略和评估基准。

### 核心功能

- **GEO-Bench**：10,000 查询的评估基准
- **优化策略**：9 种经过验证的优化方法
- **可见度提升**：最高可达 40%

### 技术栈

- 语言：Python 3.9
- 依赖：Hugging Face datasets
- 环境：Conda

### 数据集

```python
from datasets import load_dataset
load_dataset('GEO-optim/geo-bench')
```

- 10,000 查询
- 50+ 标签
- 25 个领域

### 9 种优化方法

1. 添加引用来源 (Cite Sources)
2. 使用统计数据 (Statistics)
3. 引用专家观点 (Quotations)
4. 提升可读性 (Fluency)
5. 直接回答问题 (Authoritative)
6. 结构化内容 (Technical Terms)
7. 建立权威性 (Credibility)
8. 保持内容新鲜 (Unique Words)
9. 简化语言 (Easy-to-Understand)

### 适用场景

- 内容分析器（DeepZD Phase 1）
- 优化建议生成

### 许可证

Apache-2.0

---

## DeepZD 集成计划

| DeepZD 功能 | 参考项目 | 优先级 |
|-------------|----------|--------|
| 内容分析器 | GEO-optim/GEO | Phase 1 |
| 品牌监控 | AI2HU/gego | Phase 3 |
