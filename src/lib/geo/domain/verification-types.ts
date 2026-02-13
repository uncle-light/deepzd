/**
 * Types for real AI search citation verification
 * Two modes: url_verification (real search) and text_quality (local analysis)
 */

/** Supported AI search engines */
export type SearchEngine = 'volc' | 'glm' | 'openai';

/** A citation discovered from AI search engine response */
export interface DiscoveredCitation {
  url: string;
  title?: string;
  domain: string;
  isUserDomain: boolean;
}

/** Result from a single engine for a single query */
export interface EngineQueryResult {
  engine: SearchEngine;
  answer: string;
  citations: DiscoveredCitation[];
  userCited: boolean;
  /** Position of user citation (1-based), 0 if not cited */
  userCitationPosition: number;
  /** Duration in ms */
  duration: number;
}

/** Aggregated result for a single query across engines */
export interface QueryVerificationResult {
  query: string;
  queryType: string;
  engineResults: EngineQueryResult[];
  /** How many engines cited the user domain */
  citedByEngines: number;
  totalEngines: number;
  /** citedByEngines / totalEngines */
  citationRate: number;
  /** Competitor domains seen across engines */
  competitorDomains: CompetitorDomain[];
}

/** A competitor domain aggregated across queries/engines */
export interface CompetitorDomain {
  domain: string;
  /** How many engines cited this domain */
  engineCount: number;
  /** How many queries this domain appeared in */
  queryCount: number;
  title?: string;
}
