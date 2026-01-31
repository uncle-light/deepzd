import { tools } from "../../data/tools";
import { notFound } from "next/navigation";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Link from "next/link";

type Tool = typeof tools[0];

function ToolContent({ tool, favicon, related }: { 
  tool: Tool; 
  favicon: string; 
  related: Tool[];
}) {
  return (
    <main className="pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <nav className="text-sm text-zinc-500 mb-6">
          <Link href="/tools" className="hover:text-white">AI工具</Link>
          <span className="mx-2">›</span>
          <span className="text-zinc-300">{tool.name}</span>
        </nav>

        <div className="card p-6 md:p-8">
          <div className="flex items-start gap-4 md:gap-6">
            <img src={favicon} alt={tool.name} className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-zinc-800" />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{tool.name}</h1>
                <span className={`tag tag-${tool.category}`}>{tool.category}</span>
              </div>
              <p className="text-zinc-400 mt-2 text-lg">{tool.desc}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-6 border-t border-zinc-700/50">
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2">
              访问官网 <span>↗</span>
            </a>
            <button className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
              ♡ 收藏
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">同类工具</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/tools/${r.slug}`} className="card p-3 hover:border-violet-500/50">
                  <p className="font-medium truncate">{r.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{r.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export default async function ToolDetail({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) notFound();

  const domain = new URL(tool.url).hostname;
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  
  const related = tools
    .filter((t) => t.category === tool.category && t.slug !== slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <ToolContent tool={tool} favicon={favicon} related={related} />
      <Footer />
    </div>
  );
}
