"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Search,
  History,
  Settings,
  KeyRound,
  Radar,
  X,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/analyze", key: "analyze", icon: Search },
  { href: "/dashboard/monitors", key: "monitors", icon: Radar },
  { href: "/dashboard/history", key: "history", icon: History },
  { href: "/dashboard/api-keys", key: "apiKeys", icon: KeyRound },
  { href: "/dashboard/settings", key: "settings", icon: Settings },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function DashboardSidebar({ open, onClose, onUpgrade }: DashboardSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("dashboard.nav");
  const tp = useTranslations("dashboard.plan");
  const locale = (params.locale as string) || "zh";
  const [planId, setPlanId] = useState<string>("free");

  useEffect(() => {
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((d) => { if (d.plan) setPlanId(d.plan); })
      .catch(() => {});
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    const fullHref = `/${locale}${href}`;
    return exact ? pathname === fullHref : pathname?.startsWith(fullHref);
  };

  const isFree = planId === "free";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[220px] bg-[var(--background)] border-r border-[var(--border)] z-50 transition-transform duration-200 md:translate-x-0 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)]">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-md bg-[var(--foreground)] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[var(--background)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
              DeepZD
            </span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors ${
                  active
                    ? "text-[var(--foreground)] bg-[var(--surface-muted)] font-medium"
                    : "text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Plan indicator */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="px-2.5 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--gray-500)] font-medium">
                {planId.toUpperCase()}
              </span>
              {isFree && onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="text-xs text-[var(--foreground)] hover:underline font-medium"
                >
                  {tp("upgrade")}
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--gray-500)] leading-relaxed">
              {tp(planId as "free" | "pro" | "enterprise")}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
