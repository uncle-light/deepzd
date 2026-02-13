"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useChatLabels } from "./ChatLabelsContext";

export type ProgressMode = "analyze-url" | "analyze-text" | "optimize" | "generic";

interface LongTaskProgressProps {
  mode: ProgressMode;
  locale: string;
  /** @deprecated Use ChatLabelsContext instead. Kept for backward compat. */
  labels?: Record<string, string>;
  compact?: boolean;
}

const MODE_ESTIMATE_SECONDS: Record<ProgressMode, number> = {
  "analyze-url": 65,
  "analyze-text": 24,
  optimize: 18,
  generic: 30,
};

function i18n(locale: string, zh: string, en: string): string {
  return locale === "en" ? en : zh;
}

function resolveStages(
  mode: ProgressMode,
  locale: string,
  labels: Record<string, string>
): string[] {
  if (mode === "analyze-url") {
    return [
      labels.progressFetch ||
        i18n(locale, "抓取页面内容并提取正文", "Fetching page content and extracting text"),
      labels.progressQuery ||
        i18n(locale, "生成搜索查询与评估主题", "Generating search queries and topic"),
      labels.progressVerify ||
        i18n(locale, "调用 AI 搜索引擎进行引用验证", "Verifying citations across AI search engines"),
      labels.progressAggregate ||
        i18n(locale, "聚合结果并计算策略评分", "Aggregating results and scoring strategies"),
      labels.progressRender ||
        i18n(locale, "整理可视化结果", "Preparing visualized results"),
    ];
  }

  if (mode === "analyze-text") {
    return [
      labels.progressRead ||
        i18n(locale, "读取并解析文本结构", "Reading and parsing text structure"),
      labels.progressScore ||
        i18n(locale, "评估 9 个 GEO 策略维度", "Scoring 9 GEO strategy dimensions"),
      labels.progressSuggest ||
        i18n(locale, "生成优化建议", "Generating optimization suggestions"),
      labels.progressRender ||
        i18n(locale, "整理可视化结果", "Preparing visualized results"),
    ];
  }

  if (mode === "optimize") {
    return [
      labels.progressOptimizePlan ||
        i18n(locale, "分析原文并规划优化策略", "Analyzing content and planning optimization"),
      labels.progressOptimizeRewrite ||
        i18n(locale, "按策略进行改写", "Rewriting by selected strategy"),
      labels.progressOptimizeReview ||
        i18n(locale, "校对并生成最终版本", "Reviewing and finalizing output"),
    ];
  }

  return [
    labels.progressRead || i18n(locale, "处理中…", "Processing..."),
    labels.progressRender || i18n(locale, "整理输出…", "Preparing output..."),
  ];
}

/**
 * Non-linear asymptotic progress curve.
 * Reaches ~63% at estimate time, ~86% at 2x estimate, never hits 100%.
 * Feels natural — fast start, gradual slowdown.
 */
function calcProgress(elapsed: number, estimate: number): number {
  const t = elapsed / Math.max(estimate, 1);
  // 1 - e^(-1.8t) gives ~83% at t=1, ~96% at t=2
  const raw = 1 - Math.exp(-1.8 * t);
  return Math.min(97, Math.max(5, Math.round(raw * 100)));
}

function getStageIndex(elapsedSeconds: number, totalSeconds: number, stageCount: number) {
  if (stageCount <= 1) return 0;
  const ratio = Math.min(0.999, elapsedSeconds / Math.max(totalSeconds, 1));
  return Math.floor(ratio * stageCount);
}

export default function LongTaskProgress({
  mode,
  locale,
  labels: labelsProp,
  compact = false,
}: LongTaskProgressProps) {
  const contextLabels = useChatLabels();
  const labels = labelsProp && Object.keys(labelsProp).length > 0 ? labelsProp : contextLabels;

  const [elapsed, setElapsed] = useState(0);
  const stages = useMemo(() => resolveStages(mode, locale, labels), [mode, locale, labels]);
  const estimate = MODE_ESTIMATE_SECONDS[mode] ?? MODE_ESTIMATE_SECONDS.generic;

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode]);

  const stageIndex = getStageIndex(elapsed, estimate, stages.length);
  const progress = calcProgress(elapsed, estimate);
  const isOvertime = elapsed > estimate;

  const title =
    labels.analyzing ||
    (mode === "optimize"
      ? i18n(locale, "正在优化内容…", "Optimizing content...")
      : i18n(locale, "正在分析内容…", "Analyzing content..."));

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--foreground)]" />
          <span>{title}</span>
        </div>
        <div className="text-xs text-[var(--gray-500)] tabular-nums">
          {labels.progressElapsedPrefix || i18n(locale, "已用时", "Elapsed")} {elapsed}s
        </div>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--foreground)] transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!compact && (
        <div className="mt-3 space-y-2">
          {stages.map((stage, index) => (
            <div key={stage} className="flex items-center gap-2 text-xs">
              {index < stageIndex ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              ) : index === stageIndex ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--foreground)]" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-[var(--gray-500)]" />
              )}
              <span
                className={
                  index <= stageIndex
                    ? "text-[var(--foreground)]"
                    : "text-[var(--gray-500)]"
                }
              >
                {stage}
              </span>
            </div>
          ))}
        </div>
      )}

      {isOvertime && (
        <div className="mt-2 text-xs text-[var(--gray-400)] animate-pulse">
          {labels.progressOvertime ||
            i18n(
              locale,
              "仍在处理中，AI 引擎响应较慢，请耐心等待…",
              "Still processing, AI engines are responding slowly, please wait..."
            )}
        </div>
      )}

      <div className="mt-3 text-xs text-[var(--gray-500)]">
        {labels.progressStopHint ||
          i18n(locale, "分析耗时可能较长，按 Esc 可停止", "This may take some time. Press Esc to stop")}
      </div>
    </div>
  );
}
