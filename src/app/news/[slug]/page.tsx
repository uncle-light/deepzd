import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { news } from "../../data/news";

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
          <Link href="/news" className="text-white">资讯</Link>
        </div>
      </div>
    </nav>
  );
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = news.find(n => n.slug === slug);
  if (!item) notFound();

  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/news" className="text-violet-400 text-sm">← 返回</Link>
          <div className="flex items-center gap-4 mt-4 mb-2">
            <span className="tag">{item.tag}</span>
            <span className="text-zinc-500 text-sm">{item.date}</span>
          </div>
          <h1 className="text-3xl font-bold mb-6">{item.title}</h1>
          <article className="prose prose-invert max-w-none">
            <ReactMarkdown>{item.content}</ReactMarkdown>
          </article>
        </div>
      </main>
    </div>
  );
}
