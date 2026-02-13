/**
 * GEO core types (cleaned from legacy Python-ported dead code)
 * Only active types used by the analysis pipeline
 */

/**
 * Citation detail in AI answer
 */
export interface CitationDetail {
  /** Source index (1-5) */
  sourceIndex: number;
  /** Sentence position in answer */
  position: number;
  /** The sentence text containing citation */
  sentence: string;
  /** Word count of the sentence */
  wordCount: number;
  /** Source URL (from web search) */
  url?: string;
  /** Source title (from web search) */
  title?: string;
}

/**
 * Competing source info
 */
export interface SourceInfo {
  /** Source index (1-5) */
  index: number;
  /** Source type */
  type: 'generated' | 'user' | 'search';
  /** Content preview (first 200 chars) */
  preview: string;
  /** Citation count in AI answer */
  citationCount: number;
  /** Impression score */
  score: number;
  /** Source URL (from web search) */
  url?: string;
  /** Source title (from web search) */
  title?: string;
  /** Source domain (extracted from URL) */
  domain?: string;
}

/**
 * Single query analysis result
 */
export interface QueryAnalysisResult {
  /** The query used */
  query: string;
  /** Query type */
  queryType: 'definition' | 'howto' | 'comparison' | 'general';
  /** User content citation score (0-100) */
  citationScore: number;
  /** User content rank among 5 sources */
  rank: number;
  /** Number of times user content was cited */
  citationCount: number;
  /** Average citation position (lower = better) */
  avgPosition: number;
  /** AI generated answer text */
  aiAnswer: string;
  /** All citations in the answer */
  citations: CitationDetail[];
  /** All sources info */
  sources: SourceInfo[];
  /** Analysis duration (ms) */
  duration: number;
}
