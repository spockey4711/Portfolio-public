import { NowSnapshot } from "@/components/sections/now/NowSnapshot";
import { getNow } from "@/content/now";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig } from "@/lib/seo/site";

import type { Metadata } from "next";

// The English /now page (S5-1d), twin of app/(de)/jetzt/page.tsx: the same shared
// NowSnapshot body rendered in English, with its own canonical + hreflang alternates
// pointing back at the German original (which stays x-default). The EN snapshot
// resolves via getNow("en") inside the shared component.
const locale = "en";
const now = getNow(locale);
const alternates = alternatesFor("now", locale);

export const metadata: Metadata = {
  // The layout title template appends the site name: "What I am working on - Yannik Wünker".
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

export default function EnNowPage() {
  return <NowSnapshot locale={locale} />;
}
