import Nav from "../components/Nav";
import Footer from "../components/Footer";

const prompts = [
  { title: "代码审查专家", desc: "审查代码质量、安全性", category: "开发" },
  { title: "全栈开发助手", desc: "前后端开发指导", category: "开发" },
  { title: "Bug修复专家", desc: "定位和修复代码问题", category: "开发" },
  { title: "产品文案撰写", desc: "生成产品描述文案", category: "写作" },
  { title: "小红书文案", desc: "爆款笔记生成", category: "写作" },
  { title: "公众号文章", desc: "微信文章创作", category: "写作" },
  { title: "数据分析师", desc: "数据洞察分析", category: "分析" },
  { title: "Excel公式专家", desc: "复杂公式生成", category: "办公" },
  { title: "英语翻译官", desc: "专业中英互译", category: "翻译" },
  { title: "日语翻译", desc: "中日互译", category: "翻译" },
  { title: "面试官模拟", desc: "技术面试练习", category: "求职" },
  { title: "简历优化", desc: "简历润色建议", category: "求职" },
  { title: "周报生成器", desc: "工作周报撰写", category: "办公" },
  { title: "会议纪要", desc: "会议内容整理", category: "办公" },
  { title: "Midjourney提示词", desc: "AI绘画提示词", category: "绘画" },
  { title: "Stable Diffusion", desc: "SD提示词优化", category: "绘画" },
];

export default function Prompts() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI 提示词</h1>
            <p className="text-zinc-400 text-base md:text-lg">
              精选高质量提示词，提升AI使用效率
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {prompts.map((p) => (
              <div key={p.title} className="card p-4 md:p-6">
                <span className="tag text-xs">{p.category}</span>
                <h3 className="font-semibold text-lg mt-2">{p.title}</h3>
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
