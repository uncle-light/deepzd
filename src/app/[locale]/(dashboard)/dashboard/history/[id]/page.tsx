import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Globe, FileText, Calendar } from "lucide-react";
import DetailClient from "./detail-client";

function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-500 bg-emerald-500/10";
  if (score >= 50) return "text-blue-500 bg-blue-500/10";
  if (score >= 25) return "text-yellow-500 bg-yellow-500/10";
  return "text-red-500 bg-red-500/10";
}

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("dashboard");
  const ta = await getTranslations("analyze");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!analysis) notFound();

  const isZh = locale === "zh";
  const isUrl = analysis.content_type === "url";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href={`/${locale}/dashboard/history`}
            className="p-1.5 rounded-md hover:bg-[var(--surface-muted)] transition-colors text-[var(--gray-400)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs text-[var(--gray-500)]">{t("nav.history")}</span>
        </div>

        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-muted)] flex items-center justify-center shrink-0 mt-0.5">
                  {isUrl ? (
                    <Globe className="w-4 h-4 text-[var(--accent)]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[var(--gray-400)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">
                    {t("history.viewDetail")}
                  </h1>
                  {isUrl && analysis.url && (
                    <p className="text-sm text-[var(--gray-500)] truncate mt-0.5">{analysis.url}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {analysis.score != null && (
                  <span className={`px-2.5 py-1 text-sm font-bold rounded-md ${getScoreColor(analysis.score)}`}>
                    {analysis.score}
                  </span>
                )}
                <Link
                  href={`/api/analyses/${id}/export?format=markdown`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--gray-500)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isZh ? "导出" : "Export"}
                </Link>
              </div>
            </div>
          </div>
          <div className="px-5 py-2.5 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--gray-500)]">
              <Calendar className="w-3 h-3" />
              {new Date(analysis.created_at).toLocaleDateString(
                isZh ? "zh-CN" : "en-US",
                { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
              )}
            </div>
            <span className="text-[11px] text-[var(--gray-500)]">
              {isUrl ? "URL" : isZh ? "文本" : "Text"}
            </span>
          </div>
        </div>
      </div>

      <DetailClient
        analysis={analysis}
        locale={locale}
        labels={{
          urlTitle: ta("urlMode.title"),
          textTitle: ta("textMode.title"),
          citationRate: ta("urlMode.citationRate"),
          qualityScore: ta("textMode.qualityScore"),
          topic: ta("topic"),
          wordCount: ta("wordCount"),
          charCount: ta("charCount"),
          disclaimer: ta("grade.disclaimer"),
          textDisclaimer: ta("textMode.disclaimer"),
          strategyTitle: ta("strategy.title"),
          suggestions: ta("suggestions"),
          engineResult: ta("urlMode.engineResult"),
          citedBy: ta("urlMode.citedBy"),
          notCited: ta("urlMode.notCited"),
          answerPreview: ta("urlMode.answerPreview"),
          noAnswer: ta("urlMode.noAnswer"),
          competitors: ta("urlMode.competitors"),
          queries: ta("urlMode.queries"),
          engines: ta("urlMode.engines"),
          engineNames: {
            volc: ta("urlMode.engine.volc"),
            glm: ta("urlMode.engine.glm"),
            openai: ta("urlMode.engine.openai"),
          },
        }}
      />
    </div>
  );
}
