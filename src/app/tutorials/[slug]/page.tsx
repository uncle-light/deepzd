import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { tutorials } from "../../data/tutorials";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-[#DDD6FE]">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#7C3AED]">DeepZD</Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/tutorials" className="text-[#7C3AED]">教程</Link>
          <Link href="/news" className="text-gray-600">资讯</Link>
          <Link href="/about" className="text-gray-600">关于</Link>
        </div>
      </div>
    </nav>
  );
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorial = tutorials.find(t => t.slug === slug);
  if (!tutorial) notFound();

  return (
    <div className="min-h-screen bg-[#FAF5FF]">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/tutorials" className="text-[#7C3AED] text-sm mb-4 inline-block">← 返回教程</Link>
          <span className="px-2 py-1 bg-[#F3E8FF] text-[#7C3AED] text-xs rounded ml-4">{tutorial.tag}</span>
          <h1 className="text-3xl font-bold text-[#1E1B4B] mt-4 mb-6">{tutorial.title}</h1>
          <article className="prose prose-gray max-w-none prose-headings:text-[#1E1B4B] prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-[#7C3AED]">
            <ReactMarkdown>{tutorial.content}</ReactMarkdown>
          </article>
        </div>
      </main>
    </div>
  );
}
