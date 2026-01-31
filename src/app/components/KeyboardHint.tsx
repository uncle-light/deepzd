"use client";

import { useState, useEffect } from "react";

export default function KeyboardHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    const hideTimer = setTimeout(() => setVisible(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-rise-in hidden md:block">
      <div className="glass px-4 py-3 rounded-lg text-sm text-zinc-400">
        按 <kbd className="px-2 py-1 mx-1 bg-zinc-800 rounded text-white">⌘K</kbd> 快速搜索
      </div>
    </div>
  );
}
