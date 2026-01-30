import Link from "next/link";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <Hero />
      <Features />
      <LatestContent />
      <ToolsPreview />
      <Footer />
    </div>
  );
}

function LatestContent() {
  return (
    <section className="py-20 px-6 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">最新内容</h2>
          <Link href="/tutorials" className="text-violet-400 text-sm hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <ContentCard 
            title="Midjourney 2025 完全入门指南" 
            desc="从注册到进阶，掌握AI绘画核心技巧"
            tag="绘画" 
            href="/tutorials/midjourney-guide" 
          />
          <ContentCard 
            title="ChatGPT 高效使用技巧" 
            desc="提升10倍效率的提问方法论"
            tag="对话" 
            href="/tutorials/chatgpt-tips" 
          />
          <ContentCard 
            title="DeepSeek R1 重磅发布" 
            desc="中国AI的效率突破，训练成本降低90%"
            tag="资讯" 
            href="/news/deepseek-new-model" 
          />
        </div>
      </div>
    </section>
  );
}

function ContentCard({ title, desc, tag, href }: { 
  title: string; 
  desc: string;
  tag: string; 
  href: string 
}) {
  return (
    <Link href={href} className="card p-6 block group">
      <span className="tag">{tag}</span>
      <h3 className="font-semibold mt-3 group-hover:text-violet-400 transition-colors">{title}</h3>
      <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{desc}</p>
    </Link>
  );
}

function ToolsPreview() {
  return (
    <section className="py-20 px-6 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">热门工具</h2>
          <Link href="/tools" className="text-violet-400 text-sm hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <ToolCard name="ChatGPT" desc="最强AI对话助手" category="对话" />
          <ToolCard name="Midjourney" desc="顶级AI绘画工具" category="绘画" />
          <ToolCard name="Cursor" desc="AI驱动的代码编辑器" category="编程" />
          <ToolCard name="Runway" desc="专业AI视频生成" category="视频" />
        </div>
      </div>
    </section>
  );
}

function ToolCard({ name, desc, category }: { 
  name: string; 
  desc: string;
  category: string;
}) {
  return (
    <div className="card p-5 text-center group hover:border-violet-500/50 transition-colors">
      <span className="tag text-xs">{category}</span>
      <h3 className="font-semibold mt-2">{name}</h3>
      <p className="text-zinc-500 text-sm mt-1">{desc}</p>
    </div>
  );
}
