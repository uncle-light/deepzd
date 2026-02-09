/**
 * SSE event types for GEO content analysis streaming
 */

import type { SourceInfo, QueryAnalysisResult } from './types';

/** SSE event type names */
export type SSEEventType =
  | 'init'
  | 'queries'
  | 'query_start'
  | 'query_sources'
  | 'query_answer'
  | 'query_complete'
  | 'complete'
  | 'error';

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
    contentStats: ContentStats;
    estimatedSteps: number;
    characteristics?: ContentCharacteristics;
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

/** Query start event - sent when starting to analyze a query */
export interface QueryStartEvent {
  type: 'query_start';
  timestamp: string;
  data: {
    queryIndex: number;
    query: string;
    queryType: string;
  };
}

/** Query sources event - sent after generating competing sources */
export interface QuerySourcesEvent {
  type: 'query_sources';
  timestamp: string;
  data: {
    queryIndex: number;
    sources: SourceInfo[];
  };
}

/** Query answer event - sent after AI generates answer */
export interface QueryAnswerEvent {
  type: 'query_answer';
  timestamp: string;
  data: {
    queryIndex: number;
    aiAnswer: string;
  };
}

/** Query complete event - sent with full query result */
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
    metadata: {
      provider: string;
      model: string;
      totalDuration: number;
      apiCalls: number;
      timestamp: string;
    };
  };
}

/** Error event - sent when an error occurs */
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
  | QuerySourcesEvent
  | QueryAnswerEvent
  | QueryCompleteEvent
  | CompleteEvent
  | ErrorEvent;

/** SSE event sender function type */
export type SSEEventSender = (event: SSEEvent) => void;
