import Nav from "../components/Nav";
import Footer from "../components/Footer";

const skills = [
  { name: "代码审查", desc: "审查代码质量和安全问题", category: "开发", source: "@anthropic" },
  { name: "代码重构", desc: "优化代码结构和性能", category: "开发", source: "@cursor_ai" },
  { name: "API文档生成", desc: "自动生成API文档", category: "开发", source: "@anthropic" },
  { name: "单元测试", desc: "生成单元测试用例", category: "开发", source: "@cursor_ai" },
  { name: "数据分析", desc: "分析数据生成报告", category: "分析", source: "@anthropic" },
  { name: "SQL生成", desc: "自然语言转SQL", category: "数据", source: "@openai" },
  { name: "文章写作", desc: "生成高质量文章", category: "写作", source: "@anthropic" },
  { name: "邮件撰写", desc: "专业邮件生成", category: "写作", source: "@openai" },
  { name: "文案优化", desc: "润色和改写文案", category: "写作", source: "@anthropic" },
  { name: "中英翻译", desc: "专业准确翻译", category: "翻译", source: "@deepl" },
  { name: "会议纪要", desc: "生成会议摘要", category: "效率", source: "@otter_ai" },
  { name: "PPT大纲", desc: "生成演示文稿大纲", category: "效率", source: "@gamma" },
  { name: "图表生成", desc: "数据可视化图表", category: "可视化", source: "@anthropic" },
  { name: "正则表达式", desc: "生成和解释正则", category: "工具", source: "@openai" },
  { name: "Cron表达式", desc: "生成定时任务表达式", category: "工具", source: "@anthropic" },
  { name: "Git操作", desc: "Git命令生成", category: "开发", source: "@github" },
  { name: "Docker配置", desc: "Dockerfile生成", category: "运维", source: "@docker" },
];

export default function Skills() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Agent Skills</h1>
            <p className="text-zinc-400 text-base md:text-lg">
              AI智能体技能库 - 扩展AI能力的模块化组件
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {skills.map((skill) => (
              <div key={skill.name} className="card p-4 md:p-6">
                <span className="tag text-xs">{skill.category}</span>
                <h3 className="font-semibold text-lg mt-2">{skill.name}</h3>
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
