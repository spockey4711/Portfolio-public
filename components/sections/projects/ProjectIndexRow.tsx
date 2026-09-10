import { Link } from "@/components/chrome/view-transitions";
import { ProjectStatusBadge } from "@/components/sections/projects/ProjectStatusBadge";
import { ArrowAffordance } from "@/components/ui/ArrowAffordance";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getProjectKindLabels, type Project } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { isRouteTranslated, localizedPath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils/cn";

/**
 * One row of the projects index: name, type and year, status, and the single
 * tagline. Deliberately typographic - there is no media slot at all, so a project
 * without a real screenshot is a lean row rather than an empty frame pretending to
 * be a product shot (ADR-0011). The proof that needs a picture stays in the
 * featured card above and on each project's own detail page.
 */
export type ProjectIndexRowProps = {
  project: Project;
  locale: Locale;
};

// The row is one grid: name and tagline on the left, the facts on the right. On
// mobile it collapses to a column with the facts first, so they read as a kicker
// above the name instead of trailing off the end of the tagline.
const ROW_LAYOUT =
  "flex flex-col gap-3 py-7 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-10";

export function ProjectIndexRow({ project, locale }: ProjectIndexRowProps) {
  // Same target resolution as the featured card: prefer the internal detail page
  // when the project has one and its localized route has shipped, then fall back
  // to an external live/demo/repo link. A project with neither stays a plain row -
  // listed and readable, it just has nowhere further to go.
  const detailHref =
    project.detailPage && isRouteTranslated("projectDetail", locale)
      ? localizedPath("projectDetail", locale, project.slug)
      : null;
  const externalHref = project.links?.live ?? project.links?.demo ?? project.links?.repo;

  const meta = `${getProjectKindLabels(locale)[project.kind]} · ${project.year}`;

  // The arrow is the row's "this goes somewhere" cue, so it only appears when the
  // row is actually a link, and it points out of the site for an external one.
  const arrow = detailHref ? (
    <ArrowAffordance className="ml-3 text-2xl" />
  ) : externalHref ? (
    <ArrowAffordance direction="up-right" className="ml-3 text-2xl" />
  ) : null;

  const content = (
    <>
      {/* A fixed-width facts column from sm up: the type labels then share a left
          edge and the status badges a right one, which is what makes the rows
          read as an index rather than five right-aligned fragments. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:order-2 sm:w-64 sm:flex-nowrap sm:justify-between">
        {/* Not uppercased: a kind label carries real casing ("iOS-App",
            "macOS-App") that the mono register would otherwise destroy. */}
        <MonoLabel tone="muted" textCase="normal">
          {meta}
        </MonoLabel>
        <ProjectStatusBadge status={project.status} locale={locale} />
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:order-1">
        <h2 className="font-display text-3xl leading-none font-extrabold tracking-[0.02em] text-ink uppercase transition-colors duration-200 group-hover:text-signal group-focus-visible:text-signal">
          {project.name}
          {arrow}
        </h2>
        <p className="max-w-[60ch] font-sans leading-relaxed text-ink-soft">{project.tagline}</p>
      </div>
    </>
  );

  if (detailHref) {
    // Internal route: a Next Link (client-side nav + prefetch), like the cards.
    return (
      <Link href={detailHref} className={cn("group", ROW_LAYOUT)}>
        {content}
      </Link>
    );
  }

  if (externalHref) {
    return (
      <a href={externalHref} target="_blank" rel="noreferrer" className={cn("group", ROW_LAYOUT)}>
        {content}
      </a>
    );
  }

  return <div className={ROW_LAYOUT}>{content}</div>;
}
