import { Link } from "@/components/chrome/view-transitions";
import { ProjectMedia } from "@/components/sections/projects/ProjectMedia";
import { ProjectStatusBadge } from "@/components/sections/projects/ProjectStatusBadge";
import { ArrowAffordance } from "@/components/ui/ArrowAffordance";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCopy } from "@/content/copy";
import type { Project, ProjectMetric } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { isRouteTranslated, localizedPath } from "@/lib/i18n/routes";

export type FeaturedProjectProps = {
  project: Project;
  locale: Locale;
};

/** Pick three complementary proof points without duplicating the full detail-page rail. */
function headlineMetrics(metrics: ProjectMetric[]): ProjectMetric[] {
  const preferredIndexes = [0, 3, 5];
  return preferredIndexes.flatMap((index) => metrics[index] ?? []).slice(0, 3);
}

/**
 * The onepager's lead proof: one screenshot, one problem sentence, three numbers
 * and two routes deeper. The role, learnings and complete metric rail remain on
 * the project detail page instead of being repeated here.
 */
export function FeaturedProject({ project, locale }: FeaturedProjectProps) {
  const { detailsLink, liveLink: liveLinkLabel } = getCopy(locale).projects;
  const liveLink = project.links?.live;
  const detailLink =
    project.detailPage && isRouteTranslated("projectDetail", locale)
      ? localizedPath("projectDetail", locale, project.slug)
      : null;
  const metrics = headlineMetrics(project.caseStudy?.metrics ?? []);

  return (
    <Card
      data-project-shape="wide"
      className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,1fr)] lg:gap-10"
    >
      <ProjectMedia
        project={project}
        locale={locale}
        loading="eager"
        className="aspect-[16/10] w-full"
      />

      <div className="flex min-w-0 flex-col gap-5 lg:py-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="font-display text-4xl leading-none font-extrabold tracking-[0.02em] text-ink uppercase sm:text-5xl">
            {project.name}
          </h3>
          <ProjectStatusBadge status={project.status} locale={locale} />
        </div>

        <p className="max-w-[48ch] font-sans text-lg leading-relaxed text-ink-soft">
          {project.tagline}
        </p>
        {project.onepager?.statement ? (
          <p className="max-w-[50ch] border-l-2 border-accent pl-4 font-sans leading-relaxed text-ink">
            {project.onepager.statement}
          </p>
        ) : null}

        {metrics.length > 0 ? (
          <dl className="grid grid-cols-3 border-y-2 border-ink">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex min-w-0 flex-col gap-1 border-r border-ink px-2 py-4 last:border-r-0 sm:px-4"
              >
                <dd className="font-display text-2xl leading-none font-bold text-ink sm:text-3xl">
                  {metric.value}
                </dd>
                <dt className="font-mono text-[9px] leading-snug text-ink-soft sm:text-[10px]">
                  {metric.label}
                </dt>
              </div>
            ))}
          </dl>
        ) : null}

        {detailLink || liveLink ? (
          <div className="mt-auto flex flex-wrap items-center gap-5 pt-1">
            {detailLink ? (
              <Link
                href={detailLink}
                className="group inline-flex items-center gap-2 border-2 border-ink bg-accent px-5 py-3 font-mono text-[13px] tracking-[1px] whitespace-nowrap text-accent-ink uppercase shadow-widget transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                {detailsLink} <ArrowAffordance />
              </Link>
            ) : null}
            {liveLink ? (
              <Button variant="ghost" href={liveLink} target="_blank" rel="noreferrer">
                {liveLinkLabel} <ArrowAffordance direction="up-right" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
