"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/tools", label: "AI工具", icon: "🛠️" },
  { href: "/tutorials", label: "教程", icon: "📚" },
  { href: "/prompts", label: "提示词", icon: "💡" },
  { href: "/mcp", label: "MCP", icon: "🔌" },
  { href: "/skills", label: "Skills", icon: "🧩" },
  { href: "/news", label: "资讯", icon: "📰" },
];

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full glass z-50 border-b border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <Link href="/" className="text-lg md:text-xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          DeepZD
        </Link>

        {/* Desktop Nav - 改进版：底部指示条 */}
        <div className="hidden md:flex gap-1 text-sm">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-white font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                {item.label}
                {/* 底部指示条 */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-zinc-400 p-2 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Nav - 改进版：平滑过渡 */}
      <div 
        className={`md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-md overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-zinc-800/50 transition-colors ${
                isActive
                  ? "text-white bg-violet-500/10 border-l-2 border-l-violet-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <span className="ml-auto text-violet-400">●</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
