"use client";

import { useState } from "react";
import { tools } from "../data/tools";

export default function RandomDiscover() {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleDiscover = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const randomTool = tools[Math.floor(Math.random() * tools.length)];
      window.open(randomTool.url, "_blank");
      setIsSpinning(false);
    }, 800);
  };

  return (
    <button
      onClick={handleDiscover}
      className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all"
      disabled={isSpinning}
    >
      <span className={`inline-block ${isSpinning ? "animate-spin" : ""}`}>
        🎲
      </span>
      <span className="ml-2 text-sm text-zinc-300">随机发现</span>
    </button>
  );
}
