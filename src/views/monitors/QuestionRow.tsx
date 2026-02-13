"use client";

import { useState } from "react";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { QuestionIntentType } from "@/lib/geo/domain/monitor-types";

interface QuestionRowProps {
  id: string;
  question: string;
  intentType: QuestionIntentType;
  searchVolume: number;
  enabled: boolean;
  locale: string;
  labels: {
    recommendation: string;
    comparison: string;
    inquiry: string;
    save: string;
    cancel: string;
  };
  onUpdate: (id: string, data: { question?: string; intentType?: QuestionIntentType; enabled?: boolean }) => void;
  onDelete: (id: string) => void;
}

const INTENT_COLORS: Record<QuestionIntentType, string> = {
  recommendation: "text-blue-600 bg-blue-500/10 border-blue-500/20",
  comparison: "text-orange-600 bg-orange-500/10 border-orange-500/20",
  inquiry: "text-purple-600 bg-purple-500/10 border-purple-500/20",
};

function formatVolume(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}w`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

export default function QuestionRow({
  id,
  question,
  intentType,
  searchVolume,
  enabled,
  locale: _locale,
  labels,
  onUpdate,
  onDelete,
}: QuestionRowProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(question);
  const [editIntent, setEditIntent] = useState(intentType);

  const handleSave = () => {
    if (!editText.trim()) return;
    onUpdate(id, { question: editText.trim(), intentType: editIntent });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditText(question);
    setEditIntent(intentType);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mx-2 my-1 p-3 rounded-md bg-[var(--surface-muted)] space-y-2">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full px-3 py-1.5 text-sm rounded-md border border-[var(--border)] bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-1 focus:ring-[var(--gray-400)]"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="flex items-center gap-2">
          <select
            value={editIntent}
            onChange={(e) => setEditIntent(e.target.value as QuestionIntentType)}
            className="px-2 py-1 text-xs rounded-md border border-[var(--border)] bg-transparent text-[var(--foreground)] focus:outline-none"
          >
            <option value="recommendation">{labels.recommendation}</option>
            <option value="comparison">{labels.comparison}</option>
            <option value="inquiry">{labels.inquiry}</option>
          </select>
          <div className="flex-1" />
          <button
            onClick={handleCancel}
            className="px-2.5 py-1 text-xs rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            {labels.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-2.5 py-1 text-xs rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
          >
            {labels.save}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-3 mx-2 px-2 py-2 rounded-md transition-colors hover:bg-[var(--surface-muted)] ${
        !enabled ? "opacity-40" : ""
      }`}
    >
      <span className="flex-1 text-sm text-[var(--foreground)] truncate min-w-0">
        {question}
      </span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${INTENT_COLORS[intentType]}`}
      >
        {labels[intentType]}
      </span>
      {searchVolume > 0 && (
        <span className="text-[11px] text-[var(--gray-500)] tabular-nums shrink-0 w-10 text-right">
          {formatVolume(searchVolume)}
        </span>
      )}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onUpdate(id, { enabled: !enabled })}
          className="p-1 rounded text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors"
        >
          {enabled ? (
            <ToggleRight className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <ToggleLeft className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="p-1 rounded text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(id)}
          className="p-1 rounded text-[var(--gray-400)] hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
