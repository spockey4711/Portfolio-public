import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { fetchLatestCommit, type LatestCommitResult } from "@/lib/data/latest-commit";
import { logWidgetFailure } from "@/lib/observability/widget-failure";

/**
 * GET /api/latest-commit - same-origin "latest public push" for the signals-of-life
 * feed (S3-5).
 *
 * Shapes the server-only GitHub events read (lib/data/latest-commit.ts) into a typed
 * response and, on any failure (upstream error, bad payload, no recent push),
 * returns a 200 "unavailable" state so the feed row degrades to its quiet fallback
 * without surfacing an error or shifting layout - logging the failure server-side so
 * it stays observable (S2-9). Any token stays server-side, honouring the
 * secrets-server-only rule. See docs/architecture/rendering-and-data.md.
 */

// ~15 min: a fresh push should surface within a coding session, but this stays well
// inside GitHub's rate limit even unauthenticated (at most a handful of calls/hour,
// shared across every visitor).
const REVALIDATE_SECONDS = 900;

// The upstream is a plain GET, but unstable_cache is what pins us to one upstream
// call per revalidation window regardless of traffic. A thrown error (upstream
// failure or no recent push) is not cached, so a transient outage recovers on the
// next request.
const getLatestCommit = unstable_cache(fetchLatestCommit, ["latest-commit"], {
  revalidate: REVALIDATE_SECONDS,
});

// Cache a successful body at the CDN for the revalidation window, with a longer
// stale-while-revalidate so a returning visitor never waits on GitHub.
const SUCCESS_CACHE = `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=3600`;
// Do not cache failures for long, so a transient outage recovers quickly.
const FALLBACK_CACHE = "public, s-maxage=60";

export async function GET(): Promise<NextResponse<LatestCommitResult>> {
  try {
    const commit = await getLatestCommit();
    // A null commit is a quiet empty state (no recent public push), not a failure:
    // serve the fallback without logging, and cache it briefly like the success path.
    if (!commit) {
      return NextResponse.json(
        { available: false },
        { headers: { "Cache-Control": SUCCESS_CACHE } },
      );
    }
    return NextResponse.json(
      { available: true, ...commit },
      { headers: { "Cache-Control": SUCCESS_CACHE } },
    );
  } catch (error) {
    // Degrade to the quiet fallback, but log so the failure is observable.
    logWidgetFailure("latest-commit", error);
    return NextResponse.json(
      { available: false },
      { headers: { "Cache-Control": FALLBACK_CACHE } },
    );
  }
}
