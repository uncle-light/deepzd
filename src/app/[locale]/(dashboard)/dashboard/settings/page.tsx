import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Parallel queries for profile, subscription, and usage
  const period = new Date().toISOString().slice(0, 7);
  const [profileRes, subRes, usageRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, locale, created_at")
      .eq("id", user?.id ?? "")
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan_id, status, current_period_end, plans(name_zh, name_en, analysis_limit)")
      .eq("user_id", user?.id ?? "")
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("usage")
      .select("analysis_count")
      .eq("user_id", user?.id ?? "")
      .eq("period", period)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const sub = subRes.data;
  const plans = sub?.plans as unknown as {
    name_zh: string;
    name_en: string;
    analysis_limit: number;
  } | null;

  const isEmailUser = user?.app_metadata?.provider === "email";
  const provider = user?.app_metadata?.provider ?? "email";

  return (
    <div className="py-4">
      <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
        {t("nav.settings")}
      </h1>
      <p className="text-sm text-[var(--gray-500)] mt-1 mb-8">
        {t("settingsDesc")}
      </p>
      <SettingsForm
        locale={locale}
        profileLocale={profile?.locale ?? locale}
        email={user?.email ?? ""}
        fullName={profile?.full_name ?? ""}
        avatarUrl={profile?.avatar_url ?? ""}
        isEmailUser={isEmailUser}
        provider={provider}
        createdAt={profile?.created_at ?? user?.created_at ?? ""}
        planId={(sub?.plan_id as string) ?? "free"}
        planName={
          locale === "zh"
            ? plans?.name_zh ?? "免费版"
            : plans?.name_en ?? "Free"
        }
        analysisLimit={plans?.analysis_limit ?? 5}
        analysisUsed={usageRes.data?.analysis_count ?? 0}
        periodEnd={
          (sub?.current_period_end as string) ?? ""
        }
      />
    </div>
  );
}
