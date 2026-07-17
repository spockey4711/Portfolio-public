import { Link } from "@/components/chrome/view-transitions";
import { FeaturedProject } from "@/components/sections/projects/FeaturedProject";
import { ProjectCard } from "@/components/sections/projects/ProjectCard";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import { getProjects } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";

/**
 * The projects index body (IA level 2, P3-9): the complete, ordered project list,
 * of which the onepager section (level 1) shows only a curated teaser. Shared by
 * both locale routes (de at /projekte, en at /en/projects) exactly like Onepager,
 * so the two trees render the same structure and only the resolved copy/content
 * differs. The routes own their metadata; this owns the markup.
 */
export function ProjectsIndex({ locale }: { locale: Locale }) {
  const { index } = getCopy(locale).projects;
  const ordered = [...getProjects(locale)].sort((a, b) => a.order - b.order);
  const [featured, ...rest] = ordered;

  // The back link points up to the onepager section (`/#projekte`), the index's
  // parent. Pass next/link an explicit { pathname, hash } object: a `"/#hash"`
  // string is collapsed to a same-page hash that never leaves this page. Same
  // pattern as components/chrome/Nav.tsx and ProjectDetail.tsx.
  const [backPathname, backHash] = index.backToOnepager.href.split("#");

  return (
    <main className="mx-auto w-full max-w-(--container-max) px-6 pt-32 pb-28 sm:px-10 lg:pr-14 lg:pl-26">
      <Link
        href={{ pathname: backPathname || "/", hash: backHash || undefined }}
        className="font-mono text-xs tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
      >
        {index.backToOnepager.label}
      </Link>

      <header className="mt-10 flex flex-col gap-4">
        <MonoLabel tone="pine" className="tracking-[2px]">
          {index.eyebrow}
        </MonoLabel>
        <h1 className="font-display text-[clamp(2rem,5vw,2.875rem)] leading-[1.08] tracking-[-0.01em] text-ink">
          {index.title}
        </h1>
        <p className="max-w-[60ch] font-sans text-lg leading-relaxed text-ink-soft">
          {index.intro}
        </p>
      </header>

      <div className="mt-14 flex flex-col gap-12">
        {featured ? <FeaturedProject project={featured} locale={locale} /> : null}

        {rest.length > 0 ? (
          <ul className="grid list-none gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {rest.map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} locale={locale} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
