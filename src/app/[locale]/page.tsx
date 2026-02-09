"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BarChart3, ChevronRight, Eye, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import Footer from "../components/Footer";
import { FAQJsonLd } from "../components/JsonLd";
import Nav from "../components/Nav";

const MouseGlow = dynamic(() => import("../components/MouseGlow"), { ssr: false });
const FloatingParticles = dynamic(() => import("../components/FloatingParticles"), { ssr: false });

export default function Home() {
  const params = useParams();
  const locale = (params.locale as string) || "zh";

  return (
    <div className="min-h-screen bg-[var(--background)] relative grid-bg">
      <MouseGlow />
      <FloatingParticles />
      <Nav />
      <Hero locale={locale} />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
}

function Hero({ locale }: { locale: string }) {
  const t = useTranslations("hero");

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

function Features() {
  const t = useTranslations("features");
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  const features = [
    {
      key: "analyzer",
      icon: <BarChart3 className="w-8 h-8" strokeWidth={1.5} />,
    },
    {
      key: "prompts",
      icon: <Terminal className="w-8 h-8" strokeWidth={1.5} />,
    },
    {
      key: "monitor",
      icon: <Eye className="w-8 h-8" strokeWidth={1.5} />,
    },
  ];

  return (
    <section className="py-32 px-4 md:px-6 border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-1000 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="text-lg text-[var(--gray-400)]">{t("subtitle")}</p>
        </div>

        {/* Features Grid */}
        <div ref={gridRef} className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.key}
              className={`group relative p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border-light)] transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
                gridVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: gridVisible ? `${index * 150}ms` : "0ms",
              }}
            >
              {/* Badge for "Coming Soon" */}
              {feature.key === "monitor" && (
                <div className="absolute top-4 right-4 px-2 py-1 text-xs rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                  {t(`${feature.key}.badge`)}
                </div>
              )}

              {/* Icon */}
              <div className="mb-6 text-[var(--gray-400)] group-hover:text-[var(--foreground)] group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-3 text-[var(--foreground)]">
                {t(`${feature.key}.title`)}
              </h3>

              {/* Description */}
              <p className="text-[var(--gray-400)] leading-relaxed">
                {t(`${feature.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const t = useTranslations("faq");

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
