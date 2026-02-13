"use client";

import { Menu } from "lucide-react";
import UserMenu from "./UserMenu";

interface DashboardNavProps {
  locale: string;
  userName?: string | null;
  avatarUrl?: string | null;
  onMenuClick: () => void;
}

export default function DashboardNav({
  locale,
  userName,
  avatarUrl,
  onMenuClick,
}: DashboardNavProps) {
  return (
    <header className="shrink-0 h-14 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-md text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Keyboard shortcut hint */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[var(--border)] text-[var(--gray-500)] text-xs cursor-default">
          <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)]">⌘</kbd>
          <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)]">K</kbd>
        </div>

        <UserMenu locale={locale} userName={userName} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
