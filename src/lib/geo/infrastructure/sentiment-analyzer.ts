/**
 * Batch sentiment analysis for brand mention contexts.
 * Single LLM call covers all contexts to minimise API usage.
 */

import { callAIChat, getDefaultProvider } from '../../ai';
import type { AIProvider } from '../../ai';
import type { SentimentResult } from '../domain/monitor-types';

export interface SentimentInput {
  queryIndex: number;
  context: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function analyzeSentimentBatch(
  brandName: string,
  contexts: SentimentInput[],
  locale: string,
): Promise<Map<number, SentimentResult>> {
  const results = new Map<number, SentimentResult>();

  if (contexts.length === 0) return results;

  try {
    const provider = getDefaultProvider();
    if (!provider) throw new Error('No AI provider available');

    const prompt = buildPrompt(brandName, contexts, locale);
    const responses = await callAIChat(
      [{ role: 'user', content: prompt }],
      { provider: provider as AIProvider, retries: 1, retryDelay: 1000 },
    );

    if (responses.length === 0 || !responses[0].text) {
      throw new Error('Empty response');
    }

    const text = responses[0].text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const parsed = JSON.parse(jsonMatch[0]) as {
      index: number;
      sentiment: string;
      confidence?: number;
    }[];

    for (const item of parsed) {
      const sentiment = normalizeSentiment(item.sentiment);
      const ctx = contexts.find((c) => c.queryIndex === item.index);
      results.set(item.index, {
        sentiment,
        confidence: item.confidence ?? 0.8,
        context: ctx?.context ?? '',
      });
    }
  } catch (err) {
    console.warn('[sentiment-analyzer] LLM failed, defaulting to neutral:', err);
  }

  // Fill missing entries with neutral
  for (const ctx of contexts) {
    if (!results.has(ctx.queryIndex)) {
      results.set(ctx.queryIndex, {
        sentiment: 'neutral',
        confidence: 0,
        context: ctx.context,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function normalizeSentiment(raw: string): 'positive' | 'neutral' | 'negative' {
  const lower = raw.toLowerCase().trim();
  if (lower === 'positive') return 'positive';
  if (lower === 'negative') return 'negative';
  return 'neutral';
}

function buildPrompt(
  brandName: string,
  contexts: SentimentInput[],
  locale: string,
): string {
  const entries = contexts
    .map((c) => `[${c.queryIndex}] ${c.context}`)
    .join('\n\n');

  if (locale === 'zh') {
    return `分析以下文本片段中对品牌"${brandName}"的情感倾向。

${entries}

对每个片段判断情感：positive（正面推荐）、neutral（客观提及）、negative（负面评价）。

严格按以下 JSON 格式返回，不要添加其他内容：
[{"index":0,"sentiment":"positive|neutral|negative","confidence":0.9}]`;
  }

  return `Analyze the sentiment toward the brand "${brandName}" in each text snippet below.

${entries}

For each snippet, determine sentiment: positive (recommendation), neutral (objective mention), negative (criticism).

Return strictly in this JSON format, no extra text:
[{"index":0,"sentiment":"positive|neutral|negative","confidence":0.9}]`;
}
