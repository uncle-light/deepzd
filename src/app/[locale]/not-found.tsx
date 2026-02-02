"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  const params = useParams();
  const locale = (params.locale as string) || "zh";

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-[120px] md:text-[150px] font-bold leading-none text-[var(--foreground)] mb-4">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--foreground)] mb-4">
          {t("title")}
        </h2>
        <p className="text-[var(--gray-400)] mb-8 leading-relaxed">
          {t("desc")}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-full hover:bg-[var(--card-bg)] hover:border-[var(--border-light)] transition-all"
        >
          <span>{t("back")}</span>
        </Link>
      </div>
    </div>
  );
}
