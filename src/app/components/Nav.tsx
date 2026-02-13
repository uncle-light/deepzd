"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import UserMenu from "./UserMenu";

const navItems = [
  { href: "/geo", key: "geo" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
];

interface NavProps {
  user?: { name?: string | null; avatarUrl?: string | null } | null;
}

export default function Nav({ user }: NavProps = {}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("nav");
  const locale = (params.locale as string) || "zh";
  const isZh = locale === "zh";
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const switchLanguage = (targetLocale: string) => {
    const newPath = getLocalePath(targetLocale);
    setIsOpen(false);
    setLangOpen(false);
    router.push(newPath);
  };

  const getLocalePath = (targetLocale: string) => {
    if (pathname) {
      if (pathname === "/" || pathname === `/${locale}`) {
        return `/${targetLocale}`;
      }
      const newPath = pathname.replace(`/${locale}`, `/${targetLocale}`);
      if (newPath === pathname) {
        return `/${targetLocale}${pathname}`;
      }
      return newPath;
    }
    return `/${targetLocale}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="text-lg font-semibold text-[var(--foreground)] hover:opacity-80 transition-opacity"
        >
          DeepZD
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const fullHref = `/${locale}${item.href}`;
            const isActive = pathname?.includes(item.href);
            return (
              <Link
                key={item.href}
                href={fullHref}
                className={`px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-[var(--foreground)]"
                    : "text-[var(--gray-400)] hover:text-[var(--foreground)]"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-5 bg-[var(--border)] mx-2" />

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <span>{isZh ? "中文" : "EN"}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 py-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-xl">
                <button
                  onClick={() => switchLanguage("zh")}
                  className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                    isZh ? "text-[var(--foreground)] bg-[var(--surface-muted)]" : "text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => switchLanguage("en")}
                  className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                    !isZh ? "text-[var(--foreground)] bg-[var(--surface-muted)]" : "text-[var(--gray-400)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  English
                </button>
              </div>
            )}
          </div>

          {/* Auth */}
          <div className="w-px h-5 bg-[var(--border)] mx-2" />
          {user ? (
            <UserMenu locale={locale} userName={user.name} avatarUrl={user.avatarUrl} />
          ) : (
            <Link
              href={`/${locale}/login`}
              className="px-4 py-1.5 text-sm border border-[var(--border)] rounded-full text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors"
            >
              {t("login")}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`md:hidden border-t border-[var(--border)] bg-[var(--background)] overflow-hidden transition-all duration-200 ${
        isOpen ? "max-h-[300px]" : "max-h-0"
      }`}>
        {navItems.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive = pathname?.includes(item.href);
          return (
            <Link
              key={item.href}
              href={fullHref}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 text-sm border-b border-[var(--border)] transition-colors ${
                isActive ? "text-[var(--foreground)] bg-[var(--card-bg)]" : "text-[var(--gray-400)] hover:text-[var(--foreground)]"
              }`}
            >
              {t(item.key)}
            </Link>
          );
        })}

        {/* Mobile Language */}
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => switchLanguage("zh")}
            className={`flex-1 px-4 py-3 text-sm transition-colors ${
              isZh ? "text-[var(--foreground)] bg-[var(--card-bg)]" : "text-[var(--gray-400)]"
            }`}
          >
            中文
          </button>
          <button
            onClick={() => switchLanguage("en")}
            className={`flex-1 px-4 py-3 text-sm border-l border-[var(--border)] transition-colors ${
              !isZh ? "text-[var(--foreground)] bg-[var(--card-bg)]" : "text-[var(--gray-400)]"
            }`}
          >
            English
          </button>
        </div>

        {/* Mobile Auth */}
        {!user && (
          <Link
            href={`/${locale}/login`}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm text-center text-[var(--foreground)] bg-[var(--card-bg)] border-b border-[var(--border)]"
          >
            {t("login")}
          </Link>
        )}
        {user && (
          <Link
            href={`/${locale}/dashboard`}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm text-[var(--foreground)] border-b border-[var(--border)]"
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}
