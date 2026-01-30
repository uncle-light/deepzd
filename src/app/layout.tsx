import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepZD - AI工具导航 | 教程 | MCP | Skills",
  description: "探索AI的无限可能。AI工具推荐、使用教程、提示词、MCP服务器、Agent Skills一站式导航平台。",
  keywords: "AI工具,ChatGPT,Claude,Midjourney,MCP,AI教程,提示词,Agent Skills",
  authors: [{ name: "DeepZD" }],
  openGraph: {
    title: "DeepZD - AI工具导航",
    description: "AI工具、教程、MCP、Skills一站式导航",
    type: "website",
  },
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
