/**
 * The branded per-project Open Graph card for the English detail pages (S5-5), twin of
 * app/(de)/projekte/[slug]/opengraph-image.tsx: one statically generated PNG per detail
 * route, in English. It mirrors the page's generateStaticParams / dynamicParams so the
 * image set matches the page set exactly. The shared template lives in @/lib/og/card;
 * this file only maps a project to its English props. The twitter card re-exports this
 * module (./twitter-image). See docs/content/seo.md.
 */

import { detailProjects, getDetailProject, getProjectStatusLabels } from "@/content/projects";
import { CARD_CONTENT_TYPE, CARD_SIZE, renderCard } from "@/lib/og/card";

const locale = "en";

export const dynamicParams = false;
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;
export const alt = "Project - Yannik Wünker";

export function generateStaticParams() {
  return detailProjects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getDetailProject(slug, locale);

  // Unreachable while dynamicParams=false, but keeps the render total and falls
  // back to the site identity rather than throwing if that ever changes.
  if (!project) {
    return renderCard({
      kicker: "Portfolio",
      title: "Yannik Wünker",
      subtitle: "Business informatics, digital products and web development.",
      footerRight: "Cologne",
    });
  }

  return renderCard({
    kicker: "Project",
    title: project.name,
    subtitle: project.tagline,
    footerRight: `en/projects/${project.slug}`,
    badge: getProjectStatusLabels(locale)[project.status],
  });
}
