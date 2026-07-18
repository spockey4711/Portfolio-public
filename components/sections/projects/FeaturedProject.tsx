import { Link } from "@/components/chrome/view-transitions";
import { ProjectMedia } from "@/components/sections/projects/ProjectMedia";
import { ProjectStatusBadge } from "@/components/sections/projects/ProjectStatusBadge";
import { ArrowAffordance } from "@/components/ui/ArrowAffordance";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import type { Project } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { isRouteTranslated, localizedPath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils/cn";

/**
 * The featured project card: a cover plus the short story - problem, role and
 * honest learnings. Two layouts share this markup so every project on the
 * onepager reads in the same voice:
 *
 * - "poster" (default): cover on top, story stacked below. The upright card used
 *   for the index lead and for the onepager's secondary projects, which sit two
 *   to a row and stretch to equal height.
 * - "wide": on lg+ the cover sits beside the story instead of above it. The
 *   onepager's full-row lead tile (fuelivo) uses this so it reads as the section
 *   anchor without towering over the two cards beneath it the way a full-width
 *   poster would. Because the story column runs much taller than the 16/10
 *   cover, the media column fills the space below the cover with the project's
 *   case-study metrics - real numbers in the same tile voice as the detail
 *   page's rail - instead of leaving the column blank.
 */
export type FeaturedProjectProps = {
  project: Project;
  locale: Locale;
  layout?: "poster" | "wide";
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <MonoLabel tone="pine">{label}</MonoLabel>
      {children}
    </div>
  );
}

export function FeaturedProject({ project, locale, layout = "poster" }: FeaturedProjectProps) {
  const { labels, detail, detailsLink } = getCopy(locale).projects;
  const liveLink = project.links?.live;
  // The detail route only exists once its English variant has shipped; until then
  // the "view details" link is hidden on the English tree (translatedRoutes).
  const showDetailLink = Boolean(project.detailPage) && isRouteTranslated("projectDetail", locale);
  const wide = layout === "wide";
  // The metrics tiles only exist to balance the wide layout's media column
  // against the taller story column; poster cards stay cover-only.
  const metrics = wide ? (project.caseStudy?.metrics ?? []) : [];

  return (
    // In "wide" the Card becomes a two-column grid on lg (cover | story); until
    // then, and always in "poster", it stays a single column with the cover on
    // top. `items-start` keeps the cover at its natural height instead of
    // stretching down the taller story column.
    <Card
      className={cn(
        "flex h-full flex-col gap-6",
        wide && "lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] lg:items-start lg:gap-8",
      )}
    >
      <div className="flex min-w-0 flex-col gap-6">
        <ProjectMedia project={project} locale={locale} className="aspect-[16/10] w-full" />

        {/* Only on lg+, where the wide grid actually leaves the media column
            short: below that breakpoint the card is a single stacked column and
            the tiles would just push the story further down. The numbers repeat
            on the detail page, so nothing is lost on small screens. The tile
            markup mirrors ProjectDetail's metrics rail so both read as one
            system. */}
        {metrics.length > 0 ? (
          <div className="hidden lg:block">
            <Field label={labels.metrics}>
              <dl className="grid grid-cols-2 gap-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex flex-col-reverse gap-1 rounded-xl border border-line bg-bg p-4"
                  >
                    <dt className="font-mono text-[11px] leading-snug text-ink-soft">
                      {metric.label}
                    </dt>
                    <dd className="font-display text-[1.5rem] leading-none text-ink">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Field>
          </div>
        ) : null}
      </div>

      {/* The story is one column so the wide grid can place it opposite the cover;
          in poster layout it is simply the stacked body below the cover. `flex-1`
          lets it fill the card height so the CTA's `mt-auto` still bottom-aligns
          across two equal-height cards sharing a row. */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="font-display text-3xl font-extrabold tracking-[0.02em] text-ink uppercase">
              {project.name}
            </h3>
            <ProjectStatusBadge status={project.status} locale={locale} />
          </div>
          <p className="max-w-[52ch] font-sans text-lg text-ink-soft">{project.tagline}</p>
        </div>

        {project.problem ? (
          <Field label={labels.problem}>
            <p className="max-w-[58ch] font-sans text-ink-soft">{project.problem}</p>
          </Field>
        ) : null}

        {project.role ? (
          <Field label={labels.role}>
            <p className="max-w-[58ch] font-sans text-ink-soft">{project.role}</p>
          </Field>
        ) : null}

        {project.learnings && project.learnings.length > 0 ? (
          <Field label={labels.learnings}>
            <ul className="flex list-none flex-col gap-2">
              {project.learnings.map((learning) => (
                <li key={learning} className="flex gap-3 font-sans text-ink-soft">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-pine" />
                  <span className="max-w-[58ch]">{learning}</span>
                </li>
              ))}
            </ul>
          </Field>
        ) : null}

        {project.stack && project.stack.length > 0 ? (
          <Field label={labels.stack}>
            <ul className="flex list-none flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-card border border-line bg-bg px-2.5 py-1 font-mono text-xs text-ink-soft"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Field>
        ) : null}

        {liveLink || showDetailLink ? (
          <div className="mt-auto flex flex-wrap items-center gap-5 pt-2">
            {liveLink ? (
              <Button variant="primary" href={liveLink} target="_blank" rel="noreferrer">
                {detail.links.live} <ArrowAffordance direction="up-right" />
              </Button>
            ) : null}
            {showDetailLink ? (
              // Internal route: a Next Link (client-side nav + prefetch), styled
              // as the ghost CTA next to the primary live button. `group` lets the
              // trailing arrow nudge on hover and keyboard focus alike.
              <Link
                href={localizedPath("projectDetail", locale, project.slug)}
                className="group inline-flex items-center gap-2 font-mono text-sm whitespace-nowrap text-pine transition-colors duration-200 hover:text-signal"
              >
                {detailsLink} <ArrowAffordance />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
