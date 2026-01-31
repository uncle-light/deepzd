"use client";

import { useEffect, useState, useCallback } from "react";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA"
];

const AI_QUOTES = [
  "AI 不会取代你，但会用 AI 的人会。",
  "未来已来，只是分布不均。",
  "最好的 AI 是让你忘记它存在的 AI。",
  "人工智能是新的电力。",
  "数据是新时代的石油。",
];

export default function KonamiEasterEgg() {
  const [keys, setKeys] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);
  const [quote, setQuote] = useState("");

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys((prev) => {
      const newKeys = [...prev, e.code].slice(-10);
      if (newKeys.join(",") === KONAMI_CODE.join(",")) {
        setActivated(true);
        setQuote(AI_QUOTES[Math.floor(Math.random() * AI_QUOTES.length)]);
        setTimeout(() => setActivated(false), 4000);
        return [];
      }
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!activated) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <div className="animate-rise-in text-center p-8 glass rounded-2xl max-w-md mx-4">
        <div className="text-4xl mb-4">🎉</div>
        <p className="text-xl font-medium text-white mb-2">彩蛋解锁！</p>
        <p className="text-zinc-400 italic">&ldquo;{quote}&rdquo;</p>
      </div>
    </div>
  );
}
