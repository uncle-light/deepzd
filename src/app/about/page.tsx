import Link from "next/link";

function Nav() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-[#DDD6FE]">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-[#7C3AED]">DeepZD</Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/tutorials" className="text-gray-600 hover:text-[#7C3AED]">教程</Link>
          <Link href="/news" className="text-gray-600 hover:text-[#7C3AED]">资讯</Link>
          <Link href="/about" className="text-[#7C3AED]">关于</Link>
        </div>
      </div>
    </nav>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF5FF]">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1E1B4B] mb-6">关于 DeepZD</h1>
          
          <div className="prose prose-gray">
            <p className="text-gray-600 mb-4">
              DeepZD 是一个专注于 AI 知识分享的平台，致力于让每个人都能轻松掌握 AI 工具。
            </p>
            <p className="text-gray-600 mb-4">
              我们提供深度教程、实战案例和前沿资讯，帮助你从入门到精通。
            </p>
            <p className="text-gray-600">
              无论你是 AI 新手还是进阶用户，都能在这里找到适合自己的学习内容。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
