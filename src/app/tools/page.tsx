import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { tools } from "../data/tools";

export default function Tools() {
  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-20 md:pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI 工具推荐</h1>
            <p className="text-zinc-400 text-base md:text-lg">
              精选优质AI工具，助力效率提升
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {tools.map((t) => (
              <ToolCard key={t.slug} {...t} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ToolCard({ name, desc, category, url }: { 
  name: string; 
  desc: string; 
  category: string; 
  url: string 
}) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="card p-4 md:p-6 block group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-base md:text-lg group-hover:text-violet-400 transition-colors">
            {name}
          </h3>
          <p className="text-zinc-400 text-sm mt-2">{desc}</p>
        </div>
        <span className="tag text-xs ml-3">{category}</span>
      </div>
    </a>
  );
}
