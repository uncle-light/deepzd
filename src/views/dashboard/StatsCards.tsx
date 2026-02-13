"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardsProps {
  totalAnalyses: number;
  avgScore: number | string;
  thisMonthCount: number;
  lastMonthCount?: number;
  prevAvgScore?: number | string;
  labels: {
    totalAnalyses: string;
    avgScore: string;
    thisMonth: string;
  };
}

export default function StatsCards({
  totalAnalyses,
  avgScore,
  thisMonthCount,
  lastMonthCount,
  prevAvgScore,
  labels,
}: StatsCardsProps) {
  const monthTrend = lastMonthCount != null && lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : null;

  const scoreTrend = typeof avgScore === "number" && typeof prevAvgScore === "number" && prevAvgScore > 0
    ? Math.round(((avgScore - prevAvgScore) / prevAvgScore) * 100)
    : null;

  const cards = [
    { label: labels.totalAnalyses, value: totalAnalyses },
    { label: labels.avgScore, value: avgScore, trend: scoreTrend },
    { label: labels.thisMonth, value: thisMonthCount, trend: monthTrend },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-[var(--border)] p-5"
        >
          <p className="text-xs text-[var(--gray-500)] mb-2">{card.label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-[var(--foreground)] tabular-nums tracking-tight">
              {card.value}
            </p>
            {card.trend != null && card.trend !== 0 && (
              <span className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${
                card.trend > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {card.trend > 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(card.trend)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
