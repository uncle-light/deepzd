"use client";

import ScoreOverview from "@/views/analysis/ScoreOverview";
import StrategyScoreCard from "@/views/analysis/StrategyScoreCard";
import QueryResultList from "@/views/analysis/QueryResultList";
import CompetitorRanking from "@/views/analysis/CompetitorRanking";
import SuggestionList from "@/views/analysis/SuggestionList";

function getGrade(score: number): 'a' | 'b' | 'c' | 'd' {
  if (score >= 75) return 'a';
  if (score >= 50) return 'b';
  if (score >= 25) return 'c';
  return 'd';
}

const GRADE_LABELS: Record<string, Record<string, { label: string; name: string; desc: string }>> = {
  zh: {
    a: { label: "A", name: "优秀", desc: "内容具备较强的AI引用潜力，结构和质量表现出色" },
    b: { label: "B", name: "良好", desc: "内容有一定的AI引用潜力，部分维度仍有提升空间" },
    c: { label: "C", name: "一般", desc: "内容的AI引用潜力有限，建议参考优化建议进行改进" },
    d: { label: "D", name: "待改进", desc: "内容需要较大幅度的优化才能提升AI引用可能性" },
  },
  en: {
    a: { label: "A", name: "Excellent", desc: "Content has strong AI citation potential" },
    b: { label: "B", name: "Good", desc: "Content has moderate AI citation potential" },
    c: { label: "C", name: "Fair", desc: "Limited AI citation potential" },
    d: { label: "D", name: "Needs Work", desc: "Content needs significant optimization" },
  },
};

interface DetailClientProps {
  analysis: {
    content_type: string;
    score: number;
    results: Record<string, unknown>;
  };
  locale: string;
  labels: Record<string, unknown>;
}

export default function DetailClient({ analysis, locale, labels }: DetailClientProps) {
  const l = labels as Record<string, string> & { engineNames: Record<string, string> };
  const r = analysis.results;
  const isUrl = analysis.content_type === "url";

  const grade = getGrade(analysis.score);
  const gradeInfo = GRADE_LABELS[locale]?.[grade] || GRADE_LABELS.en[grade];

  // Build queriesCited label
  const queriesCitedLabel = isUrl
    ? `${(r.queryResults as unknown[])?.filter((q: unknown) => (q as { citationRate: number }).citationRate > 0).length || 0}/${(r.queryResults as unknown[])?.length || 0}`
    : "";

  return (
    <div className="space-y-6">
      <ScoreOverview
        contentType={isUrl ? "url" : "text"}
        score={analysis.score}
        topic={r.topic as string}
        contentStats={r.contentStats as { charCount: number; wordCount: number; sentenceCount: number; paragraphCount: number }}
        userDomain={r.userDomain as string}
        citedCount={isUrl ? (r.queryResults as unknown[])?.filter((q: unknown) => (q as { citationRate: number }).citationRate > 0).length : undefined}
        totalCount={isUrl ? (r.queryResults as unknown[])?.length : undefined}
        labels={{
          urlTitle: l.urlTitle,
          textTitle: l.textTitle,
          citationRate: l.citationRate,
          queriesCited: queriesCitedLabel,
          qualityScore: l.qualityScore,
          topic: l.topic,
          wordCount: l.wordCount,
          charCount: l.charCount,
          gradeLabel: gradeInfo.label,
          gradeName: gradeInfo.name,
          gradeDesc: gradeInfo.desc,
          disclaimer: l.disclaimer,
          textDisclaimer: l.textDisclaimer,
        }}
      />

      {isUrl && !!r.queryResults && (
        <QueryResultList
          queryResults={r.queryResults as Parameters<typeof QueryResultList>[0]["queryResults"]}
          labels={{
            engineResult: l.engineResult,
            citedBy: l.citedBy,
            notCited: l.notCited,
            answerPreview: l.answerPreview,
            noAnswer: l.noAnswer,
            engineNames: l.engineNames,
          }}
        />
      )}

      {isUrl && !!r.topCompetitors && (
        <CompetitorRanking
          competitors={r.topCompetitors as Parameters<typeof CompetitorRanking>[0]["competitors"]}
          labels={{
            title: l.competitors,
            queries: l.queries,
            engines: l.engines,
          }}
        />
      )}

      {!!r.strategyScores && (
        <StrategyScoreCard
          strategyScores={r.strategyScores as Parameters<typeof StrategyScoreCard>[0]["strategyScores"]}
          title={l.strategyTitle}
        />
      )}

      {!!r.suggestions && (
        <SuggestionList
          suggestions={r.suggestions as string[]}
          title={l.suggestions}
        />
      )}
    </div>
  );
}
