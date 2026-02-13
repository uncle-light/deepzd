import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import LoginForm from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return {
    title: `${t("title")} | DeepZD`,
    description: t("title"),
  };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { locale } = await params;
  const { redirect } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        {t("login.title")}
      </h1>
      <p className="text-sm text-[var(--gray-400)] mb-8">
        {t("login.subtitle")}
      </p>
      <LoginForm locale={locale} redirect={redirect} />
    </div>
  );
}
