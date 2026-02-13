"use client";

import { memo } from "react";
import ScoreOverview from "@/views/analysis/ScoreOverview";
import StrategyRadarChart from "@/views/dashboard/StrategyRadarChart";
import CompetitorRanking from "@/views/analysis/CompetitorRanking";
import SuggestionList from "@/views/analysis/SuggestionList";
import QueryResultList from "@/views/analysis/QueryResultList";
import LongTaskProgress from "./LongTaskProgress";
import { useChatLabels } from "./ChatLabelsContext";
import { getGradeInfo, isRecord, getToolErrorMessage } from "./chat-utils";

const DEFAULT_ENGINE_NAMES: Record<string, string> = {
  volc: "豆包",
  glm: "智谱 GLM",
  openai: "ChatGPT",
};

interface ToolPartProps {
  toolName: string;
  state: string;
  input: Record<string, unknown>;
  output: unknown;
}

function ToolPartInner({ toolName, state, input, output }: ToolPartProps) {
  const labels = useChatLabels();
  const locale = labels.locale || "zh";
  const isDone = state === "output-available";
  const isError = state === "output-error";

  // analyzeContent — server tool with direct result rendering
  if (toolName === "analyzeContent") {
    if (isError) {
      return (
        <div className="p-3 rounded-lg border border-red-600/20">
          <span className="text-sm text-red-600">
            {getToolErrorMessage(
              output,
              locale === "zh" ? "分析失败，请稍后重试" : "Analysis failed, please try again"
            )}
          </span>
        </div>
      );
    }
    if (!isDone) {
      return (
        <LongTaskProgress
          mode={input.inputType === "url" ? "analyze-url" : "analyze-text"}
          locale={locale}
          labels={labels}
        />
      );
    }
    if (!isRecord(output)) return null;

    const score = typeof output.score === "number" ? output.score : 0;
    const topic = typeof output.topic === "string" ? output.topic : "";
    const mode = output.mode === "url_verification" ? "url" : "text";
    const grade = getGradeInfo(score, locale);

    const contentStats = isRecord(output.contentStats)
      ? {
          charCount: Number(output.contentStats.charCount ?? 0),
          wordCount: Number(output.contentStats.wordCount ?? 0),
          sentenceCount: Number(output.contentStats.sentenceCount ?? 0),
          paragraphCount: Number(output.contentStats.paragraphCount ?? 0),
        }
      : undefined;

    const queryResults = Array.isArray(output.queryResults) ? output.queryResults : [];
    const totalCount = queryResults.length;
    const citedCount = queryResults.filter((q) => {
      if (!isRecord(q)) return false;
      return typeof q.citationRate === "number" && q.citationRate > 0;
    }).length;

    const radarData = (Array.isArray(output.strategyScores) ? output.strategyScores : [])
      .filter(isRecord)
      .map((s) => ({ name: String(s.label ?? ""), score: Number(s.score ?? 0) }))
      .filter((d) => d.name);

    const competitors = Array.isArray(output.topCompetitors)
      ? output.topCompetitors
          .filter(isRecord)
          .map((c) => ({
            domain: String(c.domain ?? ""),
            engineCount: Number(c.engineCount ?? 0),
            queryCount: Number(c.queryCount ?? 0),
          }))
          .filter((c) => c.domain)
      : [];

    const suggestions = Array.isArray(output.suggestions)
      ? output.suggestions.map((s) => String(s))
      : [];

    return (
      <div className="space-y-3">
        <ScoreOverview
          contentType={mode}
          score={score}
          topic={topic}
          contentStats={contentStats}
          userDomain={typeof output.userDomain === "string" ? output.userDomain : undefined}
          citedCount={mode === "url" ? citedCount : undefined}
          totalCount={mode === "url" ? totalCount : undefined}
          labels={{
            urlTitle: labels.urlTitle || "URL 引用率",
            textTitle: labels.textTitle || "文本质量评分",
            citationRate: labels.citationRate || "引用率",
            queriesCited: labels.queriesCited || "查询被引用",
            qualityScore: labels.qualityScore || "质量评分",
            topic: labels.topic || "主题",
            wordCount: labels.wordCount || "词",
            charCount: labels.charCount || "字符",
            gradeLabel: grade.label,
            gradeName: grade.name,
            gradeDesc: grade.desc,
            disclaimer: labels.disclaimer || "",
            textDisclaimer:
              labels.textDisclaimer || "文本模式仅进行本地策略分析，不验证实际引用情况。",
          }}
        />
        {radarData.length > 0 && (
          <StrategyRadarChart
            data={radarData}
            title={labels.strategyTitle || "策略评分"}
            emptyText={labels.noData || "暂无数据"}
          />
        )}
        {mode === "url" && competitors.length > 0 && (
          <CompetitorRanking
            competitors={competitors}
            labels={{
              title: labels.competitorsTitle || "竞争对手排名",
              queries: labels.queries || "查询",
              engines: labels.engines || "引擎",
            }}
          />
        )}
        {mode === "url" && queryResults.length > 0 && (
          <QueryResultList
            queryResults={queryResults.filter(isRecord).map((q) => ({
              query: String(q.query ?? ""),
              queryType: String(q.queryType ?? ""),
              citationRate: Number(q.citationRate ?? 0),
              citedByEngines: Number(q.citedByEngines ?? 0),
              totalEngines: Number(q.totalEngines ?? 0),
              engineResults: Array.isArray(q.engineResults)
                ? q.engineResults.filter(isRecord).map((er) => ({
                    engine: String(er.engine ?? ""),
                    answer: String(er.answer ?? ""),
                    citations: Array.isArray(er.citations)
                      ? er.citations.filter(isRecord).map((c) => ({
                          domain: String(c.domain ?? ""),
                          url: typeof c.url === "string" ? c.url : undefined,
                          position: typeof c.position === "number" ? c.position : undefined,
                          isUserDomain: !!c.isUserDomain,
                        }))
                      : [],
                    userCited: !!er.userCited,
                    duration: Number(er.duration ?? 0),
                  }))
                : [],
            }))}
            labels={{
              engineResult: labels.engineResult || "引擎验证详情",
              citedBy: labels.citedBy || "被引用",
              notCited: labels.notCited || "未被引用",
              answerPreview: labels.answerPreview || "AI 原文回答",
              noAnswer: labels.noAnswer || "该引擎未返回回答内容",
              engineNames: DEFAULT_ENGINE_NAMES,
            }}
          />
        )}
        {suggestions.length > 0 && (
          <SuggestionList
            suggestions={suggestions}
            title={labels.suggestionsTitle || "优化建议"}
          />
        )}
      </div>
    );
  }

  // optimizeContent — server tool
  if (toolName === "optimizeContent") {
    if (isError) {
      return (
        <div className="p-3 rounded-lg border border-red-600/20">
          <span className="text-sm text-red-600">
            {getToolErrorMessage(
              output,
              locale === "zh" ? "优化失败，请稍后重试" : "Optimization failed, please try again"
            )}
          </span>
        </div>
      );
    }
    if (!isDone) {
      return <LongTaskProgress mode="optimize" locale={locale} labels={labels} />;
    }
    if (!isRecord(output)) return null;

    const changes = Array.isArray(output.changes)
      ? output.changes.map((c) => String(c))
      : [];
    const optimizedContent =
      typeof output.optimizedContent === "string" ? output.optimizedContent : "";

    return (
      <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
        <div className="text-sm font-medium text-[var(--foreground)]">
          {locale === "zh" ? "优化结果" : "Optimization Result"}
        </div>
        {changes.length > 0 && (
          <ul className="list-disc pl-5 text-sm text-[var(--gray-400)] space-y-1">
            {changes.map((change, idx) => (
              <li key={idx}>{change}</li>
            ))}
          </ul>
        )}
        {optimizedContent && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm whitespace-pre-wrap text-[var(--foreground)]">
            {optimizedContent}
          </div>
        )}
      </div>
    );
  }

  return null;
}

const ToolPart = memo(ToolPartInner);
export default ToolPart;
