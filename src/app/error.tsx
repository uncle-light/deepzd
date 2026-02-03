"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-black text-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">出错了</h1>
            <p className="text-gray-400 mb-8">
              抱歉，页面加载时发生了错误
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
