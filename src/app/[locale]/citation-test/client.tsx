"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Link, FileText, Loader2, Trophy, Target,
  CheckCircle2, Circle, Sparkles, TrendingUp, ChevronDown, ChevronUp,
  Clock, Zap, MessageSquare, Wand2, X, Check, Copy
} from "lucide-react";

/** Citation detail */
interface CitationDetail {
  sourceIndex: number;
  position: number;
  sentence: string;
  wordCount: number;
  url?: string;
  title?: string;
}

/** Source info */
interface SourceInfo {
  index: number;
  type: 'generated' | 'user' | 'search';
  preview: string;
  citationCount: number;
  score: number;
  url?: string;
  title?: string;
  domain?: string;
}

/** Query analysis result */
interface QueryResult {
  query: string;
  queryType: 'definition' | 'howto' | 'comparison' | 'general';
  citationScore: number;
  rank: number;
  citationCount: number;
  avgPosition: number;
  aiAnswer: string;
  citations: CitationDetail[];
  sources: SourceInfo[];
  duration: number;
}

/** Content stats */
interface ContentStats {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

/** Content characteristics */
interface ContentCharacteristics {
  hasStatistics: boolean;
  hasCitations: boolean;
  hasQuotes: boolean;
  hasStructure: boolean;
  avgSentenceLength: number;
  uniqueWordsRatio: number;
}

/** Analysis metadata */
interface AnalysisMetadata {
  provider: string;
  model: string;
  totalDuration: number;
  apiCalls: number;
  timestamp: string;
}

/** Strategy score from backend */
interface StrategyScore {
  strategy: string;
  score: number;
  label: string;
  description: string;
  suggestions: string[];
}

/** Optimization result */
interface OptimizationResult {
  strategy: string;
  originalContent: string;
  optimizedContent: string;
  changes: string[];
}

/** GEO analysis result */
interface GeoResult {
  overall: number;
  queryResults: QueryResult[];
  topic: string;
  contentStats: ContentStats;
  suggestions: string[];
  strategyScores?: StrategyScore[];
  metadata: AnalysisMetadata;
}

/** SSE progress state */
interface ProgressState {
  step: 'idle' | 'init' | 'queries' | 'analyzing' | 'complete';
  currentQuery: number;
  totalQueries: number;
  subStep: 'sources' | 'answer' | 'calculating' | null;
}

// Auto-detect if input is URL
function isUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return false;
  }
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

// Get score level for styling
function getScoreLevel(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

// Get score label
function getScoreLabel(score: number, t: (key: string) => string): string {
  if (score >= 70) return t("scoreLevel.high");
  if (score >= 40) return t("scoreLevel.medium");
  return t("scoreLevel.low");
}

// Format duration in ms to readable string
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AnalyzePageClient() {
  const t = useTranslations("analyze");
  const locale = useLocale();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    step: 'idle',
    currentQuery: 0,
    totalQueries: 0,
    subStep: null,
  });
  const [result, setResult] = useState<GeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queries, setQueries] = useState<Array<{ query: string; type: string }>>([]);
  const [characteristics, setCharacteristics] = useState<ContentCharacteristics | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [expandedQuery, setExpandedQuery] = useState<number | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  // Optimization states
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  // Abort current analysis stream request
  const closeAnalysisStream = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => closeAnalysisStream();
  }, [closeAnalysisStream]);

  const handleAnalyze = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError(t("error.empty"));
      return;
    }

    const inputType = isUrl(trimmed) ? "url" : "text";
    if (inputType === "text" && trimmed.length < 50) {
      setError(t("error.tooShort"));
      return;
    }

    // Reset state
    setIsLoading(true);
    setError(null);
    setResult(null);
    setQueries([]);
    setCharacteristics(null);
    setQueryResults([]);
    setExpandedQuery(null);
    setProgress({ step: 'idle', currentQuery: 0, totalQueries: 0, subStep: null });

    // Abort existing request
    closeAnalysisStream();

    const controller = new AbortController();
    streamAbortRef.current = controller;
    let completed = false;

    const handleStreamEvent = (event: { type?: string; data?: Record<string, unknown> }) => {
      switch (event.type) {
        case 'init':
          if (event.data?.characteristics) {
            setCharacteristics(event.data.characteristics as ContentCharacteristics);
          }
          setProgress(p => ({ ...p, step: 'init' }));
          break;

        case 'queries':
          setQueries((event.data?.queries as Array<{ query: string; type: string }>) || []);
          setProgress(p => ({
            ...p,
            step: 'queries',
            totalQueries: ((event.data?.queries as unknown[]) || []).length,
          }));
          break;

        case 'query_start':
          setProgress(p => ({
            ...p,
            step: 'analyzing',
            currentQuery: Number(event.data?.queryIndex || 0) + 1,
            subStep: 'sources',
          }));
          break;

        case 'query_sources':
          setProgress(p => ({ ...p, subStep: 'answer' }));
          break;

        case 'query_answer':
          setProgress(p => ({ ...p, subStep: 'calculating' }));
          break;

        case 'query_complete':
          if (event.data?.result) {
            setQueryResults(prev => [...prev, event.data?.result as QueryResult]);
          }
          setProgress(p => ({ ...p, subStep: null }));
          break;

        case 'complete':
          completed = true;
          setResult((event.data || null) as GeoResult | null);
          setProgress(p => ({ ...p, step: 'complete' }));
          setIsLoading(false);
          closeAnalysisStream();
          break;

        case 'error':
          setError((event.data?.message as string) || t("error.failed"));
          setIsLoading(false);
          closeAnalysisStream();
          break;
      }
    };

    try {
      const response = await fetch('/api/analyze-content/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed, locale, inputType }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let message = t("error.failed");
        try {
          const errorData = await response.json();
          if (errorData?.error) message = errorData.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      if (!response.body) {
        throw new Error(t("error.failed"));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split(/\r?\n\r?\n/);
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
          const lines = chunk.split(/\r?\n/);
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              handleStreamEvent(JSON.parse(payload));
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      if (!completed) {
        setIsLoading(false);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setError(error instanceof Error ? error.message : t("error.failed"));
      setIsLoading(false);
    } finally {
      if (streamAbortRef.current === controller) {
        streamAbortRef.current = null;
      }
    }
  }, [content, locale, t, closeAnalysisStream]);

  // Handle strategy optimization
  const handleOptimize = useCallback(async (strategy: string) => {
    if (!content.trim() || optimizing) return;

    setOptimizing(strategy);
    setOptimizationResult(null);
    setShowDiff(false);

    try {
      const response = await fetch('/api/optimize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, strategy, locale }),
      });

      const data = await response.json();

      if (data.success) {
        setOptimizationResult(data.data);
        setShowDiff(true);
      } else {
        setError(data.error || 'Optimization failed');
      }
    } catch {
      setError('Optimization request failed');
    } finally {
      setOptimizing(null);
    }
  }, [content, locale, optimizing]);

  // Apply optimized content
  const applyOptimization = useCallback(() => {
    if (optimizationResult) {
      setContent(optimizationResult.optimizedContent);
      setShowDiff(false);
      setOptimizationResult(null);
      setResult(null); // Clear previous results
    }
  }, [optimizationResult]);

  // Copy optimized content
  const copyOptimizedContent = useCallback(() => {
    if (optimizationResult) {
      navigator.clipboard.writeText(optimizationResult.optimizedContent);
    }
  }, [optimizationResult]);

  return (
    <main className="min-h-screen pt-20 pb-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with gradient */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            {t("badge")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[var(--foreground)] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base text-[var(--gray-400)] max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </header>

        {/* Input Card */}
        <div className="mb-8 p-6 md:p-8 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-[var(--gray-400)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              {t("inputType.text")}
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("textPlaceholder")}
            rows={10}
            className="w-full px-4 py-4 rounded-xl border border-[var(--border)]
                       bg-[var(--background)] text-[var(--foreground)] text-base leading-relaxed
                       placeholder:text-[var(--gray-500)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]
                       resize-none transition-all font-mono"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-[var(--gray-500)]">
                {isUrl(content.trim()) ? (
                  <><Link className="w-4 h-4" /> URL</>
                ) : (
                  <><FileText className="w-4 h-4" /> {content.length} {t("charUnit")}</>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {content && (
                <button
                  type="button"
                  onClick={() => { setContent(""); setResult(null); setError(null); }}
                  className="px-4 py-2 text-sm text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--gray-200)]/10"
                >
                  {t("clear")}
                </button>
              )}
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !content.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{t("analyzing")}</>
                ) : (
                  <><Zap className="w-4 h-4" />{t("analyzeBtn")}</>
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        {isLoading && (
          <div className="mb-6 p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[var(--gray-400)]" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                {t("progress.title")}
              </span>
            </div>
            <div className="space-y-3">
              {/* Step 1: Init */}
              <div className="flex items-center gap-3">
                {progress.step !== 'idle' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader2 className="w-4 h-4 text-[var(--foreground)] animate-spin" />
                )}
                <span className={`text-sm ${progress.step !== 'idle' ? "text-[var(--gray-400)]" : "text-[var(--foreground)]"}`}>
                  {t("progress.extracting")}
                </span>
              </div>

              {/* Step 2: Queries */}
              <div className="flex items-center gap-3">
                {['queries', 'analyzing', 'complete'].includes(progress.step) ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : progress.step === 'init' ? (
                  <Loader2 className="w-4 h-4 text-[var(--foreground)] animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-[var(--gray-500)]" />
                )}
                <span className={`text-sm ${
                  ['queries', 'analyzing', 'complete'].includes(progress.step) ? "text-[var(--gray-400)]" :
                  progress.step === 'init' ? "text-[var(--foreground)]" : "text-[var(--gray-500)]"
                }`}>
                  {t("progress.generating")}
                </span>
              </div>

              {/* Step 3: Analyzing queries (parallel) */}
              <div className="flex items-center gap-3">
                {progress.step === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : progress.step === 'analyzing' ? (
                  <Loader2 className="w-4 h-4 text-[var(--foreground)] animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-[var(--gray-500)]" />
                )}
                <span className={`text-sm ${
                  progress.step === 'complete' ? "text-[var(--gray-400)]" :
                  progress.step === 'analyzing' ? "text-[var(--foreground)]" : "text-[var(--gray-500)]"
                }`}>
                  {progress.step === 'analyzing'
                    ? t("progress.parallelAnalysis", { completed: queryResults.length, total: progress.totalQueries })
                    : t("progress.simulating")}
                </span>
              </div>

              {/* Step 4: Complete */}
              <div className="flex items-center gap-3">
                {progress.step === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-[var(--gray-500)]" />
                )}
                <span className={`text-sm ${progress.step === 'complete' ? "text-[var(--gray-400)]" : "text-[var(--gray-500)]"}`}>
                  {t("progress.analyzing")}
                </span>
              </div>
            </div>

            {/* Content characteristics analysis */}
            {characteristics && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--gray-500)] mb-2">{t("characteristics.title")}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {characteristics.hasStatistics ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-[var(--gray-400)]">{t("characteristics.statistics")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {characteristics.hasCitations ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-[var(--gray-400)]">{t("characteristics.citations")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {characteristics.hasQuotes ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-[var(--gray-400)]">{t("characteristics.quotes")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {characteristics.hasStructure ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-[var(--gray-400)]">{t("characteristics.structure")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generated queries list */}
            {queries.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--gray-500)] mb-2">{t("generatedQueries")}</p>
                <div className="space-y-1.5">
                  {queries.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-[var(--background)]">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--accent)]/20 text-[var(--accent)]">
                        {q.type}
                      </span>
                      <span className="text-[var(--gray-400)] truncate">{q.query}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time query results during analysis */}
            {queryResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--gray-500)] mb-2">{t("queryResults")}</p>
                <div className="space-y-2">
                  {queryResults.map((qr, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-[var(--background)]">
                      <span className="text-[var(--gray-400)] truncate max-w-[200px]">{qr.query}</span>
                      <span className={`font-medium ${
                        getScoreLevel(qr.citationScore) === "high" ? "text-green-500" :
                        getScoreLevel(qr.citationScore) === "medium" ? "text-yellow-500" : "text-red-500"
                      }`}>
                        {qr.citationScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-[var(--gray-500)] mb-0.5">{t("overall")}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-semibold tabular-nums text-[var(--foreground)]">
                      {result.overall}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      getScoreLevel(result.overall) === "high"
                        ? "bg-green-500/10 text-green-600"
                        : getScoreLevel(result.overall) === "medium"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-red-500/10 text-red-600"
                    }`}>
                      {getScoreLabel(result.overall, t)}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-[var(--gray-500)]">
                  <p>{result.contentStats.wordCount} {t("wordCount")}</p>
                  <p>{result.contentStats.charCount} {t("charCount")}</p>
                </div>
              </div>

              {/* Score Explanation */}
              <p className="text-xs text-[var(--gray-400)] mb-3">
                {t("scoreExplanation")}
              </p>

              {/* Topic */}
              {result.topic && (
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--gray-500)]" />
                  <span className="text-xs text-[var(--gray-500)]">
                    {t("topic")}: <span className="text-[var(--foreground)]">{result.topic}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Strategy Scores - GEO 9 Strategies */}
            {result.strategyScores && result.strategyScores.length > 0 && (
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
                <p className="text-xs font-medium text-[var(--gray-500)] mb-4">
                  {t("strategy.title")}
                </p>
                <div className="space-y-3">
                  {result.strategyScores.map((s) => {
                    const level = getScoreLevel(s.score);
                    const isOptimizing = optimizing === s.strategy;
                    return (
                      <div key={s.strategy} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[var(--foreground)]">{s.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              level === "high" ? "text-green-500" :
                              level === "medium" ? "text-yellow-500" : "text-red-500"
                            }`}>
                              {s.score}
                            </span>
                            {s.score < 70 && (
                              <button
                                onClick={() => handleOptimize(s.strategy)}
                                disabled={isOptimizing || !!optimizing}
                                className="px-2 py-1 text-xs rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 disabled:opacity-50 flex items-center gap-1"
                              >
                                {isOptimizing ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Wand2 className="w-3 h-3" />
                                )}
                                {t("strategy.optimize")}
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 bg-[var(--gray-200)]/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              level === "high" ? "bg-green-500" :
                              level === "medium" ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                        {/* Suggestions on hover */}
                        {s.suggestions.length > 0 && (
                          <p className="text-xs text-[var(--gray-500)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {s.suggestions[0]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Query Results */}
            {result.queryResults.length > 0 && (
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
                <p className="text-xs font-medium text-[var(--gray-500)] mb-3">
                  {t("queryResults")}
                </p>
                <div className="space-y-3">
                  {result.queryResults.map((qr, i) => {
                    const level = getScoreLevel(qr.citationScore);
                    const isExpanded = expandedQuery === i;
                    return (
                      <div key={i} className="rounded-lg bg-[var(--background)] overflow-hidden">
                        {/* Query header - clickable */}
                        <button
                          type="button"
                          onClick={() => setExpandedQuery(isExpanded ? null : i)}
                          className="w-full p-3 text-left hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-900)] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-[var(--foreground)] flex-1">
                              {qr.query}
                            </p>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[var(--gray-500)] shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[var(--gray-500)] shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs mt-2">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-[var(--gray-500)]" />
                              <span className={
                                level === "high" ? "text-green-500" :
                                level === "medium" ? "text-yellow-500" : "text-red-500"
                              }>
                                {qr.citationScore}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-[var(--gray-500)]" />
                              <span className="text-[var(--gray-400)]">#{qr.rank}/5</span>
                            </span>
                            <span className="text-[var(--gray-500)]">
                              {t("citationCount")}: {qr.citationCount}
                            </span>
                            <span className="flex items-center gap-1 text-[var(--gray-500)]">
                              <Clock className="w-3 h-3" />
                              {formatDuration(qr.duration)}
                            </span>
                          </div>
                        </button>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-3 border-t border-[var(--border)]">
                            {/* AI Answer */}
                            {qr.aiAnswer && (
                              <div className="pt-3">
                                <p className="text-xs font-medium text-[var(--gray-500)] mb-2 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {t("detail.aiAnswer")}
                                </p>
                                <div className="text-xs text-[var(--gray-400)] leading-relaxed prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {qr.aiAnswer}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            )}

                            {/* Citations */}
                            {qr.citations.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-[var(--gray-500)] mb-2">
                                  {t("detail.citations")} ({qr.citations.length})
                                </p>
                                <div className="space-y-1.5">
                                  {qr.citations.map((c, ci) => (
                                    <div key={ci} className="text-xs p-2 rounded bg-[var(--card-bg)]">
                                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-2 ${
                                        c.sourceIndex === 5 ? "bg-green-500/20 text-green-600" : "bg-[var(--gray-200)] text-[var(--gray-600)]"
                                      }`}>
                                        [{c.sourceIndex}]
                                      </span>
                                      <span className="text-[var(--gray-400)]">{c.sentence}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Sources comparison */}
                            {qr.sources.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-[var(--gray-500)] mb-2">
                                  {t("detail.sources")}
                                </p>
                                <div className="space-y-1.5">
                                  {qr.sources.map((s) => (
                                    <div key={s.index} className={`text-xs p-2 rounded ${
                                      s.type === 'user' ? "bg-green-500/10 border border-green-500/20" : "bg-[var(--card-bg)]"
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                            s.type === 'user' ? "bg-green-500/20 text-green-600" :
                                            s.type === 'search' ? "bg-[var(--accent)]/20 text-[var(--accent)]" :
                                            "bg-[var(--gray-200)] text-[var(--gray-600)]"
                                          }`}>
                                            [{s.index}]
                                          </span>
                                          <span className="text-[var(--gray-400)]">
                                            {s.type === 'user' ? t("detail.yourContent") :
                                             s.type === 'search' ? t("detail.searchResult") :
                                             t("detail.competitor")}
                                          </span>
                                        </span>
                                        <span className="flex items-center gap-3">
                                          <span className="text-[var(--gray-500)]">{s.citationCount}x</span>
                                          <span className={`font-medium ${
                                            s.score >= 50 ? "text-green-500" : s.score >= 20 ? "text-yellow-500" : "text-[var(--gray-500)]"
                                          }`}>
                                            {Math.round(s.score)}
                                          </span>
                                        </span>
                                      </div>
                                      {/* Show URL if available */}
                                      {s.url && (
                                        <a
                                          href={s.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--accent)] hover:text-[var(--accent)] hover:underline truncate"
                                        >
                                          <Link className="w-3 h-3 shrink-0" />
                                          <span className="truncate">{s.domain || s.url}</span>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
                <p className="text-xs font-medium text-[var(--gray-500)] mb-3">
                  {t("suggestions")}
                </p>
                <div className="prose prose-sm prose-invert max-w-none
                                prose-headings:text-[var(--foreground)] prose-headings:font-semibold
                                prose-h2:text-base prose-h2:mb-2 prose-h2:mt-0
                                prose-h3:text-sm prose-h3:mb-1.5 prose-h3:mt-3
                                prose-p:my-1 prose-p:text-[var(--gray-400)] prose-p:text-sm
                                prose-ul:my-1.5 prose-ul:text-sm
                                prose-li:my-0.5 prose-li:text-[var(--gray-400)]
                                prose-strong:text-[var(--foreground)] prose-strong:font-medium
                                prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result.suggestions.join('\n')}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Metadata */}
            {result.metadata && (
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
                <p className="text-xs font-medium text-[var(--gray-500)] mb-3">
                  {t("detail.metadata")}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[var(--gray-500)]" />
                    <span className="text-[var(--gray-500)]">{t("detail.provider")}:</span>
                    <span className="text-[var(--gray-400)]">{result.metadata.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-[var(--gray-500)]" />
                    <span className="text-[var(--gray-500)]">{t("detail.duration")}:</span>
                    <span className="text-[var(--gray-400)]">{formatDuration(result.metadata.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 text-[var(--gray-500)]" />
                    <span className="text-[var(--gray-500)]">{t("detail.apiCalls")}:</span>
                    <span className="text-[var(--gray-400)]">{result.metadata.apiCalls}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--gray-500)]">{t("detail.model")}:</span>
                    <span className="text-[var(--gray-400)] truncate">{result.metadata.model}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Diff Modal */}
      {showDiff && optimizationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[80vh] bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                {t("strategy.diffTitle")}
              </h3>
              <button
                onClick={() => { setShowDiff(false); setOptimizationResult(null); }}
                className="p-1 hover:bg-[var(--gray-200)]/10 rounded"
              >
                <X className="w-4 h-4 text-[var(--gray-500)]" />
              </button>
            </div>

            {/* Changes summary */}
            {optimizationResult.changes.length > 0 && (
              <div className="px-4 py-2 bg-[var(--accent)]/5 border-b border-[var(--border)]">
                <p className="text-xs text-[var(--accent)]">
                  {optimizationResult.changes.join(' • ')}
                </p>
              </div>
            )}

            {/* Diff content */}
            <div className="flex-1 overflow-auto p-4 grid grid-cols-2 gap-4">
              {/* Original */}
              <div>
                <p className="text-xs font-medium text-red-500 mb-2">
                  {t("strategy.original")}
                </p>
                <div className="text-sm text-[var(--gray-400)] whitespace-pre-wrap bg-red-500/5 p-3 rounded border border-red-500/20">
                  {optimizationResult.originalContent}
                </div>
              </div>
              {/* Optimized */}
              <div>
                <p className="text-xs font-medium text-green-500 mb-2">
                  {t("strategy.optimized")}
                </p>
                <div className="text-sm text-[var(--gray-400)] whitespace-pre-wrap bg-green-500/5 p-3 rounded border border-green-500/20">
                  {optimizationResult.optimizedContent}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)]">
              <button
                onClick={copyOptimizedContent}
                className="px-3 py-1.5 text-sm text-[var(--gray-400)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                {t("strategy.copy")}
              </button>
              <button
                onClick={() => { setShowDiff(false); setOptimizationResult(null); }}
                className="px-4 py-1.5 text-sm text-[var(--gray-500)] hover:text-[var(--foreground)]"
              >
                {t("strategy.cancel")}
              </button>
              <button
                onClick={applyOptimization}
                className="px-4 py-1.5 text-sm bg-[var(--foreground)] text-[var(--background)] rounded-lg flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                {t("strategy.apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
