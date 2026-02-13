import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Tag,
  Layers,
  MessageCircle,
  ShieldCheck,
  MessageSquare,
  Search,
  Sparkles,
  Cpu,
  Monitor,
  Globe,
  FileText,
  BarChart3,
  Eye,
  Target,
  LayoutTemplate,
  Award,
  RefreshCw,
  Code,
  ChevronRight,
} from "lucide-react";
import { WebAppJsonLd } from "../../../components/JsonLd";

export default async function GeoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("geo");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <WebAppJsonLd
        name="GEO - Generative Engine Optimization"
        description="Learn how to optimize your content for AI search engines like ChatGPT, Perplexity, and Claude"
        url={`/${locale}/geo`}
      />
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <HeroSection t={t} locale={locale} />
          <WhatIsGeoSection t={t} />
          <AISearchSection t={t} />
          <ZeroClickSection t={t} />
          <PrinciplesSection t={t} />
          <ComparisonSection t={t} />
          <MethodsSection t={t} />
          <StatsSection t={t} />
          <CTASection t={t} locale={locale} />
        </div>
      </div>
    </div>
  );
}

function HeroSection({ t, locale }: { t: Awaited<ReturnType<typeof getTranslations>>; locale: string }) {
  return (
    <section className="text-center mb-16">
      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-[var(--foreground)]">
        {t("title")}
      </h1>
      <p className="text-lg text-[var(--gray-400)] max-w-2xl mx-auto mb-8">
        {t("subtitle")}
      </p>
      <Link
        href={`/${locale}/dashboard/analyze`}
        className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-full hover:bg-[var(--card-bg)] hover:border-[var(--border-light)] transition-all"
      >
        {t("cta")}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </section>
  );
}

function WhatIsGeoSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t("whatIs.title")}</h2>
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
        <p className="text-[var(--gray-400)] leading-relaxed mb-4">{t("whatIs.p1")}</p>
        <p className="text-[var(--gray-400)] leading-relaxed mb-4">{t("whatIs.p2")}</p>
        <p className="text-[var(--gray-400)] leading-relaxed">{t("whatIs.p3")}</p>
      </div>
    </section>
  );
}

function AISearchSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const platforms = [
    { key: "chatgpt", icon: <MessageSquare className="w-5 h-5" /> },
    { key: "perplexity", icon: <Search className="w-5 h-5" /> },
    { key: "gemini", icon: <Sparkles className="w-5 h-5" /> },
    { key: "claude", icon: <Cpu className="w-5 h-5" /> },
    { key: "copilot", icon: <Monitor className="w-5 h-5" /> },
    { key: "aiOverview", icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">{t("aiSearch.title")}</h2>
      <p className="text-[var(--gray-400)] mb-6">{t("aiSearch.desc")}</p>
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
        <h3 className="font-semibold mb-4 text-[var(--foreground)]">{t("aiSearch.platforms.title")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platforms.map((p) => (
            <div key={p.key} className="flex items-start gap-3">
              <div className="w-6 h-6 text-[var(--gray-400)]">{p.icon}</div>
              <p className="text-sm text-[var(--gray-400)]">{t(`aiSearch.platforms.${p.key}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ZeroClickSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t("zeroClick.title")}</h2>
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-shrink-0">
          <span className="text-6xl md:text-7xl font-bold text-[var(--accent)]">93%</span>
          <p className="text-sm text-[var(--gray-500)] mt-1">{t("zeroClick.stat")}</p>
        </div>
        <div className="flex-1">
          <p className="text-[var(--gray-400)] leading-relaxed">{t("zeroClick.desc")}</p>
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const principles = [
    { key: "entity", icon: <Tag className="w-5 h-5" /> },
    { key: "semantic", icon: <Layers className="w-5 h-5" /> },
    { key: "citability", icon: <MessageCircle className="w-5 h-5" /> },
    { key: "reliability", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">{t("principles.title")}</h2>
      <p className="text-[var(--gray-400)] mb-6">{t("principles.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {principles.map((p) => (
          <div key={p.key} className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
            <div className="w-10 h-10 rounded-md bg-[var(--surface-muted)] text-[var(--gray-400)] flex items-center justify-center mb-3">
              {p.icon}
            </div>
            <h3 className="font-semibold mb-2 text-[var(--foreground)]">{t(`principles.${p.key}.title`)}</h3>
            <p className="text-sm text-[var(--gray-400)]">{t(`principles.${p.key}.desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparisonSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const items = ["target", "goal", "metrics", "content", "result"];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t("comparison.title")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-4 px-4 text-left text-[var(--gray-400)] font-medium">{t("comparison.aspect")}</th>
              <th className="py-4 px-4 text-left text-[var(--foreground)] font-medium">SEO</th>
              <th className="py-4 px-4 text-left text-[var(--foreground)] font-medium">GEO</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item} className="border-b border-[var(--border)]">
                <td className="py-4 px-4 text-[var(--gray-400)]">{t(`comparison.${item}.label`)}</td>
                <td className="py-4 px-4 text-[var(--gray-400)]">{t(`comparison.${item}.seo`)}</td>
                <td className="py-4 px-4 text-[var(--foreground)]">{t(`comparison.${item}.geo`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MethodsSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const methods = [
    { icon: <FileText className="w-5 h-5" />, key: "citations" },
    { icon: <BarChart3 className="w-5 h-5" />, key: "statistics" },
    { icon: <MessageCircle className="w-5 h-5" />, key: "quotations" },
    { icon: <Eye className="w-5 h-5" />, key: "readability" },
    { icon: <Target className="w-5 h-5" />, key: "directAnswer" },
    { icon: <LayoutTemplate className="w-5 h-5" />, key: "structure" },
    { icon: <Award className="w-5 h-5" />, key: "authority" },
    { icon: <RefreshCw className="w-5 h-5" />, key: "freshness" },
    { icon: <Code className="w-5 h-5" />, key: "schema" },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">{t("methods.title")}</h2>
      <p className="text-[var(--gray-400)] mb-6">{t("methods.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div
            key={method.key}
            className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border-light)] transition-colors"
          >
            <div className="w-10 h-10 rounded-md bg-[var(--surface-muted)] flex items-center justify-center mb-3 text-[var(--gray-400)]">
              {method.icon}
            </div>
            <h3 className="font-semibold mb-2 text-[var(--foreground)]">{t(`methods.${method.key}.title`)}</h3>
            <p className="text-sm text-[var(--gray-400)]">{t(`methods.${method.key}.desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const stats = [
    { value: "40%", key: "visibility" },
    { value: "180%", key: "citation" },
    { value: "73%", key: "preference" },
    { value: "6x", key: "clickthrough" },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t("stats.title")}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.key} className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-center">
            <div className="text-3xl font-bold text-[var(--accent)] mb-2">{stat.value}</div>
            <p className="text-sm text-[var(--gray-400)]">{t(`stats.${stat.key}`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection({ t, locale }: { t: Awaited<ReturnType<typeof getTranslations>>; locale: string }) {
  return (
    <section className="text-center p-8 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">{t("ctaSection.title")}</h2>
      <p className="text-[var(--gray-400)] mb-6">{t("ctaSection.desc")}</p>
      <Link
        href={`/${locale}/dashboard/analyze`}
        className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-full hover:bg-[var(--card-bg)] hover:border-[var(--border-light)] transition-all"
      >
        {t("ctaSection.button")}
      </Link>
    </section>
  );
}
