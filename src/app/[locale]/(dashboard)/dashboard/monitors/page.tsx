import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MonitorList from "@/views/monitors/MonitorList";

export default async function MonitorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("monitors");
  const tm = await getTranslations("monitors.metrics");
  const tc = await getTranslations("monitors.check");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Fetch monitors with latest check
  const { data } = await supabase
    .from("brand_monitors")
    .select("*, monitor_checks(id, status, summary, created_at)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const monitors = (data ?? []).map((m) => {
    const checks = (m.monitor_checks as { id: string; status: string; summary: unknown; created_at: string }[]) ?? [];
    const sorted = checks.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const latestCheck = sorted[0] ?? null;
    const { monitor_checks: _, ...rest } = m;
    return { ...rest, latestCheck };
  });

  return (
    <MonitorList
      monitors={monitors}
      locale={locale}
      labels={{
        title: t("title"),
        subtitle: t("subtitle"),
        create: t("create"),
        empty: t("empty"),
        emptyDesc: t("emptyDesc"),
        lastCheck: tc("lastCheck"),
        never: tc("never"),
        mentionRate: tm("mentionRate"),
        avgPosition: tm("avgPosition"),
      }}
    />
  );
}
