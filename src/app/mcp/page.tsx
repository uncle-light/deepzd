import Nav from "../components/Nav";
import Footer from "../components/Footer";

const mcpServers = [
  { name: "Filesystem", desc: "文件系统读写操作", author: "Anthropic", category: "核心" },
  { name: "GitHub", desc: "GitHub仓库管理", author: "Anthropic", category: "开发" },
  { name: "GitLab", desc: "GitLab项目集成", author: "Community", category: "开发" },
  { name: "Slack", desc: "Slack消息集成", author: "Anthropic", category: "通讯" },
  { name: "PostgreSQL", desc: "PostgreSQL数据库", author: "Anthropic", category: "数据库" },
  { name: "MySQL", desc: "MySQL数据库查询", author: "Community", category: "数据库" },
  { name: "SQLite", desc: "SQLite本地数据库", author: "Anthropic", category: "数据库" },
  { name: "MongoDB", desc: "MongoDB文档数据库", author: "Community", category: "数据库" },
  { name: "Redis", desc: "Redis缓存操作", author: "Community", category: "数据库" },
  { name: "Brave Search", desc: "Brave搜索引擎", author: "Anthropic", category: "搜索" },
  { name: "Google Search", desc: "Google搜索集成", author: "Community", category: "搜索" },
  { name: "Puppeteer", desc: "浏览器自动化", author: "Anthropic", category: "自动化" },
  { name: "Playwright", desc: "跨浏览器自动化", author: "Community", category: "自动化" },
  { name: "Docker", desc: "Docker容器管理", author: "Community", category: "运维" },
  { name: "Kubernetes", desc: "K8s集群操作", author: "Community", category: "运维" },
  { name: "AWS", desc: "AWS云服务集成", author: "Community", category: "云服务" },
  { name: "Notion", desc: "Notion笔记集成", author: "Community", category: "效率" },
  { name: "Linear", desc: "Linear项目管理", author: "Community", category: "效率" },
  { name: "Sentry", desc: "错误监控追踪", author: "Community", category: "监控" },
  { name: "Stripe", desc: "支付系统集成", author: "Community", category: "支付" },
];

export default function MCP() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">MCP 服务器</h1>
            <p className="text-zinc-400 text-base md:text-lg">
              Model Context Protocol - AI的USB-C接口，连接外部工具与数据源
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              来源：@anthropic @alexalbert__ on X
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {mcpServers.map((server) => (
              <div key={server.name} className="card p-4 md:p-6">
                <span className="tag text-xs">{server.category}</span>
                <h3 className="font-semibold text-lg mt-2">{server.name}</h3>
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
