import { type Copy } from "@/content/copy";
import { showAvailability } from "@/lib/config/features";

import { HeroMeta } from "./HeroMeta";
import { NowPlaying } from "./NowPlaying";

type HeroCopy = Copy["hero"];

/**
 * The live-status module: one surface that gathers the ambient live signals -
 * the now-playing track on top, a rule, then a status row carrying the
 * time/weather meta line and - when the availability flag is on - a "verfügbar"
 * indicator. Chrome-less by design: it fills whatever container mounts it (the
 * bento tile in Onepager.tsx owns the border/padding), so it never nests a card
 * inside a card.
 *
 * NowPlaying and HeroMeta keep their own live-data effects and static fallbacks,
 * so the module reserves its space from first paint (no layout shift) and each
 * signal degrades on its own.
 */
export function LiveStatus({ copy }: { copy: HeroCopy }) {
  return (
    <div
      // Stable hook for the visual-regression suite to mask this module: NowPlaying
      // and the time/weather meta line carry live data that would churn every
      // snapshot (tests/visual/visual.spec.ts).
      data-testid="hero-live-status"
      className="flex w-full flex-col gap-3"
    >
      <NowPlaying copy={copy.visual.nowPlaying} />

      <span aria-hidden className="h-px w-full bg-line" />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <HeroMeta meta={copy.status.meta} />
        {/* Availability, gated behind SHOW_AVAILABILITY (lib/config/features). Off by
            default so the site does not advertise a job search until the flag is
            deliberately switched on. */}
        {showAvailability() && (
          <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-soft">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-signal motion-safe:animate-glow-pulse"
            />
            {copy.status.availability}
          </span>
        )}
      </div>
    </div>
  );
}
