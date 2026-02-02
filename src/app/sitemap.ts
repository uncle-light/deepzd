export default async function sitemap() {
  const baseUrl = "https://deepzd.com";

  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/analyze`, lastModified: new Date() },
    { url: `${baseUrl}/prompts`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
  ];

  return staticPages;
}
