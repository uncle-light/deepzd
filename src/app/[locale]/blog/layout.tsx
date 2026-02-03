import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GEO博客 - 生成式引擎优化文章 | DeepZD",
  description: "探索GEO（生成式引擎优化）最新文章、教程和案例分析，学习如何让AI引用你的内容。",
  openGraph: {
    title: "GEO博客",
    description: "生成式引擎优化文章与教程",
    type: "website",
  },
};

function BlogListJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GEO博客",
    description: "生成式引擎优化文章与教程",
    url: "https://deepzd.com/blog",
    isPartOf: {
      "@type": "WebSite",
      name: "DeepZD",
      url: "https://deepzd.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

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
        name: "博客",
        item: "https://deepzd.com/blog",
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

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BlogListJsonLd />
      <BreadcrumbJsonLd />
      {children}
    </>
  );
}
