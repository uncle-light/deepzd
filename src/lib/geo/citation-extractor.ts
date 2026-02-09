/**
 * Citation extractor for GEO analysis
 * Extracts [1][2][3] style citations from AI responses
 * Based on GEO original project: extract_citations_new()
 */

/**
 * Citation info for a single citation
 */
export interface CitationInfo {
  /** Source index (1-based) */
  sourceIndex: number;
  /** Position of the sentence in the response (0-based) */
  sentencePosition: number;
  /** The sentence text containing this citation */
  sentenceText: string;
  /** Word count of the sentence */
  sentenceWordCount: number;
}

/**
 * Statistics for a single source
 */
export interface SourceCitationStats {
  /** Number of times this source was cited */
  citationCount: number;
  /** Total word count of sentences citing this source */
  totalWordCount: number;
  /** Positions where this source was cited */
  positions: number[];
}

/**
 * Result of citation extraction
 */
export interface CitationExtractionResult {
  /** All citations found */
  citations: CitationInfo[];
  /** Statistics per source */
  sourceStats: Map<number, SourceCitationStats>;
  /** Total number of sentences */
  totalSentences: number;
}

/**
 * Count words in text (supports Chinese and English)
 */
function countWords(text: string): number {
  // Chinese characters
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  // English words (3+ characters to filter noise)
  const english = (text.match(/[a-zA-Z]{3,}/g) || []).length;
  return chinese + english;
}

/**
 * Split text into sentences
 */
function splitSentences(text: string): string[] {
  // Split by common sentence endings
  const sentences = text.split(/(?<=[.!?。！？])\s+/);
  return sentences.filter(s => s.trim().length > 0);
}

/**
 * Extract citation indices from a sentence
 * Matches patterns like [1], [2], [1][2][3]
 */
function extractCitationIndices(sentence: string): number[] {
  const pattern = /\[(\d+)\]/g;
  const indices: number[] = [];
  let match;

  while ((match = pattern.exec(sentence)) !== null) {
    const index = parseInt(match[1], 10);
    if (index > 0 && index <= 10) { // Reasonable range
      indices.push(index);
    }
  }

  return [...new Set(indices)]; // Remove duplicates
}

/**
 * Extract all citations from AI response text
 * Based on GEO original: extract_citations_new()
 */
export function extractCitations(text: string): CitationExtractionResult {
  const citations: CitationInfo[] = [];
  const sourceStats = new Map<number, SourceCitationStats>();

  // Split into sentences
  const sentences = splitSentences(text);

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const indices = extractCitationIndices(sentence);
    const wordCount = countWords(sentence);

    for (const sourceIndex of indices) {
      // Add citation info
      citations.push({
        sourceIndex,
        sentencePosition: i,
        sentenceText: sentence,
        sentenceWordCount: wordCount,
      });

      // Update source stats
      if (!sourceStats.has(sourceIndex)) {
        sourceStats.set(sourceIndex, {
          citationCount: 0,
          totalWordCount: 0,
          positions: [],
        });
      }

      const stats = sourceStats.get(sourceIndex)!;
      stats.citationCount++;
      stats.totalWordCount += wordCount / indices.length; // Split word count among citations
      stats.positions.push(i);
    }
  }

  return {
    citations,
    sourceStats,
    totalSentences: sentences.length,
  };
}
