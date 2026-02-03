import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import TagFilter from "../../components/TagFilter";
import { supabase, type BlogPost, type BlogTag } from "@/lib/supabase";

export const revalidate = 60;

type BlogListItem = Pick<
  BlogPost,
  "id" | "slug" | "title_zh" | "title_en" | "excerpt_zh" | "excerpt_en" | "published_at" | "read_time"
> & { tags?: BlogTag[] };

async function fetchBlogPosts(): Promise<BlogListItem[]> {
  // 获取文章列表
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title_zh, title_en, excerpt_zh, excerpt_en, published_at, read_time")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch blog posts", error);
    return [];
  }

  if (!posts || posts.length === 0) return [];

  // 获取文章标签关联
  const postIds = posts.map(p => p.id);
  const { data: postTags } = await supabase
    .from("blog_post_tags")
    .select("post_id, tag_id, blog_tags(id, slug, name_zh, name_en)")
    .in("post_id", postIds);

  // 组装数据
  return posts.map(post => ({
    ...post,
    tags: postTags
      ?.filter(pt => pt.post_id === post.id)
      .map(pt => pt.blog_tags as unknown as BlogTag)
      .filter(Boolean) ?? []
  }));
}

async function fetchAllTags(): Promise<BlogTag[]> {
  const { data, error } = await supabase
    .from("blog_tags")
    .select("id, slug, name_zh, name_en")
    .order("name_en");

  if (error) {
    console.error("Failed to fetch tags", error);
    return [];
  }
  return data ?? [];
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { locale } = await params;
  const { tag: tagFilter } = await searchParams;
  const t = await getTranslations("blog");
  const [posts, allTags] = await Promise.all([fetchBlogPosts(), fetchAllTags()]);
  const isZh = locale === "zh";

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isZh
      ? date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
      : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // 根据标签筛选文章
  const filteredPosts = tagFilter
    ? posts.filter(post => post.tags?.some(tag => tag.slug === tagFilter))
    : posts;

  // 转换标签格式供 TagFilter 使用
  const tagsForFilter = allTags.map(tag => ({
    slug: tag.slug,
    name: isZh ? tag.name_zh : tag.name_en,
  }));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />
      <main className="pt-32 pb-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* 页面标题 */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--foreground)]">
            {t("title")}
          </h1>
          <p className="text-lg text-[var(--gray-400)] mb-8">{t("subtitle")}</p>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <TagFilter
              tags={tagsForFilter}
              locale={locale}
              allLabel={t("allTags")}
            />
          )}

          {/* 文章列表 */}
          <div className="space-y-12">
            {filteredPosts.map((post) => {
              const title = isZh ? post.title_zh : post.title_en;
              const excerpt = isZh
                ? post.excerpt_zh ?? post.excerpt_en
                : post.excerpt_en ?? post.excerpt_zh;
              const formattedDate = formatDate(post.published_at);

              return (
                <article key={post.slug} className="group">
                  <Link href={`/${locale}/blog/${post.slug}`}>
                    {/* 日期和阅读时间 */}
                    <div className="flex items-center gap-3 text-sm text-[var(--gray-500)] mb-3">
                      {formattedDate && <time>{formattedDate}</time>}
                      {formattedDate && post.read_time && <span>·</span>}
                      {post.read_time && (
                        <span>{post.read_time} {t("minRead")}</span>
                      )}
                    </div>

                    {/* 标题 */}
                    <h2 className="text-xl md:text-2xl font-semibold mb-3 text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {title}
                    </h2>

                    {/* 摘要 */}
                    {excerpt && (
                      <p className="text-[var(--gray-400)] leading-relaxed mb-4">
                        {excerpt}
                      </p>
                    )}

                    {/* 标签 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag.slug}
                            className="px-2 py-1 text-xs rounded border border-[var(--border)] text-[var(--gray-500)]"
                          >
                            {isZh ? tag.name_zh : tag.name_en}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </article>
              );
            })}
          </div>

          {/* 空状态 */}
          {filteredPosts.length === 0 && (
            <p className="text-center text-[var(--gray-500)] py-12">
              {t("noPosts")}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
