"use client";

import { useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { tools } from "../data/tools";
import { tutorials } from "../data/tutorials";
import { news } from "../data/news";

export default function Search() {
  const [query, setQuery] = useState("");
  
  const results = query.length > 1 ? [
    ...tools.filter(t => t.name.toLowerCase().includes(query.toLowerCase())).map(t => ({ ...t, type: "工具" })),
    ...tutorials.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).map(t => ({ ...t, type: "教程", name: t.title })),
    ...news.filter(n => n.title.toLowerCase().includes(query.toLowerCase())).map(n => ({ ...n, type: "资讯", name: n.title })),
  ] : [];

  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-20 md:pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">搜索</h1>
          <input
            type="text"
            placeholder="搜索工具、教程、资讯..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-violet-500 outline-none"
          />
          
          {results.length > 0 && (
            <div className="mt-6 space-y-3">
              {results.map((r, i) => (
                <div key={i} className="card p-4">
                  <span className="tag text-xs">{r.type}</span>
                  <p className="mt-2 font-medium">{r.name}</p>
                </div>
              ))}
            </div>
          )}
          
          {query.length > 1 && results.length === 0 && (
            <p className="mt-6 text-zinc-500">未找到相关结果</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
