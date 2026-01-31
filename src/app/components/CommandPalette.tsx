"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { tools } from "../data/tools";
import { tutorials } from "../data/tutorials";
import { news } from "../data/news";

type SearchResult = {
  type: "tool" | "tutorial" | "news";
  slug: string;
  name: string;
  desc: string;
  category?: string;
  url?: string;
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 合并搜索结果
  const getResults = (): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    
    const toolResults: SearchResult[] = tools
      .filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
      .slice(0, 4)
      .map(t => ({ type: "tool", slug: t.slug, name: t.name, desc: t.desc, category: t.category, url: t.url }));
    
    const tutorialResults: SearchResult[] = tutorials
      .filter(t => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map(t => ({ type: "tutorial", slug: t.slug, name: t.title, desc: t.content.slice(0, 60) + "..." }));
    
    const newsResults: SearchResult[] = news
      .filter(n => n.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map(n => ({ type: "news", slug: n.slug, name: n.title, desc: n.content.slice(0, 60) + "..." }));
    
    return [...toolResults, ...tutorialResults, ...newsResults];
  };

  const results = getResults();

  // 高亮匹配文字
  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-violet-500/30 text-violet-300 rounded px-0.5">{part}</mark> : part
    );
  };

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    if (result.type === "tool" && result.url) {
      window.open(result.url, "_blank");
    } else if (result.type === "tutorial") {
      router.push(`/tutorials/${result.slug}`);
    } else if (result.type === "news") {
      router.push(`/news/${result.slug}`);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen(prev => !prev);
      setSelectedIndex(0);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  // 列表键盘导航
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const typeIcon = { tool: "🛠️", tutorial: "📚", news: "📰" };
  const typeLabel = { tool: "工具", tutorial: "教程", news: "资讯" };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-xl mx-4 glass rounded-xl shadow-2xl border border-zinc-700/50 animate-rise-in">
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 p-4 border-b border-zinc-700/50">
          <span className="text-zinc-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索工具、教程、资讯..."
            className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoFocus
          />
          <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded text-zinc-400">ESC</kbd>
        </div>

        {/* 搜索结果 */}
        {query && (
          <div className="max-h-80 overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.slug}`}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex ? "bg-violet-500/20 border border-violet-500/30" : "hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="text-lg">{typeIcon[result.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{highlightMatch(result.name)}</p>
                        {result.category && (
                          <span className={`tag tag-${result.category} text-[10px]`}>{result.category}</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 truncate">{result.desc}</p>
                    </div>
                    <span className="text-xs text-zinc-600">{typeLabel[result.type]}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="p-4 text-center text-zinc-500">未找到相关内容</p>
            )}
          </div>
        )}

        {/* 空状态提示 */}
        {!query && (
          <div className="p-4 text-center text-zinc-500 text-sm">
            <p>输入关键词搜索</p>
            <p className="mt-2 text-xs text-zinc-600">↑↓ 导航 · ↵ 打开 · ESC 关闭</p>
          </div>
        )}
      </div>
    </div>
  );
}
