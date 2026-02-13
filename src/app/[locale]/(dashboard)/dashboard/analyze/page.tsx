"use client";

import { useLocale, useTranslations } from "next-intl";
import ChatAnalyze from "@/views/analyze/ChatAnalyze";

export default function DashboardAnalyzePage() {
  const t = useTranslations("analyze");
  const tc = useTranslations("chat");
  const locale = useLocale();

  return (
    <ChatAnalyze
      locale={locale}
      labels={{
        placeholder: tc("placeholder"),
        send: tc("send"),
        stop: tc("stop"),
        thinking: tc("thinking"),
        analyzing: tc("analyzing"),
        newChat: tc("newChat"),
        emptyTitle: tc("emptyTitle"),
        emptyDesc: tc("emptyDesc"),
        // Score overview labels
        urlTitle: t("score.urlTitle"),
        textTitle: t("score.textTitle"),
        citationRate: t("score.citationRate"),
        queriesCited: t("score.queriesCited"),
        qualityScore: t("score.qualityScore"),
        topic: t("score.topic"),
        wordCount: t("score.wordCount"),
        charCount: t("score.charCount"),
        disclaimer: t("score.disclaimer"),
        textDisclaimer: t("score.textDisclaimer"),
        // Analysis component labels
        strategyTitle: t("strategy.title"),
        noData: t("strategy.noData"),
        competitorsTitle: t("competitors.title"),
        queries: t("competitors.queries"),
        engines: t("competitors.engines"),
        suggestionsTitle: t("suggestions"),
        analyzingUrl: tc("analyzingUrl"),
        analyzingText: tc("analyzingText"),
        optimizing: tc("optimizing"),
        progressElapsedPrefix: tc("progressElapsedPrefix"),
        progressStopHint: tc("progressStopHint"),
        progressFetch: tc("progressFetch"),
        progressQuery: tc("progressQuery"),
        progressVerify: tc("progressVerify"),
        progressAggregate: tc("progressAggregate"),
        progressRender: tc("progressRender"),
        progressRead: tc("progressRead"),
        progressScore: tc("progressScore"),
        progressSuggest: tc("progressSuggest"),
        progressOptimizePlan: tc("progressOptimizePlan"),
        progressOptimizeRewrite: tc("progressOptimizeRewrite"),
        progressOptimizeReview: tc("progressOptimizeReview"),
        chatError: t("error.failed"),
      }}
    />
  );
}
