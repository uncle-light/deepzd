"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "free",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["f1", "f2", "f3"],
    popular: false,
  },
  {
    id: "pro",
    priceMonthly: 49,
    priceYearly: 399,
    features: ["f1", "f2", "f3", "f4", "f5"],
    popular: true,
  },
  {
    id: "enterprise",
    priceMonthly: 199,
    priceYearly: 1599,
    features: ["f1", "f2", "f3", "f4", "f5", "f6", "f7"],
    popular: false,
  },
] as const;

export default function PricingPage() {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const [yearly, setYearly] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
          {t("title")}
        </h1>
        <p className="text-[var(--gray-400)] mb-6">{t("subtitle")}</p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 p-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)]">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              !yearly
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            {t("monthly")}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              yearly
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            {t("yearly")}
            <span className="ml-1.5 text-xs text-green-500">{t("yearlyDiscount")}</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            yearly={yearly}
            locale={locale}
            t={t}
          />
        ))}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "DeepZD",
            applicationCategory: "SEO Tool",
            offers: PLANS.map((p) => ({
              "@type": "Offer",
              name: p.id,
              price: yearly ? p.priceYearly : p.priceMonthly,
              priceCurrency: "CNY",
            })),
          }),
        }}
      />

      {/* FAQ */}
      <FAQSection t={t} />
    </div>
  );
}

function PlanCard({
  plan,
  yearly,
  locale,
  t,
}: {
  plan: (typeof PLANS)[number];
  yearly: boolean;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const price = yearly ? plan.priceYearly : plan.priceMonthly;
  const suffix = yearly ? t("perYear") : t("perMonth");

  return (
    <div
      className={`relative p-6 rounded-xl border bg-[var(--card-bg)] flex flex-col ${
        plan.popular
          ? "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10"
          : "border-[var(--border)]"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-medium bg-[var(--accent)] text-white rounded-full">
          {t("popular")}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
          {t(`${plan.id}.name`)}
        </h3>
        <p className="text-xs text-[var(--gray-500)]">{t(`${plan.id}.desc`)}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold text-[var(--foreground)]">
          {price === 0 ? (locale === "zh" ? "免费" : "Free") : `¥${price}`}
        </span>
        {price > 0 && (
          <span className="text-sm text-[var(--gray-500)]">{suffix}</span>
        )}
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[var(--gray-400)]">
            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            {t(`${plan.id}.${f}`)}
          </li>
        ))}
      </ul>

      {plan.id === "free" ? (
        <Link
          href={`/${locale === "zh" ? "" : locale + "/"}dashboard`}
          className="block text-center px-4 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          {t("getStarted")}
        </Link>
      ) : plan.id === "enterprise" ? (
        <a
          href="mailto:contact@deepzd.com"
          className="block text-center px-4 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          {t("contactUs")}
        </a>
      ) : (
        <button className="px-4 py-2 text-sm rounded-md bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity">
          {t("upgrade")}
        </button>
      )}
    </div>
  );
}

function FAQSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--foreground)] text-center mb-8">
        {t("faq.title")}
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-[var(--border)] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              {faq.q}
              {openIndex === i ? (
                <ChevronUp className="w-4 h-4 text-[var(--gray-500)] shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--gray-500)] shrink-0" />
              )}
            </button>
            {openIndex === i && (
              <div className="px-4 pb-3 text-sm text-[var(--gray-400)]">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
