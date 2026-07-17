import { NextResponse } from "next/server";

import { fetchNowPlaying, type NowPlayingResult } from "@/lib/data/now-playing";
import { logWidgetFailure } from "@/lib/observability/widget-failure";

/**
 * GET /api/now-playing - same-origin Spotify "now playing" for the hero widget
 * (P3-1, P3-8).
 *
 * Shapes the server-only Spotify calls (lib/data/now-playing.ts) into a tiny typed
 * response - the live track, the last played track, or an idle state - and, on any
 * upstream failure or an unconfigured feature, returns a 200 idle state so the
 * widget degrades to its static fallback without surfacing an error or shifting
 * layout - logging genuine upstream failures server-side so they stay observable
 * (S2-9). All three OAuth secrets stay server-side, honouring the secrets-server-only
 * rule. See docs/architecture/rendering-and-data.md.
 */

// A resolved track (playing or recent) changes rarely, so cache it briefly at the
// CDN with a short stale-while-revalidate window, matching the ~30-60s now-playing
// budget.
const TRACK_CACHE = "public, s-maxage=30, stale-while-revalidate=60";
// Cache the idle/unavailable state just as briefly so playback resuming surfaces
// quickly.
const IDLE_CACHE = "public, s-maxage=30";

export async function GET(): Promise<NextResponse<NowPlayingResult>> {
  try {
    const result = await fetchNowPlaying();
    return NextResponse.json(result, {
      headers: { "Cache-Control": result.state === "idle" ? IDLE_CACHE : TRACK_CACHE },
    });
  } catch (error) {
    // Degrade to the static fallback, but log so the failure is observable.
    logWidgetFailure("now-playing", error);
    return NextResponse.json({ state: "idle" }, { headers: { "Cache-Control": IDLE_CACHE } });
  }
}
