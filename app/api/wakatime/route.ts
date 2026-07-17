import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { fetchWakatimeStats, type WakatimeResult } from "@/lib/data/wakatime";
import { logWidgetFailure } from "@/lib/observability/widget-failure";

/**
 * GET /api/wakatime - same-origin last-7-days coding stats for the WakaTime widget
 * (S3-2).
 *
 * Shapes the server-only WakaTime call (lib/data/wakatime.ts) into a typed response
 * and, on any failure (no key, upstream error, bad payload), returns a 200
 * "unavailable" state so the widget degrades to its static fallback without
 * surfacing an error or shifting layout - logging genuine failures server-side so
 * they stay observable (S2-9). Keeping the key server-side honours the
 * secrets-server-only rule. See docs/architecture/rendering-and-data.md.
 */

// ~1h: the rolling 7-day breakdown moves slowly, and WakaTime aggregates roughly
// hourly, so a shorter window would only spend rate limit without fresher data.
const REVALIDATE_SECONDS = 3600;

// The upstream is a plain GET, but unstable_cache is what guarantees at most one
// upstream call per revalidation window, shared across every visitor - independent
// of how the fetch Data Cache treats the request. A thrown error (missing key or
// upstream failure) is not cached, so a transient outage recovers on the next call.
const getWakatimeStats = unstable_cache(fetchWakatimeStats, ["wakatime-stats"], {
  revalidate: REVALIDATE_SECONDS,
});

// Cache a successful body at the CDN for the revalidation window, with a longer
// stale-while-revalidate so a returning visitor never waits on WakaTime.
const SUCCESS_CACHE = `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`;
// Do not cache failures for long, so a transient outage recovers quickly.
const FALLBACK_CACHE = "public, s-maxage=60";

export async function GET(): Promise<NextResponse<WakatimeResult>> {
  try {
    const { humanReadableTotal, projects } = await getWakatimeStats();
    return NextResponse.json(
      { available: true, humanReadableTotal, projects },
      { headers: { "Cache-Control": SUCCESS_CACHE } },
    );
  } catch (error) {
    // Degrade to the static fallback, but log so the failure is observable.
    logWidgetFailure("wakatime", error);
    return NextResponse.json(
      { available: false },
      { headers: { "Cache-Control": FALLBACK_CACHE } },
    );
  }
}
