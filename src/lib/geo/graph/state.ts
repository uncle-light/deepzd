/**
 * LangGraph State Definition for GEO Chat Analysis
 * Uses MessagesAnnotation as base, extends with GEO-specific fields
 */

import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import type { ContentStats, StrategyScoreInfo } from "../domain/sse-types";
import type {
  QueryVerificationResult,
  CompetitorDomain,
} from "../domain/verification-types";

/** Unified analysis result returned by analyze nodes */
export interface AnalysisResult {
  mode: "url_verification" | "text_quality";
  score: number;
  topic: string;
  contentStats: ContentStats;
  strategyScores: StrategyScoreInfo[];
  suggestions: string[];
  /** URL mode only */
  userUrl?: string;
  userDomain?: string;
  overallCitationRate?: number;
  queryResults?: QueryVerificationResult[];
  topCompetitors?: CompetitorDomain[];
}

/** Query generated for verification */
export interface GeneratedQuery {
  query: string;
  type: "definition" | "howto" | "comparison" | "general";
}

export const GeoGraphState = Annotation.Root({
  ...MessagesAnnotation.spec,

  // Analysis context (persists across turns)
  analysisResult: Annotation<AnalysisResult | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
  currentUrl: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  currentContent: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  locale: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "zh",
  }),

  // Analysis pipeline intermediate state
  topic: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  queries: Annotation<GeneratedQuery[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  userDomain: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
});

export type GeoGraphStateType = typeof GeoGraphState.State;
