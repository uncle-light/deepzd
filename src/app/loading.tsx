export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-[var(--gray-600)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-[var(--gray-500)]">Loading...</p>
      </div>
    </div>
  );
}
