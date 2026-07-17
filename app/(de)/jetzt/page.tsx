import { NowSnapshot } from "@/components/sections/now/NowSnapshot";
import { getNow } from "@/content/now";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig } from "@/lib/seo/site";

import type { Metadata } from "next";

// The German /jetzt (Now) page (S3-3, IA level 2 per ADR-0005): a dated snapshot
// of the current focus, reached from the footer rather than the scroll-only primary
// nav. Content-driven (content/now.ts) and rankable, so it stays indexable and joins
// the sitemap. The shared NowSnapshot body renders in English at app/(en)/en/now/page.tsx
// (S5-1d); now that the English twin is live the page advertises the reciprocal
// de-DE/en/x-default hreflang pair (it previously carried only a bare canonical).
const locale = "de";
const now = getNow(locale);
const alternates = alternatesFor("now", locale);

export const metadata: Metadata = {
  // The layout title template appends the site name: "Jetzt - Yannik Wünker".
  title: now.title,
  description: now.description,
  alternates: { canonical: alternates.canonical, languages: alternates.languages },
  openGraph: {
    type: "website",
    url: alternates.canonical,
    title: `${now.title} - ${siteConfig.name}`,
    description: now.description,
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function JetztPage() {
  return <NowSnapshot locale={locale} />;
}
