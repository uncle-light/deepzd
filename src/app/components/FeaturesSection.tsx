"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BarChart3, Eye, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";

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

export default function FeaturesSection() {
  const t = useTranslations("features");
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

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
