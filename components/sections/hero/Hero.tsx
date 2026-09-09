import { ArrowAffordance } from "@/components/ui/ArrowAffordance";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import { type Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The hero: the first screen and the 30-second story, set like a broadsheet lead -
 * kicker, a heavy uppercase display headline, the lede and two CTAs. Left-biased
 * and content-height by design (no full-viewport centring): the page's weight is
 * carried by the type, and the bento grid below starts within reach of the fold.
 * The live signals that used to sit beside the copy now live as first-class tiles
 * in the grid (see Onepager.tsx), so the hero holds nothing but the words.
 *
 * Deliberately no imagery (PORT-47, design audit 2026-09). The generated pixel-art
 * figure that briefly stood beside the copy was the page's strongest AI tell,
 * brought its own palette into the amber/slate system and told a recruiter
 * nothing, while on phones it sat below the CTAs and cost a full screen of scroll.
 * If a face is ever wanted here, it is a small real photo inside the token palette,
 * never dominant and never above the CTAs on mobile.
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
  const { hero } = getCopy(locale);

  return (
    // id="top": the nav wordmark links here (see components/chrome/Nav.tsx).
    <section
      id="top"
      className="mx-auto w-full max-w-(--container-max) px-6 pt-[calc(var(--nav-height)+72px)] pb-16 sm:px-10 lg:px-14 lg:pt-[calc(var(--nav-height)+96px)]"
    >
      <div className="flex max-w-4xl min-w-0 flex-col items-start gap-7">
        <div {...reveal(0, "flex items-center gap-2.5")}>
          <span
            aria-hidden
            className="size-2 rounded-full bg-signal motion-safe:animate-glow-pulse motion-reduce:animate-none"
          />
          <MonoLabel tone="pine">{hero.kicker}</MonoLabel>
        </div>

        {/* Uppercase display head; the accent phrase switches to the slate accent
            (weight + colour carry the emphasis - headings never italicise). The
            all-caps leading floor is 1.0; 1.06 keeps wrapped lines from fusing. */}
        <h1
          {...reveal(
            0.12,
            "max-w-[16ch] min-w-0 font-display text-[clamp(2.625rem,7.5vw,4.75rem)] leading-[1.06] font-extrabold tracking-[0.01em] text-ink uppercase",
          )}
        >
          {hero.headline.lead} <span className="text-pine">{hero.headline.accent}</span>
        </h1>

        <p {...reveal(0.24, "max-w-[52ch] font-sans text-lg leading-relaxed text-ink-soft")}>
          {hero.sub}
        </p>

        {/* CTA row. The CV download lives in the Werdegang tile (experience.cv). */}
        <div {...reveal(0.36, "flex flex-wrap items-center gap-4")}>
          <Button variant="primary" href={hero.ctas.primary.href}>
            {hero.ctas.primary.label}
            <ArrowAffordance />
          </Button>
          <Button
            variant="secondary"
            href={hero.ctas.github.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {hero.ctas.github.label}
            <ArrowAffordance direction="up-right" />
          </Button>
        </div>
      </div>
    </section>
  );
}
