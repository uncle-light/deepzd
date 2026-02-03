"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Tag {
  slug: string;
  name: string;
}

interface TagFilterProps {
  tags: Tag[];
  locale: string;
  allLabel?: string;
}

export default function TagFilter({ tags, locale, allLabel = "全部" }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get("tag") || "";

  const handleTagClick = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tagSlug) {
      params.set("tag", tagSlug);
    } else {
      params.delete("tag");
    }
    router.push(`/${locale}/blog?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => handleTagClick("")}
        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
          !currentTag
            ? "bg-[var(--foreground)] text-[var(--background)]"
            : "bg-[var(--surface-muted)] text-[var(--gray-500)] hover:text-[var(--foreground)]"
        }`}
      >
        {allLabel}
      </button>
      {tags.map((tag) => (
        <button
          key={tag.slug}
          onClick={() => handleTagClick(tag.slug)}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            currentTag === tag.slug
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--surface-muted)] text-[var(--gray-500)] hover:text-[var(--foreground)]"
          }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
