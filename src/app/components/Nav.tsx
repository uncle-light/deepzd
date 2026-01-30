"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/tools", label: "AI工具" },
  { href: "/tutorials", label: "教程" },
  { href: "/prompts", label: "提示词" },
  { href: "/mcp", label: "MCP" },
  { href: "/skills", label: "Skills" },
  { href: "/news", label: "资讯" },
];

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full bg-zinc-950/90 backdrop-blur-md z-50 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <Link href="/" className="text-lg md:text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DeepZD
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                pathname?.startsWith(item.href)
                  ? "text-white font-medium"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-zinc-400 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>
      
      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 text-sm border-b border-zinc-800 ${
                pathname?.startsWith(item.href)
                  ? "text-white bg-zinc-900"
                  : "text-zinc-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
