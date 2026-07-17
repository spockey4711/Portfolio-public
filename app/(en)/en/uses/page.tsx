import { UsesInventory } from "@/components/sections/uses/UsesInventory";
import { getCopy } from "@/content/copy";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig } from "@/lib/seo/site";

import type { Metadata } from "next";

// The English /uses page (S5-1c), twin of app/(de)/uses/page.tsx: the same shared
// UsesInventory body rendered in English, with its own canonical + hreflang
// alternates pointing back at the German original (which stays x-default). The EN
// inventory resolves via getUsesGroups("en") inside the shared component.
const locale = "en";
const copy = getCopy(locale);
const alternates = alternatesFor("uses", locale);

export const metadata: Metadata = {
  // The layout title template appends the site name: "What I use - Yannik Wünker".
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

export default function EnUsesPage() {
  return <UsesInventory locale={locale} />;
}
