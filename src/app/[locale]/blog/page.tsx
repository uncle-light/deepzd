import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { supabase, type BlogPost } from "@/lib/supabase";

export const revalidate = 60;

type BlogListItem = Pick<
  BlogPost,
  "slug" | "title_zh" | "title_en" | "excerpt_zh" | "excerpt_en" | "published_at" | "read_time"
>;

async function fetchBlogPosts(): Promise<BlogListItem[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title_zh, title_en, excerpt_zh, excerpt_en, published_at, read_time")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch blog posts", error);
    return [];
  }

  return data ?? [];
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("blog");
  const posts = await fetchBlogPosts();
  const isZh = locale === "zh";

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
            {posts.map((post) => {
              const title = isZh ? post.title_zh : post.title_en;
              const excerpt = isZh
                ? post.excerpt_zh ?? post.excerpt_en
                : post.excerpt_en ?? post.excerpt_zh;
              return (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  className="block p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
                >
                  <h2 className="text-xl font-semibold mb-2 text-[var(--foreground)]">
                    {title}
                  </h2>
                  {excerpt && (
                    <p className="text-[var(--gray-400)] text-sm mb-4">
                      {excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[var(--gray-500)]">
                    {post.published_at && (
                      <>
                        <span>{post.published_at}</span>
                        <span>·</span>
                      </>
                    )}
                    {post.read_time !== null && (
                      <span>{post.read_time} {t("minRead")}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
