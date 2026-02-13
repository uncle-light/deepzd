"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SuggestionListProps {
  suggestions: string[];
  title: string;
}

export default function SuggestionList({ suggestions, title }: SuggestionListProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="px-5 py-3.5">
        <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      </div>
      <div className="border-t border-[var(--border)] px-5 py-4">
        <div className="prose prose-sm dark:prose-invert max-w-none
          prose-headings:text-[var(--foreground)] prose-headings:font-semibold
          prose-h2:text-sm prose-h2:mb-2 prose-h2:mt-0
          prose-h3:text-xs prose-h3:mb-1.5 prose-h3:mt-3
          prose-p:my-1 prose-p:text-[var(--gray-400)] prose-p:text-sm prose-p:leading-relaxed
          prose-ul:my-1.5 prose-ul:text-sm
          prose-li:my-0.5 prose-li:text-[var(--gray-400)]
          prose-strong:text-[var(--foreground)] prose-strong:font-medium
          prose-a:text-[var(--foreground)] prose-a:underline prose-a:underline-offset-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {suggestions.join('\n')}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
