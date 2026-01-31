"use client";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
  counts?: Record<string, number>;
  totalCount?: number;
}

export default function CategoryFilter({ 
  categories, 
  selected, 
  onChange, 
  counts = {},
  totalCount = 0
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onChange("全部")}
        className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
          selected === "全部"
            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
            : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:border-zinc-600"
        }`}
      >
        全部
        {totalCount > 0 && (
          <span className="text-xs opacity-60">({totalCount})</span>
        )}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 tag-${cat} ${
            selected === cat
              ? "border border-current"
              : "border border-transparent hover:border-current/30"
          }`}
        >
          {cat}
          {counts[cat] !== undefined && (
            <span className="text-xs opacity-60">({counts[cat]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
