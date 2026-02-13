"use client";

import { TrendingUp } from "lucide-react";

interface ContentStats {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

interface ScoreOverviewProps {
  contentType: 'url' | 'text';
  score: number;
  topic?: string;
  contentStats?: ContentStats;
  userDomain?: string;
  citedCount?: number;
  totalCount?: number;
  labels: {
    urlTitle: string;
    textTitle: string;
    citationRate: string;
    queriesCited: string;
    qualityScore: string;
    topic: string;
    wordCount: string;
    charCount: string;
    gradeLabel: string;
    gradeName: string;
    gradeDesc: string;
    disclaimer: string;
    textDisclaimer: string;
  };
}

function getGrade(score: number): 'a' | 'b' | 'c' | 'd' {
  if (score >= 75) return 'a';
  if (score >= 50) return 'b';
  if (score >= 25) return 'c';
  return 'd';
}

const GRADE_COLORS: Record<string, string> = {
  a: 'text-green-600',
  b: 'text-blue-600',
  c: 'text-amber-600',
  d: 'text-red-600',
};

export default function ScoreOverview({
  contentType, score, topic, contentStats,
  userDomain, citedCount, totalCount, labels,
}: ScoreOverviewProps) {
  if (contentType === 'url') {
    const ratePercent = score;
    const hasEmbeddedCount = labels.queriesCited.includes("/");
    const queriesCitedText =
      hasEmbeddedCount || citedCount == null || totalCount == null
        ? labels.queriesCited
        : `${citedCount}/${totalCount} ${labels.queriesCited}`;

    return (
      <div className="rounded-lg border border-[var(--border)] p-5">
        <p className="text-xs text-[var(--gray-500)] mb-4">{labels.urlTitle}</p>

        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-4xl font-semibold text-[var(--foreground)] tabular-nums tracking-tight">
              {ratePercent}<span className="text-lg text-[var(--gray-400)]">%</span>
            </p>
            <p className="text-xs text-[var(--gray-500)] mt-1">{labels.citationRate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--gray-500)]">{queriesCitedText}</p>
            {userDomain && <p className="text-xs text-[var(--gray-500)] mt-0.5 font-mono">{userDomain}</p>}
          </div>
        </div>

        <div className="h-1 bg-[var(--surface-muted)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              ratePercent >= 50 ? "bg-green-600" : ratePercent > 0 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${Math.max(ratePercent, 2)}%` }}
          />
        </div>

        {topic && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--gray-400)]" />
            <span className="text-xs text-[var(--gray-500)]">
              {labels.topic}: <span className="text-[var(--foreground)]">{topic}</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Text quality mode
  const grade = getGrade(score);
  return (
    <div className="rounded-lg border border-[var(--border)] p-5">
      <p className="text-xs text-[var(--gray-500)] mb-4">{labels.textTitle}</p>

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`text-3xl font-semibold tabular-nums ${GRADE_COLORS[grade]}`}>
            {labels.gradeLabel}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{labels.gradeName}</p>
            <p className="text-xs text-[var(--gray-500)] tabular-nums">{score}/100</p>
          </div>
        </div>
        {contentStats && (
          <div className="text-right text-xs text-[var(--gray-500)] space-y-0.5">
            <p>{contentStats.wordCount} {labels.wordCount}</p>
            <p>{contentStats.charCount} {labels.charCount}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--gray-500)] mb-1">{labels.gradeDesc}</p>
      <p className="text-xs text-[var(--gray-500)] mb-3">{labels.disclaimer}</p>
      <p className="text-xs text-[var(--gray-500)] p-3 rounded-md bg-[var(--surface-muted)]">{labels.textDisclaimer}</p>

      {topic && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[var(--gray-400)]" />
          <span className="text-xs text-[var(--gray-500)]">
            {labels.topic}: <span className="text-[var(--foreground)]">{topic}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export { getGrade, GRADE_COLORS };
export type { ContentStats };
