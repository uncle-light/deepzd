import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import RegisterForm from "./register-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register");
  return {
    title: `${t("title")} | DeepZD`,
    description: t("title"),
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("auth");

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        {t("register.title")}
      </h1>
      <p className="text-sm text-[var(--gray-400)] mb-8">
        {t("register.subtitle")}
      </p>
      <RegisterForm locale={locale} />
    </div>
  );
}
