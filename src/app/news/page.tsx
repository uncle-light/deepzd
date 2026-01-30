import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { news } from "../data/news";

export default function News() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">AI 资讯</h1>
            <p className="text-zinc-400 text-lg">
              追踪AI领域最新动态与深度分析
            </p>
          </header>
          
          <div className="space-y-4">
            {news.map((n) => (
              <Link key={n.slug} href={`/news/${n.slug}`} className="card p-6 block group">
                <div className="flex justify-between items-start mb-3">
                  <span className="tag">{n.tag}</span>
                  <span className="text-zinc-500 text-sm">{n.date}</span>
                </div>
                <h3 className="font-semibold text-lg group-hover:text-violet-400 transition-colors">
                  {n.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
