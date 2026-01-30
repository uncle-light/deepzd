import Nav from "../components/Nav";
import Footer from "../components/Footer";

const mcpServers = [
  {
    name: "Filesystem",
    desc: "文件系统读写操作",
    author: "Anthropic",
    source: "@anthropic"
  },
  {
    name: "GitHub",
    desc: "GitHub仓库操作",
    author: "Anthropic",
    source: "@anthropic"
  },
  {
    name: "Slack",
    desc: "Slack消息集成",
    author: "Anthropic",
    source: "@anthropic"
  },
  {
    name: "PostgreSQL",
    desc: "数据库查询操作",
    author: "Anthropic",
    source: "@anthropic"
  },
  {
    name: "Brave Search",
    desc: "网络搜索能力",
    author: "Anthropic",
    source: "@anthropic"
  },
  {
    name: "Puppeteer",
    desc: "浏览器自动化",
    author: "Anthropic",
    source: "@anthropic"
  },
];

export default function MCP() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">MCP 服务器</h1>
            <p className="text-zinc-400 text-lg">
              Model Context Protocol - AI的USB-C接口
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              来源：@anthropic @alexalbert__ on X
            </p>
          </header>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mcpServers.map((server) => (
              <div key={server.name} className="card p-6">
                <h3 className="font-semibold text-lg">{server.name}</h3>
                <p className="text-zinc-400 text-sm mt-2">{server.desc}</p>
                <p className="text-zinc-500 text-xs mt-3">by {server.author}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
