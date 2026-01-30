import Link from "next/link";
import { news } from "../data/news";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DeepZD
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/tutorials" className="text-zinc-400 hover:text-white">教程</Link>
          <Link href="/tools" className="text-zinc-400 hover:text-white">工具</Link>
          <Link href="/news" className="text-white">资讯</Link>
        </div>
      </div>
    </nav>
  );
}

export default function News() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI 资讯</h1>
          <p className="text-zinc-400 mb-8">AI领域最新动态</p>
          <div className="space-y-4">
            {news.map((n) => (
              <Link key={n.slug} href={`/news/${n.slug}`}>
                <div className="card p-5">
                  <div className="flex justify-between mb-2">
                    <span className="tag">{n.tag}</span>
                    <span className="text-zinc-500 text-sm">{n.date}</span>
                  </div>
                  <h3 className="font-semibold">{n.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
