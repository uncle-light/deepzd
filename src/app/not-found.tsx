import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-violet-400 mb-4">404</h1>
        <p className="text-xl text-zinc-400 mb-8">页面未找到</p>
        <Link href="/" className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors">
          返回首页
        </Link>
      </div>
    </div>
  );
}
