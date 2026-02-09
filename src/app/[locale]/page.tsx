import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Footer from "../components/Footer";
import { FAQJsonLd } from "../components/JsonLd";
import Nav from "../components/Nav";
import FeaturesSection from "../components/FeaturesSection";
import VisualEffects from "../components/VisualEffects";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tHero = await getTranslations("hero");
  const tFaq = await getTranslations("faq");

  return (
    <div className="min-h-screen bg-[var(--background)] relative grid-bg">
      <VisualEffects />
      <Nav />
      <Hero t={tHero} locale={locale} />
      <FeaturesSection />
      <FAQ t={tFaq} />
      <Footer />
    </div>
  );
}

type TranslationFn = Awaited<ReturnType<typeof getTranslations>>;

function Hero({ t, locale }: { t: TranslationFn; locale: string }) {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-sm text-[var(--gray-400)] animate-slide-down">
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
          <span>{t("badge")}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-[var(--foreground)] animate-slide-up">
          {t("title1")}
          <br />
          <span className="text-[var(--gray-400)]">{t("title2")}</span>
        </h1>

        {/* Description */}
        <p className="text-base md:text-lg text-[var(--gray-400)] mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up animation-delay-200">
          {t("desc")}
          <a
            href="https://arxiv.org/abs/2311.09735"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            {t("descLink")}
          </a>
        </p>

        {/* CTA Button */}
        <div className="flex justify-center animate-slide-up animation-delay-400">
          <Link
            href={`/${locale}/geo`}
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-full hover:bg-[var(--card-bg)] hover:border-[var(--border-light)] transition-all hover:scale-105"
          >
            <span>{t("learnMore")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQ({ t }: { t: TranslationFn }) {
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

  // 构建FAQ数据用于JsonLd
  const faqData = faqKeys.map((key) => ({
    question: t(`${key}.question` as "q1.question"),
    answer: t(`${key}.answer` as "q1.answer"),
  }));

  return (
    <section
      id="faq"
      className="py-20 px-4 md:px-6 border-t border-[var(--border)]"
    >
      <FAQJsonLd faqs={faqData} />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-[var(--foreground)]">
          {t("title")}
        </h2>

        <div className="space-y-4">
          {faqKeys.map((faq) => (
            <div
              key={faq}
              className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]"
            >
              <h3 className="font-semibold mb-2 text-[var(--foreground)]">
                {t(`${faq}.question` as "q1.question")}
              </h3>
              <p className="text-[var(--gray-400)] text-sm leading-relaxed">
                {t(`${faq}.answer` as "q1.answer")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
