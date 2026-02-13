import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import MonitorDashboard from "@/views/monitors/MonitorDashboard";

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Fetch monitor + recent checks
  const { data: monitor, error } = await supabase
    .from("brand_monitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !monitor) notFound();

  const { data: checks } = await supabase
    .from("monitor_checks")
    .select("id, status, summary, query_count, engine_count, duration, created_at")
    .eq("monitor_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch latest check detail (full)
  let latestDetail = null;
  const latestCompleted = (checks ?? []).find((c) => c.status === "completed");
  if (latestCompleted) {
    const { data: fullCheck } = await supabase
      .from("monitor_checks")
      .select("detail")
      .eq("id", latestCompleted.id)
      .single();
    latestDetail = fullCheck?.detail ?? null;
  }

  return (
    <MonitorDashboard
      monitor={{ ...monitor, checks: checks ?? [] }}
      locale={locale}
      latestDetail={latestDetail}
    />
  );
}
