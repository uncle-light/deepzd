"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">
          {t("title")}
        </h1>
        <p className="text-[var(--gray-400)] mb-8">
          {t("description")}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-secondary"
          >
            {t("retry")}
          </button>
          <Link href="/" className="btn-primary">
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
