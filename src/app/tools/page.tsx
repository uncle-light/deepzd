import Link from "next/link";
import { tools } from "../data/tools";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DeepZD
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/tutorials" className="text-zinc-400 hover:text-white">教程</Link>
          <Link href="/tools" className="text-white">工具</Link>
          <Link href="/news" className="text-zinc-400 hover:text-white">资讯</Link>
        </div>
      </div>
    </nav>
  );
}

export default function Tools() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI 工具推荐</h1>
          <p className="text-zinc-400 mb-6">精选优质AI工具</p>
          <div className="flex gap-2 mb-8 flex-wrap">
            <span className="tag">全部</span>
            <span className="tag">对话</span>
            <span className="tag">绘画</span>
            <span className="tag">编程</span>
            <span className="tag">视频</span>
            <span className="tag">音频</span>
            <span className="tag">办公</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {tools.map((t) => (
              <ToolCard key={t.slug} {...t} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolCard({ name, desc, category, url }: { name: string; desc: string; category: string; url: string }) {
  return (
    <a href={url} target="_blank" className="card p-5 block">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold mb-1">{name}</h3>
          <p className="text-zinc-400 text-sm">{desc}</p>
        </div>
        <span className="tag">{category}</span>
      </div>
    </a>
  );
}
