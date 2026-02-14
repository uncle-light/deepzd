"use client";

import { useState, useRef, KeyboardEvent, type Dispatch, type SetStateAction } from "react";
import { Plus, Sparkles, Loader2, ChevronDown, ChevronRight, X } from "lucide-react";
import QuestionRow from "./QuestionRow";
import type { MonitorQuestion, QuestionGroup, QuestionIntentType } from "@/lib/geo/domain/monitor-types";

interface QuestionSettingsSectionProps {
  monitorId: string | null;
  questions: QuestionGroup[];
  setQuestions: Dispatch<SetStateAction<QuestionGroup[]>>;
  coreKeywords: string[];
  setCoreKeywords: Dispatch<SetStateAction<string[]>>;
  brandNames: string[];
  locale: string;
  labels: {
    title: string;
    generate: string;
    generating: string;
    coreKeywords: string;
    coreKeywordsHint: string;
    addQuestion: string;
    questionPlaceholder: string;
    questionCount: string;
    recommendation: string;
    comparison: string;
    inquiry: string;
    evaluation: string;
    tutorial: string;
    pricing: string;
    save: string;
    cancel: string;
    empty: string;
    optional: string;
  };
}

export default function QuestionSettingsSection({
  monitorId,
  questions,
  setQuestions,
  coreKeywords,
  setCoreKeywords,
  brandNames,
  locale,
  labels,
}: QuestionSettingsSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [kwInput, setKwInput] = useState("");
  const [expandedKw, setExpandedKw] = useState<Set<string>>(new Set());
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const kwRef = useRef<HTMLInputElement>(null);

  const addKeyword = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !coreKeywords.includes(trimmed)) {
      setCoreKeywords([...coreKeywords, trimmed]);
    }
    setKwInput("");
  };

  const handleKwKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(kwInput);
    }
  };

  const removeKeyword = (kw: string) => {
    setCoreKeywords(coreKeywords.filter((k) => k !== kw));
    setQuestions(questions.filter((g) => g.coreKeyword !== kw));
  };

  const toggleExpand = (kw: string) => {
    setExpandedKw((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (coreKeywords.length === 0) return;
    setGenerating(true);

    try {
      if (monitorId) {
        const res = await fetch(`/api/monitors/${monitorId}/questions/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coreKeywords }),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        const groupMap = new Map<string, MonitorQuestion[]>();
        for (const g of questions) {
          groupMap.set(g.coreKeyword, [...g.questions]);
        }
        for (const row of data.questions ?? []) {
          const q: MonitorQuestion = {
            id: row.id,
            monitorId: row.monitor_id,
            coreKeyword: row.core_keyword,
            question: row.question,
            intentType: row.intent_type,
            searchVolume: row.search_volume,
            sortOrder: row.sort_order,
            enabled: row.enabled,
            tags: row.tags ?? [],
          };
          const list = groupMap.get(q.coreKeyword) ?? [];
          list.push(q);
          groupMap.set(q.coreKeyword, list);
        }

        setQuestions(
          Array.from(groupMap.entries()).map(([coreKeyword, qs]) => ({
            coreKeyword,
            questions: qs,
          })),
        );
      } else {
        const res = await fetch("/api/monitors/questions-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName: brandNames[0] ?? "",
            coreKeywords,
            locale,
          }),
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          const groupMap = new Map<string, MonitorQuestion[]>();
          for (const g of questions) {
            groupMap.set(g.coreKeyword, [...g.questions]);
          }
          for (const row of data.questions ?? []) {
            const q: MonitorQuestion = {
              id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              monitorId: "",
              coreKeyword: row.coreKeyword,
              question: row.question,
              intentType: row.intentType,
              searchVolume: row.searchVolume ?? 0,
              sortOrder: (groupMap.get(row.coreKeyword)?.length ?? 0),
              enabled: true,
              tags: [],
            };
            const list = groupMap.get(q.coreKeyword) ?? [];
            list.push(q);
            groupMap.set(q.coreKeyword, list);
          }
          setQuestions(
            Array.from(groupMap.entries()).map(([coreKeyword, qs]) => ({
              coreKeyword,
              questions: qs,
            })),
          );
        } else {
          const newGroups = coreKeywords
            .filter((kw) => !questions.some((g) => g.coreKeyword === kw))
            .map((kw) => ({ coreKeyword: kw, questions: [] as MonitorQuestion[] }));
          setQuestions([...questions, ...newGroups]);
        }
      }

      setExpandedKw(new Set(coreKeywords));
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateQuestion = (
    groupIdx: number,
    qId: string,
    data: { question?: string; intentType?: QuestionIntentType; enabled?: boolean; tags?: string[] },
  ) => {
    setQuestions(
      questions.map((g, gi) =>
        gi === groupIdx
          ? {
              ...g,
              questions: g.questions.map((q) =>
                q.id === qId ? { ...q, ...data } : q,
              ),
            }
          : g,
      ),
    );

    if (monitorId) {
      const body: Record<string, unknown> = {};
      if (data.question !== undefined) body.question = data.question;
      if (data.intentType !== undefined) body.intentType = data.intentType;
      if (data.enabled !== undefined) body.enabled = data.enabled;
      if (data.tags !== undefined) body.tags = data.tags;

      fetch(`/api/monitors/${monitorId}/questions/${qId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    }
  };

  const handleDeleteQuestion = (groupIdx: number, qId: string) => {
    setQuestions(
      questions
        .map((g, gi) =>
          gi === groupIdx
            ? { ...g, questions: g.questions.filter((q) => q.id !== qId) }
            : g,
        )
        .filter((g) => g.questions.length > 0),
    );

    if (monitorId) {
      fetch(`/api/monitors/${monitorId}/questions/${qId}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  };

  const handleAddQuestion = (groupIdx: number, keyword: string) => {
    if (!newQuestion.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const q: MonitorQuestion = {
      id: tempId,
      monitorId: monitorId ?? "",
      coreKeyword: keyword,
      question: newQuestion.trim(),
      intentType: "recommendation",
      searchVolume: 0,
      sortOrder: questions[groupIdx]?.questions.length ?? 0,
      enabled: true,
      tags: [],
    };

    setQuestions(
      questions.map((g, gi) =>
        gi === groupIdx ? { ...g, questions: [...g.questions, q] } : g,
      ),
    );

    if (monitorId) {
      fetch(`/api/monitors/${monitorId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coreKeyword: keyword,
          question: newQuestion.trim(),
          intentType: "recommendation",
        }),
      })
        .then((r) => r.json())
        .then((saved) => {
          setQuestions((prev) =>
            prev.map((g) => ({
              ...g,
              questions: g.questions.map((qq) =>
                qq.id === tempId ? { ...qq, id: saved.id } : qq,
              ),
            })),
          );
        })
        .catch(() => {});
    }

    setNewQuestion("");
    setAddingTo(null);
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          {labels.title}
          <span className="ml-2 text-[var(--gray-400)] font-normal text-xs">({labels.optional})</span>
        </h2>
        <button
          onClick={handleGenerate}
          disabled={generating || coreKeywords.length === 0}
          className="flex items-center gap-1.5 px-3 h-8 text-xs rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {generating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {generating ? labels.generating : labels.generate}
        </button>
      </div>

      <div className="space-y-5">
        {/* Core keywords tag input */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {labels.coreKeywords}
          </label>
          <div
            className="flex flex-wrap gap-2 p-2.5 rounded-md border border-[var(--border)] min-h-[42px] cursor-text focus-within:ring-2 focus-within:ring-[var(--foreground)] focus-within:border-transparent transition-shadow"
            onClick={() => kwRef.current?.focus()}
          >
            {coreKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)]"
              >
                {kw}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeKeyword(kw);
                  }}
                  className="text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              ref={kwRef}
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={handleKwKeyDown}
              onBlur={() => addKeyword(kwInput)}
              placeholder={coreKeywords.length === 0 ? labels.coreKeywordsHint : ""}
              className="flex-1 min-w-[120px] text-sm bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none"
            />
          </div>
        </div>

        {/* Empty state */}
        {questions.length === 0 && coreKeywords.length > 0 && (
          <div className="rounded-lg border border-dashed border-[var(--border)] py-8 text-center">
            <p className="text-xs text-[var(--gray-400)]">{labels.empty}</p>
          </div>
        )}

        {/* Question groups */}
        {questions.map((group, gi) => {
          const isExpanded = expandedKw.has(group.coreKeyword);
          const enabledCount = group.questions.filter((q) => q.enabled).length;

          return (
            <div
              key={group.coreKeyword}
              className="rounded-lg border border-[var(--border)] transition-colors hover:border-[var(--gray-300)]"
            >
              <button
                onClick={() => toggleExpand(group.coreKeyword)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--gray-400)] shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--gray-400)] shrink-0" />
                )}
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {group.coreKeyword}
                </span>
                <span className="text-xs text-[var(--gray-500)]">
                  {labels.questionCount
                    .replace("%count%", String(enabledCount))
                    .replace("%total%", String(group.questions.length))}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-[var(--border)]">
                  <div className="py-1">
                    {group.questions.map((q) => (
                      <QuestionRow
                        key={q.id}
                        id={q.id}
                        question={q.question}
                        intentType={q.intentType}
                        searchVolume={q.searchVolume}
                        enabled={q.enabled}
                        tags={q.tags}
                        locale={locale}
                        labels={{
                          recommendation: labels.recommendation,
                          comparison: labels.comparison,
                          inquiry: labels.inquiry,
                          evaluation: labels.evaluation,
                          tutorial: labels.tutorial,
                          pricing: labels.pricing,
                          save: labels.save,
                          cancel: labels.cancel,
                        }}
                        onUpdate={(id, data) => handleUpdateQuestion(gi, id, data)}
                        onDelete={(id) => handleDeleteQuestion(gi, id)}
                      />
                    ))}
                  </div>

                  {/* Add question inline */}
                  <div className="border-t border-[var(--border)]">
                    {addingTo === group.coreKeyword ? (
                      <div className="flex items-center gap-2 px-4 py-3">
                        <input
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder={labels.questionPlaceholder}
                          className="flex-1 px-3 h-10 text-sm rounded-md border border-[var(--border)] bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddQuestion(gi, group.coreKeyword);
                            if (e.key === "Escape") {
                              setAddingTo(null);
                              setNewQuestion("");
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddQuestion(gi, group.coreKeyword)}
                          className="px-2.5 py-1.5 text-xs rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
                        >
                          {labels.save}
                        </button>
                        <button
                          onClick={() => {
                            setAddingTo(null);
                            setNewQuestion("");
                          }}
                          className="px-2.5 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
                        >
                          {labels.cancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTo(group.coreKeyword)}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {labels.addQuestion}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
