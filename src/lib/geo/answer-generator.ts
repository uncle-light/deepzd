/**
 * AI answer generator for GEO analysis
 * Generates answers with citations from provided sources
 * Based on GEO original: generative_le.py
 */

import { callAIChat, getDefaultProvider } from '../ai';
import type { CompetingSource } from './source-generator';

/**
 * Generated answer with metadata
 */
export interface GeneratedAnswer {
  /** The answer text with [n] citations */
  answer: string;
  /** Query used to generate this answer */
  query: string;
}

/**
 * System prompts for source-based answer generation
 * Based on GEO original: generative_le.py query_prompt
 *
 * Key requirements from GEO original:
 * - Use _only_ provided search results
 * - Every sentence _immediately followed_ by citation
 * - Use [1][2][3] format, NOT [1, 2, 3]
 */
const SYSTEM_PROMPTS: Record<string, string> = {
  zh: `你是一个专业的信息综合助手。根据提供的 5 个搜索结果，为用户问题撰写准确、全面的回答。

严格要求：
1. 【必须】只能使用提供的 5 个搜索结果（Source 1-5）作为信息来源
2. 【必须】每个句子后面紧跟引用标记，格式为 [1]、[2]、[3]、[4]、[5]
3. 【必须】尽可能引用所有 5 个来源，不要只引用其中 1-2 个
4. 【必须】引用多个来源时使用 [1][2][3] 格式，不要用 [1, 2, 3]
5. 【禁止】引用不存在的来源（如 [6]、[7] 等）
6. 【禁止】编造信息或使用搜索结果之外的知识
7. 回答要专业、客观、全面，综合多个来源的观点

回答格式要求：
- 使用结构化表述："第一，...；第二，...；第三，..."
- 每个要点后都要有引用标记
- 先总述概念，再分点阐述细节
- 使用专业术语，避免口语化表达

示例格式：
"Schema标记也被称为结构化数据标记，它是一种结构化数据的语言[2][3]。它的核心作用主要包括：第一，帮助搜索引擎及AI更好地解析网页内容[3][5]；第二，添加该标记后可在搜索结果中生成增强的描述[1][4]；第三，它还能助力建立E-E-A-T信号[5]。"`,

  en: `You are a professional information synthesis assistant. Write an accurate and comprehensive answer based on the 5 provided search results.

STRICT REQUIREMENTS:
1. [MUST] Use ONLY the 5 provided search results (Source 1-5) as information sources
2. [MUST] Every sentence must be immediately followed by citation marks: [1], [2], [3], [4], [5]
3. [MUST] Try to cite ALL 5 sources, don't just cite 1-2 of them
4. [MUST] Use [1][2][3] format for multiple citations, NOT [1, 2, 3]
5. [FORBIDDEN] Do NOT cite non-existent sources (like [6], [7], etc.)
6. [FORBIDDEN] Do NOT make up information or use knowledge outside the search results
7. Answer should be professional, objective, and comprehensive, synthesizing multiple viewpoints

FORMAT REQUIREMENTS:
- Use structured presentation: "First, ...; Second, ...; Third, ..."
- Include citations after each point
- Start with overview, then elaborate with details
- Use professional terminology, avoid colloquial language

Example format:
"Schema markup is also called structured data markup, a language for structured data[2][3]. Its core functions include: First, helping search engines and AI better parse webpage content[3][5]; Second, generating enhanced descriptions in search results after adding this markup[1][4]; Third, assisting in establishing E-E-A-T signals[5]."`
};

/**
 * Generate answer with citations from provided sources
 * Based on GEO original flow: inject sources into prompt
 */
export async function generateAnswer(
  query: string,
  sources: CompetingSource[],
  locale: string = 'zh'
): Promise<GeneratedAnswer> {
  const provider = getDefaultProvider();
  if (!provider) {
    return { answer: '', query };
  }

  const systemPrompt = SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.en;
  const userPrompt = buildUserPrompt(query, sources, locale);

  try {
    const responses = await callAIChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      provider,
      temperature: 0.5,
      maxTokens: 1500,
    });

    const response = responses[0];
    if (response?.text) {
      return {
        answer: response.text,
        query,
      };
    }
  } catch (error) {
    console.warn('Answer generation failed:', error);
  }

  return { answer: '', query };
}

/**
 * Build user prompt with sources injected
 * Based on GEO original: generative_le.py query_prompt format
 * Uses "### Source N:" format for consistency with GEO original
 *
 * 改进：明确告知 AI 有 5 个来源，必须尽量引用所有来源
 */
function buildUserPrompt(
  query: string,
  sources: CompetingSource[],
  locale: string
): string {
  // Format sources using GEO original format: "### Source N:\n{content}"
  const sourceText = sources
    .map(s => `### Source ${s.index}:\n${s.content}`)
    .join('\n\n');

  if (locale === 'zh') {
    return `问题：${query}

以下是 ${sources.length} 个搜索结果（Source 1-${sources.length}），请综合所有来源回答问题：

${sourceText}

请基于以上 ${sources.length} 个来源撰写回答，尽可能引用所有来源。`;
  }

  return `Question: ${query}

Here are ${sources.length} search results (Source 1-${sources.length}), please synthesize all sources to answer:

${sourceText}

Please write an answer based on all ${sources.length} sources above, citing as many sources as possible.`;
}
