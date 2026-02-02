// JSON-LD Structured Data for GEO/SEO

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DeepZD",
    url: "https://deepzd.com",
    description: "GEO（生成式引擎优化）权威指南",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://deepzd.com/search?q={search_term_string}",
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
