import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <Hero />
      <NewsSection />
      <ToolsSection />
      <MCPSection />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-28 md:pt-32 pb-12 md:pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            探索 AI，从这里开始
          </span>
        </h1>
        <p className="text-base md:text-xl text-zinc-400 mb-6 md:mb-8 px-4">
          AI工具、教程、提示词、MCP、Skills 一站式导航
        </p>
        <Link href="/search" className="inline-block px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
          🔍 搜索工具、教程...
        </Link>
      </div>
    </section>
  );
}

function NewsSection() {
  return (
    <section className="py-8 md:py-12 px-4 md:px-6 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold">🔥 AI 资讯</h2>
          <Link href="/news" className="text-violet-400 text-sm">更多</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <NewsItem title="DeepSeek R1 重磅发布" date="01-30" />
          <NewsItem title="Anthropic 发布 MCP 协议" date="01-28" />
          <NewsItem title="GPT-5 正式发布" date="01-27" />
          <NewsItem title="Claude 4 系列更新" date="01-24" />
        </div>
      </div>
    </section>
  );
}

function NewsItem({ title, date }: { title: string; date: string }) {
  return (
    <div className="flex justify-between items-center p-3 md:p-4 card">
      <span className="text-sm">{title}</span>
      <span className="text-zinc-500 text-xs">{date}</span>
    </div>
  );
}

function ToolsSection() {
  return (
    <section className="py-8 md:py-12 px-4 md:px-6 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold">🛠️ AI 工具</h2>
          <Link href="/tools" className="text-violet-400 text-sm">更多</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <ToolItem name="ChatGPT" category="对话" />
          <ToolItem name="Claude" category="对话" />
          <ToolItem name="Midjourney" category="绘画" />
          <ToolItem name="Cursor" category="编程" />
        </div>
      </div>
    </section>
  );
}

function ToolItem({ name, category }: { name: string; category: string }) {
  return (
    <div className="card p-3 md:p-4 text-center">
      <p className="font-medium text-sm md:text-base">{name}</p>
      <p className="text-zinc-500 text-xs mt-1">{category}</p>
    </div>
  );
}

function MCPSection() {
  return (
    <section className="py-8 md:py-12 px-4 md:px-6 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold">⚡ MCP & Skills</h2>
          <Link href="/mcp" className="text-violet-400 text-sm">更多</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Link href="/mcp" className="card p-4 md:p-6">
            <h3 className="font-semibold">MCP 服务器</h3>
            <p className="text-zinc-400 text-sm mt-2">AI的USB-C接口</p>
          </Link>
          <Link href="/skills" className="card p-4 md:p-6">
            <h3 className="font-semibold">Agent Skills</h3>
            <p className="text-zinc-400 text-sm mt-2">AI能力扩展组件</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
