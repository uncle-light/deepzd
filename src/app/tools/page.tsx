"use client";

import { useState, useMemo } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CategoryFilter from "../components/CategoryFilter";
import { tools } from "../data/tools";

export default function Tools() {
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const categories = useMemo(() => {
    const cats = [...new Set(tools.map((t) => t.category))];
    return cats;
  }, []);

  // 计算每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tools.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredTools = useMemo(() => {
    if (selectedCategory === "全部") return tools;
    return tools.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-20 md:pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                AI 工具推荐
              </span>
            </h1>
            <p className="text-zinc-400 text-base md:text-lg">
              精选 {tools.length}+ 优质AI工具，助力效率提升
            </p>
          </header>

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            counts={categoryCounts}
            totalCount={tools.length}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map((t, i) => (
              <ToolCard key={t.slug} {...t} index={i} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ToolCard({
  name,
  desc,
  category,
  url,
  index,
}: {
  name: string;
  desc: string;
  category: string;
  url: string;
  index: number;
}) {
  // 从URL提取域名获取favicon
  const domain = new URL(url).hostname;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-5 block group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
          <img 
            src={faviconUrl} 
            alt={name}
            className="w-8 h-8"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base md:text-lg group-hover:text-violet-400 transition-colors">
              {name}
            </h3>
            <span className={`tag tag-${category} text-xs ml-3 shrink-0`}>
              {category}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{desc}</p>
        </div>
      </div>
    </a>
  );
}
