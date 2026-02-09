"use client";

import { useEffect, useState } from "react";

const messages = {
  zh: {
    title: "出错了",
    description: "抱歉，页面加载时发生了错误",
    retry: "重试",
  },
  en: {
    title: "Something went wrong",
    description: "Sorry, an error occurred while loading the page",
    retry: "Try again",
  },
} as const;

function useLocale(): "zh" | "en" {
  const [locale] = useState<"zh" | "en">(() => {
    if (typeof window !== "undefined") {
      return navigator.language.startsWith("zh") ? "zh" : "en";
    }
    return "zh";
  });
  return locale;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = messages[locale];

  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-black text-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
            <p className="text-gray-400 mb-8">{t.description}</p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              {t.retry}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
