import { Metadata } from "next";

export const metadata: Metadata = {
  title: "什么是GEO？生成式引擎优化完整指南 | DeepZD",
  description:
    "GEO（Generative Engine Optimization）是针对AI搜索引擎的内容优化策略，让ChatGPT、Claude、Perplexity主动引用你的内容。",
  keywords: ["GEO", "生成式引擎优化", "AI SEO", "ChatGPT优化", "Perplexity优化"],
  openGraph: {
    title: "什么是GEO？生成式引擎优化完整指南",
    description: "让AI主动引用你的内容，掌握GEO核心策略",
    type: "article",
  },
};

// Article JSON-LD
function ArticleJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "什么是GEO？生成式引擎优化完整指南",
    description:
      "GEO（Generative Engine Optimization）是针对AI搜索引擎的内容优化策略",
    author: {
      "@type": "Organization",
      name: "DeepZD",
      url: "https://deepzd.com",
    },
    publisher: {
      "@type": "Organization",
      name: "DeepZD",
      url: "https://deepzd.com",
    },
    datePublished: "2026-02-01",
    dateModified: "2026-02-03",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://deepzd.com/geo",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Breadcrumb JSON-LD
function BreadcrumbJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: "https://deepzd.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "GEO指南",
        item: "https://deepzd.com/geo",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function GeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ArticleJsonLd />
      <BreadcrumbJsonLd />
      {children}
    </>
  );
}
