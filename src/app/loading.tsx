export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] grid-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[var(--gray-400)]">加载中...</p>
      </div>
    </div>
  );
}
