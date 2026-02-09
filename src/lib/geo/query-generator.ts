/**
 * Query generator for GEO analysis
 * Generates relevant queries based on user content
 */

import { callAIChat, getDefaultProvider } from '../ai';

/**
 * Generated query with metadata
 */
export interface GeneratedQuery {
  /** The query text */
  query: string;
  /** Query type/angle */
  type: 'definition' | 'howto' | 'comparison' | 'general';
}

/**
 * Query generation result
 */
export interface QueryGenerationResult {
  /** Generated queries */
  queries: GeneratedQuery[];
  /** Extracted topic */
  topic: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  zh: `你是一个内容分析专家。根据用户提供的内容，提取主题并生成3个用户可能会向AI搜索引擎提问的问题。

要求：
1. 问题应该覆盖不同角度：定义类、方法类、对比类
2. 问题应该自然，像真实用户会问的
3. 问题应该与内容主题高度相关

输出JSON格式：
{
  "topic": "内容的核心主题",
  "queries": [
    {"query": "问题1", "type": "definition"},
    {"query": "问题2", "type": "howto"},
    {"query": "问题3", "type": "comparison"}
  ]
}`,

  en: `You are a content analysis expert. Based on the user's content, extract the topic and generate 3 questions that users might ask AI search engines.

Requirements:
1. Questions should cover different angles: definition, how-to, comparison
2. Questions should be natural, like real users would ask
3. Questions should be highly relevant to the content topic

Output JSON format:
{
  "topic": "core topic of the content",
  "queries": [
    {"query": "question 1", "type": "definition"},
    {"query": "question 2", "type": "howto"},
    {"query": "question 3", "type": "comparison"}
  ]
}`
};

/**
 * Generate queries based on content
 */
export async function generateQueries(
  content: string,
  locale: string = 'zh'
): Promise<QueryGenerationResult> {
  const provider = getDefaultProvider();
  if (!provider) {
    return getDefaultQueries(content, locale);
  }

  const truncated = content.slice(0, 2000);
  const systemPrompt = SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.en;

  try {
    const responses = await callAIChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: truncated }
    ], {
      provider,
      temperature: 0.5,
      maxTokens: 500,
    });

    if (responses.length > 0) {
      const parsed = parseResponse(responses[0].text);
      if (parsed) return parsed;
    }
  } catch (error) {
    console.warn('Query generation failed:', error);
  }

  return getDefaultQueries(content, locale);
}

/**
 * Parse AI response to extract queries
 */
function parseResponse(response: string): QueryGenerationResult | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.topic || !Array.isArray(parsed.queries)) return null;

    return {
      topic: parsed.topic,
      queries: parsed.queries.slice(0, 3).map((q: { query: string; type?: string }) => ({
        query: q.query,
        type: q.type || 'general',
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Extract topic from content (simple heuristic)
 */
function extractTopic(content: string): string {
  // Get first sentence or first 50 chars
  const firstSentence = content.match(/^[^.!?。！？]+/);
  if (firstSentence) {
    return firstSentence[0].slice(0, 50).trim();
  }
  return content.slice(0, 50).trim();
}

/**
 * Default query templates per locale
 */
const DEFAULT_QUERY_TEMPLATES: Record<string, { definition: string; howto: string; general: string }> = {
  zh: {
    definition: '什么是{topic}？',
    howto: '如何理解{topic}？',
    general: '{topic}有什么特点？',
  },
  en: {
    definition: 'What is {topic}?',
    howto: 'How does {topic} work?',
    general: 'What are the key aspects of {topic}?',
  },
};

/**
 * Generate default queries when AI is unavailable
 */
function getDefaultQueries(content: string, locale: string): QueryGenerationResult {
  const topic = extractTopic(content);
  const templates = DEFAULT_QUERY_TEMPLATES[locale] ?? DEFAULT_QUERY_TEMPLATES.en;

  return {
    topic,
    queries: [
      { query: templates.definition.replace('{topic}', topic), type: 'definition' },
      { query: templates.howto.replace('{topic}', topic), type: 'howto' },
      { query: templates.general.replace('{topic}', topic), type: 'general' },
    ],
  };
}
