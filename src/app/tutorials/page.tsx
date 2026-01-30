import Link from "next/link";
import { tutorials } from "../data/tutorials";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-[#DDD6FE]">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#7C3AED]">DeepZD</Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/tutorials" className="text-[#7C3AED]">教程</Link>
          <Link href="/news" className="text-gray-600 hover:text-[#7C3AED]">资讯</Link>
          <Link href="/about" className="text-gray-600 hover:text-[#7C3AED]">关于</Link>
        </div>
      </div>
    </nav>
  );
}

export default function Tutorials() {
  return (
    <div className="min-h-screen bg-[#FAF5FF]">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1E1B4B] mb-2">教程中心</h1>
          <p className="text-gray-600 mb-8">从入门到精通，系统学习 AI 工具</p>
          <div className="space-y-4">
            {tutorials.map((t) => (
              <Link key={t.slug} href={`/tutorials/${t.slug}`}>
                <div className="p-5 bg-white rounded-xl border border-[#DDD6FE] hover:shadow-md transition cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-[#1E1B4B]">{t.title}</h3>
                    <span className="px-2 py-1 bg-[#F3E8FF] text-[#7C3AED] text-xs rounded">{t.tag}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
