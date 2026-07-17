import { Link } from "@/components/chrome/view-transitions";
import { Tile } from "@/components/sections/bento/Tile";
import { FeaturedProject } from "@/components/sections/projects/FeaturedProject";
import { getCopy } from "@/content/copy";
import { getProjects } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { isRouteTranslated, localizedPath } from "@/lib/i18n/routes";

// The onepager teaser is IA level 1: a curated selection, not the full list (see
// ADR-0005). It shows the featured project plus the next TEASER_COUNT entries by
// order; every project - including the ones dropped here - lives on the /projekte
// index (level 2, P3-9), reached via the "view all" tile below.
const TEASER_COUNT = 2;

/**
 * The Projects tiles (P1-8): a fragment of bento cells owned by the two-column
 * grid in Onepager.tsx. fuelivo leads as a full-row "wide" card (cover beside its
 * story); the two curated teaser projects follow on the next row, one per column,
 * rendered with the same rich card so all three read in one voice and show the
 * same problem/role/learnings story. A slate "view all" tile spans the closing
 * row into the full /projekte index. Projects are read from content/projects,
 * already ordered so the featured entry is first (guaranteed by the invariants in
 * tests/unit/projects.test.ts).
 */
export function Projects({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const ordered = [...getProjects(locale)].sort((a, b) => a.order - b.order);
  const [featured, ...rest] = ordered;
  const teaser = rest.slice(0, TEASER_COUNT);
  // The full index only exists once its English variant has shipped; until then
  // the "view all" tile stays hidden on the English tree (translatedRoutes).
  const showViewAll = isRouteTranslated("projectsIndex", locale);

  return (
    <>
      {featured ? (
        <section id="projekte" aria-labelledby="projekte-title" className="min-w-0 md:col-span-2">
          <h2 id="projekte-title" className="sr-only">
            {copy.projects.title}
          </h2>
          <FeaturedProject project={featured} locale={locale} layout="wide" />
        </section>
      ) : null}

      {teaser.map((project) => (
        // The two teasers share the row below the featured tile. They render the
        // full card (not a lighter stub), so grid's default align-items: stretch
        // is exactly what we want here - it keeps both cards the same height
        // regardless of how much story each one carries.
        <div key={project.slug} className="min-w-0">
          <FeaturedProject project={project} locale={locale} layout="poster" />
        </div>
      ))}

      {showViewAll ? (
        // A deliberately quiet slate cell: nothing but the index link, set big.
        // The stretched pseudo-element makes the whole tile the click target while
        // the accessible name stays the plain label.
        <Tile tone="slate" className="justify-end md:col-span-2">
          <Link
            href={localizedPath("projectsIndex", locale)}
            className="group flex flex-col items-start gap-2 after:absolute after:inset-0"
          >
            <span
              aria-hidden
              className="font-display text-4xl leading-none font-extrabold transition-transform duration-200 motion-safe:group-hover:translate-x-1"
            >
              →
            </span>
            <span className="font-display text-2xl leading-[1.06] font-bold tracking-[0.02em] uppercase">
              {copy.projects.viewAll}
            </span>
          </Link>
        </Tile>
      ) : null}
    </>
  );
}
