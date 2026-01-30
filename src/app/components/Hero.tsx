export default function Hero() {
  return (
    <section className="pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 bg-[#F3E8FF] text-[#7C3AED] text-sm font-medium rounded-full mb-6">
          🚀 AI 知识平台
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#1E1B4B] leading-tight">
          让每个人都能用好 <span className="text-[#7C3AED]">AI</span>
        </h1>

        <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
          发现好工具，学会怎么用。从入门到精通，探索 AI 的无限可能。
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/tutorials" 
            className="px-6 py-3 bg-[#7C3AED] text-white font-medium rounded-lg hover:bg-[#6D28D9] transition">
            开始学习 →
          </a>
          <a href="/about" 
            className="px-6 py-3 border border-[#DDD6FE] text-[#7C3AED] font-medium rounded-lg hover:bg-[#F3E8FF] transition">
            了解更多
          </a>
        </div>
      </div>
    </section>
  );
}
