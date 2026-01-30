import Nav from "../components/Nav";
import Footer from "../components/Footer";

const skills = [
  {
    name: "代码审查",
    desc: "自动审查代码质量和安全问题",
    category: "开发",
    source: "@anthropic"
  },
  {
    name: "文档生成",
    desc: "根据代码自动生成API文档",
    category: "开发",
    source: "@cursor_ai"
  },
  {
    name: "数据分析",
    desc: "分析数据并生成可视化报告",
    category: "分析",
    source: "@anthropic"
  },
  {
    name: "内容写作",
    desc: "生成高质量文章和文案",
    category: "写作",
    source: "@openai"
  },
];

export default function Skills() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Agent Skills</h1>
            <p className="text-zinc-400 text-lg">
              AI智能体技能库 - 扩展AI能力的模块化组件
            </p>
          </header>
          
          <div className="grid md:grid-cols-2 gap-6">
            {skills.map((skill) => (
              <div key={skill.name} className="card p-6">
                <span className="tag">{skill.category}</span>
                <h3 className="font-semibold text-lg mt-3">{skill.name}</h3>
                <p className="text-zinc-400 text-sm mt-2">{skill.desc}</p>
                <p className="text-zinc-500 text-xs mt-3">来源：{skill.source}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
