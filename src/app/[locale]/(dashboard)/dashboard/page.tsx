import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StatsCards from "@/views/dashboard/StatsCards";
import ScoreTrendChart from "@/views/dashboard/ScoreTrendChart";
import StrategyRadarChart from "@/views/dashboard/StrategyRadarChart";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? "";

  const userName = user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "";

  const isZh = locale === "zh";

  // Parallel queries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const [countRes, recentRes, trendRes] = await Promise.all([
    supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("analyses")
      .select("id, content_type, url, content, score, created_at, results")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("analyses")
      .select("score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const totalAnalyses = countRes.count ?? 0;
  const recentAnalyses = recentRes.data ?? [];
  const trendData = trendRes.data ?? [];

  // Compute avg score
  const scoredItems = recentAnalyses.filter((a) => a.score != null);
  const avgScore = scoredItems.length
    ? Math.round(scoredItems.reduce((s, a) => s + (a.score ?? 0), 0) / scoredItems.length)
    : "-";

  // This month / last month count
  const thisMonthCount = trendData.filter((a) => a.created_at >= monthStart).length;
  const lastMonthCount = trendData.filter(
    (a) => a.created_at >= lastMonthStart && a.created_at < monthStart
  ).length;

  // Trend chart data
  const chartData = [...trendData].reverse().map((a) => ({
    date: new Date(a.created_at).toLocaleDateString(
      isZh ? "zh-CN" : "en-US",
      { month: "short", day: "numeric" }
    ),
    score: a.score ?? 0,
  }));

  // Strategy radar from latest analysis
  const latestWithStrategy = recentAnalyses.find(
    (a) => a.results && (a.results as Record<string, unknown>).strategyScores
  );
  const radarData = latestWithStrategy
    ? ((latestWithStrategy.results as Record<string, unknown>).strategyScores as { label: string; score: number }[])
        .map((s) => ({ name: s.label, score: s.score }))
    : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
          {t("welcome", { name: userName })}
        </h1>
        <p className="text-sm text-[var(--gray-500)] mt-1">{t("welcomeDesc")}</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <StatsCards
          totalAnalyses={totalAnalyses}
          avgScore={avgScore}
          thisMonthCount={thisMonthCount}
          lastMonthCount={lastMonthCount}
          labels={{
            totalAnalyses: t("stats.totalAnalyses"),
            avgScore: t("stats.avgScore"),
            thisMonth: t("stats.thisMonth"),
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ScoreTrendChart
          data={chartData}
          title={t("stats.scoreTrend")}
          emptyText={t("stats.noData")}
        />
        <StrategyRadarChart
          data={radarData}
          title={t("stats.strategyOverview")}
          emptyText={t("stats.noData")}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link
          href={`/${locale}/dashboard/analyze`}
          className="group flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{t("nav.analyze")}</p>
            <p className="text-xs text-[var(--gray-500)] mt-0.5">{t("analyzeDesc")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--gray-500)] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
        <Link
          href={`/${locale}/dashboard/history`}
          className="group flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{t("nav.history")}</p>
            <p className="text-xs text-[var(--gray-500)] mt-0.5">{t("historyDesc")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--gray-500)] group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </div>

      {/* Recent Analyses */}
      {recentAnalyses.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {t("recentAnalyses")}
            </p>
            <Link
              href={`/${locale}/dashboard/history`}
              className="text-xs text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
            >
              {isZh ? "查看全部" : "View all"}
            </Link>
          </div>
          <div className="border-t border-[var(--border)]">
            {recentAnalyses.map((analysis, i) => (
              <Link
                key={analysis.id}
                href={`/${locale}/dashboard/history/${analysis.id}`}
                className={`group flex items-center justify-between px-5 py-3 hover:bg-[var(--surface-muted)] transition-colors ${
                  i < recentAnalyses.length - 1 ? "border-b border-[var(--border)]" : ""
                }`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm text-[var(--foreground)] truncate">
                    {analysis.url || (analysis.content as string)?.slice(0, 60) || analysis.content_type}
                  </p>
                  <p className="text-xs text-[var(--gray-500)] mt-0.5">
                    {new Date(analysis.created_at).toLocaleDateString(
                      isZh ? "zh-CN" : "en-US",
                      { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                </div>
                {analysis.score != null && (
                  <span className="shrink-0 text-sm font-medium text-[var(--foreground)] tabular-nums">
                    {analysis.score}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
