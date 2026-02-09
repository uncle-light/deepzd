/**
 * Source generator for GEO analysis
 * Uses Bocha API (中文搜索) with AI-generated summaries for real search results
 */

import { search } from 'duck-duck-scrape';
import { callAIChat } from '../ai';

/** Raw Bocha API web page result */
interface BochaWebPage {
  name?: string;
  url?: string;
  summary?: string;
  snippet?: string;
}

/**
 * Search result interface
 */
interface SearchResult {
  title: string;
  url: string;
  description: string; // 博查 API 的 AI 摘要或简短描述
}

/**
 * A competing source for GEO analysis
 * Extended to support real search results with URL info
 */
export interface CompetingSource {
  /** Source index (1-5) */
  index: number;
  /** Source type: search = real web result, user = user content, generated = AI fallback */
  type: 'search' | 'user' | 'generated';
  /** Source content */
  content: string;
  /** Source URL (from web search) */
  url?: string;
  /** Source title (from web search) */
  title?: string;
  /** Source domain (extracted from URL) */
  domain?: string;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Fetch search results from Bocha API (中文搜索)
 */
async function fetchBochaResults(query: string, limit: number = 4): Promise<SearchResult[]> {
  const apiKey = process.env.BOCHA_API_KEY;
  const baseURL = process.env.BOCHA_BASE_URL || 'https://api.bocha.cn/v1';

  if (!apiKey) {
    console.warn('[source-generator] BOCHA_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(`${baseURL}/web-search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        summary: true, // 获取 AI 生成的文本摘要（summary 字段）
        freshness: 'noLimit',
        count: limit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[source-generator] Bocha API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();

    // 提取搜索结果 - 博查 API 返回格式: data.data.webPages.value
    const webPages = data?.data?.webPages?.value || [];
    const results: SearchResult[] = webPages
      .slice(0, limit)
      .map((page: BochaWebPage) => ({
        title: page.name || '',
        url: page.url || '',
        description: page.summary || page.snippet || '',
      }));

    console.log(`[source-generator] Found ${results.length} Bocha results`);

    return results;
  } catch (error) {
    console.error('[source-generator] Bocha API error:', error);
    return [];
  }
}

/**
 * Fetch search results from DuckDuckGo
 * Note: DuckDuckGo has poor support for Chinese queries, may fail with VQD error
 */
async function fetchDuckDuckGoResults(query: string, limit: number = 4): Promise<SearchResult[]> {
  try {
    // 对于中文查询,DuckDuckGo 经常失败,直接返回空结果让其回退到 AI 生成
    if (/[\u4e00-\u9fa5]/.test(query)) {
      return [];
    }

    const searchResults = await search(query, {
      safeSearch: 0, // 0 = off, 1 = moderate, 2 = strict
    });

    if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
      return [];
    }

    const results: SearchResult[] = searchResults.results
      .slice(0, limit)
      .map((result) => ({
        title: result.title || '',
        url: result.url || '',
        description: result.description || '',
      }));

    return results;
  } catch (error) {
    console.error('[source-generator] DuckDuckGo search error:', error);
    return [];
  }
}

/**
 * Fetch real competing sources using Bocha API (中文) or DuckDuckGo (英文)
 * Source 5 is always the user content
 *
 * Flow:
 * 1. Detect language and choose search provider
 * 2. Get top 4 search results (title, URL, description)
 * 3. Use description as competing content
 * 4. Add user content as Source 5
 */
export async function fetchRealSources(
  query: string,
  userContent: string,
  locale: string = 'zh'
): Promise<CompetingSource[]> {
  try {
    // 优先使用博查 API (中文搜索)
    const isChinese = /[\u4e00-\u9fa5]/.test(query);
    let searchResults: SearchResult[] = [];

    if (isChinese) {
      searchResults = await fetchBochaResults(query, 4);
    }

    // 如果博查失败或是英文查询,尝试 DuckDuckGo
    if (searchResults.length === 0 && !isChinese) {
      searchResults = await fetchDuckDuckGoResults(query, 4);
    }

    // If no results, use fallback
    if (searchResults.length === 0) {
      return generateFallbackSources(query, userContent, locale);
    }

    // Convert search results to competing sources
    const sources: CompetingSource[] = searchResults.map((result, i) => {
      // 使用博查 API 的 AI 摘要
      const content = result.description
        ? `${result.title}\n\n${result.description}`
        : result.title;

      return {
        index: i + 1,
        type: 'search' as const,
        content,
        url: result.url,
        title: result.title,
        domain: extractDomain(result.url),
      };
    });

    // If we got fewer than 4 results, pad with generated content
    if (sources.length < 4) {
      const fallbackSources = await generatePaddingSources(
        query,
        4 - sources.length,
        sources.length + 1,
        locale
      );
      sources.push(...fallbackSources);
    }

    // Add user content as Source 5
    sources.push({
      index: 5,
      type: 'user',
      content: userContent,
    });

    return sources;
  } catch (error) {
    console.warn('[source-generator] Search failed, using fallback:', error);
    return generateFallbackSources(query, userContent, locale);
  }
}

/**
 * Generate fallback sources when web search is unavailable
 * (Original implementation for backward compatibility)
 */
async function generateFallbackSources(
  query: string,
  userContent: string,
  locale: string
): Promise<CompetingSource[]> {
  const prompt = locale === 'zh'
    ? `你是一个内容生成专家。根据给定的查询问题，生成4段不同角度的参考内容。

要求：
1. 每段内容200-300字
2. 内容要专业、有信息量
3. 每段从不同角度回答问题
4. 使用JSON数组格式返回

查询问题：${query}

返回格式：
["内容1", "内容2", "内容3", "内容4"]`
    : `You are a content generation expert. Generate 4 reference passages from different angles for the given query.

Requirements:
1. Each passage 200-300 words
2. Professional and informative content
3. Each from a different perspective
4. Return as JSON array

Query: ${query}

Return format:
["content1", "content2", "content3", "content4"]`;

  try {
    const responses = await callAIChat([
      { role: 'user', content: prompt }
    ], {
      provider: 'volc', // 使用火山引擎而不是默认的 OpenAI
      temperature: 0.7,
      maxTokens: 2000,
    });

    const text = responses[0]?.text || '[]';
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) {
      return createEmptyFallback(userContent);
    }

    const contents = JSON.parse(match[0]) as string[];
    if (!Array.isArray(contents) || contents.length < 4) {
      return createEmptyFallback(userContent);
    }

    const sources: CompetingSource[] = contents.slice(0, 4).map((content, i) => ({
      index: i + 1,
      type: 'generated' as const,
      content: content.trim(),
    }));

    sources.push({
      index: 5,
      type: 'user',
      content: userContent,
    });

    return sources;
  } catch (error) {
    console.warn('[source-generator] Fallback generation failed:', error);
    return createEmptyFallback(userContent);
  }
}

/**
 * Generate padding sources to fill gaps when web search returns fewer than 4 results
 */
async function generatePaddingSources(
  query: string,
  count: number,
  startIndex: number,
  locale: string
): Promise<CompetingSource[]> {
  if (count <= 0) return [];

  const prompt = locale === 'zh'
    ? `根据问题"${query}"，生成${count}段不同角度的参考内容。每段100-200字，返回JSON数组格式。`
    : `For the question "${query}", generate ${count} reference passages from different angles. Each 100-200 words, return as JSON array.`;

  try {
    const responses = await callAIChat([
      { role: 'user', content: prompt }
    ], {
      provider: 'volc', // 使用火山引擎
      temperature: 0.7,
      maxTokens: 1000,
    });

    const text = responses[0]?.text || '[]';
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) {
      return createPaddingFallback(count, startIndex);
    }

    const contents = JSON.parse(match[0]) as string[];
    return contents.slice(0, count).map((content, i) => ({
      index: startIndex + i,
      type: 'generated' as const,
      content: content.trim(),
    }));
  } catch {
    return createPaddingFallback(count, startIndex);
  }
}

/**
 * Create empty fallback sources
 */
function createEmptyFallback(userContent: string): CompetingSource[] {
  return [
    { index: 1, type: 'generated', content: 'Source 1 content unavailable.' },
    { index: 2, type: 'generated', content: 'Source 2 content unavailable.' },
    { index: 3, type: 'generated', content: 'Source 3 content unavailable.' },
    { index: 4, type: 'generated', content: 'Source 4 content unavailable.' },
    { index: 5, type: 'user', content: userContent },
  ];
}

/**
 * Create padding fallback sources
 */
function createPaddingFallback(count: number, startIndex: number): CompetingSource[] {
  return Array.from({ length: count }, (_, i) => ({
    index: startIndex + i,
    type: 'generated' as const,
    content: `Source ${startIndex + i} content unavailable.`,
  }));
}

// Keep old function name for backward compatibility
export const generateCompetingSources = fetchRealSources;
