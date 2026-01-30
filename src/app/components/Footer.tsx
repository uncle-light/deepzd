import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            DeepZD
          </Link>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href="/tutorials" className="hover:text-white transition">教程</Link>
            <Link href="/tools" className="hover:text-white transition">工具</Link>
            <Link href="/news" className="hover:text-white transition">资讯</Link>
            <Link href="/about" className="hover:text-white transition">关于</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-zinc-500 text-sm">
          © 2026 DeepZD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
