import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              DeepZD
            </Link>
            <p className="text-zinc-500 text-sm mt-3">
              探索AI的无限可能
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">学习</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <Link href="/tutorials" className="block hover:text-white transition">教程中心</Link>
              <Link href="/tools" className="block hover:text-white transition">工具推荐</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-4">资讯</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <Link href="/news" className="block hover:text-white transition">最新动态</Link>
              <Link href="/about" className="block hover:text-white transition">关于我们</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-4">联系</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>反馈建议</p>
              <p>商务合作</p>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          © 2026 DeepZD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
