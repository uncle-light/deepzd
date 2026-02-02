"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getThemeByTime(): Theme {
  const hour = new Date().getHours();
  // 白天 6:00 - 18:00 使用浅色主题
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 初始化时根据时间设置主题
    setTheme(getThemeByTime());
    setMounted(true);

    // 每分钟检查一次是否需要切换主题
    const interval = setInterval(() => {
      setTheme(getThemeByTime());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("light", "dark");
      if (theme === "light") {
        document.documentElement.classList.add("light");
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
