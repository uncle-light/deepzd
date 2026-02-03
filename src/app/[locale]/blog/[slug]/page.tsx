import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase, type BlogPost } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 60;

type BlogDetail = Pick<BlogPost, "slug" | "title_zh" | "title_en" | "content_zh" | "content_en">;

async function fetchBlogPost(slug: string): Promise<BlogDetail | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title_zh, title_en, content_zh, content_en")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch blog post", error);
    return null;
  }

  return data ?? null;
}

export default async function BlogPost({
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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
