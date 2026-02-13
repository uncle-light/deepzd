import { getTranslations } from "next-intl/server";
import { AboutPageJsonLd } from "../../../components/JsonLd";

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("about");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AboutPageJsonLd locale={locale} />
      <main className="pt-32 pb-24 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[var(--foreground)]">
            DeepZD
          </h1>

          <div className="space-y-6 text-lg text-[var(--gray-400)] leading-relaxed mb-16">
            <p>{t("desc1")}</p>
            <p>{t("desc2")}</p>
          </div>

          <div className="border-t border-[var(--border)] my-12" />

          <div className="text-[var(--gray-500)]">
            <p className="mb-2">{t("contact")}</p>
            <a
              href="mailto:service@deepzd.com"
              className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              service@deepzd.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
