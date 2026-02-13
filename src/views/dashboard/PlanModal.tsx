"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check, X } from "lucide-react";

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

interface PlanModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PlanModal({ open, onClose }: PlanModalProps) {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const [yearly, setYearly] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-md text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight mb-1">
              {t("title")}
            </h2>
            <p className="text-sm text-[var(--gray-500)]">{t("subtitle")}</p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center p-0.5 rounded-md border border-[var(--border)] bg-[var(--surface-muted)]">
              <button
                onClick={() => setYearly(false)}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-all ${
                  !yearly
                    ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--gray-500)] hover:text-[var(--foreground)]"
                }`}
              >
                {t("monthly")}
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-all ${
                  yearly
                    ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--gray-500)] hover:text-[var(--foreground)]"
                }`}
              >
                {t("yearly")}
                <span className="ml-1.5 text-xs text-green-600 font-medium">{t("yearlyDiscount")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)] border-t border-[var(--border)]">
          {PLANS.map((plan) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
            const suffix = yearly ? t("perYear") : t("perMonth");

            return (
              <div
                key={plan.id}
                className={`relative p-5 flex flex-col bg-[var(--background)] ${
                  plan.popular ? "md:-my-px md:py-6 md:z-10 md:rounded-b-lg md:border-x md:border-b md:border-[var(--foreground)]/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-medium bg-[var(--foreground)] text-[var(--background)] rounded-b-md">
                    {t("popular")}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-0.5">
                    {t(`${plan.id}.name`)}
                  </h3>
                  <p className="text-xs text-[var(--gray-500)] leading-relaxed">{t(`${plan.id}.desc`)}</p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-[var(--foreground)] tabular-nums">
                    {price === 0 ? (locale === "zh" ? "免费" : "Free") : `¥${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-xs text-[var(--gray-500)] ml-1">{suffix}</span>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-[var(--gray-400)]">
                      <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                      <span>{t(`${plan.id}.${f}`)}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === "free" ? (
                  <button
                    onClick={onClose}
                    className="w-full text-center px-4 py-2 text-xs font-medium rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    {t("getStarted")}
                  </button>
                ) : plan.id === "enterprise" ? (
                  <a
                    href="mailto:contact@deepzd.com"
                    className="block text-center px-4 py-2 text-xs font-medium rounded-md border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    {t("contactUs")}
                  </a>
                ) : (
                  <button className="w-full px-4 py-2 text-xs font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity">
                    {t("upgrade")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
