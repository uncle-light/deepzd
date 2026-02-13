import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="p-6">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          DeepZD
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
