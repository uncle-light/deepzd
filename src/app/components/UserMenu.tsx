"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react";

interface UserMenuProps {
  locale: string;
  userName?: string | null;
  avatarUrl?: string | null;
}

export default function UserMenu({ locale, userName, avatarUrl }: UserMenuProps) {
  const t = useTranslations("dashboard.nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-[var(--surface-muted)] transition-colors"
      >
        <div className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-[11px] font-medium text-[var(--foreground)] overflow-hidden bg-[var(--surface-muted)]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <ChevronDown className={`w-3 h-3 text-[var(--gray-400)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg overflow-hidden z-50">
          {/* User info header */}
          <div className="px-3 py-3 border-b border-[var(--border)] bg-[var(--surface-muted)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-xs font-medium text-[var(--foreground)] overflow-hidden bg-[var(--background)]">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                {userName && (
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{userName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href={`/${locale}/dashboard`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t("dashboard")}
            </Link>
            <Link
              href={`/${locale}/dashboard/settings`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              {t("settings")}
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-[var(--border)] py-1">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
