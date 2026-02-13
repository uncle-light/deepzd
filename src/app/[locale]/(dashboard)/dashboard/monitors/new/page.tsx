import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MonitorSetup from "@/views/monitors/MonitorSetup";

export default async function NewMonitorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return <MonitorSetup locale={locale} monitorId={null} />;
}
