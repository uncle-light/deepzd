/**
 * SSE event types for brand monitor check streaming.
 */

import type { CheckSummary, CheckDetail } from './monitor-types';

// ---------------------------------------------------------------------------
// Event type names
// ---------------------------------------------------------------------------

export type MonitorSSEEventType =
  | 'monitor_init'
  | 'monitor_queries'
  | 'monitor_engine_start'
  | 'monitor_engine_complete'
  | 'monitor_query_complete'
  | 'monitor_sentiment'
  | 'monitor_complete'
  | 'monitor_error';

// ---------------------------------------------------------------------------
// Individual event interfaces
// ---------------------------------------------------------------------------

export interface MonitorInitEvent {
  type: 'monitor_init';
  timestamp: string;
  data: {
    monitorId: string;
    monitorName: string;
    brandNames: string[];
    totalEngines: number;
  };
}

export interface MonitorQueriesEvent {
  type: 'monitor_queries';
  timestamp: string;
  data: {
    queries: { query: string; type: string }[];
  };
}

export interface MonitorEngineStartEvent {
  type: 'monitor_engine_start';
  timestamp: string;
  data: {
    queryIndex: number;
    engine: string;
  };
}

export interface MonitorEngineCompleteEvent {
  type: 'monitor_engine_complete';
  timestamp: string;
  data: {
    queryIndex: number;
    engine: string;
    brandMentioned: boolean;
    brandPosition: number;
    duration: number;
  };
}

export interface MonitorQueryCompleteEvent {
  type: 'monitor_query_complete';
  timestamp: string;
  data: {
    queryIndex: number;
    query: string;
    brandMentioned: boolean;
    brandPosition: number;
    competitorCount: number;
  };
}

export interface MonitorSentimentEvent {
  type: 'monitor_sentiment';
  timestamp: string;
  data: {
    processed: number;
    total: number;
  };
}

export interface MonitorCompleteEvent {
  type: 'monitor_complete';
  timestamp: string;
  data: {
    checkId: string;
    summary: CheckSummary;
    detail: CheckDetail;
    duration: number;
  };
}

export interface MonitorErrorEvent {
  type: 'monitor_error';
  timestamp: string;
  data: {
    message: string;
    code?: string;
  };
}

// ---------------------------------------------------------------------------
// Union + sender
// ---------------------------------------------------------------------------

export type MonitorSSEEvent =
  | MonitorInitEvent
  | MonitorQueriesEvent
  | MonitorEngineStartEvent
  | MonitorEngineCompleteEvent
  | MonitorQueryCompleteEvent
  | MonitorSentimentEvent
  | MonitorCompleteEvent
  | MonitorErrorEvent;

export type MonitorSSEEventSender = (event: MonitorSSEEvent) => void;
