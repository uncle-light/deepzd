import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import MonitorSetup from "@/views/monitors/MonitorSetup";

export default async function MonitorSettingsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: monitor, error } = await supabase
    .from("brand_monitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !monitor) notFound();

  return (
    <MonitorSetup
      locale={locale}
      monitorId={id}
      initialData={{
        name: monitor.name,
        brandNames: monitor.brand_names,
        brandWebsite: monitor.brand_website ?? "",
        brandDescription: monitor.brand_description ?? "",
        competitorBrands: monitor.competitor_brands ?? [],
        industryKeywords: monitor.industry_keywords,
      }}
    />
  );
}
