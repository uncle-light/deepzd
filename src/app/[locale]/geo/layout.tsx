import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.geo");
  return {
    title: t("title"),
    description: t("description"),
    keywords: ["GEO", "Generative Engine Optimization", "AI SEO", "ChatGPT", "Perplexity"],
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "article",
    },
  };
}

export default function GeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
