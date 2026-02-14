/**
 * Generate monitor questions for a core keyword using LLM.
 * Falls back to templates on failure.
 */

import { callAIChat, getDefaultProvider } from '../../ai';
import type { AIProvider } from '../../ai';
import type { QuestionIntentType } from '../domain/monitor-types';

export interface GeneratedQuestion {
  question: string;
  intentType: QuestionIntentType;
  searchVolume: number;
}

const INTENT_TYPES: QuestionIntentType[] = [
  'recommendation', 'comparison', 'inquiry',
  'evaluation', 'tutorial', 'pricing',
];

// ---------------------------------------------------------------------------
// LLM generation
// ---------------------------------------------------------------------------

function buildPrompt(brandName: string, coreKeyword: string, locale: string): string {
  if (locale === 'zh') {
    return `你是一个搜索查询生成专家。根据核心关键词"${coreKeyword}"，生成 6 个真实用户会在 AI 搜索引擎中输入的通用行业查询问题。

要求：
- 6 种意图类型各 1 个：
  - recommendation（推荐/建议）：如"哪个牌子的${coreKeyword}效果好"
  - comparison（对比/评测）：如"${coreKeyword}排行榜"
  - inquiry（咨询/查询）：如"${coreKeyword}怎么选"
  - evaluation（评价/口碑）：如"${coreKeyword}好不好用"、"${coreKeyword}口碑怎么样"
  - tutorial（教程/指南）：如"${coreKeyword}怎么用"、"${coreKeyword}使用方法"
  - pricing（价格/选购）：如"${coreKeyword}多少钱"、"性价比高的${coreKeyword}"
- 问题必须是通用的品类/行业问题，禁止包含任何品牌名称（如"${brandName}"）
- 目的是监控品牌在 AI 回答这些通用问题时是否被提及
- 估算每个问题的月搜索量（整数）
- 查询要自然，像真实用户会搜索的

严格按以下 JSON 格式返回，不要添加其他内容：
[{"question":"问题内容","intentType":"recommendation|comparison|inquiry|evaluation|tutorial|pricing","searchVolume":1000}]`;
  }

  return `You are a search query generation expert. Based on the core keyword "${coreKeyword}", generate 6 realistic generic industry queries that users would type into AI search engines.

Requirements:
- 1 of each intent type:
  - recommendation: e.g. "best ${coreKeyword} brands"
  - comparison: e.g. "${coreKeyword} ranking top 10"
  - inquiry: e.g. "how to choose ${coreKeyword}"
  - evaluation: e.g. "is ${coreKeyword} worth it", "${coreKeyword} reviews"
  - tutorial: e.g. "how to use ${coreKeyword}", "${coreKeyword} guide"
  - pricing: e.g. "how much does ${coreKeyword} cost", "affordable ${coreKeyword}"
- Questions MUST be generic category/industry questions, NEVER include any brand names (e.g. "${brandName}")
- Purpose: monitor whether the brand gets mentioned when AI answers these generic questions
- Estimate monthly search volume (integer) for each query
- Queries should sound natural

Return strictly in this JSON format, no extra text:
[{"question":"query text","intentType":"recommendation|comparison|inquiry|evaluation|tutorial|pricing","searchVolume":1000}]`;
}

export async function generateQuestionsForKeyword(
  brandName: string,
  coreKeyword: string,
  locale: string,
): Promise<GeneratedQuestion[]> {
  try {
    const provider = getDefaultProvider();
    if (!provider) throw new Error('No AI provider available');

    const responses = await callAIChat(
      [{ role: 'user', content: buildPrompt(brandName, coreKeyword, locale) }],
      { provider: provider as AIProvider, retries: 1, retryDelay: 1000 },
    );

    if (responses.length === 0 || !responses[0].text) {
      throw new Error('Empty response');
    }

    const text = responses[0].text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const parsed = JSON.parse(jsonMatch[0]) as {
      question: string;
      intentType: string;
      searchVolume: number;
    }[];

    return parsed
      .filter((q) => q.question && INTENT_TYPES.includes(q.intentType as QuestionIntentType))
      .map((q) => ({
        question: q.question,
        intentType: q.intentType as QuestionIntentType,
        searchVolume: Math.max(0, Math.round(q.searchVolume || 0)),
      }))
      .slice(0, 8);
  } catch (err) {
    console.warn('[monitor-question-generator] LLM failed, using templates:', err);
    return generateFallbackQuestions(brandName, coreKeyword, locale);
  }
}

// ---------------------------------------------------------------------------
// Template fallback
// ---------------------------------------------------------------------------

function generateFallbackQuestions(
  _brandName: string,
  keyword: string,
  locale: string,
): GeneratedQuestion[] {
  if (locale === 'zh') {
    return [
      { question: `哪个牌子的${keyword}效果好`, intentType: 'recommendation', searchVolume: 1200 },
      { question: `${keyword}排行榜前十名`, intentType: 'comparison', searchVolume: 3600 },
      { question: `${keyword}怎么选`, intentType: 'inquiry', searchVolume: 900 },
      { question: `${keyword}口碑怎么样`, intentType: 'evaluation', searchVolume: 800 },
      { question: `${keyword}怎么用`, intentType: 'tutorial', searchVolume: 700 },
      { question: `${keyword}多少钱`, intentType: 'pricing', searchVolume: 1500 },
    ];
  }

  return [
    { question: `best ${keyword} brands`, intentType: 'recommendation', searchVolume: 1200 },
    { question: `${keyword} ranking top 10`, intentType: 'comparison', searchVolume: 3600 },
    { question: `how to choose ${keyword}`, intentType: 'inquiry', searchVolume: 900 },
    { question: `${keyword} reviews`, intentType: 'evaluation', searchVolume: 800 },
    { question: `how to use ${keyword}`, intentType: 'tutorial', searchVolume: 700 },
    { question: `how much does ${keyword} cost`, intentType: 'pricing', searchVolume: 1500 },
  ];
}
