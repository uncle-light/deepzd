import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepZD - 深度AI知识平台",
  description: "让每个人都能用好AI，发现好工具，学会怎么用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
