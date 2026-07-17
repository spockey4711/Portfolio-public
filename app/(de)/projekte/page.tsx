import { ProjectsIndex } from "@/components/sections/projects/ProjectsIndex";
import { getCopy } from "@/content/copy";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig } from "@/lib/seo/site";

import type { Metadata } from "next";

// The German projects index (IA level 2, P3-9): the complete, ordered list, of
// which the onepager section (level 1) shows only a curated teaser. Unlike the
// legal pages, this is a rankable route, so it stays indexable and joins the
// sitemap. Sits beside app/(de)/projekte/[slug]/page.tsx without conflict - that
// route's dynamicParams=false is scoped to the dynamic segment only. The shared
// index body renders in English at app/(en)/en/projects/page.tsx.
const locale = "de";
const copy = getCopy(locale);
const alternates = alternatesFor("projectsIndex", locale);

export const metadata: Metadata = {
  // The layout title template appends the site name: "Alle Projekte - Yannik Wünker".
  title: copy.projects.index.title,
  description: copy.projects.index.intro,
  alternates: { canonical: alternates.canonical, languages: alternates.languages },
  openGraph: {
    type: "website",
    url: alternates.canonical,
    title: `${copy.projects.index.title} - ${siteConfig.name}`,
    description: copy.projects.index.intro,
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function ProjekteIndexPage() {
  return <ProjectsIndex locale={locale} />;
}
