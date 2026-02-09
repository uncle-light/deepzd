/**
 * GEO types (aligned with GEO-optim/GEO)
 */

// GEO method keys (from GEO-optim/GEO run_geo.py)
export type GeoMethodKey =
  | 'identity'
  | 'fluent_gpt'
  | 'unique_words_gpt'
  | 'authoritative_mine'
  | 'more_quotes_mine'
  | 'citing_credible_mine'
  | 'simple_language_mine'
  | 'technical_terms_mine'
  | 'stats_optimization_gpt'
  | 'seo_optimize_mine2';

// Impression function keys (from GEO-optim/GEO utils.py)
export type ImpressionFnKey =
  | 'simple_wordpos'
  | 'simple_word'
  | 'simple_pos'
  | 'subjective_score'
  | 'subjpos_detailed'
  | 'diversity_detailed'
  | 'uniqueness_detailed'
  | 'follow_detailed'
  | 'influence_detailed'
  | 'relevance_detailed'
  | 'subjcount_detailed';

export interface Source {
  url: string;
  text: string;
  raw_source: string;
  source: string;
  summary: string;
}

export interface CacheEntry {
  sources: Source[];
  responses: string[][];
}

// Improve output (aligned with run_geo.py)
export type ImproveResult =
  | {
      improvements: number[][]; // shape (num_methods, n)
      success_flags: boolean[];
    }
  | {
      init_scores: number[][]; // shape (num_completions, n)
      final_scores: number[][][]; // shape (num_methods, num_completions, n)
    };

export interface AnalyzeRequest {
  query: string;
  idx: number;
  sources?: string[];
  summaries?: string[];
  impression_fn?: ImpressionFnKey;
  return_full_data?: boolean;
  static_cache?: boolean;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ImproveResult;
  error?: string;
}

// New content analysis types
export interface ContentAnalyzeRequest {
  content: string;
  inputType: 'text' | 'url';
  locale?: string; // Language for AI analysis suggestions
}

export interface ContentScore {
  score: number;        // 0-100
  suggestions: string[];
}

export interface ContentAnalyzeResult {
  overall: number;      // 0-100
  scores: {
    authoritative: ContentScore;
    statistics: ContentScore;
    citations: ContentScore;
    quotations: ContentScore;
    readability: ContentScore;
    technical: ContentScore;
    fluency: ContentScore;
    uniqueness: ContentScore;
    structure: ContentScore;
  };
  contentStats: {
    charCount: number;
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
  };
}

export interface ContentAnalyzeResponse {
  success: boolean;
  data?: ContentAnalyzeResult;
  error?: string;
}

// ============================================
// New GEO Analysis Types (aligned with GEO original)
// ============================================

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

/**
 * Complete GEO analysis result
 */
export interface GeoAnalysisResult {
  /** Overall GEO score (0-100) */
  overall: number;
  /** Results for each query */
  queryResults: QueryAnalysisResult[];
  /** Extracted topic */
  topic: string;
  /** Content statistics */
  contentStats: {
    charCount: number;
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
  };
  /** Optimization suggestions */
  suggestions: string[];
  /** Analysis metadata */
  metadata: {
    /** AI provider used */
    provider: string;
    /** Model used */
    model: string;
    /** Total analysis duration (ms) */
    totalDuration: number;
    /** Number of API calls */
    apiCalls: number;
    /** Timestamp */
    timestamp: string;
  };
}

/**
 * GEO analysis API response
 */
export interface GeoAnalysisResponse {
  success: boolean;
  data?: GeoAnalysisResult;
  error?: string;
}
