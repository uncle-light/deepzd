"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Filter,
  ArrowRight,
  Search,
  AlertTriangle,
} from "lucide-react";

interface AnalysisItem {
  id: string;
  content_type: string;
  url: string | null;
  content: string | null;
  score: number | null;
  created_at: string;
}

interface HistoryClientProps {
  analyses: AnalysisItem[];
  locale: string;
  labels: {
    empty: string;
    delete: string;
    viewDetail: string;
    score: string;
    all: string;
    urlType: string;
    textType: string;
    today: string;
    thisWeek: string;
    earlier: string;
    confirmDelete: string;
    cancel: string;
  };
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-[var(--foreground)]";
  if (score >= 25) return "text-amber-600";
  return "text-red-600";
}

function groupByDate(
  items: AnalysisItem[],
  labels: { today: string; thisWeek: string; earlier: string },
) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const groups: { label: string; items: AnalysisItem[] }[] = [];
  const today: AnalysisItem[] = [];
  const thisWeek: AnalysisItem[] = [];
  const earlier: AnalysisItem[] = [];

  for (const item of items) {
    const d = new Date(item.created_at);
    if (d >= todayStart) today.push(item);
    else if (d >= weekStart) thisWeek.push(item);
    else earlier.push(item);
  }

  if (today.length) groups.push({ label: labels.today, items: today });
  if (thisWeek.length) groups.push({ label: labels.thisWeek, items: thisWeek });
  if (earlier.length) groups.push({ label: labels.earlier, items: earlier });

  return groups;
}

export default function HistoryClient({ analyses, locale, labels }: HistoryClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "url" | "text">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = filter === "all"
    ? analyses
    : analyses.filter((a) => a.content_type === filter);

  const groups = groupByDate(filtered, {
    today: labels.today,
    thisWeek: labels.thisWeek,
    earlier: labels.earlier,
  });

  const isZh = locale === "zh";

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/analyses/${deleteId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  // Empty state
  if (analyses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] py-16">
        <div className="flex flex-col items-center">
          <Search className="w-5 h-5 text-[var(--gray-400)] mb-4" />
          <p className="text-sm font-medium text-[var(--gray-400)]">{labels.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-3.5 h-3.5 text-[var(--gray-500)]" />
        {(["all", "url", "text"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              filter === f
                ? "border-[var(--foreground)] text-[var(--foreground)] bg-[var(--foreground)]/5"
                : "border-[var(--border)] text-[var(--gray-500)] hover:border-[var(--gray-400)] hover:text-[var(--foreground)]"
            }`}
          >
            {f === "all" ? labels.all : f === "url" ? labels.urlType : labels.textType}
          </button>
        ))}
        <span className="ml-auto text-xs text-[var(--gray-500)]">
          {filtered.length} {isZh ? "条记录" : "records"}
        </span>
      </div>

      {/* Grouped list */}
      {groups.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--gray-500)]">{labels.empty}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-[var(--gray-500)] mb-2 px-1">{group.label}</p>
              <div className="rounded-lg border border-[var(--border)] overflow-hidden">
                {group.items.map((item, i) => (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--surface-muted)] transition-colors cursor-pointer ${
                      i < group.items.length - 1 ? "border-b border-[var(--border)]" : ""
                    }`}
                    onClick={() => router.push(`/${locale}/dashboard/history/${item.id}`)}
                  >
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)] truncate">
                        {item.url || item.content?.slice(0, 60) || item.content_type}
                      </p>
                      <p className="text-xs text-[var(--gray-500)] mt-0.5">
                        {new Date(item.created_at).toLocaleDateString(
                          isZh ? "zh-CN" : "en-US",
                          { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>

                    {/* Score badge */}
                    {item.score != null && (
                      <span className={`shrink-0 text-sm font-medium tabular-nums ${getScoreColor(item.score)}`}>
                        {item.score}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                        className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-[var(--gray-500)] hover:text-red-600 transition-all"
                        aria-label={labels.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--gray-500)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div
            className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-6 max-w-sm mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-[var(--foreground)]">{labels.confirmDelete}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
              >
                {labels.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? "..." : labels.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
