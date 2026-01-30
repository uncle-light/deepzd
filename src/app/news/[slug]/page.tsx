import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { news } from "../../data/news";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-[#DDD6FE]">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#7C3AED]">DeepZD</Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/tutorials" className="text-gray-600">教程</Link>
          <Link href="/news" className="text-[#7C3AED]">资讯</Link>
          <Link href="/about" className="text-gray-600">关于</Link>
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
    <div className="min-h-screen bg-[#FAF5FF]">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/news" className="text-[#7C3AED] text-sm mb-4 inline-block">← 返回资讯</Link>
          <div className="flex items-center gap-4 mt-4 mb-2">
            <span className="px-2 py-1 bg-[#F3E8FF] text-[#7C3AED] text-xs rounded">{item.tag}</span>
            <span className="text-gray-400 text-sm">{item.date}</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E1B4B] mb-6">{item.title}</h1>
          <article className="prose prose-gray max-w-none prose-p:text-gray-600">
            <ReactMarkdown>{item.content}</ReactMarkdown>
          </article>
        </div>
      </main>
    </div>
  );
}
