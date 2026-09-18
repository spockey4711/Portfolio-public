import { Link } from "@/components/chrome/view-transitions";
import { ProjectMedia } from "@/components/sections/projects/ProjectMedia";
import { ProjectStatusBadge } from "@/components/sections/projects/ProjectStatusBadge";
import { ArrowAffordance } from "@/components/ui/ArrowAffordance";
import { Card } from "@/components/ui/Card";
import { getCopy } from "@/content/copy";
import type { Project } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { isRouteTranslated, localizedPath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils/cn";

export type ProjectTeaserShape = "upright" | "typographic";

export type ProjectTeaserProps = {
  project: Project;
  locale: Locale;
  shape: ProjectTeaserShape;
};

/**
 * A compact secondary proof. Each teaser shows one visual, one defining
 * decision and a short evidenced stack, leaving the full narrative to the case
 * study. The shape changes the visual's proportion rather than duplicating the
 * featured card skeleton.
 */
export function ProjectTeaser({ project, locale, shape }: ProjectTeaserProps) {
  const { detailsLink } = getCopy(locale).projects;
  const detailLink =
    project.detailPage && isRouteTranslated("projectDetail", locale)
      ? localizedPath("projectDetail", locale, project.slug)
      : null;

  return (
    <Card data-project-shape={shape} className="group flex flex-col gap-5">
      <ProjectMedia
        project={project}
        locale={locale}
        className={cn(
          "w-full",
          shape === "upright" ? "h-72 sm:h-88" : "aspect-[2/1] border-term-border bg-term-bg",
        )}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h3 className="font-display text-3xl leading-none font-extrabold tracking-[0.02em] text-ink uppercase">
          {project.name}
        </h3>
        <ProjectStatusBadge status={project.status} locale={locale} />
      </div>

      <p className="max-w-[54ch] font-sans leading-relaxed text-ink-soft">{project.tagline}</p>

      {project.onepager?.statement ? (
        <p className="border-l-2 border-accent pl-4 font-sans leading-relaxed text-ink">
          {project.onepager.statement}
        </p>
      ) : null}

      {project.onepager?.stack && project.onepager.stack.length > 0 ? (
        <ul className="flex list-none flex-wrap gap-2">
          {project.onepager.stack.map((tech) => (
            <li
              key={tech}
              className="border border-line-strong bg-bg px-2.5 py-1 font-mono text-[11px] text-ink-soft"
            >
              {tech}
            </li>
          ))}
        </ul>
      ) : null}

      {detailLink ? (
        <Link
          href={detailLink}
          className="group/link mt-auto inline-flex w-fit items-center gap-2 pt-1 font-mono text-sm text-pine transition-colors duration-200 hover:text-signal"
        >
          {detailsLink} <ArrowAffordance />
        </Link>
      ) : null}
    </Card>
  );
}
