export default function Features() {
  return (
    <section className="py-20 px-6 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📚"
            title="系统教程"
            desc="从入门到精通，覆盖主流AI工具的完整学习路径"
          />
          <FeatureCard
            icon="🛠️"
            title="工具推荐"
            desc="精选优质AI工具，附带详细使用指南与对比分析"
          />
          <FeatureCard
            icon="📰"
            title="行业资讯"
            desc="追踪AI领域最新动态，深度解读技术趋势"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { 
  icon: string; 
  title: string; 
  desc: string 
}) {
  return (
    <div className="text-center p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
