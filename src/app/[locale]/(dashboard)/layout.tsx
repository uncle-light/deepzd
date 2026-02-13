import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const userName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null;
  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  return (
    <DashboardShell locale={locale} userName={userName} avatarUrl={avatarUrl}>
      {children}
    </DashboardShell>
  );
}
