// JSON-LD Structured Data for GEO/SEO

const SITE_URL = "https://deepzd.com";
const ORG_NAME = "DeepZD";

export function WebsiteJsonLd({ locale = "zh" }: { locale?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_NAME,
    url: SITE_URL,
    description:
      locale === "zh"
        ? "GEO（生成式引擎优化）权威指南"
        : "The definitive guide to GEO (Generative Engine Optimization)",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** About page: AboutPage + Organization */
export function AboutPageJsonLd({ locale = "zh" }: { locale?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: locale === "zh" ? `关于 ${ORG_NAME}` : `About ${ORG_NAME}`,
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@type": "Organization",
      name: ORG_NAME,
      url: SITE_URL,
      email: "service@deepzd.com",
      description:
        locale === "zh"
          ? "GEO（生成式引擎优化）工具平台"
          : "GEO (Generative Engine Optimization) tool platform",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** WebApplication JSON-LD for tool pages (GEO, citation-test) */
export function WebAppJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${SITE_URL}${url}`,
    applicationCategory: "SEO Tool",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: ORG_NAME,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Blog list page: CollectionPage */
export function BlogListJsonLd({ locale }: { locale: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: locale === "zh" ? "DeepZD 博客" : "DeepZD Blog",
    description: locale === "zh"
      ? "GEO 优化技巧、AI 搜索趋势和内容策略"
      : "GEO optimization tips, AI search trends and content strategies",
    url: `${SITE_URL}/${locale}/blog`,
    isPartOf: {
      "@type": "WebSite",
      name: ORG_NAME,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Blog article page: Article + BreadcrumbList */
export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  locale,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  locale: string;
}) {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      url: `${SITE_URL}${url}`,
      datePublished,
      dateModified: datePublished,
      author: {
        "@type": "Organization",
        name: ORG_NAME,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: ORG_NAME,
        url: SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "zh" ? "首页" : "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "zh" ? "博客" : "Blog",
          item: `${SITE_URL}/${locale}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
        },
      ],
    },
  ];

  return (
    <>
      {data.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}

/** Blog list breadcrumb: BreadcrumbList */
export function BlogBreadcrumbJsonLd({ locale }: { locale: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "zh" ? "首页" : "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "zh" ? "博客" : "Blog",
        item: `${SITE_URL}/${locale}/blog`,
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
