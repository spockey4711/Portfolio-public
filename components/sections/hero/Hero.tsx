import { ArrowAffordance } from "@/components/ui/ArrowAffordance";
import { Button } from "@/components/ui/Button";
import { getCopy } from "@/content/copy";
import { showAvailability } from "@/lib/config/features";
import { isCvAvailable } from "@/lib/content/cv";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The hero: the first screen, set like a broadsheet masthead - the name as the
 * display headline, one sentence of positioning, the availability line and two
 * CTAs. It answers a recruiter's first five seconds (who, what, where, looking for
 * what, and where the CV is) and then gets out of the way: left-biased and
 * content-height by design (no full-viewport centring), so the first proof - the
 * fuelivo card below - starts inside the first viewport at 1440x900 (PORT-48,
 * design audit 2026-09). No kicker: the generic three-word formula said nothing the
 * positioning sentence does not say better, and it cost a line above the fold.
 *
 * Deliberately no imagery (PORT-47). The generated pixel-art figure that briefly
 * stood beside the copy was the page's strongest AI tell, brought its own palette
 * into the amber/slate system and told a recruiter nothing, while on phones it sat
 * below the CTAs and cost a full screen of scroll. If a face is ever wanted here,
 * it is a small real photo inside the token palette, never dominant and never
 * above the CTAs on mobile.
 *
 * The CV download renders only when the file really exists in public/
 * (lib/content/cv.ts, server-only - this must stay a Server Component), exactly
 * like the Werdegang link. GitHub left the hero: the contact band lists it, and a
 * recruiter's next step is the projects or the CV, not the repositories. The
 * availability line stays behind SHOW_AVAILABILITY (lib/config/features), so the
 * site advertises a job search only once that switch is deliberately flipped.
 *
 * Reveal: every element rises in via the `rise-up` keyframe, staggered from first
 * paint (globals.css). This is the page's one orchestrated entrance. Each element
 * rests hidden only under `motion-safe`, so reduced-motion users see the settled
 * hero with no animation. It is pure CSS, so nothing here runs on the React
 * render path.
 */

// Per-element reveal stagger in seconds.
function reveal(delay: number, className?: string) {
  return {
    className: cn("motion-safe:animate-rise-up motion-safe:opacity-0", className),
    style: { animationDelay: `${delay}s` },
  };
}

export function Hero({ locale }: { locale: Locale }) {
  const { hero, cv } = getCopy(locale);
  const cvAvailable = isCvAvailable();

  return (
    // id="top": the nav wordmark links here (see components/chrome/Nav.tsx).
    <section
      id="top"
      className="mx-auto w-full max-w-(--container-max) px-6 pt-[calc(var(--nav-height)+72px)] pb-16 sm:px-10 lg:px-14 lg:pt-[calc(var(--nav-height)+96px)]"
    >
      <div className="flex max-w-4xl min-w-0 flex-col items-start gap-6">
        {/* The name is the page's one h1 (docs/design/accessibility.md), set as the
            uppercase display masthead. One line at every width, so the fold budget
            goes to the facts below it. */}
        <h1
          {...reveal(
            0,
            "min-w-0 font-display text-[clamp(2.625rem,7.5vw,4.75rem)] leading-[1.06] font-extrabold tracking-[0.01em] text-ink uppercase",
          )}
        >
          {hero.name}
        </h1>

        {/* One sentence of positioning: what, where, current role, current build.
            Sans and sentence case so it reads as prose under the masthead, sized
            like the band lead-ins (BandIntro) so the page keeps one lede register. */}
        <p
          {...reveal(
            0.12,
            "max-w-[52ch] font-sans text-xl leading-relaxed text-ink-soft sm:text-2xl",
          )}
        >
          {hero.positioning}
        </p>

        {/* Availability line: the pulsing marker the Werdegang uses for ongoing
            entries, then the location. Gated behind SHOW_AVAILABILITY, so the
            prerendered HTML simply omits it until the flag is set at build time. */}
        {showAvailability() ? (
          <p
            {...reveal(
              0.24,
              "flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-[1px] uppercase",
            )}
          >
            <span className="inline-flex items-center gap-2 text-pine">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-signal motion-safe:animate-glow-pulse"
              />
              {hero.status.availability}
            </span>
            <span aria-hidden className="text-muted">
              ·
            </span>
            <span className="text-muted">{hero.status.location}</span>
          </p>
        ) : null}

        {/* CTA row: the jump to the first proof, then the CV as a download. */}
        <div {...reveal(0.36, "flex flex-wrap items-center gap-4")}>
          <Button variant="primary" href={hero.ctas.primary.href}>
            {hero.ctas.primary.label}
            <ArrowAffordance />
          </Button>
          {cvAvailable ? (
            <Button variant="secondary" href={cv.href} download>
              {cv.label}
              <span aria-hidden>↓</span>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
