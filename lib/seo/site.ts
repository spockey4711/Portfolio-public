/**
 * Central SEO / site metadata: the single source of truth for the canonical
 * base URL and the shared strings, consumed by the root layouts, sitemap and
 * robots so the tags never drift apart. See docs/content/seo.md.
 *
 * Locale-specific strings (title, description, OG locale, job title) live in the
 * per-locale `siteMeta` and are read via getSiteMeta(locale); the locale-neutral
 * facts (name, share image, theme colour, address) stay on siteConfig. See
 * docs/content/i18n.md.
 */

import { type Locale, openGraphLocale } from "@/lib/i18n/locale";

// Canonical base URL. NEXT_PUBLIC_SITE_URL is inlined at build time (a Dockerfile
// build arg the deploy workflow passes; see docs/operations/environment-variables.md).
// Falls back to the production apex so metadata still resolves when the variable
// is unset (a local `pnpm build`, CI without the env). Trailing slashes are
// stripped so callers can safely append their own paths.
const FALLBACK_SITE_URL = "https://yannikwuenker.de";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL).replace(/\/+$/, "");

/**
 * Resolve an internal path (leading slash) to its absolute URL under the canonical
 * host. The single place `siteUrl` is joined with a path, so the sitemap, the
 * JSON-LD builders and any other machine-readable output never disagree on the
 * base. A path without a leading slash still resolves correctly; callers pass
 * `localizedPath(...)` output, which always starts with `/`.
 */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`;
}

/** The locale-specific SEO strings: page title, meta description and job title. */
export interface SiteMeta {
  title: string;
  description: string;
  /** Open Graph `og:locale` (underscore form). */
  ogLocale: string;
  /** Person JSON-LD job title, localized. */
  jobTitle: string;
}

const siteMeta: Record<Locale, SiteMeta> = {
  de: {
    title: "Yannik Wünker - Wirtschaftsinformatik, digitale Produkte & Webentwicklung",
    description:
      "Portfolio mit Projekten rund um IT, Daten, Backend/Webentwicklung und digitale Produktentwicklung.",
    ogLocale: openGraphLocale.de,
    jobTitle: "Wirtschaftsinformatik-Student",
  },
  en: {
    title: "Yannik Wünker - Information Systems, digital products & web development",
    description:
      "Portfolio of projects around IT, data, backend/web development and digital product development.",
    ogLocale: openGraphLocale.en,
    jobTitle: "Information Systems student",
  },
};

/** The locale-specific SEO strings for a locale. */
export function getSiteMeta(locale: Locale): SiteMeta {
  return siteMeta[locale];
}

export const siteConfig = {
  name: "Yannik Wünker",
  // 1200x630 default share image (public/og/default.png). Generated on-brand
  // (name, role, Sand & Pine palette) from a committed template via
  // scripts/generate-assets.mjs; see docs/content/seo.md.
  ogImage: "/og/default.png",
  // Browser UI tint. Mirrors --bg (page background) from app/globals.css and must
  // be a literal here because CSS variables are not available at metadata build
  // time; keep in sync if the token changes.
  themeColor: "#eae6d9",
  // Static facts for the Person JSON-LD (docs/content/seo.md). Kept truthful and
  // minimal - only what is already visible on the page. The job title is localized
  // (siteMeta above). Social profile URLs are not duplicated here; they live with
  // the contact copy in content/copy and are pulled in by lib/seo/structured-data.ts
  // to stay in sync with the links the visitor actually sees.
  person: {
    alumniOf: "Universität zu Köln",
    address: { locality: "Köln", country: "DE" },
  },
} as const;
