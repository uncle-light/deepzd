"use client";

interface CompetitorDomain {
  domain: string;
  queryCount: number;
  engineCount: number;
}

interface CompetitorRankingProps {
  competitors: CompetitorDomain[];
  labels: {
    title: string;
    queries: string;
    engines: string;
  };
}

export default function CompetitorRanking({ competitors, labels }: CompetitorRankingProps) {
  if (!competitors || competitors.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="px-5 py-3.5">
        <p className="text-sm font-medium text-[var(--foreground)]">{labels.title}</p>
      </div>
      <div className="border-t border-[var(--border)]">
        {competitors.slice(0, 8).map((c, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-5 py-2.5 ${
              i < Math.min(competitors.length, 8) - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-5 text-right shrink-0 text-xs tabular-nums ${
                i < 3 ? "font-medium text-[var(--foreground)]" : "text-[var(--gray-500)]"
              }`}>
                {i + 1}
              </span>
              <span className="text-sm text-[var(--foreground)] truncate">{c.domain}</span>
            </div>
            <div className="flex items-center gap-4 shrink-0 text-xs text-[var(--gray-500)]">
              <span>{c.queryCount} {labels.queries}</span>
              <span>{c.engineCount} {labels.engines}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { CompetitorDomain };
