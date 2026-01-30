import Link from "next/link";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DeepZD
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/tutorials" className="text-zinc-400 hover:text-white transition">教程</Link>
          <Link href="/tools" className="text-zinc-400 hover:text-white transition">工具</Link>
          <Link href="/news" className="text-zinc-400 hover:text-white transition">资讯</Link>
          <Link href="/about" className="text-zinc-400 hover:text-white transition">关于</Link>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <Hero />
      <Features />
      <LatestContent />
      <Footer />
    </div>
  );
}

function LatestContent() {
  return (
    <section className="py-20 px-6 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">最新内容</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ContentCard title="Midjourney 入门指南" tag="教程" href="/tutorials/midjourney-guide" />
          <ContentCard title="ChatGPT 使用技巧" tag="教程" href="/tutorials/chatgpt-tips" />
          <ContentCard title="DeepSeek 新模型发布" tag="资讯" href="/news/deepseek-new-model" />
        </div>
      </div>
    </section>
  );
}

function ContentCard({ title, tag, href }: { title: string; tag: string; href: string }) {
  return (
    <Link href={href} className="card p-5 block">
      <span className="tag">{tag}</span>
      <h3 className="font-semibold mt-3">{title}</h3>
    </Link>
  );
}
