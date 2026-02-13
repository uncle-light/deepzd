/**
 * URL Verification use case
 * Real AI search citation verification
 * Extracted from content-analyzer.ts
 */

import type { SSEEventSender } from '../domain/sse-types';
import { extractDomain } from '../domain/citation-parser';
import { analyzeGeoStrategies } from '../domain/strategy-analyzer';
import { generateQueries } from '../infrastructure/query-generator';
import {
  getAvailableEngines,
  verifyQuery,
  aggregateCompetitors,
  generateVerificationSuggestions,
} from '../infrastructure/search-engine-verifier';
import { getDefaultProvider } from '../../ai';
import { calculateContentStats } from './shared';

/**
 * URL Verification mode: real AI search citation verification
 */
export async function analyzeUrlVerificationStream(
  url: string,
  content: string,
  locale: string,
  sendEvent: SSEEventSender,
  signal?: AbortSignal
): Promise<void> {
  const startTime = Date.now();
  const provider = getDefaultProvider();
  const userDomain = extractDomain(url);

  try {
    // 1. Send init event
    const contentStats = calculateContentStats(content);
    sendEvent({
      type: 'init',
      timestamp: new Date().toISOString(),
      data: {
        mode: 'url_verification',
        contentStats,
        estimatedSteps: 5,
        userUrl: url,
        userDomain,
      },
    });

    // 2. Send url_fetched event
    sendEvent({
      type: 'url_fetched',
      timestamp: new Date().toISOString(),
      data: { url, domain: userDomain, contentLength: content.length },
    });

    if (signal?.aborted) return;

    // 3. Generate queries
    const { queries, topic } = await generateQueries(content, locale);
    sendEvent({
      type: 'queries',
      timestamp: new Date().toISOString(),
      data: {
        topic,
        queries: queries.map(q => ({ query: q.query, type: q.type })),
      },
    });

    if (signal?.aborted) return;

    // 4. Get available engines
    const engines = getAvailableEngines();
    if (engines.length === 0) {
      sendEvent({
        type: 'error',
        timestamp: new Date().toISOString(),
        data: {
          message: locale === 'zh'
            ? '没有可用的 AI 搜索引擎，请检查 API 配置'
            : 'No AI search engines available, check API configuration',
          code: 'NO_ENGINES',
        },
      });
      return;
    }

    // 5. Verify all queries in parallel
    for (let i = 0; i < queries.length; i++) {
      sendEvent({
        type: 'query_start',
        timestamp: new Date().toISOString(),
        data: { queryIndex: i, query: queries[i].query, queryType: queries[i].type },
      });
    }

    const queryResultsRaw = await Promise.all(
      queries.map(async (q, i) => {
        if (signal?.aborted) return null;
        const result = await verifyQuery(
          q.query, q.type,
          userDomain, locale, engines, sendEvent, i
        );
        return result;
      })
    );
    const queryResults = queryResultsRaw.filter(
      (r): r is Awaited<ReturnType<typeof verifyQuery>> => r !== null
    );

    if (signal?.aborted) return;

    // 6. Aggregate and send final results
    const topCompetitors = aggregateCompetitors(queryResults);
    const totalCited = queryResults.filter(r => r.citationRate > 0).length;
    const overallCitationRate = queries.length > 0 ? totalCited / queries.length : 0;

    const strategyAnalysis = analyzeGeoStrategies(content, locale);
    const suggestions = generateVerificationSuggestions(
      overallCitationRate, topCompetitors,
      strategyAnalysis.topWeaknesses.map(w => ({ label: w.label, suggestions: w.suggestions })),
      locale
    );
    const totalDuration = Date.now() - startTime;

    sendEvent({
      type: 'verification_complete',
      timestamp: new Date().toISOString(),
      data: {
        userUrl: url,
        userDomain,
        overallCitationRate,
        queryResults,
        topic,
        contentStats,
        topCompetitors,
        strategyScores: strategyAnalysis.scores.map(s => ({
          strategy: s.strategy, score: s.score,
          label: s.label, description: s.description, suggestions: s.suggestions,
        })),
        suggestions,
        metadata: {
          provider: provider || 'unknown',
          model: 'multi-engine',
          totalDuration,
          apiCalls: 1 + queries.length * engines.length,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    if (signal?.aborted) return;
    sendEvent({
      type: 'error',
      timestamp: new Date().toISOString(),
      data: {
        message: error instanceof Error ? error.message : 'Verification failed',
        code: 'VERIFICATION_ERROR',
      },
    });
  }
}
