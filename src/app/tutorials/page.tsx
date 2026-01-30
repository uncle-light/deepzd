import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { tutorials } from "../data/tutorials";

export default function Tutorials() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">教程中心</h1>
            <p className="text-zinc-400 text-lg">
              系统学习AI工具，从入门到精通
            </p>
          </header>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((t) => (
              <Link key={t.slug} href={`/tutorials/${t.slug}`} className="card p-6 group">
                <span className="tag">{t.tag}</span>
                <h3 className="font-semibold text-lg mt-3 group-hover:text-violet-400 transition-colors">
                  {t.title}
                </h3>
                <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                  {t.content.substring(0, 80)}...
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
