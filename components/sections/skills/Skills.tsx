import { MonoLabel } from "@/components/ui/MonoLabel";
import { Pill } from "@/components/ui/Pill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCopy } from "@/content/copy";
import { getSkillGroups } from "@/content/skills";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The Skills section (P1-10). A grouped, "uses"-style tech stack: each group is a
 * mono label with its technologies as plain chips - honest, no rating bars, no
 * logo soup. Rendered as a description list (group title -> items) so the grouping
 * is meaningful to assistive tech. Groups and items come from content/skills.ts;
 * the title from content/copy.
 *
 * Open prose, not a tile: on the landing page it sits straight on the paper
 * background as an editorial band, sharing a row with the experience timeline
 * (Onepager.tsx). The groups run two-up while the section is full width and
 * collapse to one column at lg, where the section is only half the row.
 */
export function Skills({ locale, className }: { locale: Locale; className?: string }) {
  const copy = getCopy(locale);
  const skillGroups = getSkillGroups(locale);

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className={cn("flex flex-col gap-6", className)}
    >
      <SectionHeader title={copy.skills.title} />
      <h2 id="skills-title" className="sr-only">
        {copy.skills.title}
      </h2>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-1">
        {skillGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <dt>
              <MonoLabel tone="muted" className="tracking-[2px]">
                {group.title}
              </MonoLabel>
            </dt>
            <dd>
              <ul className="flex list-none flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Pill>{item}</Pill>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
