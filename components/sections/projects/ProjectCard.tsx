import { Link } from "@/components/chrome/view-transitions";
import { ProjectMedia } from "@/components/sections/projects/ProjectMedia";
import { ProjectStatusBadge } from "@/components/sections/projects/ProjectStatusBadge";
import { Card } from "@/components/ui/Card";
import type { Project } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { isRouteTranslated, localizedPath } from "@/lib/i18n/routes";

/**
 * A regular (non-featured) project card: cover placeholder, name with its status
 * badge, and the one-line tagline. Kept intentionally light next to the featured
 * entry. When the whole card links out it becomes the anchor; otherwise it is a
 * plain panel.
 */
export type ProjectCardProps = {
  project: Project;
  locale: Locale;
};

// Shared with the plain-panel fallback below; the hover/focus lift only applies
// when the card is a link.
const CARD_BASE = "flex h-full flex-col gap-4";
const CARD_INTERACTIVE = `${CARD_BASE} transition duration-200 group-hover:border-pine group-hover:shadow-widget group-focus-visible:border-pine group-focus-visible:shadow-widget motion-safe:group-hover:-translate-y-1 motion-safe:group-focus-visible:-translate-y-1`;

export function ProjectCard({ project, locale }: ProjectCardProps) {
  // Prefer the internal detail page when the project has one and its localized
  // route has shipped (mirrors FeaturedProject's "view details" guard); only then
  // fall back to an external live/demo/repo link. Without this a project whose
  // sole link is its repo (e.g. DevBlueprint) sent the card straight to GitHub,
  // bypassing its own detail page.
  const detailHref =
    project.detailPage && isRouteTranslated("projectDetail", locale)
      ? localizedPath("projectDetail", locale, project.slug)
      : null;
  const externalHref = project.links?.live ?? project.links?.demo ?? project.links?.repo;

  const content = (
    <>
      <ProjectMedia project={project} locale={locale} className="aspect-[16/10] w-full" />
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl text-ink">{project.name}</h3>
        <ProjectStatusBadge status={project.status} locale={locale} />
      </div>
      <p className="font-sans text-ink-soft">{project.tagline}</p>
    </>
  );

  // The whole card is the click target. Hover and keyboard focus share one move
  // so the two stay in step: the border shifts to pine (the interactive-surface
  // cue from the design system), a widget shadow lifts it off the page, and it
  // rises a few pixels. The rise is `motion-safe` only, so reduced-motion users
  // get the border and shadow with no travel. The global `:focus-visible` ring
  // still draws around the anchor on keyboard focus (app/globals.css).
  if (detailHref) {
    // Internal route: a Next Link (client-side nav + prefetch), like FeaturedProject.
    return (
      <Link href={detailHref} className="group block h-full">
        <Card className={CARD_INTERACTIVE}>{content}</Card>
      </Link>
    );
  }

  if (externalHref) {
    return (
      <a href={externalHref} target="_blank" rel="noreferrer" className="group block h-full">
        <Card className={CARD_INTERACTIVE}>{content}</Card>
      </a>
    );
  }

  return <Card className={CARD_BASE}>{content}</Card>;
}
