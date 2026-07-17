import { UsesInventory } from "@/components/sections/uses/UsesInventory";
import { getCopy } from "@/content/copy";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig } from "@/lib/seo/site";

import type { Metadata } from "next";

// The German /uses page (S3-4, IA level 2 per ADR-0005): the hardware, editor,
// stack and tools actually in use, reached from the footer rather than the
// scroll-only primary nav. Content-driven (content/uses.ts) and rankable, so it
// stays indexable and joins the sitemap. The shared inventory body renders in
// English at app/(en)/en/uses/page.tsx (S5-1c); now that the English twin is live
// the page advertises the reciprocal de-DE/en/x-default hreflang pair.
const locale = "de";
const copy = getCopy(locale);
const alternates = alternatesFor("uses", locale);

export const metadata: Metadata = {
  // The layout title template appends the site name: "Was ich benutze - Yannik Wünker".
  title: copy.uses.title,
  description: copy.uses.intro,
  alternates: { canonical: alternates.canonical, languages: alternates.languages },
  openGraph: {
    type: "website",
    url: alternates.canonical,
    title: `${copy.uses.title} - ${siteConfig.name}`,
    description: copy.uses.intro,
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function UsesPage() {
  return <UsesInventory locale={locale} />;
}
