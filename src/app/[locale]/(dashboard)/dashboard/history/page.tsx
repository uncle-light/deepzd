import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import HistoryClient from "./history-client";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, content_type, url, content, score, created_at")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
          {t("nav.history")}
        </h1>
        <p className="text-sm text-[var(--gray-500)] mt-1">{t("historyDesc")}</p>
      </div>

      <HistoryClient
        analyses={analyses ?? []}
        locale={locale}
        labels={{
          empty: t("history.empty"),
          delete: t("history.delete"),
          viewDetail: t("history.viewDetail"),
          score: t("history.score"),
          all: t("history.all"),
          urlType: t("history.urlType"),
          textType: t("history.textType"),
          today: t("history.today"),
          thisWeek: t("history.thisWeek"),
          earlier: t("history.earlier"),
          confirmDelete: t("history.confirmDelete"),
          cancel: t("history.cancel"),
        }}
      />
    </div>
  );
}
