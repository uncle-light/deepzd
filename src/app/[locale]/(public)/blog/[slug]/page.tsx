import { getTranslations } from "next-intl/server";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { supabase, type BlogPost } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReadingProgress from "../../../../components/ReadingProgress";

export const revalidate = 60;

const siteUrl = "https://deepzd.com";

type BlogDetail = Pick<BlogPost, "slug" | "title_zh" | "title_en" | "content_zh" | "content_en" | "excerpt_zh" | "excerpt_en" | "published_at">;
type BlogNavItem = Pick<BlogPost, "slug" | "title_zh" | "title_en">;

async function fetchBlogPost(slug: string): Promise<BlogDetail | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title_zh, title_en, content_zh, content_en, excerpt_zh, excerpt_en, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch blog post", error);
    return null;
  }

  return data ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  const isZh = locale === "zh";
  const title = isZh ? post.title_zh : post.title_en;
  const description = (isZh ? post.excerpt_zh : post.excerpt_en)
    ?? (isZh ? post.excerpt_en : post.excerpt_zh)
    ?? `${title} - DeepZD Blog`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      url: `${siteUrl}/${locale}/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      languages: {
        "zh": `${siteUrl}/blog/${slug}`,
        "en": `${siteUrl}/en/blog/${slug}`,
        "x-default": `${siteUrl}/blog/${slug}`,
      },
    },
  };
}

async function fetchAdjacentPosts(publishedAt: string | null): Promise<{ prev: BlogNavItem | null; next: BlogNavItem | null }> {
  if (!publishedAt) return { prev: null, next: null };

  const { data: prevData } = await supabase
    .from("blog_posts")
    .select("slug, title_zh, title_en")
    .lt("published_at", publishedAt)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: nextData } = await supabase
    .from("blog_posts")
    .select("slug, title_zh, title_en")
    .gt("published_at", publishedAt)
    .order("published_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { prev: prevData ?? null, next: nextData ?? null };
}

function ArticleJsonLd({ title, slug, publishedAt }: { title: string; slug: string; publishedAt: string | null }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    author: { "@type": "Organization", name: "DeepZD", url: "https://deepzd.com" },
    publisher: { "@type": "Organization", name: "DeepZD", url: "https://deepzd.com" },
    datePublished: publishedAt || "2026-02-01",
    dateModified: publishedAt || "2026-02-01",
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://deepzd.com/blog/${slug}` },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function BreadcrumbJsonLd({ title, slug }: { title: string; slug: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: "https://deepzd.com" },
      { "@type": "ListItem", position: 2, name: "博客", item: "https://deepzd.com/blog" },
      { "@type": "ListItem", position: 3, name: title, item: `https://deepzd.com/blog/${slug}` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("blog");
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  const isZh = locale === "zh";
  const title = isZh ? post.title_zh : post.title_en;
  const content = (isZh ? post.content_zh : post.content_en) ?? (isZh ? post.content_en : post.content_zh) ?? "";

  const { prev, next } = await fetchAdjacentPosts(post.published_at);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ReadingProgress />
      <ArticleJsonLd title={title} slug={slug} publishedAt={post.published_at} />
      <BreadcrumbJsonLd title={title} slug={slug} />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <article className="max-w-3xl mx-auto">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-[var(--gray-400)] hover:text-[var(--foreground)] mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("backToList")}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--foreground)]">
            {title}
          </h1>

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </div>

          {(prev || next) && (
            <nav className="mt-16 pt-8 border-t border-[var(--border)]">
              <div className="flex justify-between gap-4">
                {prev ? (
                  <Link
                    href={`/${locale}/blog/${prev.slug}`}
                    className="group flex-1 max-w-[45%]"
                  >
                    <span className="text-sm text-[var(--gray-500)] mb-1 block">
                      {t("prevPost")}
                    </span>
                    <span className="text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {isZh ? prev.title_zh : prev.title_en}
                    </span>
                  </Link>
                ) : <div />}
                {next ? (
                  <Link
                    href={`/${locale}/blog/${next.slug}`}
                    className="group flex-1 max-w-[45%] text-right"
                  >
                    <span className="text-sm text-[var(--gray-500)] mb-1 block">
                      {t("nextPost")}
                    </span>
                    <span className="text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {isZh ? next.title_zh : next.title_en}
                    </span>
                  </Link>
                ) : <div />}
              </div>
            </nav>
          )}
        </article>
      </main>
    </div>
  );
}
