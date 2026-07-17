/**
 * Shared metadata builders for the two locale root layouts (app/(de), app/(en)),
 * so the title template, Open Graph block, canonical and hreflang alternates are
 * defined once and only the locale differs. Per-page routes (legal, projects,
 * blog) override title/description/canonical via their own generateMetadata. See
 * docs/content/seo.md and docs/content/i18n.md.
 */

import { type Locale } from "@/lib/i18n/locale";
import { alternatesFor } from "@/lib/i18n/routes";
import { getSiteMeta, siteConfig, siteUrl } from "@/lib/seo/site";

import type { Metadata, Viewport } from "next";

/** The full root metadata for a locale, including the home hreflang alternates. */
export function buildRootMetadata(locale: Locale): Metadata {
  const meta = getSiteMeta(locale);
  const alternates = alternatesFor("home", locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: meta.title,
      template: `%s - ${siteConfig.name}`,
    },
    description: meta.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      url: alternates.canonical,
      siteName: siteConfig.name,
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

// themeColor lives in the viewport export (Next requires it here, not in metadata).
// It is locale-neutral, so both root layouts re-export this same object.
export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
};
