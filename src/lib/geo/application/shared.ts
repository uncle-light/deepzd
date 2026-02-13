/**
 * Shared utilities for GEO analysis use cases
 * Extracted from content-analyzer.ts
 */

import type { ContentStats } from '../domain/sse-types';

/**
 * Count words in text (Chinese + English)
 */
export function countWords(text: string): number {
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english = (text.match(/[a-zA-Z]+/g) || []).length;
  return chinese + english;
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
  const matches = text.match(/[.!?。！？]+/g);
  return matches ? matches.length : 1;
}

/**
 * Count paragraphs in text
 */
export function countParagraphs(text: string): number {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return Math.max(paragraphs.length, 1);
}

/**
 * Calculate content statistics
 */
export function calculateContentStats(content: string): ContentStats {
  return {
    charCount: content.length,
    wordCount: countWords(content),
    sentenceCount: countSentences(content),
    paragraphCount: countParagraphs(content),
  };
}

/**
 * Analyze content characteristics for suggestions
 */
export function analyzeContentCharacteristics(content: string): {
  hasStatistics: boolean;
  hasCitations: boolean;
  hasQuotes: boolean;
  hasStructure: boolean;
  avgSentenceLength: number;
  uniqueWordsRatio: number;
} {
  const statsPattern = /\d+%|\d+\.\d+|\d{4}年|\d+ (percent|million|billion)/gi;
  const hasStatistics = statsPattern.test(content);

  const citationPattern = /\[\d+\]|（.*?研究.*?）|\(.*?et al\..*?\)|according to|研究表明|数据显示/gi;
  const hasCitations = citationPattern.test(content);

  const quotePattern = /["「『].*?["」』]|".*?"/g;
  const hasQuotes = quotePattern.test(content);

  const structurePattern = /^#+\s|^\d+\.\s|^[-*]\s|<h[1-6]>/gm;
  const hasStructure = structurePattern.test(content);

  const sentences = content.split(/[.!?。！？]+/).filter(s => s.trim());
  const avgSentenceLength = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length
    : 0;

  const words = content.toLowerCase().match(/[\u4e00-\u9fa5]|[a-z]+/gi) || [];
  const uniqueWords = new Set(words);
  const uniqueWordsRatio = words.length > 0 ? uniqueWords.size / words.length : 0;

  return { hasStatistics, hasCitations, hasQuotes, hasStructure, avgSentenceLength, uniqueWordsRatio };
}
