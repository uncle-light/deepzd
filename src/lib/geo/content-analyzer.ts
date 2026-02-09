/**
 * Content analyzer for GEO optimization
 * Flow (based on GEO original):
 * 1. Generate queries from content
 * 2. Generate 4 competing sources + user content as Source 5
 * 3. AI generates answer citing from these 5 sources
 * 4. Extract citations and calculate impression scores
 * 5. User content (Source 5) score = GEO performance
 */

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { GeoAnalysisResult, QueryAnalysisResult } from './types';
import type { SSEEventSender, ContentStats } from './sse-types';
import { generateQueries } from './query-generator';
import { generateCompetingSources } from './source-generator';
import { generateAnswer } from './answer-generator';
import { extractCitations } from './citation-extractor';
import { calculateImpression } from './impression-calculator';
import { analyzeGeoStrategies } from './strategy-analyzer';
import { getDefaultProvider } from '../ai';
import { URL_FETCH_LIMITS } from '../constants';

/** User content is always source 5 */
const USER_SOURCE_INDEX = 5;
const TOTAL_SOURCES = 5;

/**
 * Count words in text (Chinese + English)
 */
function countWords(text: string): number {
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english = (text.match(/[a-zA-Z]+/g) || []).length;
  return chinese + english;
}

/**
 * Count sentences in text
 */
function countSentences(text: string): number {
  const matches = text.match(/[.!?。！？]+/g);
  return matches ? matches.length : 1;
}

/**
 * Count paragraphs in text
 */
function countParagraphs(text: string): number {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return Math.max(paragraphs.length, 1);
}

/**
 * Analyze single query using GEO original flow
 * 1. Generate competing sources (4 AI + 1 user)
 * 2. AI generates answer citing from sources
 * 3. Extract citations and calculate scores
 */
async function analyzeQuery(
  query: string,
  queryType: 'definition' | 'howto' | 'comparison' | 'general',
  userContent: string,
  locale: string
): Promise<QueryAnalysisResult> {
  const startTime = Date.now();

  // Step 1: Generate competing sources (user content = Source 5)
  const sources = await generateCompetingSources(query, userContent, locale);

  // Step 2: AI generates answer citing from these sources
  const { answer } = await generateAnswer(query, sources, locale);

  // Step 3: Extract citations from answer
  const extraction = extractCitations(answer);

  // Step 4: Calculate impression scores
  const impression = calculateImpression(extraction, TOTAL_SOURCES, USER_SOURCE_INDEX);

  const duration = Date.now() - startTime;

  // Build citation details
  const citations = extraction.citations.map(c => ({
    sourceIndex: c.sourceIndex,
    position: c.sentencePosition,
    sentence: c.sentenceText,
    wordCount: c.sentenceWordCount,
  }));

  // Build sources info with scores and URL info
  const sourcesInfo = sources.map(s => {
    const stats = extraction.sourceStats.get(s.index);
    const scoreInfo = impression.scores.find(sc => sc.sourceIndex === s.index);
    return {
      index: s.index,
      type: s.type,
      preview: s.content.slice(0, 200),
      citationCount: stats?.citationCount || 0,
      score: scoreInfo?.normalizedScore || 0,
      // Pass through URL info from real search results
      url: s.url,
      title: s.title,
      domain: s.domain,
    };
  });

  return {
    query,
    queryType,
    citationScore: impression.targetScore?.normalizedScore || 0,
    rank: impression.targetRank,
    citationCount: impression.targetScore?.citationCount || 0,
    avgPosition: impression.targetScore?.avgPosition || TOTAL_SOURCES,
    aiAnswer: answer,
    citations,
    sources: sourcesInfo,
    duration,
  };
}

/**
 * Analyze content characteristics for suggestions
 */
function analyzeContentCharacteristics(content: string): {
  hasStatistics: boolean;
  hasCitations: boolean;
  hasQuotes: boolean;
  hasStructure: boolean;
  avgSentenceLength: number;
  uniqueWordsRatio: number;
} {
  // Check for statistics (numbers, percentages)
  const statsPattern = /\d+%|\d+\.\d+|\d{4}年|\d+ (percent|million|billion)/gi;
  const hasStatistics = statsPattern.test(content);

  // Check for citations (brackets, references)
  const citationPattern = /\[\d+\]|（.*?研究.*?）|\(.*?et al\..*?\)|according to|研究表明|数据显示/gi;
  const hasCitations = citationPattern.test(content);

  // Check for quotes
  const quotePattern = /["「『].*?["」』]|".*?"/g;
  const hasQuotes = quotePattern.test(content);

  // Check for structure (headers, lists)
  const structurePattern = /^#+\s|^\d+\.\s|^[-*]\s|<h[1-6]>/gm;
  const hasStructure = structurePattern.test(content);

  // Calculate average sentence length
  const sentences = content.split(/[.!?。！？]+/).filter(s => s.trim());
  const avgSentenceLength = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length
    : 0;

  // Calculate unique words ratio
  const words = content.toLowerCase().match(/[\u4e00-\u9fa5]|[a-z]+/gi) || [];
  const uniqueWords = new Set(words);
  const uniqueWordsRatio = words.length > 0 ? uniqueWords.size / words.length : 0;

  return { hasStatistics, hasCitations, hasQuotes, hasStructure, avgSentenceLength, uniqueWordsRatio };
}

/**
 * Suggestion text i18n dictionary
 */
const SUGGESTION_I18N = {
  overallScore: { zh: '## GEO 综合评分', en: '## GEO Overall Score' },
  citationPerf: { zh: '**引用表现**', en: '**Citation Performance**' },
  avgRank: { zh: '平均排名', en: 'Avg Rank' },
  weaknesses: { zh: '\n### 需要改进的方面\n', en: '\n### Areas for Improvement\n' },
  strengths: { zh: '\n### 做得好的方面\n', en: '\n### Strengths\n' },
  noCitation: {
    zh: '\n**警告**: 内容在所有查询中均未被AI引用，建议重构内容以直接回答用户问题',
    en: '\n**Warning**: Content not cited in any query. Restructure to directly answer user questions.',
  },
  lowScore: { zh: '\n**注意**: 引用分数较低', en: '\n**Note**: Low citation score' },
  lowScoreSuffix: { zh: '，需要大幅优化', en: ', needs significant improvement' },
} as const;

function tSugg(key: keyof typeof SUGGESTION_I18N, locale: string): string {
  const pair = SUGGESTION_I18N[key];
  return pair[locale as 'zh' | 'en'] ?? pair.en;
}

/**
 * Generate suggestions based on analysis results
 * Integrated with GEO 9 strategies analyzer
 */
function generateSuggestions(
  queryResults: QueryAnalysisResult[],
  locale: string,
  content: string
): string[] {
  const suggestions: string[] = [];

  // 基础统计
  const avgScore = queryResults.reduce((s, r) => s + r.citationScore, 0) / queryResults.length;
  const avgRank = queryResults.reduce((s, r) => s + r.rank, 0) / queryResults.length;
  const totalCitations = queryResults.reduce((s, r) => s + r.citationCount, 0);

  // GEO 9 大策略分析
  const strategyAnalysis = analyzeGeoStrategies(content, locale);

  // 1. 添加综合评分建议
  suggestions.push(`${tSugg('overallScore', locale)}: ${strategyAnalysis.overallScore}/100\n`);
  suggestions.push(`${tSugg('citationPerf', locale)}: ${Math.round(avgScore)}/100 (${tSugg('avgRank', locale)} ${avgRank.toFixed(1)}/5)\n`);

  // 2. 添加前3个弱点的优化建议
  suggestions.push(tSugg('weaknesses', locale));

  strategyAnalysis.topWeaknesses.forEach((weakness, index) => {
    suggestions.push(`${index + 1}. ${weakness.label} (${weakness.score}/100)`);
    weakness.suggestions.forEach(s => suggestions.push(`   • ${s}`));
  });

  // 3. 添加前3个优势
  suggestions.push(tSugg('strengths', locale));

  strategyAnalysis.topStrengths.forEach((strength, index) => {
    suggestions.push(`${index + 1}. ${strength.label} (${strength.score}/100)`);
  });

  // 4. 添加引用表现建议
  if (totalCitations === 0) {
    suggestions.push(tSugg('noCitation', locale));
  } else if (avgScore < 30) {
    suggestions.push(`${tSugg('lowScore', locale)} (${Math.round(avgScore)}/100)${tSugg('lowScoreSuffix', locale)}`);
  }

  return suggestions;
}

/**
 * Main GEO analysis function
 * Aligned with GEO original project flow
 */
export async function analyzeContentGeo(
  content: string,
  locale: string = 'zh'
): Promise<GeoAnalysisResult> {
  const startTime = Date.now();
  const provider = getDefaultProvider();

  // Calculate content stats
  const contentStats = calculateContentStats(content);

  // Generate queries from content (1 API call)
  const { queries, topic } = await generateQueries(content, locale);

  // Analyze each query (并发执行, 6 API calls)
  const queryResults = await Promise.all(
    queries.map(q => analyzeQuery(q.query, q.type, content, locale))
  );

  // Calculate overall score
  const overall = Math.round(
    queryResults.reduce((s, r) => s + r.citationScore, 0) / queryResults.length
  );

  // Generate suggestions
  const suggestions = generateSuggestions(queryResults, locale, content);

  const totalDuration = Date.now() - startTime;

  return {
    overall,
    queryResults,
    topic,
    contentStats,
    suggestions,
    metadata: {
      provider: provider || 'unknown',
      model: process.env.GLM_MODEL || process.env.DEEPSEEK_MODEL || 'unknown',
      totalDuration,
      apiCalls: 1 + queries.length * 2, // 1 query gen + n * (source + answer)
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Fetch content from URL
 */
export async function fetchUrlContent(url: string): Promise<string> {
  const response = await fetchSafeUrl(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await readResponseTextWithLimit(response, URL_FETCH_LIMITS.MAX_BYTES);

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;

  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    if (isIP(mapped) === 4) return isPrivateIPv4(mapped);
  }

  return false;
}

function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPrivateIPv4(address);
  if (version === 6) return isPrivateIPv6(address);
  return true;
}

/** 开发环境下跳过 DNS 解析的私有 IP 检查（代理软件会返回 198.18.x.x 等虚拟 IP） */
const SKIP_DNS_SSRF_CHECK = process.env.NODE_ENV === 'development';

async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http/https URLs are allowed');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local')
  ) {
    throw new Error('Private network URL is not allowed');
  }

  const hostIpVersion = isIP(hostname);
  if (hostIpVersion > 0) {
    if (isPrivateAddress(hostname)) {
      throw new Error('Private IP URL is not allowed');
    }
    return parsed;
  }

  // 开发环境跳过 DNS 解析检查：代理/VPN 会劫持 DNS 返回虚拟 IP（如 198.18.x.x）
  if (SKIP_DNS_SSRF_CHECK) {
    return parsed;
  }

  let records: Array<{ address: string }> = [];
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error('Hostname resolution failed');
  }

  if (records.length === 0) {
    throw new Error('Hostname resolution failed');
  }

  for (const record of records) {
    if (isPrivateAddress(record.address)) {
      throw new Error('Resolved private IP is not allowed');
    }
  }

  return parsed;
}

async function fetchWithTimeout(url: URL): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_FETCH_LIMITS.TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DeepZD/1.0)' },
      redirect: 'manual',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('URL fetch timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSafeUrl(rawUrl: string): Promise<Response> {
  let currentUrl = rawUrl;

  for (let hop = 0; hop <= URL_FETCH_LIMITS.MAX_REDIRECTS; hop++) {
    const safeUrl = await assertPublicUrl(currentUrl);
    const response = await fetchWithTimeout(safeUrl);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error('Redirect location missing');
      }
      currentUrl = new URL(location, safeUrl).toString();
      continue;
    }

    return response;
  }

  throw new Error('Too many redirects');
}

async function readResponseTextWithLimit(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) {
    const fallbackText = await response.text();
    if (Buffer.byteLength(fallbackText, 'utf8') > maxBytes) {
      throw new Error(`URL content too large (max ${maxBytes} bytes)`);
    }
    return fallbackText;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let totalBytes = 0;
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (!value) continue;
    totalBytes += value.byteLength;

    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error(`URL content too large (max ${maxBytes} bytes)`);
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return text;
}

/**
 * Calculate content statistics with analysis details
 */
function calculateContentStats(content: string): ContentStats {
  return {
    charCount: content.length,
    wordCount: countWords(content),
    sentenceCount: countSentences(content),
    paragraphCount: countParagraphs(content),
  };
}

/**
 * Streaming GEO analysis function
 * Sends SSE events as analysis progresses
 * Uses parallel execution for speed
 */
export async function analyzeContentGeoStream(
  content: string,
  locale: string,
  sendEvent: SSEEventSender
): Promise<void> {
  const startTime = Date.now();
  const provider = getDefaultProvider();
  const characteristics = analyzeContentCharacteristics(content);

  try {
    // 1. Send init event with content stats and characteristics
    const contentStats = calculateContentStats(content);
    sendEvent({
      type: 'init',
      timestamp: new Date().toISOString(),
      data: {
        contentStats,
        estimatedSteps: 4,
        // Include content analysis details
        characteristics: {
          hasStatistics: characteristics.hasStatistics,
          hasCitations: characteristics.hasCitations,
          hasQuotes: characteristics.hasQuotes,
          hasStructure: characteristics.hasStructure,
          avgSentenceLength: Math.round(characteristics.avgSentenceLength),
          uniqueWordsRatio: Math.round(characteristics.uniqueWordsRatio * 100),
        },
      },
    });

    // 2. Generate queries and send queries event
    const { queries, topic } = await generateQueries(content, locale);
    sendEvent({
      type: 'queries',
      timestamp: new Date().toISOString(),
      data: {
        topic,
        queries: queries.map(q => ({ query: q.query, type: q.type })),
      },
    });

    // 3. Send query_start for all queries (parallel execution)
    queries.forEach((q, i) => {
      sendEvent({
        type: 'query_start',
        timestamp: new Date().toISOString(),
        data: { queryIndex: i, query: q.query, queryType: q.type },
      });
    });

    // 4. Execute all queries in parallel for speed
    const queryPromises = queries.map((q, i) =>
      analyzeQuery(q.query, q.type, content, locale)
        .then(result => {
          sendEvent({
            type: 'query_complete',
            timestamp: new Date().toISOString(),
            data: { queryIndex: i, result },
          });
          return result;
        })
    );

    const queryResults = await Promise.all(queryPromises);

    // 5. Calculate final results and send complete event
    const overall = Math.round(
      queryResults.reduce((s, r) => s + r.citationScore, 0) / queryResults.length
    );
    const suggestions = generateSuggestions(queryResults, locale, content);
    const totalDuration = Date.now() - startTime;

    // 6. Get strategy scores for frontend display
    const strategyAnalysis = analyzeGeoStrategies(content, locale);

    sendEvent({
      type: 'complete',
      timestamp: new Date().toISOString(),
      data: {
        overall,
        queryResults,
        topic,
        contentStats,
        suggestions,
        // Add strategy scores for frontend
        strategyScores: strategyAnalysis.scores.map(s => ({
          strategy: s.strategy,
          score: s.score,
          label: s.label,
          description: s.description,
          suggestions: s.suggestions,
        })),
        metadata: {
          provider: provider || 'unknown',
          model: process.env.GLM_MODEL || process.env.DEEPSEEK_MODEL || 'unknown',
          totalDuration,
          apiCalls: 1 + queries.length * 2,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    sendEvent({
      type: 'error',
      timestamp: new Date().toISOString(),
      data: {
        message: error instanceof Error ? error.message : 'Analysis failed',
        code: 'ANALYSIS_ERROR',
      },
    });
  }
}
