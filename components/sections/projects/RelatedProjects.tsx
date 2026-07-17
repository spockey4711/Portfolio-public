import { Link } from "@/components/chrome/view-transitions";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import type { Project } from "@/content/projects";
import { type Locale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/routes";

/**
 * The internal-linking footer of a project detail page (S5-2): links to the other
 * projects that have their own page, so a visitor and a crawler both have a path
 * on from here instead of a dead end. Renders nothing when there is no sibling to
 * point at, so a lone detail page degrades gracefully. Uses the view-transition
 * Link so project-to-project navigation animates like the rest of the site.
 */
export function RelatedProjects({
  projects,
  locale,
}: {
  projects: readonly Project[];
  locale: Locale;
}) {
  if (projects.length === 0) {
    return null;
  }

  const { related } = getCopy(locale).projects.detail;

  return (
    <nav aria-label={related} className="mt-20 border-t border-line pt-10">
      <MonoLabel tone="pine" className="tracking-[2px]">
        {related}
      </MonoLabel>
      <ul className="mt-6 grid list-none gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={localizedPath("projectDetail", locale, project.slug)}
              className="group flex h-full flex-col gap-1.5 rounded-card border border-line bg-surface p-5 transition-colors duration-200 hover:border-line-strong"
            >
              <span className="font-display text-lg text-ink transition-colors duration-200 group-hover:text-pine">
                {project.name}
              </span>
              <span className="font-sans text-sm leading-relaxed text-ink-soft">
                {project.tagline}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
