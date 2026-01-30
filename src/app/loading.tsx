export default function Loading() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400">加载中...</p>
      </div>
    </div>
  );
}
