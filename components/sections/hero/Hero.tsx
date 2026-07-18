import Image from "next/image";

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
 * Beside the copy stands a full-body pixel-art character (me). On large screens it
 * shares the row with the type, nudged down so its head begins level with the
 * headline (its feet then reach past the copy into the whitespace below); on phones
 * it drops below the CTAs, centred and height-capped. The source is a 600px-wide PNG
 * (public/images/hero-avatar.png) rendered small, so it stays crisp on retina
 * without weighing on the LCP - `priority` loads it eagerly since it is above the
 * fold. It reveals last in the entrance sequence.
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
      <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
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

        {/* The pixel-art character. Foot-aligned to the copy on lg (self-end),
            centred and height-capped on phones. w-auto keeps the aspect from the
            intrinsic 600x1795, so only the height drives its on-screen size. On lg
            it is nudged down (relative/top, not transform - the rise-up animation
            owns transform and its `forwards` fill would otherwise reset the offset)
            so the head begins level with the headline rather than above it. */}
        <div {...reveal(0.48, "shrink-0 self-center lg:relative lg:top-[5.5rem] lg:self-end")}>
          <Image
            src="/images/hero-avatar.png"
            alt={hero.visual.portraitAlt}
            width={600}
            height={1795}
            priority
            sizes="(min-width: 1024px) 200px, 130px"
            className="mx-auto h-[clamp(300px,52vw,380px)] w-auto select-none lg:mx-0 lg:h-[clamp(380px,44vw,600px)]"
          />
        </div>
      </div>
    </section>
  );
}
