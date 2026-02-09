# GEO (Generative Engine Optimization) 技术方案文档

> 版本: v1.0 | 基于源码分析 | 可直接用于开发

---

## 目录

1. [项目概述](#1-项目概述)
2. [系统架构](#2-系统架构)
3. [模块详细设计](#3-模块详细设计)
4. [数据结构定义](#4-数据结构定义)
5. [核心算法实现](#5-核心算法实现)
6. [API 接口规范](#6-api-接口规范)
7. [配置与环境](#7-配置与环境)
8. [扩展指南](#8-扩展指南)

---

## 1. 项目概述

### 1.1 背景与目标

**问题定义**: 随着 LLM 驱动的生成式搜索引擎（如 Perplexity、ChatGPT Search）兴起，传统 SEO 技术无法有效提升内容在 AI 生成答案中的引用率。

**解决方案**: GEO 通过一系列内容优化策略，提升网页内容被生成式引擎引用的概率，最高可提升 **40%** 的源可见性。

**核心价值对比**:

| 传统 SEO | GEO |
|---------|-----|
| 优化搜索排名 | 优化 AI 引用率 |
| 关键词密度 | 内容权威性、可信度 |
| 链接建设 | 统计数据、引用来源 |

### 1.2 技术栈

| 层级 | 技术选型 |
|------|----------|
| 语言 | Python 3.9 |
| LLM | OpenAI GPT-3.5-turbo / GPT-3.5-turbo-16k |
| 网页抓取 | trafilatura, BeautifulSoup4, readabilipy |
| NLP | NLTK (句子分词、词分词) |
| 数据集 | HuggingFace datasets |
| 缓存 | JSON 文件缓存 |

### 1.3 论文引用

```bibtex
@misc{aggarwal2023geo,
  title={GEO: Generative Engine Optimization},
  author={Pranjal Aggarwal and Vishvak Murahari and Tanmay Rajpurohit
          and Ashwin Kalyan and Karthik R Narasimhan and Ameet Deshpande},
  year={2023},
  eprint={2311.09735},
  archivePrefix={arXiv},
  primaryClass={cs.LG}
}
```

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GEO 系统架构                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐                                                           │
│   │  用户查询   │                                                           │
│   │   (Query)   │                                                           │
│   └──────┬──────┘                                                           │
│          │                                                                  │
│          ▼                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                搜索与内容提取层 (search_try.py)                      │   │
│   │  ┌───────────┐   ┌───────────────┐   ┌─────────────────────────┐   │   │
│   │  │Google搜索 │──▶│ 网页内容抓取  │──▶│ GPT-3.5 内容清洗        │   │   │
│   │  │ 获取链接  │   │ trafilatura   │   │ 去除导航/侧边栏         │   │   │
│   │  └───────────┘   └───────────────┘   └─────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│          │                                                                  │
│          ▼ sources[] (url, text, summary)                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     答案生成层 (generative_le.py)                    │   │
│   │  ┌─────────────────────────────────────────────────────────────┐   │   │
│   │  │  GPT-3.5-turbo-16k 生成带引用的答案                         │   │   │
│   │  │  每句话后附加 [index] 引用标记                              │   │   │
│   │  └─────────────────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│          │                                                                  │
│          ▼ answers[] (带引用的答案文本)                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     GEO 优化层 (geo_functions.py)                    │   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│   │  │权威性   │ │统计数据 │ │引用来源 │ │技术术语 │ │SEO优化  │ ...   │   │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│          │                                                                  │
│          ▼ optimized_summaries[]                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     评估层 (utils.py)                                │   │
│   │  ┌─────────────────┐   ┌─────────────────────────────────────────┐ │   │
│   │  │ 引用提取        │   │ 多维度评分                              │ │   │
│   │  │ extract_citations│   │ wordpos / relevance / influence / ...  │ │   │
│   │  └─────────────────┘   └─────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│          │                                                                  │
│          ▼                                                                  │
│   ┌─────────────┐                                                           │
│   │ 优化效果报告│ improvements[method][source_idx]                          │
│   └─────────────┘                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流程图

```
Query ──▶ Google Search ──▶ [URL1, URL2, ..., URL_n]
                                    │
                                    ▼ trafilatura 抓取
                                    │
                                    ▼
                           GPT-3.5 清洗内容
                                    │
                                    ▼
                    sources = [{url, text, summary}, ...]
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            原始答案生成                    GEO优化后答案生成
            (identity)                     (10种优化方法)
                    │                               │
                    ▼                               ▼
            init_scores[]                   final_scores[]
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
                    improvements = final_scores - init_scores
```

### 2.3 文件结构

```
/GEO/
├── src/                          # 核心源代码
│   ├── run_geo.py                # 主运行脚本 (入口)
│   ├── geo_functions.py          # GEO 优化函数库 (10种策略)
│   ├── utils.py                  # 工具函数 (评估指标)
│   ├── generative_le.py          # 生成式引擎答案生成
│   ├── search_try.py             # 网页搜索和内容提取
│   └── global_cache.json         # 缓存文件
├── GEO-Bench/                    # 基准测试数据集
├── geval_prompts/                # GPT 评估提示文件
│   ├── relevance_detailed.txt
│   ├── diversity_detailed.txt
│   ├── influence_detailed.txt
│   └── ...
├── docs/                         # 文档
├── requirements.txt              # 依赖配置
└── README.md                     # 项目说明
```

---

## 3. 模块详细设计

### 3.1 搜索与内容提取模块 (`search_try.py`)

#### 3.1.1 功能职责

| 功能 | 描述 |
|------|------|
| Google搜索 | 根据查询获取搜索结果链接 |
| 内容抓取 | 使用 trafilatura 提取网页正文 |
| 内容清洗 | 使用 GPT-3.5 去除无关内容 |
| 结果封装 | 返回结构化的 sources 列表 |

#### 3.1.2 核心函数

```python
def search_handler(req: str, source_count: int = 8) -> dict:
    """
    主搜索处理函数

    Args:
        req: 用户查询字符串
        source_count: 需要获取的源数量，默认8个

    Returns:
        {
            'sources': [
                {
                    'url': str,        # 网页URL
                    'text': str,       # 标题+摘要
                    'raw_source': str, # 原始提取文本
                    'source': str,     # 清洗后文本
                    'summary': str     # 摘要文本
                },
                ...
            ]
        }
    """
```

```python
def clean_source_gpt35(source: str) -> str:
    """
    使用 GPT-3.5 清洗网页内容

    Prompt策略:
    - 移除 headers, sidebars, navigation menus
    - 保留主要内容
    - 应用 Markdown 格式化

    Args:
        source: 原始提取的网页文本 (截取前8000字符)

    Returns:
        清洗后的 Markdown 格式文本
    """
```

#### 3.1.3 链接过滤规则

```python
# 排除的域名列表
exclude_list = ["google", "facebook", "twitter",
                "instagram", "youtube", "tiktok", "quora"]

# 过滤逻辑: 检查域名第二部分
urlparse(link).hostname.split('.')[1] not in exclude_list
```

#### 3.1.4 内容清洗 Prompt

```
Clean and refine the extracted text from a website.
Remove any unwanted content such as headers, sidebars, and navigation menus.
Retain only the main content of the page and ensure that the text is
well-formatted and free of HTML tags, special characters, and any other
irrelevant information.
Refined text should contain the main intended readable text.
Apply markdown formatting when outputting the answer.
```

---

### 3.2 答案生成模块 (`generative_le.py`)

#### 3.2.1 功能职责

模拟生成式搜索引擎的答案生成行为，生成带有内联引用的答案。

#### 3.2.2 Prompt 模板

```python
query_prompt = """Write an accurate and concise answer for the given user question,
using _only_ the provided summarized web search results.

The answer should be:
- correct, high-quality, written by an expert
- unbiased and journalistic tone
- informative, interesting, and engaging
- rigorous and defensible logic

CRITICAL: Every sentence should be _immediately followed_ by an in-line citation
to the search result(s) using [index] format.

When citing several search results, use [1][2][3] format rather than [1, 2, 3].

Question: {query}

Search Results:
{source_text}
"""
```

#### 3.2.3 核心函数

```python
def generate_answer(
    query: str,
    sources: List[str],
    num_completions: int,
    temperature: float = 0.5,
    model: str = 'gpt-3.5-turbo-16k'
) -> List[str]:
    """
    生成带引用的答案

    Args:
        query: 用户查询
        sources: 源摘要列表
        num_completions: 生成答案数量 (用于多次采样取平均)
        temperature: 生成温度，默认0.5
        model: 使用的模型

    Returns:
        答案列表，每个答案包含 [index] 格式的引用
    """
```

#### 3.2.4 Source 格式化

```python
# 将 sources 格式化为 prompt 输入
source_text = '\n\n'.join([
    f'### Source {idx+1}:\n{source}\n\n\n'
    for idx, source in enumerate(sources)
])
```

---

### 3.3 GEO 优化模块 (`geo_functions.py`)

#### 3.3.1 系统 Prompt 设计

```python
COMMON_SYSTEM_PROMPT = """You are an expert ml researcher having previous
background in SEO and search engines in general. You are working on novel
research ideas for next generation of products.

These products will have language models augmented with search engines,
with the task of answering questions based on sources backed by the search engine.
This new set of systems will be collectively called language engines
(generative search engines).

This will require websites to update their SEO techniques to rank higher
in the llm generated answer. Specifically they will use GEO
(Generative Engine Optimization) techniques to boost their visibility
in the final text answer outputted by the Language Engine.
"""
```

#### 3.3.2 10种优化策略详解

| # | 方法名 | 函数 | 优化目标 |
|---|--------|------|----------|
| 1 | identity | `identity()` | 基准对照（无优化） |
| 2 | fluent_gpt | `fluent_optimization_gpt()` | 提升文本流畅性 |
| 3 | unique_words_gpt | `unique_words_optimization_gpt()` | 使用独特/稀有词汇 |
| 4 | authoritative_mine | `authoritative_optimization_mine()` | 增强权威性语气 |
| 5 | more_quotes_mine | `more_quotes_mine()` | 添加权威人物引言 |
| 6 | citing_credible_mine | `citing_credible_sources_mine()` | 引用可信来源 |
| 7 | simple_language_mine | `simple_language_mine()` | 简化语言表达 |
| 8 | technical_terms_mine | `technical_terms_mine()` | 增加技术术语 |
| 9 | stats_optimization_gpt | `stats_optimization_mine()` | 添加统计数据 |
| 10 | seo_optimize_mine2 | `seo_optimize_mine2()` | SEO关键词优化 |

#### 3.3.3 优化策略 Prompt 示例

**权威性优化 (`authoritative_optimization_mine`)**:

```
Transform the following source into an authoritative style
without adding or removing any core information.

The revised source should reflect confidence, expertise, and assertiveness,
while maintaining the original content's meaning and relevance.

Rules:
- Only individual lines and/or 2-3 sentences can be paraphrased
- Keep the format and content of text the same
- Line spacing, bullet points and overall structure should remain the same
- No addition or deletion of content is allowed

Expected additions:
- Phrases such as "only we are authentic", "we guarantee"
- Second pronouns such as "you will not regret"
```

**统计数据优化 (`stats_optimization_mine`)**:

```
## Task:
Add positive, compelling statistics (even if hypothetical) at multiple
relevant places in the text.

Statistics means:
- x% growth in marketing
- numbers in scientific texts
- interesting numerical facts

## Guidelines:
1. Statistics should be subtly added inline within sentences
2. Do not update any text content except for the lines where adding statistics
3. Do not add or delete content except the statistics
4. First identify places where statistics can be added

## Output Format:
1. Stat to be added
2. Stat to be added
...
k. Stat to be added

Updated Output:
```

#### 3.3.4 GPT 调用封装

```python
def call_gpt(
    user_prompt: str,
    system_prompt: str = COMMON_SYSTEM_PROMPT,
    model: str = 'gpt-3.5-turbo-16k',
    temperature: float = 0.0,
    num_completions: int = 1,
    regenerte_answer: bool = False,
    pre_msgs: List = None
) -> str:
    """
    统一的 GPT 调用接口，带缓存机制

    缓存策略:
    - 缓存键: str((user_prompt, system_prompt))
    - 缓存文件: geo_optimizations_cache_{model}.json
    - 支持静态缓存模式 (STATIC_CACHE 环境变量)

    错误处理:
    - 自动重试 (最多10次)
    - 超长文本自动截断
    - 指数退避等待
    """
```

---

### 3.4 评估模块 (`utils.py`)

#### 3.4.1 引用提取算法

```python
def extract_citations_new(text: str) -> List[List[Tuple]]:
    """
    从生成的答案中提取引用信息

    处理流程:
    1. 按段落分割 (\\n\\n)
    2. 每段按句子分词 (nltk.sent_tokenize)
    3. 每句提取引用标记 [index]

    Returns:
        三层嵌套结构:
        [
            [  # 段落
                (words, sentence, citations),  # 句子
                ...
            ],
            ...
        ]

    引用正则: r'\\[[^\\w\\s]*\\d+[^\\w\\s]*\\]'
    """
```

#### 3.4.2 评分函数体系

**11种评估指标**:

| 类别 | 指标名 | 函数 | 计算方式 |
|------|--------|------|----------|
| 基础 | simple_wordpos | `impression_wordpos_count_simple` | 词数 × 位置衰减 |
| 基础 | simple_word | `impression_word_count_simple` | 纯词数统计 |
| 基础 | simple_pos | `impression_pos_count_simple` | 纯位置衰减 |
| GPT评估 | subjpos_detailed | `impression_subjpos_detailed` | 主观位置评分 |
| GPT评估 | diversity_detailed | `impression_diversity_detailed` | 多样性评分 |
| GPT评估 | uniqueness_detailed | `impression_uniqueness_detailed` | 独特性评分 |
| GPT评估 | follow_detailed | `impression_follow_detailed` | 跟随性评分 |
| GPT评估 | influence_detailed | `impression_influence_detailed` | 影响力评分 |
| GPT评估 | relevance_detailed | `impression_relevance_detailed` | 相关性评分 |
| GPT评估 | subjcount_detailed | `impression_subjcount_detailed` | 主观计数评分 |
| 综合 | subjective_score | `impression_subjective_impression` | 综合主观评分 |

#### 3.4.3 核心评分算法

**词位置加权评分 (`impression_wordpos_count_simple`)**:

```python
def impression_wordpos_count_simple(sentences, n=5, normalize=True):
    """
    基于词数和位置的加权评分

    公式: score_i = Σ (word_count × e^(-position/total) / citation_count)

    Args:
        sentences: extract_citations_new 的输出
        n: 源数量
        normalize: 是否归一化为概率分布

    Returns:
        长度为 n 的分数列表，表示每个源的可见性得分
    """
    sentences = list(itertools.chain(*sentences))  # 展平段落
    scores = [0 for _ in range(n)]

    for i, sent in enumerate(sentences):
        for cit in sent[2]:  # 遍历引用
            score = get_num_words(sent[0])           # 词数
            score *= math.exp(-1 * i / (len(sentences)-1))  # 位置衰减
            score /= len(sent[2])                    # 多引用分摊
            scores[cit-1] += score

    return [x/sum(scores) for x in scores] if normalize else scores
```

**位置衰减公式**:

```
位置权重 = e^(-i / (N-1))

其中:
- i: 句子在答案中的位置 (0-indexed)
- N: 总句子数

特性:
- 第一句权重 = 1.0
- 最后一句权重 ≈ 0.368 (1/e)
- 中间句子指数衰减
```

**多引用分摊规则**:

```
当一个句子引用多个源时，分数按引用数量平均分配:

score_per_source = base_score / len(citations)

例如: 句子 "AI is powerful [1][2][3]"
- 词数 = 3
- 引用数 = 3
- 每个源得分 = 3 / 3 = 1
```

---

## 4. 数据结构定义

### 4.1 核心数据结构

```python
from typing import TypedDict, List, Dict

# Source 结构
class Source(TypedDict):
    url: str           # 网页URL
    text: str          # 标题 + 摘要
    raw_source: str    # 原始提取文本
    source: str        # GPT清洗后文本
    summary: str       # 摘要文本 (用于答案生成)

# 缓存条目结构
class CacheEntry(TypedDict):
    sources: List[Source]
    responses: List[List[str]]  # 多次生成的答案

# 全局缓存结构
GlobalCache = Dict[str, List[CacheEntry]]  # query -> [CacheEntry]

# 评估结果结构
class EvaluationResult(TypedDict):
    init_scores: np.ndarray      # shape: (num_completions, n)
    final_scores: np.ndarray     # shape: (num_methods, num_completions, n)
    improvements: np.ndarray     # shape: (num_methods, n)
```

### 4.2 缓存文件结构

**global_cache.json**:

```json
{
  "What is machine learning?": [
    {
      "sources": [
        {
          "url": "https://example.com/ml",
          "text": "Title: ML Guide\nSummary: ...",
          "raw_source": "...",
          "source": "...",
          "summary": "..."
        }
      ],
      "responses": [
        ["Answer 1 with [1] citations...", "Answer 2..."]
      ]
    }
  ]
}
```

**geo_optimizations_cache_gpt-3.5-turbo-16k.json**:

```json
{
  "((user_prompt, system_prompt))": ["optimized_text_1", "optimized_text_2"]
}
```

---

## 5. 核心算法实现

### 5.1 主优化流程 (`run_geo.py`)

```python
def improve(
    query: str,
    idx: int,
    sources: List[str] = None,
    summaries: List[str] = None,
    impression_fn = impression_wordpos_count_simple,
    returnFullData: bool = False
) -> Tuple[np.ndarray, Union[List[bool], Tuple]]:
    """
    核心优化评估函数

    Args:
        query: 用户查询
        idx: 要优化的目标源索引 (0-based)
        sources: 源文本列表 (可选)
        summaries: 摘要列表 (可选)
        impression_fn: 评分函数
        returnFullData: 是否返回完整数据

    Returns:
        (improvements, success_flags)
        - improvements: shape (num_methods, n) 的改进矩阵
        - success_flags: 每种方法是否成功提升目标源
    """
```

### 5.2 算法流程图

```
输入: query, idx (目标源索引)
│
├─ Step 1: 获取初始答案
│   answers = get_answer(query, num_completions=5)
│   summaries = [x['summary'] for x in answers['sources']]
│
├─ Step 2: 计算初始分数
│   init_scores = mean([impression_fn(answer) for answer in answers])
│
├─ Step 3: 遍历所有 GEO 方法
│   for method in GEO_METHODS:
│       │
│       ├─ 3.1 应用优化到目标源
│       │   summaries_copy[idx] = method(summaries[idx])
│       │
│       ├─ 3.2 重新生成答案
│       │   new_answers = get_answer(query, summaries_copy)
│       │
│       ├─ 3.3 计算新分数
│       │   final_scores = mean([impression_fn(ans) for ans in new_answers])
│       │
│       └─ 3.4 记录改进
│           improvements[method] = final_scores - init_scores
│
└─ 输出: improvements, (improvements[:, idx] > 0)
```

---

## 6. API 接口规范

### 6.1 主入口函数

```python
# run_geo.py
def improve(
    query: str,
    idx: int,
    sources: List[str] = None,
    summaries: List[str] = None,
    impression_fn: Callable = impression_wordpos_count_simple,
    returnFullData: bool = False,
    static_cache: bool = False
) -> Tuple[np.ndarray, Union[List[bool], Tuple[np.ndarray, List[np.ndarray]]]]:
    """
    评估 GEO 优化效果

    Example:
        >>> improvements, success = improve(
        ...     query="What is deep learning?",
        ...     idx=2,  # 优化第3个源
        ...     impression_fn=impression_wordpos_count_simple
        ... )
        >>> print(improvements.shape)  # (10, 5) - 10种方法, 5个源
        >>> print(success)  # [True, False, True, ...] - 哪些方法有效
    """
```

### 6.2 工具函数接口

```python
# utils.py
def get_answer(
    query: str,
    summaries: List[str] = None,
    n: int = 5,
    num_completions: int = 1,
    cache_idx: int = 0,
    regenerate_answer: bool = False,
    write_to_cache: bool = True,
    loaded_cache: dict = None
) -> dict:
    """
    获取或生成答案

    Returns:
        {
            'sources': [Source, ...],
            'responses': [[answer1, answer2, ...], ...]
        }
    """

def extract_citations_new(text: str) -> List[List[Tuple[List[str], str, List[int]]]]:
    """
    提取答案中的引用

    Returns:
        [[[words, sentence, [citation_indices]], ...], ...]
    """
```

### 6.3 优化函数接口

```python
# geo_functions.py
def authoritative_optimization_mine(summary: str) -> str:
    """将内容改写为权威性语气"""

def stats_optimization_mine(summary: str) -> str:
    """添加统计数据"""

def citing_credible_sources_mine(summary: str) -> str:
    """添加可信来源引用"""

def fluent_optimization_gpt(summary: str) -> str:
    """提升文本流畅性"""

def unique_words_optimization_gpt(summary: str) -> str:
    """使用独特/稀有词汇"""

def more_quotes_mine(summary: str) -> str:
    """添加权威人物引言"""

def simple_language_mine(summary: str) -> str:
    """简化语言表达"""

def technical_terms_mine(summary: str) -> str:
    """增加技术术语"""

def seo_optimize_mine2(summary: str) -> str:
    """SEO关键词优化"""
```

---

## 7. 配置与环境

### 7.1 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `OPENAI_API_KEY` | (必需) | OpenAI API 密钥 |
| `GLOBAL_CACHE_FILE` | `global_cache.json` | 全局缓存文件路径 |
| `GEO_CACHE_FILE` | `geo_optimizations_cache.json` | GEO优化缓存文件 |
| `STATIC_CACHE` | `None` | 设为 `True` 启用静态缓存模式 |
| `SUBJ_STATIC_CACHE` | `None` | 主观评估静态缓存 |

### 7.2 依赖安装

```bash
# 创建环境
conda create -n geo python=3.9
conda activate geo

# 安装依赖
pip install -r requirements.txt
```

**requirements.txt**:

```
openai<1.0.0
tqdm
beautifulsoup4
readabilipy
trafilatura
datasets
nltk
numpy
requests
```

### 7.3 运行方式

```bash
# 进入源码目录
cd src

# 运行主程序
python run_geo.py

# 或指定缓存文件
GLOBAL_CACHE_FILE=my_cache.json python run_geo.py
```

---

## 8. 扩展指南

### 8.1 添加新的优化方法

**Step 1**: 在 `geo_functions.py` 中定义新函数

```python
def my_new_optimization(summary: str) -> str:
    """
    自定义优化方法

    Args:
        summary: 原始摘要文本

    Returns:
        优化后的摘要文本
    """
    user_prompt = f"""Your custom prompt here...

    Source:
    ```
    {summary}
    ```
    """
    return call_gpt(user_prompt)
```

**Step 2**: 在 `run_geo.py` 中注册方法

```python
GEO_METHODS = {
    # ... 现有方法
    'my_new_method': my_new_optimization,
}
```

### 8.2 添加新的评估指标

**Step 1**: 在 `utils.py` 中定义评分函数

```python
def impression_my_metric(sentences, n=5, normalize=True):
    """
    自定义评估指标

    Args:
        sentences: extract_citations_new 的输出
        n: 源数量
        normalize: 是否归一化

    Returns:
        长度为 n 的分数列表
    """
    scores = [0 for _ in range(n)]
    # 自定义评分逻辑
    return [x/sum(scores) for x in scores] if normalize else scores
```

**Step 2**: 在 `run_geo.py` 中注册指标

```python
IMPRESSION_FNS = {
    # ... 现有指标
    'my_metric': impression_my_metric,
}
```

### 8.3 GPT 评估提示模板

在 `geval_prompts/` 目录下创建新的评估提示文件：

```
Evaluation Criteria:

[Your Metric Name] (1-5) - [Description of what this metric measures]

Evaluation Steps:

1. Read the query and generated answer carefully
2. Assess Source [1] based on [your criteria]
3. Assign a score from 1 to 5

Example:

Input User Query:
{query}

Generated Answer:
{answer}

Evaluation Form (scores ONLY):

- [Your Metric] for Source [1]:
```

---

## 9. 注意事项

### 9.1 API 版本兼容性

- 项目使用 `openai<1.0.0` 版本
- 使用旧版 API 调用方式: `openai.ChatCompletion.create()`
- 如需升级到新版 API，需修改调用方式

### 9.2 缓存策略

- 缓存键基于 `(user_prompt, system_prompt)` 元组的字符串表示
- 静态缓存模式下，缓存只在启动时加载一次
- 动态缓存模式下，每次调用都会重新读取缓存文件

### 9.3 性能优化建议

1. **启用静态缓存**: 设置 `STATIC_CACHE=True` 减少文件 I/O
2. **预热缓存**: 首次运行时生成完整缓存
3. **批量处理**: 使用 `num_completions` 参数一次生成多个答案

### 9.4 已知限制

- Google 搜索可能触发反爬机制
- GPT API 调用有速率限制
- 长文本会被自动截断 (8000 字符)

---

## 附录

### A. 方法注册表

```python
# run_geo.py 中的完整方法注册
GEO_METHODS = {
    'identity': identity,
    'fluent_gpt': fluent_optimization_gpt,
    'unique_words_gpt': unique_words_optimization_gpt,
    'authoritative_mine': authoritative_optimization_mine,
    'more_quotes_mine': more_quotes_mine,
    'citing_credible_mine': citing_credible_sources_mine,
    'simple_language_mine': simple_language_mine,
    'technical_terms_mine': technical_terms_mine,
    'stats_optimization_gpt': stats_optimization_mine,
    'seo_optimize_mine2': seo_optimize_mine2,
}
```

### B. 指标注册表

```python
# run_geo.py 中的完整指标注册
IMPRESSION_FNS = {
    'simple_wordpos': impression_wordpos_count_simple,
    'simple_word': impression_word_count_simple,
    'simple_pos': impression_pos_count_simple,
    'subjective_score': impression_subjective_impression,
    'subjpos_detailed': impression_subjpos_detailed,
    'diversity_detailed': impression_diversity_detailed,
    'uniqueness_detailed': impression_uniqueness_detailed,
    'follow_detailed': impression_follow_detailed,
    'influence_detailed': impression_influence_detailed,
    'relevance_detailed': impression_relevance_detailed,
    'subjcount_detailed': impression_subjcount_detailed,
}
```

---

> 文档版本: v1.0
> 生成日期: 2026-02-03
> 基于源码分析自动生成
