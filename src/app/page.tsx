import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import MouseGlow from "./components/MouseGlow";
import CommandPalette from "./components/CommandPalette";
import TypeWriter from "./components/TypeWriter";
import RandomDiscover from "./components/RandomDiscover";
import KonamiEasterEgg from "./components/KonamiEasterEgg";
import FloatingParticles from "./components/FloatingParticles";
import KeyboardHint from "./components/KeyboardHint";

export default function Home() {
  return (
    <div className="min-h-screen grid-bg relative overflow-x-hidden">
      <MouseGlow />
      <FloatingParticles />
      <CommandPalette />
      <KonamiEasterEgg />
      <KeyboardHint />
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
    <section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4 md:px-6 relative">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* 装饰光效 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-gradient-to-b from-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight">
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            <TypeWriter />
          </span>
        </h1>

        <p className="text-base md:text-xl text-zinc-400 mb-8 md:mb-10 px-4 max-w-2xl mx-auto">
          AI工具、教程、提示词、MCP、Skills 一站式导航
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/80 hover:bg-zinc-700 rounded-lg text-sm transition-all hover:scale-105"
          >
            <span>🔍</span>
            <span>搜索工具、教程...</span>
            <kbd className="hidden sm:inline px-2 py-0.5 text-xs bg-zinc-700 rounded ml-2">⌘K</kbd>
          </Link>
          <RandomDiscover />
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  return (
    <section className="py-12 md:py-16 px-4 md:px-6 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <span className="animate-pulse">🔥</span>
            AI 资讯
          </h2>
          <Link href="/news" className="text-violet-400 text-sm hover:text-violet-300 transition-colors">
            更多 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NewsItem title="DeepSeek R1 重磅发布" date="01-30" hot slug="deepseek-new-model" />
          <NewsItem title="Anthropic 发布 MCP 协议" date="01-28" slug="mcp-protocol" />
          <NewsItem title="GPT-5 正式发布" date="01-27" hot slug="gpt5-release" />
          <NewsItem title="Claude 4 系列更新" date="01-24" slug="claude-4-update" />
        </div>
      </div>
    </section>
  );
}

function NewsItem({ title, date, hot, slug }: { title: string; date: string; hot?: boolean; slug: string }) {
  return (
    <Link href={`/news/${slug}`} className="flex justify-between items-center p-4 card group">
      <div className="flex items-center gap-3">
        {hot && (
          <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 rounded border border-orange-500/20">HOT</span>
        )}
        <span className="text-sm group-hover:text-violet-400 transition-colors">{title}</span>
      </div>
      <span className="text-zinc-500 text-xs">{date}</span>
    </Link>
  );
}

function ToolsSection() {
  return (
    <section className="py-12 md:py-16 px-4 md:px-6 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <span>🛠️</span>
            AI 工具
          </h2>
          <Link href="/tools" className="text-violet-400 text-sm hover:text-violet-300 transition-colors">
            更多 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ToolItem name="ChatGPT" category="对话" icon="💬" href="/tools" />
          <ToolItem name="Claude" category="对话" icon="🤖" href="/tools" />
          <ToolItem name="Midjourney" category="绘画" icon="🎨" href="/tools" />
          <ToolItem name="Cursor" category="编程" icon="💻" href="/tools" />
        </div>
      </div>
    </section>
  );
}

function ToolItem({ name, category, icon, href }: { name: string; category: string; icon: string; href: string }) {
  return (
    <Link href={href} className="card p-4 md:p-5 text-center group">
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="font-medium text-sm md:text-base group-hover:text-violet-400 transition-colors">{name}</p>
      <span className={`tag tag-${category} text-xs mt-2 inline-block`}>{category}</span>
    </Link>
  );
}

function MCPSection() {
  return (
    <section className="py-12 md:py-16 px-4 md:px-6 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <span className="animate-pulse">⚡</span>
            MCP & Skills
          </h2>
          <Link href="/mcp" className="text-violet-400 text-sm hover:text-violet-300 transition-colors">
            更多 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/mcp" className="card p-6 md:p-8 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🔌
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-violet-400 transition-colors">MCP 服务器</h3>
                <p className="text-zinc-400 text-sm mt-1">AI的USB-C接口，连接无限可能</p>
              </div>
            </div>
          </Link>
          <Link href="/skills" className="card p-6 md:p-8 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🧩
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-violet-400 transition-colors">Agent Skills</h3>
                <p className="text-zinc-400 text-sm mt-1">AI能力扩展组件，解锁更多技能</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
