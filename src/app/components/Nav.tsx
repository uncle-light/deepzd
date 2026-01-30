"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tutorials", label: "教程" },
  { href: "/tools", label: "工具" },
  { href: "/news", label: "资讯" },
  { href: "/about", label: "关于" },
];

export default function Nav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          DeepZD
        </Link>
        <div className="flex gap-8 text-sm">
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
      </div>
    </nav>
  );
}
