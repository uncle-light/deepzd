import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { news } from "../data/news";

export default function News() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-20 md:pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI 资讯</h1>
            <p className="text-zinc-400 text-base md:text-lg">
              追踪AI领域最新动态
            </p>
          </header>
          
          <div className="space-y-3 md:space-y-4">
            {news.map((n) => (
              <Link key={n.slug} href={`/news/${n.slug}`} className="card p-4 md:p-6 block group">
                <div className="flex justify-between items-start mb-2">
                  <span className="tag text-xs">{n.tag}</span>
                  <span className="text-zinc-500 text-xs">{n.date}</span>
                </div>
                <h3 className="font-semibold text-base md:text-lg group-hover:text-violet-400 transition-colors">
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
