"use client";

import { useTranslations } from "next-intl";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import AnalyzePageClient from "./client";
import { WebAppJsonLd } from "../../components/JsonLd";

export default function AnalyzePage() {
  const t = useTranslations("analyze");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <WebAppJsonLd
        name={t("title")}
        description={t("subtitle")}
        url="/citation-test"
      />
      <Nav />
      <AnalyzePageClient />
      <Footer />
    </div>
  );
}
