"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface EditData {
  id: string;
  name: string;
  brandNames: string[];
  competitorBrands: { name: string; aliases: string[] }[];
  industryKeywords: string[];
}

interface CreateMonitorModalProps {
  locale: string;
  onClose: () => void;
  onCreated: (monitor: Record<string, unknown>) => void;
  editData?: EditData;
}

interface CompetitorInput {
  name: string;
  aliases: string[];
}

export default function CreateMonitorModal({ locale, onClose, onCreated, editData }: CreateMonitorModalProps) {
  const t = useTranslations("monitors.form");
  const isEdit = !!editData;
  const [name, setName] = useState(editData?.name ?? "");
  const [brandNames, setBrandNames] = useState<string[]>(editData?.brandNames ?? []);
  const [brandInput, setBrandInput] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorInput[]>(editData?.competitorBrands ?? []);
  const [keywords, setKeywords] = useState<string[]>(editData?.industryKeywords ?? []);
  const [keywordInput, setKeywordInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState("");

  const brandRef = useRef<HTMLInputElement>(null);
  const kwRef = useRef<HTMLInputElement>(null);

  const addTag = (
    value: string,
    list: string[],
    setter: (v: string[]) => void,
    inputSetter: (v: string) => void,
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setter([...list, trimmed]);
    }
    inputSetter("");
  };

  const handleTagKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    value: string,
    list: string[],
    setter: (v: string[]) => void,
    inputSetter: (v: string) => void,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(value, list, setter, inputSetter);
    }
  };

  const addCompetitor = () => {
    setCompetitors((prev) => [...prev, { name: "", aliases: [] }]);
  };

  const updateCompetitor = (idx: number, field: "name", value: string) => {
    setCompetitors((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const removeCompetitor = (idx: number) => {
    setCompetitors((prev) => prev.filter((_, i) => i !== idx));
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
        setCompetitors((prev) => {
          const existing = new Set(prev.map((c) => c.name.toLowerCase()));
          const newOnes = data.competitors.filter(
            (c: { name: string }) => !existing.has(c.name.toLowerCase()),
          );
          return [...prev, ...newOnes];
        });
      }
      if (Array.isArray(data.keywords) && data.keywords.length > 0) {
        setKeywords((prev) => {
          const existing = new Set(prev.map((k) => k.toLowerCase()));
          const newOnes = data.keywords.filter(
            (k: string) => !existing.has(k.toLowerCase()),
          );
          return [...prev, ...newOnes];
        });
      }
    } catch {
      // ignore
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || brandNames.length === 0 || keywords.length === 0) {
      setError(locale === "zh" ? "请填写必填字段" : "Please fill required fields");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        brandNames,
        competitorBrands: competitors
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            aliases: c.aliases.filter(Boolean),
          })),
        industryKeywords: keywords,
        locale,
      };

      const res = await fetch(
        isEdit ? `/api/monitors/${editData.id}` : "/api/monitors",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }

      const monitor = await res.json();
      onCreated(monitor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-[var(--background)] rounded-lg border border-[var(--border)] shadow-xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {isEdit ? t("editTitle") : t("name")}
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Monitor name */}
          <div>
            <label className="block text-xs font-medium text-[var(--gray-500)] mb-1.5">
              {t("name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]"
            />
          </div>

          {/* Brand names (tag input) */}
          <div>
            <label className="block text-xs font-medium text-[var(--gray-500)] mb-1.5">
              {t("brandNames")}
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-[var(--border)] min-h-[38px]">
              {brandNames.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-[var(--surface-muted)] text-[var(--foreground)]"
                >
                  {tag}
                  <button onClick={() => setBrandNames((prev) => prev.filter((t) => t !== tag))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                ref={brandRef}
                type="text"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onKeyDown={(e) => handleTagKeyDown(e, brandInput, brandNames, setBrandNames, setBrandInput)}
                onBlur={() => addTag(brandInput, brandNames, setBrandNames, setBrandInput)}
                placeholder={brandNames.length === 0 ? t("brandNamesHint") : ""}
                className="flex-1 min-w-[120px] text-sm bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none"
              />
            </div>
          </div>

          {/* AI Suggest button */}
          {brandNames.length > 0 && (
            <button
              onClick={handleAISuggest}
              disabled={suggesting}
              className="flex items-center gap-1.5 text-xs text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
            >
              {suggesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {suggesting ? t("aiSuggesting") : t("aiSuggest")}
            </button>
          )}

          {/* Competitors */}
          <div>
            <label className="block text-xs font-medium text-[var(--gray-500)] mb-1.5">
              {t("competitors")}
            </label>
            <div className="space-y-2">
              {competitors.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) => updateCompetitor(idx, "name", e.target.value)}
                    placeholder={locale === "zh" ? "竞品名称" : "Competitor name"}
                    className="flex-1 px-3 py-1.5 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]"
                  />
                  <button
                    onClick={() => removeCompetitor(idx)}
                    className="p-1 text-[var(--gray-400)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addCompetitor}
                className="flex items-center gap-1 text-xs text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
              >
                <Plus className="w-3 h-3" />
                {t("addCompetitor")}
              </button>
            </div>
          </div>

          {/* Industry keywords (tag input) */}
          <div>
            <label className="block text-xs font-medium text-[var(--gray-500)] mb-1.5">
              {t("keywords")}
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-[var(--border)] min-h-[38px]">
              {keywords.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-[var(--surface-muted)] text-[var(--foreground)]"
                >
                  {tag}
                  <button onClick={() => setKeywords((prev) => prev.filter((t) => t !== tag))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                ref={kwRef}
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => handleTagKeyDown(e, keywordInput, keywords, setKeywords, setKeywordInput)}
                onBlur={() => addTag(keywordInput, keywords, setKeywords, setKeywordInput)}
                placeholder={keywords.length === 0 ? t("keywordsHint") : ""}
                className="flex-1 min-w-[120px] text-sm bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "..." : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
