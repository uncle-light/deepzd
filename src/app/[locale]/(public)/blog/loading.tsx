import { BlogListSkeleton } from "../../../components/Skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="pt-32 pb-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="skeleton h-12 w-32 rounded mb-4" />
          <div className="skeleton h-6 w-64 rounded mb-16" />
          <BlogListSkeleton count={5} />
        </div>
      </main>
    </div>
  );
}
