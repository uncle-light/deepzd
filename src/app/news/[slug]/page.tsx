import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { news } from "../../data/news";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = news.find((n) => n.slug === slug);
  
  if (!article) notFound();

  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          <Link href="/news" className="text-violet-400 text-sm hover:underline mb-6 inline-block">
            ← 返回资讯列表
          </Link>
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="tag">{article.tag}</span>
              <span className="text-zinc-500 text-sm">{article.date}</span>
            </div>
            <h1 className="text-3xl font-bold">{article.title}</h1>
          </header>
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-zinc-300 prose-strong:text-white prose-li:text-zinc-300">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
