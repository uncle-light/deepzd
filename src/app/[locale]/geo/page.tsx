"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";

// SVG Icon Component
function IconComponent({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    tag: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    layers: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    quote: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function PlatformIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    chat: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    search: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    sparkles: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    cpu: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    window: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 9h16M12 4v16" />
      </svg>
    ),
    globe: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function MethodIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    document: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    chat: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    eye: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    target: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    template: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    badge: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    refresh: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    code: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function GeoPage() {
  const t = useTranslations("geo");
  const params = useParams();
  const locale = (params.locale as string) || "zh";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <HeroSection t={t} locale={locale} />

          {/* What is GEO */}
          <WhatIsGeoSection t={t} />

          {/* AI Search Engines */}
          <AISearchSection t={t} />

          {/* Zero Click */}
          <ZeroClickSection t={t} />

          {/* Core Principles */}
          <PrinciplesSection t={t} />

          {/* GEO vs SEO */}
          <ComparisonSection t={t} />

          {/* 9 Optimization Methods */}
          <MethodsSection t={t} />

          {/* Statistics */}
          <StatsSection t={t} />

          {/* Research */}
          <ResearchSection t={t} />

          {/* CTA */}
          <CTASection t={t} locale={locale} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function HeroSection({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  return (
    <section className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-sm text-[var(--gray-400)]">
        <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
        <span>{t("badge")}</span>
      </div>
      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-[var(--foreground)]">
        {t("title")}
      </h1>
      <p className="text-lg text-[var(--gray-400)] max-w-2xl mx-auto mb-8">
        {t("subtitle")}
      </p>
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-full hover:bg-[var(--card-bg)] hover:border-[var(--border-light)] transition-all"
      >
        {t("cta")}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </section>
  );
}

function WhatIsGeoSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t("whatIs.title")}</h2>
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
        <p className="text-[var(--gray-400)] leading-relaxed mb-4">{t("whatIs.p1")}</p>
        <p className="text-[var(--gray-400)] leading-relaxed mb-4">{t("whatIs.p2")}</p>
        <p className="text-[var(--gray-400)] leading-relaxed">{t("whatIs.p3")}</p>
      </div>
    </section>
  );
}

function AISearchSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const platforms = [
    { key: "chatgpt", icon: "chat" },
    { key: "perplexity", icon: "search" },
    { key: "gemini", icon: "sparkles" },
    { key: "claude", icon: "cpu" },
    { key: "copilot", icon: "window" },
    { key: "aiOverview", icon: "globe" },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">{t("aiSearch.title")}</h2>
      <p className="text-[var(--gray-400)] mb-6">{t("aiSearch.desc")}</p>
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
        <h3 className="font-semibold mb-4 text-[var(--foreground)]">{t("aiSearch.platforms.title")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platforms.map((p) => (
            <div key={p.key} className="flex items-start gap-3">
              <div className="w-6 h-6 text-[var(--gray-400)]">
                <PlatformIcon name={p.icon} />
              </div>
              <p className="text-sm text-[var(--gray-400)]">{t(`aiSearch.platforms.${p.key}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ZeroClickSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">{t("zeroClick.title")}</h2>
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] border-l-4 border-l-[var(--accent)]">
        <p className="text-[var(--gray-400)] leading-relaxed">{t("zeroClick.desc")}</p>
      </div>
    </section>
  );
}

function PrinciplesSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const principles = [
    { key: "entity", icon: "tag" },
    { key: "semantic", icon: "layers" },
    { key: "citability", icon: "quote" },
    { key: "reliability", icon: "shield" },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">{t("principles.title")}</h2>
      <p className="text-[var(--gray-400)] mb-6">{t("principles.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {principles.map((p) => (
          <div
            key={p.key}
            className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]"
          >
            <div className="w-10 h-10 rounded-md bg-[var(--gray-800)] flex items-center justify-center mb-3">
              <IconComponent name={p.icon} />
            </div>
            <h3 className="font-semibold mb-2 text-[var(--foreground)]">
              {t(`principles.${p.key}.title`)}
            </h3>
            <p className="text-sm text-[var(--gray-400)]">
              {t(`principles.${p.key}.desc`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparisonSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const items = ["target", "goal", "metrics", "content", "result"];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t("comparison.title")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-4 px-4 text-left text-[var(--gray-400)] font-medium">{t("comparison.aspect")}</th>
              <th className="py-4 px-4 text-left text-[var(--foreground)] font-medium">SEO</th>
              <th className="py-4 px-4 text-left text-[var(--foreground)] font-medium">GEO</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item} className="border-b border-[var(--border)]">
                <td className="py-4 px-4 text-[var(--gray-400)]">{t(`comparison.${item}.label`)}</td>
                <td className="py-4 px-4 text-[var(--gray-400)]">{t(`comparison.${item}.seo`)}</td>
                <td className="py-4 px-4 text-[var(--foreground)]">{t(`comparison.${item}.geo`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MethodsSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const methods = [
    { icon: "document", key: "citations" },
    { icon: "chart", key: "statistics" },
    { icon: "chat", key: "quotations" },
    { icon: "eye", key: "readability" },
    { icon: "target", key: "directAnswer" },
    { icon: "template", key: "structure" },
    { icon: "badge", key: "authority" },
    { icon: "refresh", key: "freshness" },
    { icon: "code", key: "schema" },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">{t("methods.title")}</h2>
      <p className="text-[var(--gray-400)] mb-6">{t("methods.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div
            key={method.key}
            className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
          >
            <div className="w-10 h-10 rounded-md bg-[var(--gray-800)] flex items-center justify-center mb-3 text-[var(--gray-400)]">
              <MethodIcon name={method.icon} />
            </div>
            <h3 className="font-semibold mb-2 text-[var(--foreground)]">
              {t(`methods.${method.key}.title`)}
            </h3>
            <p className="text-sm text-[var(--gray-400)]">
              {t(`methods.${method.key}.desc`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const stats = [
    { value: "40%", key: "visibility" },
    { value: "180%", key: "citation" },
    { value: "73%", key: "preference" },
    { value: "6x", key: "clickthrough" },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t("stats.title")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-center"
          >
            <div className="text-3xl font-bold text-[var(--accent)] mb-2">{stat.value}</div>
            <p className="text-sm text-[var(--gray-400)]">{t(`stats.${stat.key}`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResearchSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t("research.title")}</h2>
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
        <h3 className="font-semibold mb-3 text-[var(--foreground)]">{t("research.paper.title")}</h3>
        <p className="text-sm text-[var(--gray-400)] mb-4">{t("research.paper.authors")}</p>
        <p className="text-[var(--gray-400)] mb-4">{t("research.paper.abstract")}</p>
        <a
          href="https://arxiv.org/abs/2311.09735"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline"
        >
          {t("research.paper.link")}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </section>
  );
}

function CTASection({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  return (
    <section className="text-center p-8 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">{t("ctaSection.title")}</h2>
      <p className="text-[var(--gray-400)] mb-6">{t("ctaSection.desc")}</p>
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-full hover:bg-[var(--card-bg)] hover:border-[var(--border-light)] transition-all"
      >
        {t("ctaSection.button")}
      </Link>
    </section>
  );
}
