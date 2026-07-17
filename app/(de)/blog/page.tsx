import { BlogIndex } from "@/components/sections/blog/BlogIndex";
import { getCopy } from "@/content/copy";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig } from "@/lib/seo/site";

import type { Metadata } from "next";

// The German blog index (IA level 2, ADR-0005): the full list of posts, reached
// from the footer rather than the scroll-only primary nav. Rankable, so it stays
// indexable and joins the sitemap. The posts themselves live at /blog/[slug]. The
// shared BlogIndex body renders the English twin at /en/blog too (S5-1f); this page
// now carries the reciprocal hreflang alternates (German stays the x-default).
const locale = "de";
const copy = getCopy(locale);
const alternates = alternatesFor("blogIndex", locale);

export const metadata: Metadata = {
  // The layout title template appends the site name: "Notizen - Yannik Wünker".
  title: copy.blog.index.title,
  description: copy.blog.index.intro,
  alternates: {
    canonical: alternates.canonical,
    languages: alternates.languages,
    types: {
      "application/rss+xml": [{ url: "/blog/feed.xml", title: `${copy.blog.index.title} - RSS` }],
    },
  },
  openGraph: {
    type: "website",
    url: alternates.canonical,
    title: `${copy.blog.index.title} - ${siteConfig.name}`,
    description: copy.blog.index.intro,
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function BlogIndexPage() {
  return <BlogIndex locale={locale} />;
}
