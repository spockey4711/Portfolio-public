"use client";

import { useEffect, useState } from "react";

import { type Copy } from "@/content/copy";
import type { NowPlayingResult } from "@/lib/data/now-playing";

type NowPlayingCopy = Copy["hero"]["visual"]["nowPlaying"];

// Poll cadence for the live track, aligned with the route's ~30-60s cache. Songs
// change while the page is open, so a light poll keeps the widget honest; the CDN
// cache means most polls never reach Spotify.
const POLL_INTERVAL_MS = 60_000;

// The card's two lines - a mono label and the track - resolved together from a
// route result, so the label and track always update as a pair (a live track
// reads "now playing", the last played track reads "last played").
type Display = { label: string; track: string };

// The static placeholder: a stylised "now playing" line that stands in until the
// route answers, and the final fallback whenever it is idle or fails.
function staticDisplay(copy: NowPlayingCopy): Display {
  return { label: copy.label, track: copy.track };
}

/** Maps a route result to the label and track the card should show. */
function toDisplay(result: NowPlayingResult | null, copy: NowPlayingCopy): Display {
  switch (result?.state) {
    case "playing":
      return { label: copy.label, track: `${result.track} - ${result.artist}` };
    case "recent":
      return { label: copy.lastPlayedLabel, track: `${result.track} - ${result.artist}` };
    default:
      // Idle, unavailable or a malformed response: keep the static placeholder.
      return staticDisplay(copy);
  }
}

/**
 * The hero's "now playing" widget (P3-1, P3-8). Two stacked rows - a top line with a
 * four-bar equalizer and a mono label, and the track and artist on the line below.
 * (It floated over the hero panel until P3-2 replaced that panel with the full-page
 * character; S2-2 folded it into the hero's live-status module - LiveStatus.tsx - which
 * now owns the card chrome and width cap, so this renders as bare rows.)
 *
 * The display starts from the static placeholder in the content model, so the server
 * render and the first client render agree (no hydration mismatch) and the widget
 * reserves its space up front (no layout shift). After hydration it polls the
 * same-origin /api/now-playing endpoint: a live track shows as "now playing", and
 * when nothing is playing the most recently played track shows as "last played"
 * (P3-8); otherwise the static placeholder stays. Either can fail or never arrive
 * and the placeholder simply remains - one widget's failure never affects the
 * page. The track line truncates so a long title cannot push the module wider.
 *
 * The equalizer bars are decorative (aria-hidden) and animate only under
 * `motion-safe`, so reduced-motion users see them at their static rest state, per
 * docs/design/accessibility.md.
 */
export function NowPlaying({ copy }: { copy: NowPlayingCopy }) {
  const [display, setDisplay] = useState<Display>(staticDisplay(copy));

  useEffect(() => {
    const controller = new AbortController();

    const load = () =>
      fetch("/api/now-playing", { signal: controller.signal })
        .then((response) => (response.ok ? (response.json() as Promise<NowPlayingResult>) : null))
        .then((result) => {
          setDisplay(toDisplay(result, copy));
        })
        .catch(() => {
          // Ignore: network or abort errors leave the static placeholder in place.
        });

    load();
    const id = window.setInterval(load, POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(id);
      controller.abort();
    };
  }, [copy]);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-2">
        <span aria-hidden className="flex h-3 items-end gap-0.5">
          {[0, 1, 2, 3].map((bar) => (
            <span
              key={bar}
              className="h-full w-0.5 origin-bottom rounded-full bg-signal motion-safe:animate-equalize"
              style={{ animationDelay: `${bar * 0.15}s` }}
            />
          ))}
        </span>
        <span className="font-mono text-[10px] tracking-[1px] text-muted">{display.label}</span>
      </span>
      <span className="min-w-0 truncate font-mono text-xs text-ink-soft">{display.track}</span>
    </div>
  );
}
