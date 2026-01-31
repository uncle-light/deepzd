"use client";

import { useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { prompts } from "../data/prompts";

type Prompt = typeof prompts[0];

function PromptCard({ 
  prompt, 
  isExpanded, 
  isCopied, 
  onToggle, 
  onCopy 
}: {
  prompt: Prompt;
  isExpanded: boolean;
  isCopied: boolean;
  onToggle: () => void;
  onCopy: () => void;
}) {
  return (
    <div className={`card p-4 transition-all ${isExpanded ? "ring-1 ring-violet-500/50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 cursor-pointer" onClick={onToggle}>
          <span className={`tag tag-${prompt.category} text-xs`}>{prompt.category}</span>
          <h3 className="font-semibold text-lg mt-2">{prompt.title}</h3>
          <p className="text-zinc-400 text-sm mt-1">{prompt.desc}</p>
        </div>
        <button
          onClick={onToggle}
          className="text-zinc-500 hover:text-white transition-colors p-1"
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-700/50 animate-fadeIn">
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-900/50 p-3 rounded-lg max-h-60 overflow-y-auto">
            {prompt.content}
          </pre>
          <button
            onClick={onCopy}
            className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all ${
              isCopied 
                ? "bg-green-500/20 text-green-400" 
                : "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
            }`}
          >
            {isCopied ? "✓ 已复制" : "📋 复制提示词"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Prompts() {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const handleCopy = async (slug: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                AI 提示词库
              </span>
            </h1>
            <p className="text-zinc-400">精选高质量提示词，点击展开查看完整内容</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((p) => (
              <PromptCard
                key={p.slug}
                prompt={p}
                isExpanded={expandedSlug === p.slug}
                isCopied={copiedSlug === p.slug}
                onToggle={() => setExpandedSlug(expandedSlug === p.slug ? null : p.slug)}
                onCopy={() => handleCopy(p.slug, p.content)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
