import Nav from "../components/Nav";
import Footer from "../components/Footer";

const prompts = [
  {
    title: "代码审查专家",
    desc: "审查代码质量、安全性和最佳实践",
    category: "开发",
    content: "你是一位资深代码审查专家..."
  },
  {
    title: "产品文案撰写",
    desc: "生成吸引用户的产品描述",
    category: "写作",
    content: "你是一位专业的产品文案..."
  },
  {
    title: "数据分析师",
    desc: "分析数据并提供洞察",
    category: "分析",
    content: "你是一位数据分析专家..."
  },
  {
    title: "英语翻译官",
    desc: "专业准确的中英互译",
    category: "翻译",
    content: "你是一位专业翻译..."
  },
];

export default function Prompts() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">AI 提示词</h1>
            <p className="text-zinc-400 text-lg">
              精选高质量提示词，提升AI使用效率
            </p>
          </header>
          
          <div className="grid md:grid-cols-2 gap-6">
            {prompts.map((p) => (
              <div key={p.title} className="card p-6">
                <span className="tag">{p.category}</span>
                <h3 className="font-semibold text-lg mt-3">{p.title}</h3>
                <p className="text-zinc-400 text-sm mt-2">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
