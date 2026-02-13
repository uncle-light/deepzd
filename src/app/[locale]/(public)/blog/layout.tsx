import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { BlogListJsonLd, BlogBreadcrumbJsonLd } from "../../../components/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.blog");
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
    },
  };
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <BlogListJsonLd locale={locale} />
      <BlogBreadcrumbJsonLd locale={locale} />
      {children}
    </>
  );
}
