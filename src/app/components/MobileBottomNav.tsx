"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/tools", label: "工具", icon: "🛠️" },
  { href: "/tutorials", label: "教程", icon: "📚" },
  { href: "/search", label: "搜索", icon: "🔍" },
  { href: "/news", label: "资讯", icon: "📰" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-zinc-800/50 safe-area-bottom">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname?.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-[56px] ${
                isActive
                  ? "text-violet-400"
                  : "text-zinc-500 active:text-zinc-300"
              }`}
            >
              <span className={`text-lg transition-transform ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium ${isActive ? "text-violet-400" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 w-1 h-1 bg-violet-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
