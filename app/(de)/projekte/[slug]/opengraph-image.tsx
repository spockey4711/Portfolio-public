/**
 * The branded per-project Open Graph card (S5-3). One statically generated PNG per
 * detail route, mirroring the page's own generateStaticParams / dynamicParams so
 * the image set matches the page set exactly. The shared template lives in
 * @/lib/og/card; this file only maps a project to its props. The twitter card
 * re-exports this module (./twitter-image). See docs/content/seo.md.
 */

import { detailProjects, getDetailProject, getProjectStatusLabels } from "@/content/projects";
import { CARD_CONTENT_TYPE, CARD_SIZE, renderCard } from "@/lib/og/card";

// This route lives in the German (de) tree; its English counterpart ships later.
const locale = "de";

export const dynamicParams = false;
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;
export const alt = "Projekt - Yannik Wünker";

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
      subtitle: "Wirtschaftsinformatik, digitale Produkte und Webentwicklung.",
      footerRight: "Köln",
    });
  }

  return renderCard({
    kicker: "Projekt",
    title: project.name,
    subtitle: project.tagline,
    footerRight: `projekte/${project.slug}`,
    badge: getProjectStatusLabels(locale)[project.status],
  });
}
