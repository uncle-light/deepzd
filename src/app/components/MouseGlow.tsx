"use client";

import { useEffect, useState } from "react";

export default function MouseGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // 仅在桌面端显示
    if (window.innerWidth < 768) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible, mounted]);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div
      className="fixed pointer-events-none z-0 transition-opacity duration-300"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* 主光晕 - 蓝色调 */}
      <div
        className="w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,112,243,0.15) 0%, rgba(0,112,243,0.05) 40%, transparent 70%)",
        }}
      />
    </div>
  );
}
