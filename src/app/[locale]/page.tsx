"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import MouseGlow from "../components/MouseGlow";
import FloatingParticles from "../components/FloatingParticles";

export default function Home() {
  const params = useParams();
  const locale = (params.locale as string) || "zh";

  return (
    <div className="min-h-screen bg-[var(--background)] relative grid-bg">
      <MouseGlow />
      <FloatingParticles />
      <Nav />
      <Hero locale={locale} />
      <FAQ />
      <Footer />
    </div>
  );
}

function Hero({ locale }: { locale: string }) {
  const t = useTranslations("hero");

  return (
    <section className="min-h-screen flex items-center justify-center px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-sm text-[var(--gray-400)]">
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
          <span>{t("badge")}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-[var(--foreground)]">
          {t("title1")}
          <br />
          <span className="text-[var(--gray-400)]">{t("title2")}</span>
        </h1>

        {/* Description */}
        <p className="text-base md:text-lg text-[var(--gray-400)] mb-10 max-w-2xl mx-auto leading-relaxed">
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
        <div className="flex justify-center">
          <Link
            href={`/${locale}/geo`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            <span>{t("learnMore")}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}


function FAQ() {
  const t = useTranslations("faq");

  const faqs = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

  return (
    <section id="faq" className="py-20 px-4 md:px-6 border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-[var(--foreground)]">
          {t("title")}
        </h2>

        <div className="space-y-4">
          {faqs.map((faq) => (
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
