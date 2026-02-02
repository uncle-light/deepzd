"use client";

import { useTranslations } from "next-intl";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";

export default function About() {
  const t = useTranslations("about");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--foreground)]">
              {t("title")}
            </h1>
            <p className="text-[var(--gray-400)]">{t("subtitle")}</p>
          </header>

          {/* Intro */}
          <IntroSection t={t} />

          {/* Mission */}
          <MissionSection t={t} />

          {/* Values */}
          <ValuesSection t={t} />

          {/* Contact */}
          <ContactSection t={t} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function IntroSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
        {t("intro.title")}
      </h2>
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] space-y-4">
        <p className="text-[var(--gray-400)] leading-relaxed">
          {t("intro.p1")}
        </p>
        <p className="text-[var(--gray-400)] leading-relaxed">
          {t("intro.p2")}
        </p>
      </div>
    </section>
  );
}

function MissionSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
        {t("mission.title")}
      </h2>
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] border-l-4 border-l-[var(--accent)]">
        <p className="text-[var(--gray-400)] leading-relaxed">
          {t("mission.desc")}
        </p>
      </div>
    </section>
  );
}

function ValuesSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const values = [
    { key: "research", icon: "book" },
    { key: "practical", icon: "tool" },
    { key: "open", icon: "share" },
  ];

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
        {t("values.title")}
      </h2>
      <div className="grid gap-4">
        {values.map((v) => (
          <div
            key={v.key}
            className="p-5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-md bg-[var(--gray-800)] flex items-center justify-center flex-shrink-0">
              <ValueIcon name={v.icon} />
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-[var(--foreground)]">
                {t(`values.${v.key}.title`)}
              </h3>
              <p className="text-sm text-[var(--gray-400)]">
                {t(`values.${v.key}.desc`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]">
      <h2 className="text-xl font-semibold mb-3 text-[var(--foreground)]">
        {t("contact.title")}
      </h2>
      <p className="text-[var(--gray-400)] text-sm mb-4">{t("contact.desc")}</p>
      <div className="flex items-center gap-2 text-[var(--gray-400)]">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm">
          {t("contact.email")}: service@deepzd.com
        </span>
      </div>
    </section>
  );
}

function ValueIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    book: (
      <svg
        className="w-5 h-5 text-[var(--gray-400)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    tool: (
      <svg
        className="w-5 h-5 text-[var(--gray-400)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    share: (
      <svg
        className="w-5 h-5 text-[var(--gray-400)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
    ),
  };
  return icons[name] || null;
}
