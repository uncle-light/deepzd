import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { WebsiteJsonLd } from "./components/JsonLd";
import ScrollToTop from "./components/ScrollToTop";
import ThemeProvider from "./components/ThemeProvider";
import "./globals.css";

const siteUrl = "https://deepzd.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DeepZD - GEO 生成式引擎优化指南",
    template: "%s | DeepZD",
  },
  description:
    "GEO（生成式引擎优化）权威指南。学习如何优化内容结构，让 ChatGPT、Perplexity、Claude 等 AI 搜索引擎主动引用和推荐你的内容。",
  keywords: [
    "GEO",
    "生成式引擎优化",
    "AI SEO",
    "ChatGPT优化",
    "Perplexity优化",
    "AI搜索引擎",
    "内容优化",
  ],
  authors: [{ name: "DeepZD" }],
  creator: "DeepZD",
  alternates: {
    languages: {
      zh: siteUrl,
      en: `${siteUrl}/en`,
      "x-default": siteUrl,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    url: siteUrl,
    siteName: "DeepZD",
    title: "DeepZD - GEO 生成式引擎优化指南",
    description: "学习如何让 AI 搜索引擎主动引用和推荐你的内容",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepZD - GEO 生成式引擎优化指南",
    description: "学习如何让 AI 搜索引擎主动引用和推荐你的内容",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "google-adsense-account": "ca-pub-1747899040068481",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans">
        <Analytics />
        <WebsiteJsonLd locale={locale} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
