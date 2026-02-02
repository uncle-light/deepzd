import { MetadataRoute } from "next";

const siteUrl = "https://deepzd.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["zh", "en"];
  const routes = ["", "/geo", "/about"];

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
  }

  return sitemap;
}
