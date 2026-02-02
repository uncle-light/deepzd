import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            探索 AI 的无限可能
          </span>
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          DeepZ 为你提供最前沿的 AI 工具教程、行业资讯与实用指南，
          助你在人工智能时代保持领先。
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/tutorials" 
            className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors"
          >
            开始学习
          </Link>
          <Link 
            href="/tools" 
            className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 rounded-lg font-medium transition-colors"
          >
            探索工具
          </Link>
        </div>
      </div>
    </section>
  );
}
