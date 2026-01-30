export default function Features() {
  const features = [
    {
      icon: "📚",
      title: "深度教程",
      desc: "从零开始，手把手教你掌握各类 AI 工具",
    },
    {
      icon: "⚡",
      title: "实战案例",
      desc: "真实场景应用，学完就能用",
    },
    {
      icon: "🔥",
      title: "前沿资讯",
      desc: "第一时间获取 AI 领域最新动态",
    },
  ];

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 text-[#1E1B4B]">
          为什么选择 DeepZD
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-xl bg-[#FAF5FF] border border-[#DDD6FE] hover:shadow-lg transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-[#7C3AED]">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
