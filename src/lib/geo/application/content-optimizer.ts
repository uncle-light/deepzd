/**
 * GEO Content Optimizer
 * Based on GEO-optim/GEO optimization strategies
 * Uses AI to rewrite content for each strategy
 *
 * Reference: https://github.com/GEO-optim/GEO
 */

import { callAIChat, getDefaultProvider } from '../../ai';
import { GeoStrategy } from '../domain/strategy-analyzer';

/**
 * Optimization result
 */
export interface OptimizationResult {
  strategy: GeoStrategy;
  originalContent: string;
  optimizedContent: string;
  changes: string[];
}

/**
 * Strategy-specific prompts (based on GEO original)
 */
const OPTIMIZATION_PROMPTS: Record<GeoStrategy, { zh: string; en: string }> = {
  [GeoStrategy.CITE_SOURCES]: {
    zh: `你是一位专业的内容优化专家。请为以下内容添加可信的引用来源。

要求：
1. 在适当位置添加引用，如"根据 XX 研究..."、"据 XX 报告显示..."
2. 引用来源应听起来可信（可以是虚构但合理的）
3. 保持原文的核心内容和结构不变
4. 添加 5-6 处引用即可，不要过度
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Add credible citations to the following content.

Requirements:
1. Add citations at appropriate places, like "According to XX research...", "XX report shows..."
2. Citations should sound credible (can be fictional but plausible)
3. Keep the core content and structure unchanged
4. Add 5-6 citations, don't overdo it
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },

  [GeoStrategy.STATISTICS]: {
    zh: `你是一位专业的内容优化专家。请为以下内容添加统计数据和数字。

要求：
1. 在适当位置添加具体数字、百分比、增长率等
2. 数据应听起来合理（可以是虚构但可信的）
3. 保持原文的核心内容和结构不变
4. 数据应自然融入句子中，不要生硬
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Add statistics and numbers to the following content.

Requirements:
1. Add specific numbers, percentages, growth rates at appropriate places
2. Data should sound reasonable (can be fictional but credible)
3. Keep the core content and structure unchanged
4. Data should blend naturally into sentences
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },

  [GeoStrategy.QUOTATIONS]: {
    zh: `你是一位专业的内容优化专家。请为以下内容添加专家观点和引用。

要求：
1. 添加专家、行业领袖或权威人士的引用
2. 使用引号标注直接引用，如：XX 专家表示："..."
3. 引用应与内容主题相关
4. 保持原文的核心内容和结构不变
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Add expert quotes to the following content.

Requirements:
1. Add quotes from experts, industry leaders, or authorities
2. Use quotation marks for direct quotes, like: Expert XX said: "..."
3. Quotes should be relevant to the content topic
4. Keep the core content and structure unchanged
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },

  [GeoStrategy.FLUENCY]: {
    zh: `你是一位专业的内容优化专家。请优化以下内容的流畅性和可读性。

要求：
1. 使句子之间过渡更自然流畅
2. 改善语言表达，使其更清晰易读
3. 保持原文的核心信息不变
4. 适当调整句子长度，避免过长
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Improve the fluency and readability of the following content.

Requirements:
1. Make transitions between sentences more natural
2. Improve language expression for clarity
3. Keep the core information unchanged
4. Adjust sentence length appropriately
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },

  [GeoStrategy.AUTHORITATIVE]: {
    zh: `你是一位专业的内容优化专家。请将以下内容改写为更权威的风格。

要求：
1. 使用更自信、专业的语气
2. 添加权威性表述，如"研究表明"、"事实上"、"数据显示"
3. 在开头直接回答核心问题
4. 保持原文的核心内容不变
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Rewrite the following content in a more authoritative style.

Requirements:
1. Use more confident, professional tone
2. Add authoritative expressions like "Research shows", "In fact", "Data indicates"
3. Answer the core question directly at the beginning
4. Keep the core content unchanged
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },

  [GeoStrategy.TECHNICAL_TERMS]: {
    zh: `你是一位专业的内容优化专家。请为以下内容添加结构化格式和技术术语。

要求：
1. 使用标题、列表、编号等结构化元素
2. 在适当位置添加专业术语
3. 保持原文的核心内容不变
4. 使内容更有条理性
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Add structured format and technical terms to the following content.

Requirements:
1. Use headings, lists, numbering for structure
2. Add professional terminology at appropriate places
3. Keep the core content unchanged
4. Make content more organized
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },

  [GeoStrategy.CREDIBILITY]: {
    zh: `你是一位专业的内容优化专家。请提升以下内容的可信度。

要求：
1. 添加时间标记，如"2024年"、"最新研究"
2. 添加来源链接或参考（可以是虚构但合理的）
3. 使用更具体的描述替代模糊表述
4. 保持原文的核心内容不变
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Enhance the credibility of the following content.

Requirements:
1. Add timestamps like "2024", "latest research"
2. Add source links or references (can be fictional but plausible)
3. Replace vague descriptions with specific ones
4. Keep the core content unchanged
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },

  [GeoStrategy.UNIQUE_WORDS]: {
    zh: `你是一位专业的内容优化专家。请增加以下内容的词汇多样性。

要求：
1. 使用更丰富、独特的词汇替换重复用词
2. 避免同一个词在短距离内重复出现
3. 保持原文的核心含义不变
4. 使用同义词和近义词增加多样性
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Increase vocabulary diversity in the following content.

Requirements:
1. Use richer, unique words to replace repetitive ones
2. Avoid repeating the same word in close proximity
3. Keep the core meaning unchanged
4. Use synonyms to increase diversity
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },

  [GeoStrategy.EASY_TO_UNDERSTAND]: {
    zh: `你是一位专业的内容优化专家。请简化以下内容，使其更易理解。

要求：
1. 使用简单、易懂的语言
2. 添加例子和解释帮助理解复杂概念
3. 缩短过长的句子
4. 保持原文的核心信息不变
5. 直接输出优化后的完整内容，不要解释

原文：
{content}

优化后的内容：`,
    en: `You are a professional content optimizer. Simplify the following content for better understanding.

Requirements:
1. Use simple, easy-to-understand language
2. Add examples and explanations for complex concepts
3. Shorten overly long sentences
4. Keep the core information unchanged
5. Output the optimized content directly, no explanations

Original:
{content}

Optimized content:`
  },
};

/**
 * Strategy labels for display
 */
export const STRATEGY_LABELS: Record<GeoStrategy, { zh: string; en: string }> = {
  [GeoStrategy.CITE_SOURCES]: { zh: '引用来源', en: 'Cite Sources' },
  [GeoStrategy.STATISTICS]: { zh: '统计数据', en: 'Statistics' },
  [GeoStrategy.QUOTATIONS]: { zh: '专家观点', en: 'Quotations' },
  [GeoStrategy.FLUENCY]: { zh: '可读性', en: 'Fluency' },
  [GeoStrategy.AUTHORITATIVE]: { zh: '权威性', en: 'Authoritative' },
  [GeoStrategy.TECHNICAL_TERMS]: { zh: '结构化', en: 'Technical Terms' },
  [GeoStrategy.CREDIBILITY]: { zh: '可信度', en: 'Credibility' },
  [GeoStrategy.UNIQUE_WORDS]: { zh: '内容新鲜度', en: 'Unique Words' },
  [GeoStrategy.EASY_TO_UNDERSTAND]: { zh: '易理解性', en: 'Easy to Understand' },
};

/**
 * Optimize content using a specific strategy
 */
export async function optimizeContent(
  content: string,
  strategy: GeoStrategy,
  locale: string = 'zh'
): Promise<OptimizationResult> {
  const provider = getDefaultProvider();
  if (!provider) {
    throw new Error(
      'No AI provider configured. Please set at least one API key: VOLC_API_KEY, GLM_API_KEY, DEEPSEEK_API_KEY, QWEN_API_KEY, or OPENAI_API_KEY.'
    );
  }

  const promptTemplate = OPTIMIZATION_PROMPTS[strategy][locale as 'zh' | 'en'];
  const prompt = promptTemplate.replace('{content}', content);

  const responses = await callAIChat(
    [{ role: 'user', content: prompt }],
    { provider }
  );
  const optimizedContent = responses[0]?.text || '';

  const changes = detectChanges(content, optimizedContent, locale);

  return {
    strategy,
    originalContent: content,
    optimizedContent: optimizedContent.trim(),
    changes,
  };
}

const CHANGE_I18N = {
  addedChars: { zh: '增加了约', en: 'Added approximately' },
  removedChars: { zh: '减少了约', en: 'Removed approximately' },
  chars: { zh: '个字符', en: 'characters' },
  addedCitations: { zh: '添加了', en: 'Added' },
  citationsSuffix: { zh: '处引用', en: 'citations' },
  addedStats: { zh: '添加了', en: 'Added' },
  statsSuffix: { zh: '处数据', en: 'statistics' },
} as const;

function tChange(key: keyof typeof CHANGE_I18N, locale: string): string {
  const pair = CHANGE_I18N[key];
  return pair[locale as 'zh' | 'en'] ?? pair.en;
}

function detectChanges(original: string, optimized: string, locale: string): string[] {
  const changes: string[] = [];

  const diff = optimized.length - original.length;
  if (diff > 0) {
    changes.push(`${tChange('addedChars', locale)} ${diff} ${tChange('chars', locale)}`);
  } else if (diff < 0) {
    changes.push(`${tChange('removedChars', locale)} ${Math.abs(diff)} ${tChange('chars', locale)}`);
  }

  const origCitations = (original.match(/\[\d+\]|根据.*?研究|据.*?显示/g) || []).length;
  const optCitations = (optimized.match(/\[\d+\]|根据.*?研究|据.*?显示/g) || []).length;
  if (optCitations > origCitations) {
    changes.push(`${tChange('addedCitations', locale)} ${optCitations - origCitations} ${tChange('citationsSuffix', locale)}`);
  }

  const origStats = (original.match(/\d+%|\d+\.\d+/g) || []).length;
  const optStats = (optimized.match(/\d+%|\d+\.\d+/g) || []).length;
  if (optStats > origStats) {
    changes.push(`${tChange('addedStats', locale)} ${optStats - origStats} ${tChange('statsSuffix', locale)}`);
  }

  return changes;
}
