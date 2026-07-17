"use client";

import { useEffect, useState } from "react";

import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import type {
  ContributionDay,
  ContributionLevel,
  GithubActivityResult,
} from "@/lib/data/github-activity";
import { type Locale, localeTag } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The GitHub activity strip (P2-3): a standalone contribution heatmap after the
 * About section (mounted in app/page.tsx). Like the terminal, it is a widget rather
 * than a numbered section, so it stays out of the section-eyebrow sequence.
 *
 * The last year of contributions is fetched from the same-origin /api/github-activity
 * route, which reads a server-only GitHub token; the client never sees the token and
 * calls only that endpoint. The widget renders a full-width skeleton grid on the
 * server and the first client render, so the two agree (no hydration mismatch) and
 * the strip reserves its height up front (no layout shift). The live calendar is
 * fetched in an effect after hydration; if it fails or never arrives, the skeleton
 * and the static fallback caption simply stay.
 *
 * The heatmap is coloured with the site's own --heat-* ramp (a single-hue amber
 * sequential scale, defined per-theme in globals.css), not GitHub's greens, so it
 * stays on-brand. There is no animation, so nothing to gate on reduced
 * motion; the grid exposes a single summary to assistive tech rather than 371 cells.
 */

// A full contribution year is 53 week-columns of 7 days. The empty skeleton reserves
// the grid's dimensions before any data arrives.
const SKELETON_WEEKS = 53;
const DAYS_PER_WEEK = 7;
const EMPTY_DAY: ContributionDay = { date: "", count: 0, level: 0 };
const SKELETON: ContributionDay[][] = Array.from({ length: SKELETON_WEEKS }, () =>
  Array.from({ length: DAYS_PER_WEEK }, () => EMPTY_DAY),
);

// Intensity buckets mapped to the --heat-* sequential ramp: a near-neutral empty
// cell (level 0), then a single amber hue stepping monotonically to the top (level
// 4). Full class strings so Tailwind's JIT keeps them.
const LEVEL_CLASS: Record<ContributionLevel, string> = {
  0: "bg-heat-0",
  1: "bg-heat-1",
  2: "bg-heat-2",
  3: "bg-heat-3",
  4: "bg-heat-4",
};

const LEGEND_LEVELS: ContributionLevel[] = [0, 1, 2, 3, 4];

export function GithubActivity({ locale }: { locale: Locale }) {
  const gh = getCopy(locale).githubActivity;
  const [calendar, setCalendar] = useState<GithubActivityResult>({ available: false });

  function dayTitle(day: ContributionDay): string | undefined {
    if (day.date === "") {
      return undefined;
    }
    const unit = day.count === 1 ? gh.day.one : gh.day.other;
    return `${day.count} ${unit} ${gh.day.on} ${day.date}`;
  }

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/github-activity", { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<GithubActivityResult>) : null))
      .then((result) => {
        if (result?.available) {
          setCalendar(result);
        }
      })
      .catch(() => {
        // Ignore: network or abort errors leave the static fallback in place.
      });

    return () => controller.abort();
  }, []);

  const weeks = calendar.available ? calendar.weeks : SKELETON;
  const caption = calendar.available
    ? `${calendar.totalContributions.toLocaleString(localeTag[locale])} ${gh.summary}`
    : gh.fallback;

  return (
    <section aria-label={gh.regionLabel} className="flex h-full min-w-0 flex-col">
      <div className="flex flex-1 flex-col rounded-card border-2 border-ink bg-surface p-5 shadow-widget sm:p-6">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <MonoLabel tone="pine">{gh.label}</MonoLabel>
          <span className="font-mono text-xs text-muted tabular-nums">{caption}</span>
        </div>

        {/* The columns grow to fill the full-width row (minmax floor keeps them scrollable
            on narrow screens); square cells derive their height from the column width. */}
        <div className="overflow-x-auto">
          <div
            role="img"
            aria-label={caption}
            className="grid w-full grid-flow-col gap-[3px]"
            style={{
              gridTemplateRows: `repeat(${DAYS_PER_WEEK}, auto)`,
              gridAutoColumns: "minmax(11px, 1fr)",
            }}
          >
            {weeks.map((week, w) =>
              week.map((day, d) => (
                <span
                  key={`${w}-${d}`}
                  aria-hidden
                  title={dayTitle(day)}
                  className={cn("aspect-square rounded-[2px]", LEVEL_CLASS[day.level])}
                />
              )),
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <a
            href={gh.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-pine transition-colors hover:text-signal"
          >
            {gh.link.label} <span aria-hidden>↗</span>
          </a>
          <div
            aria-hidden
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.5px] text-muted"
          >
            <span>{gh.legend.less}</span>
            {LEGEND_LEVELS.map((level) => (
              <span key={level} className={cn("size-[10px] rounded-[2px]", LEVEL_CLASS[level])} />
            ))}
            <span>{gh.legend.more}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
