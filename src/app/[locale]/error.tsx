"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">
          出错了
        </h1>
        <p className="text-[var(--gray-400)] mb-8">
          抱歉，页面加载时发生了错误
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-secondary"
          >
            重试
          </button>
          <Link href="/" className="btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
