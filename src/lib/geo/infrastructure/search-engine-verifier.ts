/**
 * Real citation verifier
 * Calls real AI search engines to verify if a user's domain is cited
 */

import type { SearchEngine, EngineQueryResult, QueryVerificationResult, CompetitorDomain } from '../domain/verification-types';
import type { SSEEventSender } from '../domain/sse-types';
import { callAIWithWebSearch, callAIChat, getWebSearchTool, isAIAvailable } from '../../ai';
import type { AIProvider, WebSearchAnnotation } from '../../ai';
import {
  parseCitationsFromAnnotations,
  parseCitationsFromText,
  deduplicateCitations,
} from '../domain/citation-parser';

/**
 * Detect available search engines based on environment variables
 */
export function getAvailableEngines(): SearchEngine[] {
  const available = isAIAvailable();
  const engines: SearchEngine[] = [];

  // Only include engines that support web search
  // GLM 暂时移除：glm-4.7 模型返回 404
  if (available.volc) engines.push('volc');
  if (available.openai) engines.push('openai');

  return engines;
}

/**
 * Build search prompt for AI engines
 */
function buildSearchPrompt(query: string, locale: string): string {
  if (locale === 'zh') {
    return `请搜索并回答以下问题，引用相关来源：\n\n${query}`;
  }
  return `Please search and answer the following question, citing relevant sources:\n\n${query}`;
}

/** Per-engine timeout in milliseconds (联网搜索通常需要 20-40s) */
const ENGINE_TIMEOUT = 60_000;

/**
 * Verify a single query with a single engine (with timeout)
 */
export async function verifyWithEngine(
  query: string,
  engine: SearchEngine,
  userDomain: string,
  locale: string
): Promise<EngineQueryResult> {
  const startTime = Date.now();

  try {
    const result = await Promise.race([
      doVerifyWithEngine(query, engine, userDomain, locale),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Engine ${engine} timeout`)), ENGINE_TIMEOUT)
      ),
    ]);
    return { ...result, duration: Date.now() - startTime };
  } catch (error) {
    console.warn(`[verifier] Engine ${engine} failed for query "${query}":`, error);

    // 降级：用 deepseek 普通调用（无联网搜索）确保始终有原文
    const prompt = buildSearchPrompt(query, locale);
    let fallbackAnswer = '';
    // 选一个与当前引擎不同的可用 provider
    const available = isAIAvailable();
    const eng = engine as string;
    const fallbackProvider = (
      (eng !== 'deepseek' && available.deepseek) ? 'deepseek' :
      (eng !== 'volc' && available.volc) ? 'volc' :
      (eng !== 'glm' && available.glm) ? 'glm' : null
    ) as AIProvider | null;

    if (fallbackProvider) {
      try {
        const fallback = await Promise.race([
          callAIChat(
            [{ role: 'user', content: prompt }],
            { provider: fallbackProvider, retries: 1, retryDelay: 0 }
          ),
          new Promise<never>((_, rej) =>
            setTimeout(() => rej(new Error('fallback timeout')), 45_000)
          ),
        ]);
        if (fallback.length > 0 && fallback[0].text) {
          fallbackAnswer = fallback[0].text;
        }
      } catch {
        console.warn(`[verifier] Fallback (${fallbackProvider}) also failed for ${engine}`);
      }
    }

    return {
      engine,
      answer: fallbackAnswer,
      citations: [],
      userCited: false,
      userCitationPosition: 0,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Internal: actual engine verification logic (no timeout wrapper)
 */
async function doVerifyWithEngine(
  query: string,
  engine: SearchEngine,
  userDomain: string,
  locale: string
): Promise<Omit<EngineQueryResult, 'duration'>> {
  const prompt = buildSearchPrompt(query, locale);
  let answer = '';
  let annotations: WebSearchAnnotation[] = [];

  if (engine === 'volc') {
    const response = await callAIWithWebSearch(
      [{ role: 'user', content: prompt }],
      { provider: 'volc' }
    );
    answer = response.text;
    annotations = response.annotations || [];
  } else {
    const tool = getWebSearchTool(engine as AIProvider);
    if (!tool) {
      throw new Error(`No web search tool for engine: ${engine}`);
    }

    const responses = await callAIChat(
      [{ role: 'user', content: prompt }],
      { provider: engine as AIProvider, tools: [tool] }
    );

    if (responses.length > 0) {
      answer = responses[0].text;
      annotations = responses[0].annotations || [];
    }
  }

  let citations = parseCitationsFromAnnotations(annotations, userDomain);
  const textCitations = parseCitationsFromText(answer, userDomain);
  citations = deduplicateCitations([...citations, ...textCitations]);

  const userCited = citations.some(c => c.isUserDomain);
  const userIdx = citations.findIndex(c => c.isUserDomain);

  return {
    engine,
    answer,
    citations,
    userCited,
    userCitationPosition: userCited ? userIdx + 1 : 0,
  };
}

/**
 * Verify a single query across multiple engines in parallel
 */
export async function verifyQuery(
  query: string,
  queryType: string,
  userDomain: string,
  locale: string,
  engines: SearchEngine[],
  sendEvent?: SSEEventSender,
  queryIndex?: number
): Promise<QueryVerificationResult> {
  // Notify engine starts
  if (sendEvent && queryIndex !== undefined) {
    for (const engine of engines) {
      sendEvent({
        type: 'engine_start',
        timestamp: new Date().toISOString(),
        data: { queryIndex, engine },
      });
    }
  }

  // Run all engines in parallel
  const engineResults = await Promise.all(
    engines.map(async (engine) => {
      const result = await verifyWithEngine(query, engine, userDomain, locale);

      // Notify engine complete
      if (sendEvent && queryIndex !== undefined) {
        sendEvent({
          type: 'engine_complete',
          timestamp: new Date().toISOString(),
          data: {
            queryIndex,
            engine,
            userCited: result.userCited,
            citationCount: result.citations.length,
            duration: result.duration,
          },
        });
      }

      return result;
    })
  );

  // Aggregate results
  const citedByEngines = engineResults.filter(r => r.userCited).length;
  const competitorDomains = aggregateCompetitorsForQuery(engineResults, userDomain);

  return {
    query,
    queryType,
    engineResults,
    citedByEngines,
    totalEngines: engines.length,
    citationRate: engines.length > 0 ? citedByEngines / engines.length : 0,
    competitorDomains,
  };
}

/**
 * Aggregate competitor domains for a single query across engines
 */
function aggregateCompetitorsForQuery(
  engineResults: EngineQueryResult[],
  _userDomain: string
): CompetitorDomain[] {
  const domainMap = new Map<string, { engineCount: number; title?: string }>();

  for (const result of engineResults) {
    const seenInEngine = new Set<string>();
    for (const citation of result.citations) {
      if (citation.isUserDomain) continue;
      const d = citation.domain;
      if (!seenInEngine.has(d)) {
        seenInEngine.add(d);
        const existing = domainMap.get(d) || { engineCount: 0 };
        existing.engineCount++;
        if (!existing.title && citation.title) existing.title = citation.title;
        domainMap.set(d, existing);
      }
    }
  }

  return Array.from(domainMap.entries())
    .map(([domain, info]) => ({
      domain,
      engineCount: info.engineCount,
      queryCount: 1,
      title: info.title,
    }))
    .sort((a, b) => b.engineCount - a.engineCount);
}

/**
 * Aggregate competitor domains across all queries
 */
export function aggregateCompetitors(
  queryResults: QueryVerificationResult[]
): CompetitorDomain[] {
  const domainMap = new Map<string, CompetitorDomain>();

  for (const qr of queryResults) {
    for (const cd of qr.competitorDomains) {
      const existing = domainMap.get(cd.domain);
      if (existing) {
        existing.engineCount += cd.engineCount;
        existing.queryCount++;
        if (!existing.title && cd.title) existing.title = cd.title;
      } else {
        domainMap.set(cd.domain, { ...cd });
      }
    }
  }

  return Array.from(domainMap.values())
    .sort((a, b) => b.queryCount - a.queryCount || b.engineCount - a.engineCount)
    .slice(0, 10);
}

/** Suggestion i18n dictionary */
const SUGGESTION_I18N = {
  highRate: {
    zh: '你的内容在 AI 搜索中表现优秀，被多个引擎引用。',
    en: 'Your content performs well in AI search, cited by multiple engines.',
  },
  mediumRate: {
    zh: '你的内容被部分 AI 搜索引擎引用，仍有提升空间。',
    en: 'Your content is cited by some AI engines, room for improvement.',
  },
  lowRate: {
    zh: '你的内容未被 AI 搜索引擎引用，需要优化以提升可见性。',
    en: 'Your content is not cited by AI search engines, optimization needed.',
  },
  sectionAssessment: { zh: '总体评估', en: 'Overall Assessment' },
  sectionCompetitors: { zh: '竞争对手', en: 'Competitors' },
  sectionCompetitorsDesc: {
    zh: '以下域名在相同查询中频繁被引用：',
    en: 'These domains are frequently cited for similar queries:',
  },
  sectionOptimization: { zh: '内容优化建议', en: 'Optimization Suggestions' },
  colDomain: { zh: '域名', en: 'Domain' },
  colQueries: { zh: '查询数', en: 'Queries' },
  colEngines: { zh: '引擎数', en: 'Engines' },
} as const;

function tSugg(key: keyof typeof SUGGESTION_I18N, locale: string): string {
  const pair = SUGGESTION_I18N[key];
  return pair[locale as 'zh' | 'en'] ?? pair.en;
}

/** Strategy weakness with label and suggestions */
interface StrategyWeakness {
  label: string;
  suggestions: string[];
}

/**
 * Generate Markdown-formatted suggestions based on real citation verification results
 */
export function generateVerificationSuggestions(
  overallRate: number,
  topCompetitors: CompetitorDomain[],
  topWeaknesses: StrategyWeakness[],
  locale: string
): string[] {
  const lines: string[] = [];

  // Section 1: Overall assessment
  lines.push(`**${tSugg('sectionAssessment', locale)}**`);
  lines.push('');
  if (overallRate >= 0.5) {
    lines.push(tSugg('highRate', locale));
  } else if (overallRate > 0) {
    lines.push(tSugg('mediumRate', locale));
  } else {
    lines.push(tSugg('lowRate', locale));
  }

  // Section 2: Competitor insight
  if (topCompetitors.length > 0) {
    lines.push('');
    lines.push(`**${tSugg('sectionCompetitors', locale)}**`);
    lines.push('');
    lines.push(tSugg('sectionCompetitorsDesc', locale));
    lines.push('');
    const hDomain = tSugg('colDomain', locale);
    const hQueries = tSugg('colQueries', locale);
    const hEngines = tSugg('colEngines', locale);
    lines.push(`| ${hDomain} | ${hQueries} | ${hEngines} |`);
    lines.push('|---|---|---|');
    const top3 = topCompetitors.slice(0, 3);
    for (const c of top3) {
      lines.push(`| ${c.domain} | ${c.queryCount} | ${c.engineCount} |`);
    }
  }

  // Section 3: Strategy optimization suggestions
  if (topWeaknesses.length > 0) {
    lines.push('');
    lines.push(`**${tSugg('sectionOptimization', locale)}**`);
    lines.push('');
    for (const w of topWeaknesses) {
      if (w.suggestions.length > 0) {
        lines.push(`- **${w.label}**：${w.suggestions.join('；')}`);
      }
    }
  }

  return lines;
}
