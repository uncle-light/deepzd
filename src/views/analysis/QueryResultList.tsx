"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check, X, ChevronDown, ChevronUp,
  Clock, ExternalLink,
} from "lucide-react";

interface DiscoveredCitation {
  domain: string;
  url?: string;
  position?: number;
  isUserDomain: boolean;
}

interface EngineQueryResult {
  engine: string;
  answer: string;
  citations: DiscoveredCitation[];
  userCited: boolean;
  duration: number;
}

interface QueryVerificationResult {
  query: string;
  queryType: string;
  citationRate: number;
  citedByEngines: number;
  totalEngines: number;
  engineResults: EngineQueryResult[];
}

interface QueryResultListProps {
  queryResults: QueryVerificationResult[];
  labels: {
    engineResult: string;
    citedBy: string;
    notCited: string;
    answerPreview: string;
    noAnswer: string;
    engineNames: Record<string, string>;
  };
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function QueryResultList({ queryResults, labels }: QueryResultListProps) {
  const [expandedQuery, setExpandedQuery] = useState<number | null>(null);

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="px-5 py-3.5">
        <p className="text-sm font-medium text-[var(--foreground)]">{labels.engineResult}</p>
      </div>
      <div className="border-t border-[var(--border)]">
        {queryResults.map((qr, i) => {
          const isExpanded = expandedQuery === i;
          const cited = qr.citationRate > 0;
          return (
            <div
              key={i}
              className={i < queryResults.length - 1 ? "border-b border-[var(--border)]" : ""}
            >
              <button
                type="button"
                onClick={() => setExpandedQuery(isExpanded ? null : i)}
                className="w-full px-5 py-3.5 text-left hover:bg-[var(--surface-muted)] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-[var(--foreground)] flex-1">{qr.query}</p>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[var(--gray-500)] shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--gray-500)] shrink-0 mt-0.5" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs mt-2">
                  <span className={`inline-flex items-center gap-1 ${
                    cited ? "text-green-600" : "text-red-600"
                  }`}>
                    {cited ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {cited ? labels.citedBy : labels.notCited}
                  </span>
                  <span className="text-xs text-[var(--gray-500)] tabular-nums">
                    {qr.citedByEngines}/{qr.totalEngines}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <EngineDetails engineResults={qr.engineResults} labels={labels} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EngineDetails({
  engineResults, labels,
}: {
  engineResults: EngineQueryResult[];
  labels: QueryResultListProps["labels"];
}) {
  return (
    <div className="px-5 pb-4 space-y-3 border-t border-[var(--border)] bg-[var(--surface-muted)]">
      {engineResults.map((er, ei) => (
        <div key={ei} className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--foreground)]">
              {labels.engineNames[er.engine] || er.engine}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className={er.userCited ? "text-green-600" : "text-[var(--gray-500)]"}>
                {er.userCited ? labels.citedBy : labels.notCited}
              </span>
              <span className="text-[var(--gray-500)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(er.duration)}
              </span>
            </div>
          </div>
          {er.answer ? (
            <div className="mb-2">
              <p className="text-xs text-[var(--gray-500)] mb-1.5 uppercase tracking-wider">
                {labels.answerPreview}
              </p>
              <div className="rounded-md bg-[var(--background)] border border-[var(--border)] p-3 max-h-64 overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none
                  prose-p:my-1.5 prose-p:text-[var(--foreground)] prose-p:text-xs prose-p:leading-relaxed
                  prose-headings:text-[var(--foreground)] prose-headings:text-sm prose-headings:font-medium
                  prose-ul:my-1.5 prose-ul:text-xs prose-li:my-0.5
                  prose-strong:text-[var(--foreground)] prose-strong:font-medium
                  prose-a:text-[var(--foreground)] prose-a:underline">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{er.answer}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--gray-500)] mb-2">{labels.noAnswer}</p>
          )}
          {er.citations.length > 0 && (
            <div className="space-y-1">
              {er.citations.slice(0, 5).map((c, ci) => (
                <div key={ci} className="text-xs px-2.5 py-1.5 rounded-md flex items-center gap-2 bg-[var(--background)]">
                  {c.isUserDomain ? (
                    <Check className="w-3 h-3 text-green-600 shrink-0" />
                  ) : (
                    <ExternalLink className="w-3 h-3 text-[var(--gray-500)] shrink-0" />
                  )}
                  <span className={`truncate ${c.isUserDomain ? "text-green-600 font-medium" : "text-[var(--gray-400)]"}`}>
                    {c.domain}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export type { QueryVerificationResult, EngineQueryResult };
