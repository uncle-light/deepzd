"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X, Sparkles, Loader2 } from "lucide-react";

interface CompetitorInput {
  name: string;
  aliases: string[];
}

interface CompetitorSettingsSectionProps {
  competitors: CompetitorInput[];
  setCompetitors: (v: CompetitorInput[]) => void;
  brandNames: string[];
  locale: string;
  labels: {
    title: string;
    add: string;
    aiGenerate: string;
    aiGenerating: string;
    namePlaceholder: string;
    aliasPlaceholder: string;
    aliasCount: string;
    optional: string;
  };
}

export default function CompetitorSettingsSection({
  competitors,
  setCompetitors,
  brandNames,
  locale,
  labels,
}: CompetitorSettingsSectionProps) {
  const [suggesting, setSuggesting] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [aliasInput, setAliasInput] = useState("");

  const addCompetitor = () => {
    setCompetitors([...competitors, { name: "", aliases: [] }]);
    setEditingIdx(competitors.length);
  };

  const updateName = (idx: number, value: string) => {
    setCompetitors(competitors.map((c, i) => (i === idx ? { ...c, name: value } : c)));
  };

  const removeCompetitor = (idx: number) => {
    setCompetitors(competitors.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const addAlias = (idx: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setCompetitors(
      competitors.map((c, i) =>
        i === idx && !c.aliases.includes(trimmed)
          ? { ...c, aliases: [...c.aliases, trimmed] }
          : c,
      ),
    );
    setAliasInput("");
  };

  const removeAlias = (idx: number, alias: string) => {
    setCompetitors(
      competitors.map((c, i) =>
        i === idx ? { ...c, aliases: c.aliases.filter((a) => a !== alias) } : c,
      ),
    );
  };

  const handleAISuggest = async () => {
    if (brandNames.length === 0) return;
    setSuggesting(true);
    try {
      const res = await fetch("/api/monitors/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandNames, locale }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (Array.isArray(data.competitors) && data.competitors.length > 0) {
        const existing = new Set(competitors.map((c) => c.name.toLowerCase()));
        const newOnes = data.competitors.filter(
          (c: { name: string }) => !existing.has(c.name.toLowerCase()),
        );
        setCompetitors([...competitors, ...newOnes]);
      }
    } catch {
      // ignore
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          {labels.title}
          <span className="ml-2 text-[var(--gray-400)] font-normal text-xs">({labels.optional})</span>
        </h2>
        <div className="flex items-center gap-2">
          {brandNames.length > 0 && (
            <button
              onClick={handleAISuggest}
              disabled={suggesting}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
            >
              {suggesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {suggesting ? labels.aiGenerating : labels.aiGenerate}
            </button>
          )}
          <button
            onClick={addCompetitor}
            className="flex items-center gap-1.5 px-3 h-8 text-xs rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {labels.add}
          </button>
        </div>
      </div>

      {competitors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] py-8 text-center">
          <p className="text-xs text-[var(--gray-400)]">
            {locale === "zh" ? "暂无竞品，点击上方按钮添加" : "No competitors yet. Click above to add."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {competitors.map((comp, idx) => (
            <div
              key={idx}
              className="group rounded-lg border border-[var(--border)] transition-colors hover:border-[var(--gray-300)]"
            >
              {editingIdx === idx ? (
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) => updateName(idx, e.target.value)}
                    placeholder={labels.namePlaceholder}
                    className="w-full px-3 h-10 text-sm rounded-md border border-[var(--border)] bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent transition-shadow"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-md border border-[var(--border)] min-h-[36px]">
                    {comp.aliases.map((alias) => (
                      <span
                        key={alias}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)]"
                      >
                        {alias}
                        <button onClick={() => removeAlias(idx, alias)} className="text-[var(--gray-400)] hover:text-[var(--foreground)]">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addAlias(idx, aliasInput);
                        }
                      }}
                      onBlur={() => addAlias(idx, aliasInput)}
                      placeholder={labels.aliasPlaceholder}
                      className="flex-1 min-w-[100px] text-xs bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-sm text-[var(--foreground)]">
                      {comp.name || (locale === "zh" ? "未命名" : "Unnamed")}
                    </span>
                    {comp.aliases.length > 0 && (
                      <div className="flex items-center gap-1">
                        {comp.aliases.map((a) => (
                          <span
                            key={a}
                            className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--gray-500)]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                      className="p-1.5 rounded text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeCompetitor(idx)}
                      className="p-1.5 rounded text-[var(--gray-400)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
