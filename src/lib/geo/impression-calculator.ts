/**
 * Impression calculator for GEO analysis (IMPROVED VERSION)
 * Calculates visibility scores based on citation patterns
 *
 * 改进内容：
 * 1. 修复 BUG：从"相对占比"改为"绝对质量评分"
 * 2. 使用 totalSentences 作为基准（而非 totalSources）
 * 3. 明确的权重分配：70% 引用频率 + 30% 引用位置
 * 4. 避免"单一来源总是 100 分"的问题
 */

import type { CitationExtractionResult } from './citation-extractor';

/**
 * Score for a single source
 */
export interface SourceScore {
  sourceIndex: number;
  /** Raw score before normalization */
  rawScore: number;
  /** Normalized score (0-100) */
  normalizedScore: number;
  /** Number of citations */
  citationCount: number;
  /** Average position of citations (lower = earlier = better) */
  avgPosition: number;
}

/**
 * Result of impression calculation
 */
export interface ImpressionResult {
  /** Scores for all sources */
  scores: SourceScore[];
  /** Score for the target source (user content) */
  targetScore: SourceScore | null;
  /** Rank of target source (1 = best) */
  targetRank: number;
}

/**
 * Calculate impression scores based on citation frequency and position
 *
 * 新的评分逻辑：
 * 1. 引用频率分 = (引用次数 / 总句子数) * 70 (最高 70 分)
 * 2. 引用位置分 = (1 - 平均位置 / 总句子数) * 30 (最高 30 分)
 * 3. 最终得分 = 引用频率分 + 引用位置分 (0-100 分)
 *
 * 权重说明：
 * - 引用频率占 70%：反映内容被引用的频繁程度
 * - 引用位置占 30%：反映内容在答案中的重要性（越靠前越重要）
 */
export function calculateImpression(
  extraction: CitationExtractionResult,
  totalSources: number,
  targetSourceIndex: number
): ImpressionResult {
  const { sourceStats, totalSentences } = extraction;
  const scores: SourceScore[] = [];

  // 配置参数
  const FREQUENCY_WEIGHT = 70;  // 引用频率权重
  const POSITION_WEIGHT = 30;   // 引用位置权重

  // Calculate scores for each source
  for (let i = 1; i <= totalSources; i++) {
    const stats = sourceStats.get(i);

    if (!stats || stats.citationCount === 0) {
      scores.push({
        sourceIndex: i,
        rawScore: 0,
        normalizedScore: 0,
        citationCount: 0,
        avgPosition: totalSentences,
      });
      continue;
    }

    // 计算平均位置
    const avgPosition = stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length;

    // 1. 引用频率分 (0-70)
    // 被引用次数越多，分数越高
    const frequencyScore = Math.min(
      (stats.citationCount / totalSentences) * FREQUENCY_WEIGHT,
      FREQUENCY_WEIGHT
    );

    // 2. 引用位置分 (0-30)
    // 平均位置越靠前，分数越高
    const positionScore = totalSentences > 1
      ? (1 - avgPosition / (totalSentences - 1)) * POSITION_WEIGHT
      : POSITION_WEIGHT;

    // 3. 最终得分
    const finalScore = frequencyScore + positionScore;

    scores.push({
      sourceIndex: i,
      rawScore: stats.citationCount,
      normalizedScore: Math.round(finalScore),
      citationCount: stats.citationCount,
      avgPosition,
    });
  }

  // Sort by score to get ranks
  const sortedScores = [...scores].sort((a, b) => b.normalizedScore - a.normalizedScore);

  // Find target source
  const targetScore = scores.find(s => s.sourceIndex === targetSourceIndex) || null;
  const targetRank = targetScore
    ? sortedScores.findIndex(s => s.sourceIndex === targetSourceIndex) + 1
    : totalSources;

  return {
    scores,
    targetScore,
    targetRank,
  };
}
