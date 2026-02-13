/**
 * Generate buyer-intent queries from industry keywords.
 * Uses LLM to produce ~8 diverse queries; falls back to templates on failure.
 */

import { callAIChat, getDefaultProvider } from '../../ai';
import type { AIProvider } from '../../ai';

export interface GeneratedMonitorQuery {
  query: string;
  type: 'recommendation' | 'comparison' | 'ranking' | 'review';
}

const QUERY_TYPES = ['recommendation', 'comparison', 'ranking', 'review'] as const;

// ---------------------------------------------------------------------------
// LLM generation
// ---------------------------------------------------------------------------

function buildPrompt(keywords: string[], locale: string): string {
  if (locale === 'zh') {
    return `你是一个搜索查询生成专家。根据以下行业关键词，生成 8 个真实用户会在 AI 搜索引擎（如 ChatGPT、Perplexity）中输入的买家意图查询。

行业关键词：${keywords.join('、')}

要求：
- 每种类型各 2 个：推荐类、对比类、排名类、评价类
- 推荐类：如"最好的XX有哪些"、"推荐几个XX工具"
- 对比类：如"XX和YY哪个好"、"XX工具对比"
- 排名类：如"2025年XX排行榜"、"XX工具TOP10"
- 评价类：如"XX怎么样"、"XX好用吗"
- 查询要自然，像真实用户会搜索的

严格按以下 JSON 格式返回，不要添加其他内容：
[{"query":"查询内容","type":"recommendation|comparison|ranking|review"}]`;
  }

  return `You are a search query generation expert. Based on the following industry keywords, generate 8 realistic buyer-intent queries that users would type into AI search engines (ChatGPT, Perplexity, etc.).

Industry keywords: ${keywords.join(', ')}

Requirements:
- 2 of each type: recommendation, comparison, ranking, review
- Recommendation: e.g. "best XX tools", "top XX recommendations"
- Comparison: e.g. "XX vs YY", "XX tool comparison"
- Ranking: e.g. "XX tools ranking 2025", "top 10 XX"
- Review: e.g. "is XX good", "XX review"
- Queries should sound natural

Return strictly in this JSON format, no extra text:
[{"query":"query text","type":"recommendation|comparison|ranking|review"}]`;
}

export async function generateBuyerIntentQueries(
  industryKeywords: string[],
  locale: string,
): Promise<GeneratedMonitorQuery[]> {
  try {
    const provider = getDefaultProvider();
    if (!provider) throw new Error('No AI provider available');

    const responses = await callAIChat(
      [{ role: 'user', content: buildPrompt(industryKeywords, locale) }],
      { provider: provider as AIProvider, retries: 1, retryDelay: 1000 },
    );

    if (responses.length === 0 || !responses[0].text) {
      throw new Error('Empty response');
    }

    const text = responses[0].text.trim();
    // Extract JSON array from response (may be wrapped in markdown code block)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const parsed = JSON.parse(jsonMatch[0]) as { query: string; type: string }[];

    return parsed
      .filter((q) => q.query && QUERY_TYPES.includes(q.type as typeof QUERY_TYPES[number]))
      .map((q) => ({
        query: q.query,
        type: q.type as GeneratedMonitorQuery['type'],
      }))
      .slice(0, 10); // cap at 10
  } catch (err) {
    console.warn('[monitor-query-generator] LLM failed, using templates:', err);
    return generateFallbackQueries(industryKeywords, locale);
  }
}

// ---------------------------------------------------------------------------
// Template fallback
// ---------------------------------------------------------------------------

function generateFallbackQueries(
  keywords: string[],
  locale: string,
): GeneratedMonitorQuery[] {
  const kw = keywords[0] || 'tool';
  const kw2 = keywords[1] || keywords[0] || 'tool';

  if (locale === 'zh') {
    return [
      { query: `最好的${kw}有哪些`, type: 'recommendation' },
      { query: `推荐几个${kw}工具`, type: 'recommendation' },
      { query: `${kw}和${kw2}哪个好`, type: 'comparison' },
      { query: `${kw}工具对比`, type: 'comparison' },
      { query: `2025年${kw}排行榜`, type: 'ranking' },
      { query: `${kw}工具TOP10`, type: 'ranking' },
      { query: `${kw}怎么样`, type: 'review' },
      { query: `${kw}好用吗`, type: 'review' },
    ];
  }

  return [
    { query: `best ${kw} tools`, type: 'recommendation' },
    { query: `top ${kw} recommendations`, type: 'recommendation' },
    { query: `${kw} vs ${kw2}`, type: 'comparison' },
    { query: `${kw} tool comparison`, type: 'comparison' },
    { query: `${kw} tools ranking 2025`, type: 'ranking' },
    { query: `top 10 ${kw}`, type: 'ranking' },
    { query: `is ${kw} good`, type: 'review' },
    { query: `${kw} review`, type: 'review' },
  ];
}
