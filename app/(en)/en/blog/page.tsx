import { BlogIndex } from "@/components/sections/blog/BlogIndex";
import { getCopy } from "@/content/copy";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig } from "@/lib/seo/site";

import type { Metadata } from "next";

// The English blog index (S5-1f), twin of app/(de)/blog/page.tsx: the same shared
// BlogIndex body rendered in English, with its own canonical + hreflang alternates
// pointing back at the German original (which stays x-default). Posts are authored
// in German, so this lists only EN-translated posts (getPostsForLocale) - none yet,
// so it renders the graceful empty state until the EN post layer ships in S5-1g. No
// English RSS feed exists yet, so no rss alternate is advertised here.
const locale = "en";
const copy = getCopy(locale);
const alternates = alternatesFor("blogIndex", locale);

export const metadata: Metadata = {
  // The layout title template appends the site name: "Notes - Yannik Wünker".
  title: copy.blog.index.title,
  description: copy.blog.index.intro,
  alternates: { canonical: alternates.canonical, languages: alternates.languages },
  openGraph: {
    type: "website",
    url: alternates.canonical,
    title: `${copy.blog.index.title} - ${siteConfig.name}`,
    description: copy.blog.index.intro,
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function EnBlogIndexPage() {
  return <BlogIndex locale={locale} />;
}
