import Image from "next/image";

import { Link } from "@/components/chrome/view-transitions";
import { ProjectMedia } from "@/components/sections/projects/ProjectMedia";
import { ProjectStatusBadge } from "@/components/sections/projects/ProjectStatusBadge";
import { RelatedProjects } from "@/components/sections/projects/RelatedProjects";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { FuelivoProof } from "@/components/widgets/fuelivo-proof/FuelivoProof";
import { getCopy } from "@/content/copy";
import { getFeatureStatusLabels } from "@/content/projects";
import type { FeatureStatus, Project, ProjectScreenshot } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The dedicated project page rendered at /projekte/<slug> for projects flagged
 * `detailPage` (P3-3). It gives a warranted project more room than the onepager
 * card: a large cover, the full problem/role/learnings story and, for a project
 * with a `caseStudy`, the long-form sections (solution, features, screenshots,
 * architecture, challenges, timeline, learnings).
 *
 * On wide screens the page is a two-column case study: the narrative keeps a
 * readable measure in the main column while the reference facts (actions, tech
 * stack, headline numbers) sit in a sticky rail on the right, so the layout
 * fills the width and reads much shorter than a single stacked column. Below
 * `lg` the rail collapses under the story. It renders only the fields a project
 * actually has, so a leaner entry degrades gracefully (no empty rail, no grid).
 */
export type ProjectDetailProps = {
  project: Project;
  locale: Locale;
  /** Other detail-page projects for the internal-linking footer (S5-2); may be empty. */
  related?: readonly Project[];
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <MonoLabel tone="pine">{label}</MonoLabel>
      {children}
    </section>
  );
}

/** A pine-dotted bullet list, the detail page's shared list style. */
function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex list-none flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 font-sans leading-relaxed text-ink-soft">
          <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-pine" />
          <span className="max-w-[64ch]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One screenshot with its caption. It reuses ProjectMedia's landscape frame -
 * the same bordered surface, one fixed aspect for every shot so the grid stays
 * a grid - so a gallery shot and the cover above it read as one family. The
 * caption sits under the frame as a print caption, never as an overlay on the
 * image, and `alt` and `caption` say different things: the first replaces the
 * image for a screen reader, the second tells every reader what the shot
 * proves.
 *
 * The shot is contained rather than cropped: a landscape web screenshot fills
 * the frame either way, but a native app screenshot is portrait, and cropping
 * one to a landscape box would cut off the very thing the caption promises. The
 * leftover frame reads as a mat around the shot. Unlike the cover, which knows
 * its shape from `media.orientation`, a gallery mixes both, so it takes the
 * treatment that is right for either instead of asking the content to declare
 * it.
 */
function ScreenshotFigure({ screenshot }: { screenshot: ProjectScreenshot }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-visual border border-line bg-surface">
        <Image
          src={screenshot.src}
          alt={screenshot.alt}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
        />
      </div>
      <figcaption className="font-sans text-sm leading-relaxed text-ink-soft">
        {screenshot.caption}
      </figcaption>
    </figure>
  );
}

/** A labelled block inside the sticky rail; tighter than a story Field. */
function RailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <MonoLabel tone="pine" className="tracking-[1.5px]">
        {label}
      </MonoLabel>
      {children}
    </section>
  );
}

// The dot only reinforces the status; the label text next to it carries the
// meaning, so the state never depends on color alone (accessibility).
const featureDotClass: Record<FeatureStatus, string> = {
  done: "bg-pine",
  "in-progress": "bg-signal",
  planned: "bg-line-strong",
};

export function ProjectDetail({ project, locale, related = [] }: ProjectDetailProps) {
  const { labels, detail } = getCopy(locale).projects;
  const featureStatusLabels = getFeatureStatusLabels(locale);
  const links = project.links;
  const caseStudy = project.caseStudy;

  // The back link points at a home-page anchor (`/#projekte`). Pass next/link an
  // explicit { pathname, hash } object: a `"/#hash"` string is collapsed to a
  // same-page hash that would try to scroll to a non-existent anchor on this
  // detail page instead of navigating home. See components/chrome/Nav.tsx.
  const [backPathname, backHash] = detail.backToProjects.href.split("#");

  // Rail contents. The stack prefers the grouped case-study layers and falls back
  // to the flat pill list; either way it lives in the rail, not the story.
  const techLayers = caseStudy?.techStack ?? [];
  const flatStack = project.stack ?? [];
  const hasStack = techLayers.length > 0 || flatStack.length > 0;
  const metrics = caseStudy?.metrics ?? [];
  const hasMetrics = metrics.length > 0;
  const hasLinks = Boolean(links?.live || links?.repo || links?.demo);
  const hasRail = hasStack || hasMetrics || hasLinks;

  return (
    <main className="mx-auto w-full max-w-(--container-max) px-6 pt-32 pb-28 sm:px-10 lg:pr-14 lg:pl-26">
      <Link
        href={{ pathname: backPathname || "/", hash: backHash || undefined }}
        className="font-mono text-xs tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
      >
        {detail.backToProjects.label}
      </Link>

      <div
        className={cn(
          "mt-10",
          hasRail &&
            "lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-16 xl:gap-20",
        )}
      >
        {/* Main column: the narrative, at a readable measure. */}
        <div className="flex min-w-0 flex-col">
          <header className="flex flex-col gap-4">
            <MonoLabel tone="pine" className="tracking-[2px]">
              {detail.eyebrow}
            </MonoLabel>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-display text-[clamp(2rem,5vw,2.875rem)] leading-[1.08] tracking-[-0.01em] text-ink">
                {project.name}
              </h1>
              <ProjectStatusBadge status={project.status} locale={locale} />
            </div>
            <p className="max-w-[60ch] font-sans text-lg leading-relaxed text-ink-soft">
              {project.tagline}
            </p>
          </header>

          <ProjectMedia
            project={project}
            locale={locale}
            loading="eager"
            className="mt-12 aspect-[16/10] w-full"
          />

          <div className="mt-14 flex flex-col gap-12">
            {caseStudy?.summary ? (
              <p className="max-w-[68ch] font-sans text-lg leading-relaxed text-ink">
                {caseStudy.summary}
              </p>
            ) : null}

            {project.problem ? (
              <Field label={labels.problem}>
                <p className="max-w-[64ch] font-sans leading-relaxed text-ink-soft">
                  {project.problem}
                </p>
              </Field>
            ) : null}

            {project.role ? (
              <Field label={labels.role}>
                <p className="max-w-[64ch] font-sans leading-relaxed text-ink-soft">
                  {project.role}
                </p>
              </Field>
            ) : null}

            {caseStudy?.solution ? (
              <Field label={labels.solution}>
                <p className="max-w-[64ch] font-sans leading-relaxed text-ink-soft">
                  {caseStudy.solution.intro}
                </p>
                {caseStudy.solution.highlights && caseStudy.solution.highlights.length > 0 ? (
                  <div className="mt-2">
                    <BulletList items={caseStudy.solution.highlights} />
                  </div>
                ) : null}
              </Field>
            ) : null}

            {/* The claim above is deterministic output; the proof lets the visitor
                drive it. Rendered right after the solution so claim -> proof reads
                in sequence (S4-5). */}
            {caseStudy?.interactiveProof ? <FuelivoProof locale={locale} /> : null}

            {caseStudy?.features && caseStudy.features.length > 0 ? (
              <Field label={labels.features}>
                <ul className="grid list-none gap-2 sm:grid-cols-2">
                  {caseStudy.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-center gap-3 rounded-lg border border-line bg-bg px-4 py-3"
                    >
                      <span
                        aria-hidden
                        className={`size-2 shrink-0 rounded-full ${featureDotClass[feature.status]}`}
                      />
                      <span className="min-w-0 flex-1 font-sans text-sm leading-snug text-ink">
                        {feature.label}
                      </span>
                      {feature.tag ? (
                        <span className="shrink-0 rounded-pill border border-line px-2 py-0.5 font-mono text-[10px] tracking-[0.5px] text-pine uppercase">
                          {feature.tag}
                        </span>
                      ) : null}
                      <span className="shrink-0 font-mono text-[10px] tracking-[0.5px] text-ink-soft uppercase">
                        {featureStatusLabels[feature.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              </Field>
            ) : null}

            {/* Real screenshots of the running product (ADR-0011): the features
                claim what it does, the shots show it, and the architecture then
                explains how. Nothing renders while a project has no shots yet. */}
            {caseStudy?.screenshots && caseStudy.screenshots.length > 0 ? (
              <Field label={labels.screenshots}>
                <div className="grid gap-6 sm:grid-cols-2">
                  {caseStudy.screenshots.map((screenshot) => (
                    <ScreenshotFigure key={screenshot.src} screenshot={screenshot} />
                  ))}
                </div>
              </Field>
            ) : null}

            {caseStudy?.architecture ? (
              <Field label={labels.architecture}>
                <p className="max-w-[64ch] font-sans leading-relaxed text-ink-soft">
                  {caseStudy.architecture.intro}
                </p>
                {caseStudy.architecture.points && caseStudy.architecture.points.length > 0 ? (
                  <div className="mt-2">
                    <BulletList items={caseStudy.architecture.points} />
                  </div>
                ) : null}
              </Field>
            ) : null}

            {caseStudy?.challenges && caseStudy.challenges.length > 0 ? (
              <Field label={labels.challenges}>
                <div className="flex flex-col gap-4">
                  {caseStudy.challenges.map((challenge) => (
                    <article
                      key={challenge.title}
                      className="flex flex-col gap-4 rounded-xl border border-line bg-bg p-5"
                    >
                      <h3 className="font-sans font-medium text-ink">{challenge.title}</h3>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px] tracking-[0.5px] text-pine uppercase">
                          {labels.challenge.problem}
                        </span>
                        <p className="font-sans text-sm leading-relaxed text-ink-soft">
                          {challenge.problem}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px] tracking-[0.5px] text-pine uppercase">
                          {labels.challenge.solution}
                        </span>
                        <p className="font-sans text-sm leading-relaxed text-ink-soft">
                          {challenge.solution}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </Field>
            ) : null}

            {caseStudy?.timeline && caseStudy.timeline.length > 0 ? (
              <Field label={labels.timeline}>
                <ol className="flex list-none flex-col gap-8 border-l border-line pl-6">
                  {caseStudy.timeline.map((phase) => (
                    <li key={phase.period} className="relative flex flex-col gap-1.5">
                      <span
                        aria-hidden
                        className="absolute top-1.5 left-[-24px] size-2 -translate-x-1/2 rounded-full bg-pine ring-4 ring-bg"
                      />
                      <span className="font-mono text-xs tracking-[1px] text-pine uppercase">
                        {phase.period}
                      </span>
                      <h3 className="font-sans font-medium text-ink">{phase.title}</h3>
                      <p className="max-w-[62ch] font-sans text-sm leading-relaxed text-ink-soft">
                        {phase.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </Field>
            ) : null}

            {project.learnings && project.learnings.length > 0 ? (
              <Field label={labels.learnings}>
                <BulletList items={project.learnings} />
              </Field>
            ) : null}
          </div>
        </div>

        {/* Sticky rail: reference facts and the primary actions. Collapses under
            the story below lg. */}
        {hasRail ? (
          <aside className="mt-12 flex flex-col gap-6 lg:sticky lg:top-[calc(var(--nav-height)+2rem)] lg:mt-0 lg:self-start">
            {hasLinks ? (
              <div className="flex flex-col gap-3">
                {links?.live ? (
                  <Button
                    variant="primary"
                    href={links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full justify-center"
                  >
                    {detail.links.live} ↗
                  </Button>
                ) : null}
                {links?.repo ? (
                  <Button
                    variant="secondary"
                    href={links.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full justify-center"
                  >
                    {detail.links.repo} ↗
                  </Button>
                ) : null}
                {links?.demo ? (
                  <Button
                    variant="secondary"
                    href={links.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full justify-center"
                  >
                    {detail.links.demo} ↗
                  </Button>
                ) : null}
              </div>
            ) : null}

            {hasStack || hasMetrics ? (
              <Card className="flex flex-col gap-7">
                {hasStack ? (
                  <RailField label={techLayers.length > 0 ? labels.techStack : labels.stack}>
                    {techLayers.length > 0 ? (
                      <div className="flex flex-col gap-5">
                        {techLayers.map((layer) => (
                          <div key={layer.name} className="flex flex-col gap-2">
                            <h3 className="font-mono text-[11px] tracking-[0.5px] text-ink uppercase">
                              {layer.name}
                            </h3>
                            <ul className="flex list-none flex-wrap gap-1.5">
                              {layer.items.map((item) => (
                                <li
                                  key={item}
                                  className="rounded-pill border border-line bg-bg px-2.5 py-1 font-mono text-[11px] text-ink-soft"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="flex list-none flex-wrap gap-1.5">
                        {flatStack.map((tech) => (
                          <li
                            key={tech}
                            className="rounded-pill border border-line bg-bg px-2.5 py-1 font-mono text-[11px] text-ink-soft"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    )}
                  </RailField>
                ) : null}

                {hasMetrics ? (
                  <RailField label={labels.metrics}>
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
                  </RailField>
                ) : null}
              </Card>
            ) : null}
          </aside>
        ) : null}
      </div>

      {/* Internal-linking footer: the sibling detail pages (S5-2). Full width,
          below the two-column case study; renders nothing when there is no other
          detail-page project to point at. */}
      <RelatedProjects projects={related} locale={locale} />
    </main>
  );
}
