import { Link } from "@/components/chrome/view-transitions";
import { Tile } from "@/components/sections/bento/Tile";
import { FeaturedProject } from "@/components/sections/projects/FeaturedProject";
import {
  ProjectTeaser,
  type ProjectTeaserShape,
} from "@/components/sections/projects/ProjectTeaser";
import { getCopy } from "@/content/copy";
import { getProjects } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { isRouteTranslated, localizedPath } from "@/lib/i18n/routes";

// The onepager is IA level 1: featured proof plus two curated teasers. Every
// project, including those omitted here, remains on the level-2 projects index.
const TEASER_COUNT = 2;
const TEASER_SHAPES: readonly ProjectTeaserShape[] = ["upright", "typographic"];

/**
 * The complete projects cluster. It owns its internal twelve-column grid so the
 * three entries can have distinct shapes: a full-width lead, an upright native
 * app and a wider typographic CLI card.
 */
export function Projects({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const ordered = [...getProjects(locale)].sort((a, b) => a.order - b.order);
  const [featured, ...rest] = ordered;
  const teaser = rest.slice(0, TEASER_COUNT);
  const showViewAll = isRouteTranslated("projectsIndex", locale);

  return (
    <section
      id="projekte"
      aria-labelledby="projekte-title"
      className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-12 lg:gap-6"
    >
      <h2 id="projekte-title" className="sr-only">
        {copy.projects.title}
      </h2>

      {featured ? (
        <div className="min-w-0 md:col-span-2 lg:col-span-12">
          <FeaturedProject project={featured} locale={locale} />
        </div>
      ) : null}

      {teaser.map((project, index) => {
        const shape = TEASER_SHAPES[index] ?? "typographic";
        return (
          <div
            key={project.slug}
            className={index === 0 ? "min-w-0 lg:col-span-5" : "min-w-0 lg:col-span-7"}
          >
            <ProjectTeaser project={project} locale={locale} shape={shape} />
          </div>
        );
      })}

      {showViewAll ? (
        <Tile tone="slate" className="justify-end md:col-span-2 lg:col-span-12">
          <Link
            href={localizedPath("projectsIndex", locale)}
            className="group flex items-end justify-between gap-6 after:absolute after:inset-0"
          >
            <span className="font-display text-2xl leading-none font-bold tracking-[0.02em] uppercase sm:text-3xl">
              {copy.projects.viewAll}
            </span>
            <span
              aria-hidden
              className="font-display text-4xl leading-none font-extrabold transition-transform duration-200 motion-safe:group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </Tile>
      ) : null}
    </section>
  );
}
