import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { tutorials } from "../../data/tutorials";

export function generateStaticParams() {
  return tutorials.map((t) => ({ slug: t.slug }));
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorial = tutorials.find((t) => t.slug === slug);
  
  if (!tutorial) notFound();

  return (
    <div className="min-h-screen grid-bg">
      <Nav />
      <main className="pt-24 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          <Link href="/tutorials" className="text-violet-400 text-sm hover:underline mb-6 inline-block">
            ← 返回教程列表
          </Link>
          <header className="mb-8">
            <span className="tag">{tutorial.tag}</span>
            <h1 className="text-3xl font-bold mt-4">{tutorial.title}</h1>
          </header>
          <div className="prose prose-invert max-w-none">
            {tutorial.content.split('\n').map((p, i) => (
              <p key={i} className="mb-4 text-zinc-300 leading-relaxed">{p}</p>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
