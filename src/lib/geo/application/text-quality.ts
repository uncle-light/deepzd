/**
 * Text Quality use case
 * Local strategy analysis only, no AI search verification
 * Extracted from content-analyzer.ts
 */

import type { SSEEventSender } from '../domain/sse-types';
import { analyzeGeoStrategies } from '../domain/strategy-analyzer';
import { generateQueries } from '../infrastructure/query-generator';
import { getDefaultProvider } from '../../ai';
import { calculateContentStats, analyzeContentCharacteristics } from './shared';

/**
 * Text Quality mode: local strategy analysis only
 * No AI search verification, just content quality assessment
 */
export async function analyzeTextQualityStream(
  content: string,
  locale: string,
  sendEvent: SSEEventSender,
  signal?: AbortSignal
): Promise<void> {
  const startTime = Date.now();
  const provider = getDefaultProvider();

  try {
    // 1. Send init event
    const contentStats = calculateContentStats(content);
    const characteristics = analyzeContentCharacteristics(content);

    sendEvent({
      type: 'init',
      timestamp: new Date().toISOString(),
      data: {
        mode: 'text_quality',
        contentStats,
        estimatedSteps: 2,
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

    if (signal?.aborted) return;

    // 2. Generate topic for context
    const { topic } = await generateQueries(content, locale);

    if (signal?.aborted) return;

    // 3. Run 9 strategy analysis (pure local, no API calls)
    const strategyAnalysis = analyzeGeoStrategies(content, locale);

    // 4. Send quality_complete event
    const totalDuration = Date.now() - startTime;

    sendEvent({
      type: 'quality_complete',
      timestamp: new Date().toISOString(),
      data: {
        overallQuality: strategyAnalysis.overallScore,
        contentStats,
        strategyScores: strategyAnalysis.scores.map(s => ({
          strategy: s.strategy,
          score: s.score,
          label: s.label,
          description: s.description,
          suggestions: s.suggestions,
        })),
        suggestions: (() => {
          const lines: string[] = [];
          lines.push(`**${locale === 'zh' ? '内容优化建议' : 'Optimization Suggestions'}**`);
          lines.push('');
          for (const w of strategyAnalysis.topWeaknesses) {
            if (w.suggestions.length > 0) {
              lines.push(`- **${w.label}**：${w.suggestions.join('；')}`);
            }
          }
          return lines;
        })(),
        topic,
        metadata: {
          provider: provider || 'local',
          model: 'strategy-analyzer',
          totalDuration,
          apiCalls: 1,
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
        message: error instanceof Error ? error.message : 'Quality analysis failed',
        code: 'QUALITY_ERROR',
      },
    });
  }
}
