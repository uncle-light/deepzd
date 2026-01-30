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
          <div className="space-y-6 text-zinc-400">
            <p>DeepZD 是一个专注于 AI 知识分享的平台。</p>
            <p>我们的使命是让每个人都能轻松掌握 AI 工具。</p>
            <h2 className="text-xl font-semibold text-white pt-4">我们提供</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>深度教程 - 系统学习各类AI工具</li>
              <li>工具推荐 - 精选优质AI工具</li>
              <li>前沿资讯 - AI领域最新动态</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
