import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 数字 */}
        <h1 className="text-[120px] md:text-[150px] font-bold leading-none text-[var(--foreground)] mb-4">
          404
        </h1>

        {/* 标题 */}
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--foreground)] mb-4">
          页面未找到
        </h2>

        {/* 描述 */}
        <p className="text-[var(--gray-400)] mb-8 leading-relaxed">
          抱歉，您访问的页面不存在或已被移除。
        </p>

        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回首页</span>
        </Link>
      </div>
    </div>
  );
}
