export default function Features() {
  const features = [
    { icon: "📚", title: "深度教程", desc: "系统学习AI工具", color: "violet" },
    { icon: "🛠️", title: "工具推荐", desc: "精选优质AI工具", color: "cyan" },
    { icon: "🔥", title: "前沿资讯", desc: "AI领域最新动态", color: "fuchsia" },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">为什么选择 DeepZD</h2>
        <p className="text-zinc-400 text-center mb-12">一站式AI学习平台</p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card p-6 text-center group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
