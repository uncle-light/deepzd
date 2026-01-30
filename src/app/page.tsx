import Link from "next/link";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF5FF]">
      {/* 导航栏 */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-[#DDD6FE]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-[#7C3AED]">
            DeepZD
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/tutorials" className="text-gray-600 hover:text-[#7C3AED] transition">教程</Link>
            <Link href="/news" className="text-gray-600 hover:text-[#7C3AED] transition">资讯</Link>
            <Link href="/about" className="text-gray-600 hover:text-[#7C3AED] transition">关于</Link>
          </div>
        </div>
      </nav>

      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
