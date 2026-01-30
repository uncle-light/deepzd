import Link from "next/link";
import { tutorials } from "../data/tutorials";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DeepZD
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/tutorials" className="text-white">教程</Link>
          <Link href="/tools" className="text-zinc-400 hover:text-white">工具</Link>
          <Link href="/news" className="text-zinc-400 hover:text-white">资讯</Link>
        </div>
      </div>
    </nav>
  );
}

export default function Tutorials() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">教程中心</h1>
          <p className="text-zinc-400 mb-6">系统学习AI工具</p>
          <div className="flex gap-2 mb-8 flex-wrap">
            <span className="tag">全部</span>
            <span className="tag">绘画</span>
            <span className="tag">对话</span>
            <span className="tag">编程</span>
            <span className="tag">视频</span>
            <span className="tag">音频</span>
          </div>
          <div className="space-y-4">
            {tutorials.map((t) => (
              <Link key={t.slug} href={`/tutorials/${t.slug}`}>
                <div className="card p-5">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{t.title}</h3>
                    <span className="tag">{t.tag}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
