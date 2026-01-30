import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 md:py-16 px-4 md:px-6 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 md:mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              DeepZD
            </Link>
            <p className="text-zinc-500 text-sm mt-3">
              探索AI的无限可能
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3 md:mb-4 text-sm">学习</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <Link href="/tutorials" className="block hover:text-white">教程</Link>
              <Link href="/prompts" className="block hover:text-white">提示词</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3 md:mb-4 text-sm">工具</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <Link href="/tools" className="block hover:text-white">AI工具</Link>
              <Link href="/mcp" className="block hover:text-white">MCP</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3 md:mb-4 text-sm">更多</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <Link href="/skills" className="block hover:text-white">Skills</Link>
              <Link href="/news" className="block hover:text-white">资讯</Link>
            </div>
          </div>
        </div>
        <div className="pt-6 md:pt-8 border-t border-zinc-800 text-center text-zinc-500 text-xs md:text-sm">
          © 2026 DeepZD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
