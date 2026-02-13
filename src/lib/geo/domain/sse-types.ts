/**
 * SSE event types for GEO content analysis streaming
 */

import type { QueryAnalysisResult } from './types';
import type { QueryVerificationResult, CompetitorDomain, SearchEngine } from './verification-types';

// Re-export types needed by frontend
export type { CitationDetail, SourceInfo, QueryAnalysisResult } from './types';
export type { QueryVerificationResult, CompetitorDomain, DiscoveredCitation, EngineQueryResult, SearchEngine } from './verification-types';

/** Analysis mode */
export type AnalysisMode = 'url_verification' | 'text_quality';

/** SSE event type names */
export type SSEEventType =
  | 'init'
  | 'queries'
  | 'query_start'
  | 'query_complete'
  | 'complete'
  | 'error'
  | 'url_fetched'
  | 'engine_start'
  | 'engine_complete'
  | 'verification_complete'
  | 'quality_complete';

/** Content statistics */
export interface ContentStats {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

/** Query info from generation */
export interface QueryInfo {
  query: string;
  type: 'definition' | 'howto' | 'comparison' | 'general';
}

/** Content characteristics analysis */
export interface ContentCharacteristics {
  hasStatistics: boolean;
  hasCitations: boolean;
  hasQuotes: boolean;
  hasStructure: boolean;
  avgSentenceLength: number;
  uniqueWordsRatio: number;
}

/** Init event - sent when analysis starts */
export interface InitEvent {
  type: 'init';
  timestamp: string;
  data: {
    mode?: AnalysisMode;
    contentStats: ContentStats;
    estimatedSteps: number;
    characteristics?: ContentCharacteristics;
    userUrl?: string;
    userDomain?: string;
  };
}

/** Queries event - sent after query generation */
export interface QueriesEvent {
  type: 'queries';
  timestamp: string;
  data: {
    topic: string;
    queries: QueryInfo[];
  };
}

/** Query start event */
export interface QueryStartEvent {
  type: 'query_start';
  timestamp: string;
  data: {
    queryIndex: number;
    query: string;
    queryType: string;
  };
}

/** Query complete event */
export interface QueryCompleteEvent {
  type: 'query_complete';
  timestamp: string;
  data: {
    queryIndex: number;
    result: QueryAnalysisResult;
  };
}

/** Strategy score for frontend display */
export interface StrategyScoreInfo {
  strategy: string;
  score: number;
  label: string;
  description: string;
  suggestions: string[];
}

/** Analysis metadata */
export interface AnalysisMetadata {
  provider: string;
  model: string;
  totalDuration: number;
  apiCalls: number;
  timestamp: string;
}

/** Complete event - sent with final results */
export interface CompleteEvent {
  type: 'complete';
  timestamp: string;
  data: {
    overall: number;
    queryResults: QueryAnalysisResult[];
    topic: string;
    contentStats: ContentStats;
    suggestions: string[];
    strategyScores?: StrategyScoreInfo[];
    metadata: AnalysisMetadata;
  };
}

// ============================================
// URL Verification Mode Events
// ============================================

/** URL fetched event */
export interface UrlFetchedEvent {
  type: 'url_fetched';
  timestamp: string;
  data: {
    url: string;
    domain: string;
    contentLength: number;
  };
}

/** Engine start event */
export interface EngineStartEvent {
  type: 'engine_start';
  timestamp: string;
  data: {
    queryIndex: number;
    engine: SearchEngine;
  };
}

/** Engine complete event */
export interface EngineCompleteEvent {
  type: 'engine_complete';
  timestamp: string;
  data: {
    queryIndex: number;
    engine: SearchEngine;
    userCited: boolean;
    citationCount: number;
    duration: number;
  };
}

/** Verification complete event - final result for URL verification mode */
export interface VerificationCompleteEvent {
  type: 'verification_complete';
  timestamp: string;
  data: {
    userUrl: string;
    userDomain: string;
    overallCitationRate: number;
    queryResults: QueryVerificationResult[];
    topic: string;
    contentStats: ContentStats;
    topCompetitors: CompetitorDomain[];
    strategyScores: StrategyScoreInfo[];
    suggestions: string[];
    metadata: AnalysisMetadata;
  };
}

/** Quality complete event - final result for text quality mode */
export interface QualityCompleteEvent {
  type: 'quality_complete';
  timestamp: string;
  data: {
    overallQuality: number;
    contentStats: ContentStats;
    strategyScores: StrategyScoreInfo[];
    suggestions: string[];
    topic: string;
    metadata: AnalysisMetadata;
  };
}

/** Error event */
export interface ErrorEvent {
  type: 'error';
  timestamp: string;
  data: {
    message: string;
    code?: string;
  };
}

/** Union type for all SSE events */
export type SSEEvent =
  | InitEvent
  | QueriesEvent
  | QueryStartEvent
  | QueryCompleteEvent
  | CompleteEvent
  | ErrorEvent
  | UrlFetchedEvent
  | EngineStartEvent
  | EngineCompleteEvent
  | VerificationCompleteEvent
  | QualityCompleteEvent;

/** SSE event sender function type */
export type SSEEventSender = (event: SSEEvent) => void;
