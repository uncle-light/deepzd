"use client";

import Link from "next/link";
import { Plus, Radar, ChevronRight, Clock } from "lucide-react";

interface MonitorItem {
  id: string;
  name: string;
  brand_names: string[];
  industry_keywords: string[];
  created_at: string;
  latestCheck: {
    id: string;
    status: string;
    summary: { mentionRate: number; avgPosition: number } | null;
    created_at: string;
  } | null;
}

interface MonitorListProps {
  monitors: MonitorItem[];
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    create: string;
    empty: string;
    emptyDesc: string;
    lastCheck: string;
    never: string;
    mentionRate: string;
    avgPosition: string;
  };
}

export default function MonitorList({ monitors, locale, labels }: MonitorListProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
            {labels.title}
          </h1>
          <p className="text-sm text-[var(--gray-500)] mt-1">{labels.subtitle}</p>
        </div>
        <Link
          href={`/${locale}/dashboard/monitors/new`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {labels.create}
        </Link>
      </div>

      {/* List */}
      {monitors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Radar className="w-10 h-10 text-[var(--gray-400)] mb-3" />
          <p className="text-sm font-medium text-[var(--foreground)]">{labels.empty}</p>
          <p className="text-xs text-[var(--gray-500)] mt-1 max-w-xs">{labels.emptyDesc}</p>
          <Link
            href={`/${locale}/dashboard/monitors/new`}
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {labels.create}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {monitors.map((m) => (
            <Link
              key={m.id}
              href={`/${locale}/dashboard/monitors/${m.id}`}
              className="group flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-[var(--foreground)]">{m.name}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-[var(--gray-500)]">
                    {m.brand_names.join(", ")}
                  </span>
                  <span className="text-xs text-[var(--gray-500)]">·</span>
                  <span className="text-xs text-[var(--gray-500)]">
                    {m.industry_keywords.slice(0, 3).join(", ")}
                  </span>
                </div>
                {m.latestCheck ? (
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-[var(--gray-500)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {labels.lastCheck}: {new Date(m.latestCheck.created_at).toLocaleDateString(
                        locale === "zh" ? "zh-CN" : "en-US",
                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                    {m.latestCheck.summary && (
                      <>
                        <span className="text-xs text-[var(--gray-500)]">
                          {labels.mentionRate}: {Math.round(m.latestCheck.summary.mentionRate * 100)}%
                        </span>
                        {m.latestCheck.summary.avgPosition > 0 && (
                          <span className="text-xs text-[var(--gray-500)]">
                            {labels.avgPosition}: #{m.latestCheck.summary.avgPosition}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--gray-500)] mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {labels.lastCheck}: {labels.never}
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--gray-400)] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
