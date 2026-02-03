import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const siteUrl = "https://deepzd.com";

type BlogSlugRow = { slug: string };

async function fetchBlogSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch blog slugs for sitemap", error);
    return [];
  }

  return (data as BlogSlugRow[] | null)?.map((row) => row.slug) ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["zh", "en"];
  const routes = ["", "/geo", "/about", "/blog"];
  const blogSlugs = await fetchBlogSlugs();

  const sitemap: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      sitemap.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
      });
    }

    for (const slug of blogSlugs) {
      sitemap.push({
        url: `${siteUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return sitemap;
}
