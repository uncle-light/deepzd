import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">关于 DeepZD</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">我们的使命</h2>
            <p className="text-zinc-400 leading-relaxed">
              DeepZD 致力于帮助每个人理解和使用人工智能技术。我们相信，AI 不应该是少数人的专利，
              而应该成为提升每个人生产力和创造力的工具。
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">我们提供什么</h2>
            <ul className="space-y-3 text-zinc-400">
              <li>• 深入浅出的 AI 工具教程</li>
              <li>• 精选优质工具推荐与对比</li>
              <li>• 行业动态与趋势分析</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">联系我们</h2>
            <p className="text-zinc-400">
              如有建议或合作意向，欢迎联系。
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
