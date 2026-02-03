import { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我们 | DeepZD",
  description: "DeepZD 是专注于GEO（生成式引擎优化）的知识平台，帮助内容创作者在AI时代获得更多曝光。",
  openGraph: {
    title: "关于 DeepZD",
    description: "专注于GEO的知识平台",
    type: "website",
  },
};

function AboutPageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "关于 DeepZD",
    description: "DeepZD 是专注于GEO的知识平台",
    mainEntity: {
      "@type": "Organization",
      name: "DeepZD",
      url: "https://deepzd.com",
      description: "GEO（生成式引擎优化）知识平台",
      email: "service@deepzd.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AboutPageJsonLd />
      {children}
    </>
  );
}
