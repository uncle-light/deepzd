"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Pencil, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import type { QuestionIntentType } from "@/lib/geo/domain/monitor-types";

interface QuestionRowProps {
  id: string;
  question: string;
  intentType: QuestionIntentType;
  searchVolume: number;
  enabled: boolean;
  tags: string[];
  locale: string;
  labels: {
    recommendation: string;
    comparison: string;
    inquiry: string;
    evaluation: string;
    tutorial: string;
    pricing: string;
    save: string;
    cancel: string;
  };
  onUpdate: (id: string, data: { question?: string; intentType?: QuestionIntentType; enabled?: boolean; tags?: string[] }) => void;
  onDelete: (id: string) => void;
}

const INTENT_COLORS: Record<QuestionIntentType, string> = {
  recommendation: "text-blue-600 bg-blue-500/10 border-blue-500/20",
  comparison: "text-orange-600 bg-orange-500/10 border-orange-500/20",
  inquiry: "text-purple-600 bg-purple-500/10 border-purple-500/20",
  evaluation: "text-green-600 bg-green-500/10 border-green-500/20",
  tutorial: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20",
  pricing: "text-amber-600 bg-amber-500/10 border-amber-500/20",
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
  tags,
  locale: _locale,
  labels,
  onUpdate,
  onDelete,
}: QuestionRowProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(question);
  const [editIntent, setEditIntent] = useState(intentType);
  const [editTags, setEditTags] = useState<string[]>(tags);
  const [tagInput, setTagInput] = useState("");
  const tagRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!editText.trim()) return;
    onUpdate(id, { question: editText.trim(), intentType: editIntent, tags: editTags });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditText(question);
    setEditIntent(intentType);
    setEditTags(tags);
    setTagInput("");
    setEditing(false);
  };

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  if (editing) {
    return (
      <div className="mx-3 my-1.5 p-4 rounded-md bg-[var(--surface-muted)] space-y-3">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full px-3 h-10 text-sm rounded-md border border-[var(--border)] bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="flex items-center gap-2.5">
          <select
            value={editIntent}
            onChange={(e) => setEditIntent(e.target.value as QuestionIntentType)}
            className="px-2 py-1 text-xs rounded-md border border-[var(--border)] bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]"
          >
            <option value="recommendation">{labels.recommendation}</option>
            <option value="comparison">{labels.comparison}</option>
            <option value="inquiry">{labels.inquiry}</option>
            <option value="evaluation">{labels.evaluation}</option>
            <option value="tutorial">{labels.tutorial}</option>
            <option value="pricing">{labels.pricing}</option>
          </select>
          {/* Tag input */}
          <div
            className="flex flex-wrap items-center gap-1 flex-1 min-w-0 px-2 py-1 rounded-md border border-[var(--border)] cursor-text focus-within:ring-2 focus-within:ring-[var(--foreground)] focus-within:border-transparent"
            onClick={() => tagRef.current?.focus()}
          >
            {editTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-[var(--foreground)]/8 text-[var(--foreground)] border border-[var(--border)]"
              >
                {tag}
                <button
                  onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                  className="text-[var(--gray-400)] hover:text-[var(--foreground)]"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <input
              ref={tagRef}
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => addTag(tagInput)}
              placeholder={editTags.length === 0 ? "标签..." : ""}
              className="flex-1 min-w-[60px] text-[10px] bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            {labels.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
          >
            {labels.save}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-3 mx-3 px-3 py-2.5 rounded-md transition-colors hover:bg-[var(--surface-muted)] ${
        !enabled ? "opacity-40" : ""
      }`}
    >
      <span className="flex-1 text-sm text-[var(--foreground)] truncate min-w-0">
        {question}
      </span>
      {tags.length > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--foreground)]/8 text-[var(--gray-500)] border border-[var(--border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <span
        className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${INTENT_COLORS[intentType]}`}
      >
        {labels[intentType]}
      </span>
      {searchVolume > 0 && (
        <span className="text-xs text-[var(--gray-500)] tabular-nums shrink-0 w-10 text-right">
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
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(id)}
          className="p-1 rounded text-[var(--gray-400)] hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
