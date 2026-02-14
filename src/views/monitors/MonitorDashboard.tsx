"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Play,
  Loader2,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Trash2,
  Settings,
  Clock,
  ArrowLeft,
  Search,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CheckSummary, CheckDetail, QueryCheckResult } from "@/lib/geo/domain/monitor-types";
import type { MonitorSSEEvent } from "@/lib/geo/domain/monitor-sse-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonitorData {
  id: string;
  name: string;
  brand_names: string[];
  competitor_brands: { name: string; aliases: string[] }[];
  industry_keywords: string[];
  locale: string;
  checks: CheckRow[];
}

interface CheckRow {
  id: string;
  status: string;
  summary: CheckSummary | null;
  query_count: number;
  engine_count: number;
  duration: number | null;
  created_at: string;
}

interface MonitorDashboardProps {
  monitor: MonitorData;
  locale: string;
  latestDetail: CheckDetail | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MonitorDashboard({
  monitor,
  locale,
  latestDetail: initialDetail,
}: MonitorDashboardProps) {
  const t = useTranslations("monitors");
  const router = useRouter();
  const isZh = locale === "zh";

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [summary, setSummary] = useState<CheckSummary | null>(
    monitor.checks[0]?.summary ?? null,
  );
  const [detail, setDetail] = useState<CheckDetail | null>(initialDetail);
  const [checks, setChecks] = useState<CheckRow[]>(monitor.checks);
  const [expandedQuery, setExpandedQuery] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState<string | null>(null);
  const totalQueriesRef = useRef(0);

  // -----------------------------------------------------------------------
  // Run check via SSE
  // -----------------------------------------------------------------------

  const runCheck = useCallback(async () => {
    setRunning(true);
    setProgress(t("check.running"));

    try {
      const res = await fetch(`/api/monitors/${monitor.id}/run`, { method: "POST" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as MonitorSSEEvent;
            handleSSEEvent(event);
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      console.error("[runCheck]", err);
      setProgress(err instanceof Error ? err.message : "Error");
    } finally {
      setRunning(false);
    }
  }, [monitor.id, t]);

  const handleSSEEvent = (event: MonitorSSEEvent) => {
    switch (event.type) {
      case "monitor_queries":
        totalQueriesRef.current = event.data.queries.length;
        setProgress(
          t("check.progress", {
            current: 0,
            total: totalQueriesRef.current,
          }),
        );
        break;
      case "monitor_query_complete":
        setProgress(
          t("check.progress", {
            current: event.data.queryIndex + 1,
            total: totalQueriesRef.current,
          }),
        );
        break;
      case "monitor_sentiment":
        setProgress(t("check.running"));
        break;
      case "monitor_complete": {
        const { summary: s, detail: d, checkId, duration } = event.data;
        setSummary(s);
        setDetail(d);
        setProgress(t("check.complete"));
        setChecks((prev) => [
          {
            id: checkId,
            status: "completed",
            summary: s,
            query_count: s.totalQueries,
            engine_count: s.totalEngines,
            duration,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        break;
      }
      case "monitor_error":
        setProgress(event.data.message);
        break;
    }
  };

  // -----------------------------------------------------------------------
  // Delete handler
  // -----------------------------------------------------------------------

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await fetch(`/api/monitors/${monitor.id}`, { method: "DELETE" });
      router.push(`/${locale}/dashboard/monitors`);
    } catch {
      // ignore
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const hasData = !!summary;

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/dashboard/monitors`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isZh ? "返回监控列表" : "Back to monitors"}
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
              {monitor.name}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {monitor.brand_names.map((name) => (
                <span
                  key={name}
                  className="text-xs px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--gray-500)] border border-[var(--border)]"
                >
                  {name}
                </span>
              ))}
              {monitor.industry_keywords.slice(0, 3).map((kw) => (
                <span
                  key={kw}
                  className="text-xs px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--gray-400)]"
                >
                  {kw}
                </span>
              ))}
              {monitor.industry_keywords.length > 3 && (
                <span className="text-xs text-[var(--gray-400)]">
                  +{monitor.industry_keywords.length - 3}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={runCheck}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {running ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {running ? progress : t("check.run")}
            </button>
            <Link
              href={`/${locale}/dashboard/monitors/${monitor.id}/settings`}
              className="p-2 rounded-md text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 rounded-md text-[var(--gray-400)] hover:text-red-500 hover:bg-[var(--surface-muted)] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!hasData && !running && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center">
            <Search className="w-5 h-5 text-[var(--gray-400)]" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {t("detail.noChecks")}
            </p>
            <p className="text-sm text-[var(--gray-400)]">
              {isZh
                ? "运行第一次检查，查看品牌在 AI 搜索中的表现"
                : "Run your first check to see how your brand performs in AI search"}
            </p>
          </div>
          <button
            onClick={runCheck}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
          >
            <Play className="w-4 h-4" />
            {t("check.run")}
          </button>
        </div>
      )}

      {/* Running progress */}
      {running && !hasData && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--gray-400)]" />
          <p className="text-xs text-[var(--gray-500)]">{progress}</p>
        </div>
      )}

      {/* Dashboard content */}
      {hasData && (
        <div className="space-y-10">
          {/* Summary metrics */}
          <SummaryCards summary={summary} t={t} />

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShareOfVoiceChart shareOfVoice={summary.shareOfVoice} isZh={isZh} />
            <SentimentChart distribution={summary.sentimentDistribution} t={t} />
          </div>

          {/* Engine breakdown */}
          {Object.keys(summary.perEngine).length > 0 && (
            <EngineBreakdown perEngine={summary.perEngine} t={t} />
          )}

          {/* Query details */}
          {detail && (
            <QueryDetails
              queries={detail.queries}
              expandedQuery={expandedQuery}
              setExpandedQuery={setExpandedQuery}
              showAnswer={showAnswer}
              setShowAnswer={setShowAnswer}
              t={t}
              isZh={isZh}
            />
          )}

          {/* Check history */}
          {checks.length > 0 && (
            <CheckTimeline checks={checks} t={t} isZh={isZh} />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCards({
  summary,
  t,
}: {
  summary: CheckSummary;
  t: ReturnType<typeof useTranslations<"monitors">>;
}) {
  const dominantSentiment = (() => {
    const d = summary.sentimentDistribution;
    if (d.positive >= d.neutral && d.positive >= d.negative) return { key: "positive" as const, color: "text-green-500" };
    if (d.negative >= d.neutral && d.negative >= d.positive) return { key: "negative" as const, color: "text-red-500" };
    return { key: "neutral" as const, color: "text-[var(--gray-500)]" };
  })();

  const mentionPct = Math.round(summary.mentionRate * 100);
  const sovPct = Math.round((Object.values(summary.shareOfVoice)[0] ?? 0) * 100);

  const cards = [
    {
      label: t("metrics.mentionRate"),
      value: `${mentionPct}%`,
      accent: mentionPct >= 50 ? "text-green-500" : "text-[var(--foreground)]",
      sub: `${summary.totalQueries} queries`,
    },
    {
      label: t("metrics.avgPosition"),
      value: summary.avgPosition > 0 ? `#${summary.avgPosition.toFixed(1)}` : "-",
      accent: "text-[var(--foreground)]",
      sub: `${summary.totalEngines} engines`,
    },
    {
      label: t("metrics.shareOfVoice"),
      value: `${sovPct}%`,
      accent: "text-[var(--foreground)]",
      sub: `${Object.keys(summary.shareOfVoice).length} brands`,
    },
    {
      label: t("metrics.sentiment"),
      value: t(`metrics.${dominantSentiment.key}`),
      accent: dominantSentiment.color,
      sub: (() => {
        const d = summary.sentimentDistribution;
        const total = d.positive + d.neutral + d.negative;
        return total > 0 ? `${d.positive}+ / ${d.neutral}= / ${d.negative}-` : "";
      })(),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-[var(--border)] p-5 hover:border-[var(--gray-400)] transition-colors"
        >
          <p className="text-xs text-[var(--gray-500)] mb-3">{card.label}</p>
          <p className={`text-3xl font-semibold tabular-nums tracking-tight ${card.accent}`}>
            {card.value}
          </p>
          {card.sub && (
            <p className="text-[11px] text-[var(--gray-400)] mt-1.5 tabular-nums">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ShareOfVoiceChart({
  shareOfVoice,
  isZh,
}: {
  shareOfVoice: Record<string, number>;
  isZh: boolean;
}) {
  const entries = Object.entries(shareOfVoice).sort((a, b) => b[1] - a[1]);
  const colors = [
    "var(--foreground)",
    "var(--gray-400)",
    "var(--gray-300)",
    "var(--gray-200)",
  ];

  const { stops, total: accumulated } = entries.reduce<{ stops: string[]; total: number }>(
    (acc, [, pct], i) => {
      const start = acc.total;
      const end = acc.total + pct;
      acc.stops.push(`${colors[i % colors.length]} ${start * 100}% ${end * 100}%`);
      acc.total = end;
      return acc;
    },
    { stops: [], total: 0 },
  );
  if (accumulated < 1) {
    stops.push(`var(--border) ${accumulated * 100}% 100%`);
  }

  const topPct = entries.length > 0 ? Math.round(entries[0][1] * 100) : 0;
  const maxPct = entries.length > 0 ? entries[0][1] : 1;

  return (
    <div className="rounded-lg border border-[var(--border)] p-5 hover:border-[var(--gray-400)] transition-colors">
      <p className="text-xs text-[var(--gray-500)] mb-5">
        {isZh ? "声量占比" : "Share of Voice"}
      </p>
      <div className="flex items-start gap-6">
        {/* Donut chart with center text */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{ background: `conic-gradient(${stops.join(", ")})` }}
          />
          {/* Inner circle for donut effect */}
          <div className="absolute inset-[20px] rounded-full bg-[var(--background)] flex items-center justify-center">
            <span className="text-lg font-semibold text-[var(--foreground)] tabular-nums">
              {topPct}%
            </span>
          </div>
        </div>

        {/* Horizontal bar legend */}
        <div className="flex-1 space-y-3 min-w-0 pt-1">
          {entries.map(([name, pct], i) => {
            const barWidth = maxPct > 0 ? (pct / maxPct) * 100 : 0;
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                    <span className="text-xs text-[var(--foreground)] truncate">{name}</span>
                  </div>
                  <span className="text-xs text-[var(--gray-500)] tabular-nums shrink-0 ml-2">
                    {Math.round(pct * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: colors[i % colors.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SentimentChart({
  distribution,
  t,
}: {
  distribution: { positive: number; neutral: number; negative: number };
  t: ReturnType<typeof useTranslations<"monitors">>;
}) {
  const total = distribution.positive + distribution.neutral + distribution.negative;
  const items = [
    { key: "positive" as const, label: t("metrics.positive"), color: "#22c55e" },
    { key: "neutral" as const, label: t("metrics.neutral"), color: "var(--gray-400)" },
    { key: "negative" as const, label: t("metrics.negative"), color: "#ef4444" },
  ];

  // Stacked summary bar percentages
  const pcts = items.map((item) => ({
    ...item,
    pct: total > 0 ? (distribution[item.key] / total) * 100 : 0,
    count: distribution[item.key],
  }));

  return (
    <div className="rounded-lg border border-[var(--border)] p-5 hover:border-[var(--gray-400)] transition-colors">
      <p className="text-xs text-[var(--gray-500)] mb-5">{t("metrics.sentiment")}</p>

      {/* Stacked summary bar */}
      <div className="h-2.5 rounded-full bg-[var(--surface-muted)] overflow-hidden flex mb-5">
        {pcts.map((item) =>
          item.pct > 0 ? (
            <div
              key={item.key}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
              style={{ width: `${item.pct}%`, backgroundColor: item.color }}
            />
          ) : null,
        )}
      </div>

      {/* Individual bars */}
      <div className="space-y-4">
        {pcts.map((item) => (
          <div key={item.key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-[var(--foreground)]">{item.label}</span>
              </div>
              <span className="text-xs text-[var(--gray-500)] tabular-nums">
                {item.count} ({Math.round(item.pct)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngineBreakdown({
  perEngine,
  t,
}: {
  perEngine: Record<string, { mentionRate: number; avgPosition: number }>;
  t: ReturnType<typeof useTranslations<"monitors">>;
}) {
  return (
    <section>
      <h2 className="text-sm font-medium text-[var(--foreground)] mb-3">
        {t("detail.engineBreakdown")}
      </h2>
      <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
        {Object.entries(perEngine).map(([engine, data]) => {
          const mentionPct = Math.round(data.mentionRate * 100);
          return (
            <div key={engine} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-medium text-[var(--foreground)]">{engine}</span>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[11px] text-[var(--gray-500)]">{t("metrics.mentionRate")}</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                      {mentionPct}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[var(--gray-500)]">{t("metrics.avgPosition")}</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                      {data.avgPosition > 0 ? `#${data.avgPosition.toFixed(1)}` : "-"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Visual progress bar for mention rate */}
              <div className="h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${mentionPct}%`,
                    backgroundColor: mentionPct >= 50 ? "#22c55e" : "var(--foreground)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QueryDetails({
  queries,
  expandedQuery,
  setExpandedQuery,
  showAnswer,
  setShowAnswer,
  t,
  isZh,
}: {
  queries: QueryCheckResult[];
  expandedQuery: number | null;
  setExpandedQuery: (v: number | null) => void;
  showAnswer: string | null;
  setShowAnswer: (v: string | null) => void;
  t: ReturnType<typeof useTranslations<"monitors">>;
  isZh: boolean;
}) {
  const mentionedCount = queries.filter((q) => q.brandMentioned).length;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-[var(--foreground)]">
          {t("detail.query")}
          <span className="ml-1.5 text-[var(--gray-400)] font-normal">
            ({mentionedCount}/{queries.length})
          </span>
        </h2>
      </div>
      <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
        {queries.map((q, qi) => {
          const isExpanded = expandedQuery === qi;

          return (
            <div key={qi}>
              <button
                onClick={() => setExpandedQuery(isExpanded ? null : qi)}
                className="w-full text-left px-5 py-3.5 hover:bg-[var(--surface-muted)] transition-colors"
              >
                {/* Line 1: query text */}
                <div className="flex items-start gap-2.5">
                  {q.brandMentioned ? (
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--surface-muted)] flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-[var(--gray-400)]" />
                    </div>
                  )}
                  <span className="text-sm text-[var(--foreground)] leading-relaxed flex-1">
                    {q.query}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[var(--gray-400)] shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--gray-400)] shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Line 2: meta info */}
                <div className="flex flex-wrap items-center gap-2 mt-2 pl-[30px]">
                  {q.brandMentioned && q.brandPosition > 0 && (
                    <span className="text-[11px] font-medium text-[var(--foreground)] tabular-nums bg-[var(--surface-muted)] px-1.5 py-0.5 rounded">
                      #{q.brandPosition}
                    </span>
                  )}
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded ${
                      q.sentiment === "positive"
                        ? "text-green-600 bg-green-500/10"
                        : q.sentiment === "negative"
                          ? "text-red-600 bg-red-500/10"
                          : "text-[var(--gray-500)] bg-[var(--surface-muted)]"
                    }`}
                  >
                    {t(`metrics.${q.sentiment}`)}
                  </span>
                  {q.engineResults.map((er) => (
                    <span
                      key={er.engine}
                      className={`text-[11px] px-1.5 py-0.5 rounded ${
                        er.brandMentioned
                          ? "text-green-600 bg-green-500/10"
                          : "text-[var(--gray-400)] bg-[var(--surface-muted)]"
                      }`}
                    >
                      {er.engine}
                    </span>
                  ))}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-4 pl-[50px] space-y-3">
                  {q.competitorMentions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-[var(--gray-500)]">
                        {t("detail.competitors")}:
                      </span>
                      {q.competitorMentions.map((c) => (
                        <span
                          key={c.name}
                          className="text-xs px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--gray-500)] border border-[var(--border)]"
                        >
                          {c.name}
                          {c.position > 0 && (
                            <span className="ml-1 text-[var(--gray-400)] tabular-nums">#{c.position}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Engine result cards */}
                  <div className="grid grid-cols-1 gap-2">
                    {q.engineResults.map((er) => {
                      const answerKey = `${qi}-${er.engine}`;
                      const isAnswerOpen = showAnswer === answerKey;
                      return (
                        <div
                          key={er.engine}
                          className="rounded-md border border-[var(--border)] overflow-hidden"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAnswer(isAnswerOpen ? null : answerKey);
                            }}
                            className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-[var(--surface-muted)] transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {er.brandMentioned ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--gray-300)] shrink-0" />
                              )}
                              <span className="text-xs font-medium text-[var(--foreground)]">
                                {er.engine}
                              </span>
                              {er.brandMentioned && er.brandPosition > 0 && (
                                <span className="text-[11px] text-[var(--gray-500)] tabular-nums">
                                  #{er.brandPosition}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[var(--gray-400)]">
                              {isAnswerOpen
                                ? (isZh ? "收起" : "Collapse")
                                : (isZh ? "查看回答" : "View answer")}
                            </span>
                          </button>
                          {isAnswerOpen && (
                            <div className="px-4 pb-3 pt-0 border-t border-[var(--border)]">
                              <div className="mt-3 text-xs max-h-60 overflow-y-auto prose prose-sm dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:bg-[var(--background)] prose-pre:text-[var(--foreground)] max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {er.answer || (isZh ? "（无回答）" : "(no answer)")}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CheckTimeline({
  checks,
  t,
  isZh,
}: {
  checks: CheckRow[];
  t: ReturnType<typeof useTranslations<"monitors">>;
  isZh: boolean;
}) {
  return (
    <section>
      <h2 className="text-sm font-medium text-[var(--foreground)] mb-3">
        {t("detail.checkHistory")}
        <span className="ml-1.5 text-[var(--gray-400)] font-normal">
          ({checks.length})
        </span>
      </h2>
      <div className="rounded-lg border border-[var(--border)] p-5">
        <div className="relative pl-5">
          {/* Timeline line */}
          {checks.length > 1 && (
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[var(--border)]" />
          )}

          <div className="space-y-4">
            {checks.map((c) => {
              const statusColor =
                c.status === "completed"
                  ? "bg-green-500"
                  : c.status === "failed"
                    ? "bg-red-500"
                    : "bg-yellow-500";

              return (
                <div key={c.id} className="relative flex items-center gap-3">
                  {/* Dot */}
                  <div
                    className={`absolute -left-5 w-[11px] h-[11px] rounded-full ${statusColor} border-2 border-[var(--background)]`}
                  />

                  <div className="flex items-center justify-between w-full py-1">
                    <div className="flex items-center gap-3">
                      <Clock className="w-3.5 h-3.5 text-[var(--gray-400)]" />
                      <span className="text-xs text-[var(--foreground)]">
                        {new Date(c.created_at).toLocaleDateString(
                          isZh ? "zh-CN" : "en-US",
                          { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded ${
                          c.status === "completed"
                            ? "text-green-600 bg-green-500/10"
                            : c.status === "failed"
                              ? "text-red-600 bg-red-500/10"
                              : "text-yellow-600 bg-yellow-500/10"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    {c.summary && (
                      <span className="text-xs text-[var(--gray-500)] tabular-nums">
                        {Math.round(c.summary.mentionRate * 100)}%
                        {c.duration ? ` · ${(c.duration / 1000).toFixed(1)}s` : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
