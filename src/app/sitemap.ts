import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const siteUrl = "https://deepzd.com";
const defaultLocale = "zh";

type BlogSlugRow = { slug: string };

/** 根据 as-needed 策略生成 URL：默认语言无前缀，其他语言加前缀 */
function localeUrl(route: string, locale: string): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${siteUrl}${prefix}${route}`;
}

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

  // 静态路由
  for (const route of routes) {
    const alternates: Record<string, string> = {};
    for (const loc of locales) {
      alternates[loc] = localeUrl(route, loc);
    }

    sitemap.push({
      url: localeUrl(route, defaultLocale),
      lastModified: new Date(),
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1 : 0.8,
      alternates: { languages: alternates },
    });
  }

  // 博客文章路由
  for (const slug of blogSlugs) {
    const blogRoute = `/blog/${slug}`;
    const alternates: Record<string, string> = {};
    for (const loc of locales) {
      alternates[loc] = localeUrl(blogRoute, loc);
    }

    sitemap.push({
      url: localeUrl(blogRoute, defaultLocale),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: alternates },
    });
  }

  return sitemap;
}
