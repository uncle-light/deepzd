import Link from "next/link";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DeepZD
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/tutorials" className="text-zinc-400">教程</Link>
          <Link href="/tools" className="text-zinc-400">工具</Link>
          <Link href="/news" className="text-zinc-400">资讯</Link>
        </div>
      </div>
    </nav>
  );
}

export default function About() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">关于 DeepZD</h1>
          <div className="text-zinc-400 space-y-4">
            <p>DeepZD 是一个专注于 AI 知识分享的平台。</p>
            <p>我们提供深度教程、工具推荐和前沿资讯。</p>
            <p>让每个人都能轻松掌握 AI 工具。</p>
          </div>
        </div>
      </main>
    </div>
  );
}
