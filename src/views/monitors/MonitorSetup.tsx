"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Sparkles, Save } from "lucide-react";
import Link from "next/link";
import BrandSettingsSection from "./BrandSettingsSection";
import CompetitorSettingsSection from "./CompetitorSettingsSection";
import QuestionSettingsSection from "./QuestionSettingsSection";
import type { QuestionGroup } from "@/lib/geo/domain/monitor-types";

interface CompetitorInput {
  name: string;
  aliases: string[];
}

interface MonitorSetupProps {
  locale: string;
  /** null = create mode, string = edit mode */
  monitorId: string | null;
  initialData?: {
    name: string;
    brandNames: string[];
    brandWebsite: string;
    brandDescription: string;
    competitorBrands: CompetitorInput[];
    industryKeywords: string[];
  };
}

export default function MonitorSetup({
  locale,
  monitorId,
  initialData,
}: MonitorSetupProps) {
  const ts = useTranslations("monitors.setup");
  const tb = useTranslations("monitors.brand");
  const tc = useTranslations("monitors.competitor");
  const tq = useTranslations("monitors.questions");
  const router = useRouter();

  // Brand settings state
  const [name, setName] = useState(initialData?.name ?? "");
  const [brandName, setBrandName] = useState("");
  const [brandWebsite, setBrandWebsite] = useState(initialData?.brandWebsite ?? "");
  const [brandDescription, setBrandDescription] = useState(initialData?.brandDescription ?? "");
  const [brandNames, setBrandNames] = useState<string[]>(initialData?.brandNames ?? []);

  // Competitor settings state
  const [competitors, setCompetitors] = useState<CompetitorInput[]>(
    initialData?.competitorBrands ?? [],
  );

  // Question settings state
  const [coreKeywords, setCoreKeywords] = useState<string[]>(
    initialData?.industryKeywords ?? [],
  );
  const [questions, setQuestions] = useState<QuestionGroup[]>([]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // AI one-click setup (create mode only)
  const handleAISetup = async () => {
    if (!brandName.trim()) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/monitors/ai-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          brandDescription: brandDescription.trim(),
          brandWebsite: brandWebsite.trim(),
          locale,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      if (Array.isArray(data.brandNames) && data.brandNames.length > 0) {
        setBrandNames(data.brandNames);
      }
      if (data.website) setBrandWebsite(data.website);
      if (data.description) setBrandDescription(data.description);
      if (Array.isArray(data.competitors) && data.competitors.length > 0) {
        setCompetitors(data.competitors);
      }
      if (Array.isArray(data.coreKeywords) && data.coreKeywords.length > 0) {
        setCoreKeywords(data.coreKeywords);
      }
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const groupMap = new Map<string, QuestionGroup>();
        for (const q of data.questions) {
          const kw = q.coreKeyword;
          if (!groupMap.has(kw)) {
            groupMap.set(kw, { coreKeyword: kw, questions: [] });
          }
          groupMap.get(kw)!.questions.push({
            id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            monitorId: "",
            coreKeyword: kw,
            question: q.question,
            intentType: q.intentType,
            searchVolume: q.searchVolume ?? 0,
            sortOrder: groupMap.get(kw)!.questions.length,
            enabled: true,
            tags: [],
          });
        }
        setQuestions(Array.from(groupMap.values()));
      }
    } catch {
      setError(locale === "zh" ? "AI 生成失败，请重试" : "AI generation failed, please retry");
    } finally {
      setGenerating(false);
    }
  };

  // Load existing questions for edit mode
  useEffect(() => {
    if (!monitorId) return;
    fetch(`/api/monitors/${monitorId}/questions`)
      .then((r) => r.json())
      .then((groups: QuestionGroup[]) => {
        if (Array.isArray(groups)) {
          setQuestions(groups);
          const kws = groups.map((g) => g.coreKeyword);
          setCoreKeywords((prev) => {
            const merged = new Set([...prev, ...kws]);
            return Array.from(merged);
          });
        }
      })
      .catch(() => {});
  }, [monitorId]);

  const handleSave = async () => {
    if (!name.trim() || brandNames.length === 0) {
      setError(locale === "zh" ? "请填写监控名称和品牌词" : "Monitor name and brand names are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        brandNames,
        brandWebsite: brandWebsite.trim(),
        brandDescription: brandDescription.trim(),
        competitorBrands: competitors
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            aliases: c.aliases.filter(Boolean),
          })),
        industryKeywords: coreKeywords,
        locale,
      };

      const url = monitorId ? `/api/monitors/${monitorId}` : "/api/monitors";
      const method = monitorId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }

      const saved = await res.json();
      const savedId = monitorId ?? saved.id;

      if (!monitorId && questions.length > 0) {
        const allQuestions = questions.flatMap((g) =>
          g.questions.map((q) => ({
            coreKeyword: g.coreKeyword,
            question: q.question,
            intentType: q.intentType,
            searchVolume: q.searchVolume,
            sortOrder: q.sortOrder,
          })),
        );

        for (const q of allQuestions) {
          await fetch(`/api/monitors/${savedId}/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(q),
          }).catch(() => {});
        }
      }

      router.push(`/${locale}/dashboard/monitors/${savedId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const isCreate = !monitorId;

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-12">
        <Link
          href={`/${locale}/dashboard/monitors`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === "zh" ? "返回监控列表" : "Back to monitors"}
        </Link>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
          {isCreate ? ts("createTitle") : ts("editTitle")}
        </h1>
        <p className="text-sm text-[var(--gray-500)] mt-2">
          {locale === "zh"
            ? "配置品牌信息，AI 将自动监控您的品牌在搜索引擎中的表现"
            : "Configure brand info. AI will monitor your brand visibility in search engines."}
        </p>
      </div>

      {/* Sections */}
      <div className="divide-y divide-[var(--border)]">
        <BrandSettingsSection
          name={name}
          setName={setName}
          brandName={brandName}
          setBrandName={setBrandName}
          brandWebsite={brandWebsite}
          setBrandWebsite={setBrandWebsite}
          brandDescription={brandDescription}
          setBrandDescription={setBrandDescription}
          brandNames={brandNames}
          setBrandNames={setBrandNames}
          locale={locale}
          labels={{
            title: tb("title"),
            name: tb("name"),
            namePlaceholder: tb("namePlaceholder"),
            brandName: tb("brandNameLabel"),
            brandNamePlaceholder: tb("brandNamePlaceholder"),
            website: tb("website"),
            websitePlaceholder: tb("websitePlaceholder"),
            description: tb("description"),
            descriptionPlaceholder: tb("descriptionPlaceholder"),
            brandNames: tb("brandNames"),
            brandNamesHint: tb("brandNamesHint"),
            brandNamesCount: tb("brandNamesCount"),
            optional: ts("optional"),
          }}
        />

        {/* AI one-click generate (create mode only) */}
        {isCreate && (
          <div className="py-8">
            <button
              onClick={handleAISetup}
              disabled={generating || !brandName.trim()}
              className="group w-full flex items-center justify-center gap-2.5 h-12 text-sm font-medium rounded-lg border border-dashed border-[var(--gray-300)] text-[var(--foreground)] hover:border-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-[var(--gray-400)] group-hover:text-[var(--foreground)] transition-colors" />
              )}
              {generating ? ts("aiGenerating") : ts("aiGenerate")}
            </button>
          </div>
        )}

        {/* Step 2: Competitors */}
        <CompetitorSettingsSection
          competitors={competitors}
          setCompetitors={setCompetitors}
          brandNames={brandNames}
          locale={locale}
          labels={{
            title: tc("title"),
            add: tc("add"),
            aiGenerate: tc("aiGenerate"),
            aiGenerating: tc("aiGenerating"),
            namePlaceholder: tc("namePlaceholder"),
            aliasPlaceholder: tc("aliasPlaceholder"),
            aliasCount: tc("aliasCount"),
            optional: ts("optional"),
          }}
        />

        {/* Step 3: Questions */}
        <QuestionSettingsSection
          monitorId={monitorId}
          questions={questions}
          setQuestions={setQuestions}
          coreKeywords={coreKeywords}
          setCoreKeywords={setCoreKeywords}
          brandNames={brandNames}
          locale={locale}
          labels={{
            title: tq("title"),
            generate: tq("generate"),
            generating: tq("generating"),
            coreKeywords: tq("coreKeywords"),
            coreKeywordsHint: tq("coreKeywordsHint"),
            addQuestion: tq("addQuestion"),
            questionPlaceholder: tq("questionPlaceholder"),
            questionCount: tq("questionCount"),
            recommendation: tq("recommendation"),
            comparison: tq("comparison"),
            inquiry: tq("inquiry"),
            evaluation: tq("evaluation"),
            tutorial: tq("tutorial"),
            pricing: tq("pricing"),
            save: tq("save"),
            cancel: tq("cancel"),
            empty: tq("empty"),
            optional: ts("optional"),
          }}
        />
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[220px] z-20 border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex-1">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 h-10 text-sm font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? ts("saving") : ts("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
