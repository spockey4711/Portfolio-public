import { ProjectsIndex } from "@/components/sections/projects/ProjectsIndex";
import { getCopy } from "@/content/copy";
import { alternatesFor } from "@/lib/i18n/routes";
import { siteConfig } from "@/lib/seo/site";

import type { Metadata } from "next";

// The English projects index (S5-1a), twin of app/(de)/projekte/page.tsx: the same
// shared ProjectsIndex body rendered in English, with its own canonical + hreflang
// alternates pointing back at the German original (which stays x-default). The
// per-project EN content resolves via getProjects("en"); the detail links stay
// hidden until the EN detail route ships (S5-1b), gated on translatedRoutes.
const locale = "en";
const copy = getCopy(locale);
const alternates = alternatesFor("projectsIndex", locale);

export const metadata: Metadata = {
  // The layout title template appends the site name: "All projects - Yannik Wünker".
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

export default function EnProjectsIndexPage() {
  return <ProjectsIndex locale={locale} />;
}
