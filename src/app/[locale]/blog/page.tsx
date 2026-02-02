import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

// 博客文章数据
const posts = [
  {
    slug: "what-is-geo",
    date: "2026-02-01",
    readTime: 8,
  },
  {
    slug: "geo-vs-seo",
    date: "2026-02-02",
    readTime: 6,
  },
  {
    slug: "ai-citation-tips",
    date: "2026-02-03",
    readTime: 10,
  },
];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("blog");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--foreground)]">
            {t("title")}
          </h1>
          <p className="text-[var(--gray-400)] mb-12">{t("subtitle")}</p>

          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="block p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
              >
                <h2 className="text-xl font-semibold mb-2 text-[var(--foreground)]">
                  {t(`posts.${post.slug}.title`)}
                </h2>
                <p className="text-[var(--gray-400)] text-sm mb-4">
                  {t(`posts.${post.slug}.excerpt`)}
                </p>
                <div className="flex items-center gap-4 text-xs text-[var(--gray-500)]">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime} {t("minRead")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
