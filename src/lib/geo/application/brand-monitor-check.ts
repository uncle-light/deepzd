/**
 * Brand monitor check orchestrator.
 * Coordinates query generation → engine queries → mention detection → sentiment analysis.
 */

import type { BrandMonitor, CheckSummary, CheckDetail, QueryCheckResult, EngineCheckResult, MonitorQuestion } from '../domain/monitor-types';
import type { MonitorSSEEventSender } from '../domain/monitor-sse-types';
import { detectBrandMention, detectCompetitorMentions, extractMentionContext } from '../domain/brand-mention-detector';
import { generateBuyerIntentQueries } from '../infrastructure/monitor-query-generator';
import { analyzeSentimentBatch } from '../infrastructure/sentiment-analyzer';
import type { SentimentInput } from '../infrastructure/sentiment-analyzer';
import { getAvailableEngines, verifyWithEngine } from '../infrastructure/search-engine-verifier';
import { parseCitationsFromAnnotations, parseCitationsFromText, deduplicateCitations, extractDomain } from '../domain/citation-parser';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * @param questions Pre-configured questions. When non-empty, these are used
 *   instead of runtime LLM generation (backward-compatible: empty → fallback).
 */
export async function runBrandMonitorCheck(
  monitor: BrandMonitor,
  sendEvent: MonitorSSEEventSender,
  signal?: AbortSignal,
  questions?: MonitorQuestion[],
): Promise<{ summary: CheckSummary; detail: CheckDetail }> {
  const startedAt = Date.now();
  const engines = getAvailableEngines();

  if (engines.length === 0) {
    throw new Error('No search engines available');
  }

  // 1. Init event
  sendEvent({
    type: 'monitor_init',
    timestamp: ts(),
    data: {
      monitorId: monitor.id,
      monitorName: monitor.name,
      brandNames: monitor.brandNames,
      totalEngines: engines.length,
    },
  });

  checkAbort(signal);

  // 2. Build query list — use pre-configured questions when available,
  //    otherwise fall back to runtime LLM generation (backward-compatible).
  let queries: { query: string; type: string }[];

  if (questions && questions.length > 0) {
    queries = questions.map((q) => ({ query: q.question, type: q.intentType }));
  } else {
    queries = await generateBuyerIntentQueries(
      monitor.industryKeywords,
      monitor.locale,
    );
  }

  sendEvent({
    type: 'monitor_queries',
    timestamp: ts(),
    data: { queries },
  });

  checkAbort(signal);

  // 3. Query engines and detect mentions
  const queryResults: QueryCheckResult[] = [];

  for (let qi = 0; qi < queries.length; qi++) {
    checkAbort(signal);
    const q = queries[qi];

    // Run all engines in parallel for this query
    const engineResults: EngineCheckResult[] = [];

    // Notify engine starts
    for (const engine of engines) {
      sendEvent({
        type: 'monitor_engine_start',
        timestamp: ts(),
        data: { queryIndex: qi, engine },
      });
    }

    const enginePromises = engines.map(async (engine) => {
      const result = await verifyWithEngine(q.query, engine, '', monitor.locale);

      // Detect brand mention
      const mention = detectBrandMention(result.answer, monitor.brandNames);
      const context = mention.found
        ? mention.context
        : extractMentionContext(result.answer, monitor.brandNames);

      // Detect competitor mentions
      const compMentions = detectCompetitorMentions(result.answer, monitor.competitorBrands);

      // Parse citations
      const textCitations = parseCitationsFromText(result.answer, '');
      const citations = deduplicateCitations(textCitations).map((c) => ({
        url: c.url,
        title: c.title,
        domain: c.domain,
      }));

      const engineResult: EngineCheckResult = {
        engine,
        answer: result.answer,
        brandMentioned: mention.found,
        brandPosition: mention.position,
        brandContext: context,
        competitorMentions: compMentions,
        citations,
        duration: result.duration,
      };

      sendEvent({
        type: 'monitor_engine_complete',
        timestamp: ts(),
        data: {
          queryIndex: qi,
          engine,
          brandMentioned: mention.found,
          brandPosition: mention.position,
          duration: result.duration,
        },
      });

      return engineResult;
    });

    const results = await Promise.all(enginePromises);
    engineResults.push(...results);

    // Aggregate query-level results
    const brandMentioned = engineResults.some((r) => r.brandMentioned);
    const mentionedResults = engineResults.filter((r) => r.brandMentioned);
    const brandPosition = mentionedResults.length > 0
      ? Math.round(mentionedResults.reduce((s, r) => s + r.brandPosition, 0) / mentionedResults.length)
      : 0;

    // Merge competitor mentions across engines
    const compMap = new Map<string, number>();
    for (const er of engineResults) {
      for (const cm of er.competitorMentions) {
        if (!compMap.has(cm.name) || (cm.position > 0 && cm.position < (compMap.get(cm.name) ?? Infinity))) {
          compMap.set(cm.name, cm.position);
        }
      }
    }
    const competitorMentions = Array.from(compMap.entries()).map(([name, position]) => ({ name, position }));

    queryResults.push({
      query: q.query,
      queryType: q.type,
      engineResults,
      brandMentioned,
      brandPosition,
      competitorMentions,
      sentiment: 'neutral', // placeholder, filled by sentiment analysis
      sentimentContext: engineResults.find((r) => r.brandContext)?.brandContext ?? '',
    });

    sendEvent({
      type: 'monitor_query_complete',
      timestamp: ts(),
      data: {
        queryIndex: qi,
        query: q.query,
        brandMentioned,
        brandPosition,
        competitorCount: competitorMentions.length,
      },
    });
  }

  checkAbort(signal);

  // 4. Batch sentiment analysis
  const sentimentInputs: SentimentInput[] = queryResults
    .filter((qr) => qr.brandMentioned && qr.sentimentContext)
    .map((qr, i) => ({
      queryIndex: queryResults.indexOf(qr),
      context: qr.sentimentContext,
    }));

  if (sentimentInputs.length > 0) {
    sendEvent({
      type: 'monitor_sentiment',
      timestamp: ts(),
      data: { processed: 0, total: sentimentInputs.length },
    });

    const sentimentMap = await analyzeSentimentBatch(
      monitor.brandNames[0],
      sentimentInputs,
      monitor.locale,
    );

    for (const [idx, result] of sentimentMap) {
      if (queryResults[idx]) {
        queryResults[idx].sentiment = result.sentiment;
      }
    }

    sendEvent({
      type: 'monitor_sentiment',
      timestamp: ts(),
      data: { processed: sentimentInputs.length, total: sentimentInputs.length },
    });
  }

  // 5. Aggregate summary
  const summary = aggregateSummary(queryResults, monitor, engines.length);
  const detail: CheckDetail = { queries: queryResults };
  const duration = Date.now() - startedAt;

  return { summary, detail };
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

function aggregateSummary(
  queryResults: QueryCheckResult[],
  monitor: BrandMonitor,
  engineCount: number,
): CheckSummary {
  const totalQueries = queryResults.length;
  const mentionedQueries = queryResults.filter((q) => q.brandMentioned).length;
  const mentionRate = totalQueries > 0 ? mentionedQueries / totalQueries : 0;

  // Average position (only from mentioned queries with position > 0)
  const positioned = queryResults.filter((q) => q.brandPosition > 0);
  const avgPosition = positioned.length > 0
    ? positioned.reduce((s, q) => s + q.brandPosition, 0) / positioned.length
    : 0;

  // Share of voice: count mentions for brand + each competitor
  const voiceCounts = new Map<string, number>();
  voiceCounts.set(monitor.brandNames[0], mentionedQueries);

  for (const qr of queryResults) {
    for (const cm of qr.competitorMentions) {
      voiceCounts.set(cm.name, (voiceCounts.get(cm.name) ?? 0) + 1);
    }
  }

  const totalVoice = Array.from(voiceCounts.values()).reduce((a, b) => a + b, 0);
  const shareOfVoice: Record<string, number> = {};
  for (const [name, count] of voiceCounts) {
    shareOfVoice[name] = totalVoice > 0 ? Math.round((count / totalVoice) * 100) / 100 : 0;
  }

  // Sentiment distribution
  const sentimentDistribution = { positive: 0, neutral: 0, negative: 0 };
  for (const qr of queryResults) {
    if (qr.brandMentioned) {
      sentimentDistribution[qr.sentiment]++;
    }
  }

  // Per-engine breakdown
  const perEngine: Record<string, { mentionRate: number; avgPosition: number }> = {};
  const engineNames = new Set(queryResults.flatMap((q) => q.engineResults.map((e) => e.engine)));

  for (const engine of engineNames) {
    const engineMentioned = queryResults.filter((q) =>
      q.engineResults.some((e) => e.engine === engine && e.brandMentioned),
    ).length;
    const enginePositioned = queryResults
      .flatMap((q) => q.engineResults)
      .filter((e) => e.engine === engine && e.brandPosition > 0);
    const engineAvgPos = enginePositioned.length > 0
      ? enginePositioned.reduce((s, e) => s + e.brandPosition, 0) / enginePositioned.length
      : 0;

    perEngine[engine] = {
      mentionRate: totalQueries > 0 ? engineMentioned / totalQueries : 0,
      avgPosition: Math.round(engineAvgPos * 10) / 10,
    };
  }

  return {
    mentionRate: Math.round(mentionRate * 100) / 100,
    avgPosition: Math.round(avgPosition * 10) / 10,
    shareOfVoice,
    sentimentDistribution,
    perEngine,
    totalQueries,
    totalEngines: engineCount,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ts(): string {
  return new Date().toISOString();
}

function checkAbort(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new Error('Check aborted');
  }
}
