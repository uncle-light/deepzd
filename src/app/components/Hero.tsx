export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 glow-effect relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-block px-4 py-1.5 tag mb-6">
          🚀 AI 知识平台
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          让每个人都能
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent"> 用好 AI</span>
        </h1>
        <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          发现好工具，学会怎么用。<br/>从入门到精通，探索 AI 的无限可能。
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/tutorials" className="btn-primary">开始学习 →</a>
          <a href="/tools" className="px-6 py-3 border border-zinc-700 rounded-lg hover:border-violet-500 hover:text-violet-400 transition">
            探索工具
          </a>
        </div>
      </div>
    </section>
  );
}
