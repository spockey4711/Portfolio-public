import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCopy } from "@/content/copy";
import { getExperience } from "@/content/experience";
import { isCvAvailable } from "@/lib/content/cv";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The Experience/Werdegang tile (P1-11). A compact timeline of study and work
 * entries, newest first, read from content/experience.ts. Each entry stacks the
 * period (mono) over the role, organisation and a short focus line; ongoing
 * entries carry the pulsing status marker. All strings come from content/.
 *
 * The full CV is offered as a subtle download below the timeline (the shared `cv`
 * copy block), surfaced only when the file exists in public/ (checked server-side
 * via lib/content/cv.ts), so an absent CV leaves no dead link. This is a Server Component:
 * isCvAvailable() reads the filesystem, so the section must not become a Client
 * Component.
 *
 * Open prose, not a tile: on the landing page it sits straight on the paper
 * background as an editorial band (Onepager.tsx). `h-full` lets it match the
 * Skills column beside it so the CV download can pin to the shared baseline.
 */
export function Experience({ locale, className }: { locale: Locale; className?: string }) {
  const { experience: experienceCopy, cv } = getCopy(locale);
  const experience = getExperience(locale);
  const cvAvailable = isCvAvailable();

  return (
    <section
      id="werdegang"
      aria-labelledby="werdegang-title"
      className={cn("flex h-full flex-col gap-6", className)}
    >
      <SectionHeader title={experienceCopy.title} />
      <h2 id="werdegang-title" className="sr-only">
        {experienceCopy.title}
      </h2>

      <ol className="flex list-none flex-col">
        {experience.map((entry) => (
          <li
            key={`${entry.org}-${entry.role}`}
            className="flex flex-col gap-2 border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <MonoLabel tone="muted" className="normal-case">
                {entry.period}
              </MonoLabel>
              {entry.current ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[1px] text-pine uppercase">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-signal motion-safe:animate-glow-pulse"
                  />
                  {experienceCopy.current}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-display text-xl font-bold tracking-[0.02em] text-ink uppercase">
                {entry.role}
              </h3>
              <p className="font-mono text-sm text-ink-soft">{entry.org}</p>
            </div>
            {entry.description ? (
              <p className="max-w-[60ch] font-sans text-sm leading-relaxed text-ink-soft">
                {entry.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      {cvAvailable ? (
        <Button variant="ghost" href={cv.href} download className="mt-auto self-start">
          {cv.label}
          <span aria-hidden>↓</span>
        </Button>
      ) : null}
    </section>
  );
}
