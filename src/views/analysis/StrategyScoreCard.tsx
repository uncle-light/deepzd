"use client";

import { Loader2, Wand2 } from "lucide-react";

interface StrategyScoreInfo {
  strategy: string;
  score: number;
  label: string;
  description: string;
  suggestions: string[];
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function getBarColor(score: number): string {
  if (score >= 70) return "bg-green-600";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

interface StrategyScoreCardProps {
  strategyScores: StrategyScoreInfo[];
  title: string;
  onOptimize?: (strategy: string) => void;
  optimizing?: string | null;
  optimizeLabel?: string;
}

export default function StrategyScoreCard({
  strategyScores, title, onOptimize, optimizing, optimizeLabel,
}: StrategyScoreCardProps) {
  if (!strategyScores || strategyScores.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="px-5 py-3.5">
        <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      </div>
      <div className="border-t border-[var(--border)]">
        {strategyScores.map((s, i) => (
          <div
            key={s.strategy}
            className={`px-5 py-3.5 ${
              i < strategyScores.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-[var(--foreground)]">{s.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium tabular-nums ${getScoreColor(s.score)}`}>
                  {s.score}
                </span>
                {onOptimize && optimizeLabel && s.score < 70 && (
                  <button
                    onClick={() => onOptimize(s.strategy)}
                    disabled={optimizing === s.strategy || !!optimizing}
                    className="px-2 py-1 text-xs rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] disabled:opacity-50 flex items-center gap-1 transition-colors"
                  >
                    {optimizing === s.strategy ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {optimizeLabel}
                  </button>
                )}
              </div>
            </div>
            <div className="h-1 bg-[var(--surface-muted)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(s.score)}`}
                style={{ width: `${s.score}%` }}
              />
            </div>
            {s.suggestions.length > 0 && (
              <p className="text-xs text-[var(--gray-500)] mt-1.5 leading-relaxed">
                {s.suggestions[0]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type { StrategyScoreInfo };
