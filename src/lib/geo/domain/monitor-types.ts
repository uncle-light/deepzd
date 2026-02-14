/**
 * Brand monitor types
 * Used by brand_monitors / monitor_checks tables and the check pipeline.
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface CompetitorBrand {
  name: string;
  aliases: string[];
}

export interface BrandMonitor {
  id: string;
  userId: string;
  name: string;
  brandNames: string[];
  competitorBrands: CompetitorBrand[];
  industryKeywords: string[];
  brandWebsite: string;
  brandDescription: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Question config (pre-generated, editable)
// ---------------------------------------------------------------------------

export type QuestionIntentType =
  | 'recommendation'
  | 'comparison'
  | 'inquiry'
  | 'evaluation'
  | 'tutorial'
  | 'pricing';

export interface MonitorQuestion {
  id: string;
  monitorId: string;
  coreKeyword: string;
  question: string;
  intentType: QuestionIntentType;
  searchVolume: number;
  sortOrder: number;
  enabled: boolean;
  tags: string[];
}

export interface QuestionGroup {
  coreKeyword: string;
  questions: MonitorQuestion[];
}

// ---------------------------------------------------------------------------
// Detection results
// ---------------------------------------------------------------------------

export interface BrandMention {
  found: boolean;
  /** 1-based position in a list, 0 if not in a list */
  position: number;
  /** Surrounding text snippet */
  context: string;
  /** Which brand name variant matched */
  matchedName: string;
}

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  context: string;
}

// ---------------------------------------------------------------------------
// Check results (stored as jsonb)
// ---------------------------------------------------------------------------

export interface CheckSummary {
  mentionRate: number;
  avgPosition: number;
  shareOfVoice: Record<string, number>;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  perEngine: Record<string, { mentionRate: number; avgPosition: number }>;
  totalQueries: number;
  totalEngines: number;
}

export interface CheckDetail {
  queries: QueryCheckResult[];
}

export interface QueryCheckResult {
  query: string;
  queryType: string;
  engineResults: EngineCheckResult[];
  brandMentioned: boolean;
  brandPosition: number;
  competitorMentions: { name: string; position: number }[];
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentContext: string;
}

export interface EngineCheckResult {
  engine: string;
  answer: string;
  brandMentioned: boolean;
  brandPosition: number;
  brandContext: string;
  competitorMentions: { name: string; position: number }[];
  citations: { url: string; title?: string; domain: string }[];
  duration: number;
}

// ---------------------------------------------------------------------------
// DB row shape (snake_case ↔ camelCase mapping helper)
// ---------------------------------------------------------------------------

export interface MonitorCheckRow {
  id: string;
  monitor_id: string;
  user_id: string;
  status: 'running' | 'completed' | 'failed';
  summary: CheckSummary | null;
  detail: CheckDetail | null;
  query_count: number;
  engine_count: number;
  duration: number | null;
  created_at: string;
  updated_at: string;
}
