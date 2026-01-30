import { tutorials } from "./data/tutorials";
import { news } from "./data/news";

export default async function sitemap() {
  const baseUrl = "https://deepzd.vercel.app";
  
  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/tools`, lastModified: new Date() },
    { url: `${baseUrl}/tutorials`, lastModified: new Date() },
    { url: `${baseUrl}/news`, lastModified: new Date() },
    { url: `${baseUrl}/mcp`, lastModified: new Date() },
    { url: `${baseUrl}/skills`, lastModified: new Date() },
    { url: `${baseUrl}/prompts`, lastModified: new Date() },
  ];

  const tutorialPages = tutorials.map((t) => ({
    url: `${baseUrl}/tutorials/${t.slug}`,
    lastModified: new Date(),
  }));

  const newsPages = news.map((n) => ({
    url: `${baseUrl}/news/${n.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...tutorialPages, ...newsPages];
}
