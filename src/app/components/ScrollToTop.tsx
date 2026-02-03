"use client";

import { useEffect, useState } from "react";

interface ScrollToTopProps {
  threshold?: number;
  label?: string;
}

export default function ScrollToTop({ threshold = 500, label = "返回顶部" }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label={label}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--gray-500)] hover:text-[var(--foreground)] hover:border-[var(--border-light)] transition-all shadow-lg"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
