import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { fetchContributionCalendar, type GithubActivityResult } from "@/lib/data/github-activity";
import { logWidgetFailure } from "@/lib/observability/widget-failure";

/**
 * GET /api/github-activity - same-origin contribution calendar for the activity
 * heatmap widget (P2-3).
 *
 * Shapes the server-only GitHub GraphQL call (lib/data/github-activity.ts) into a
 * typed response and, on any failure (no token, upstream error, bad payload),
 * returns a 200 "unavailable" state so the widget degrades to its static fallback
 * without surfacing an error or shifting layout - logging the failure server-side so
 * it stays observable (S2-9). Keeping the token server-side honours the
 * secrets-server-only rule. See docs/architecture/rendering-and-data.md.
 */

// ~6h, within the 6-24h GitHub cache budget in rendering-and-data.md.
const REVALIDATE_SECONDS = 21600;

// The upstream is a GraphQL POST, which Next's fetch Data Cache does not cache by
// default, so unstable_cache is what actually keeps us within GitHub's rate limit:
// at most one upstream call per revalidation window, shared across every visitor. A
// thrown error (missing token or upstream failure) is not cached, so a transient
// outage recovers on the next request.
const getContributionCalendar = unstable_cache(fetchContributionCalendar, ["github-activity"], {
  revalidate: REVALIDATE_SECONDS,
});

// Cache a successful body at the CDN for the revalidation window, with a longer
// stale-while-revalidate so a returning visitor never waits on GitHub.
const SUCCESS_CACHE = `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`;
// Do not cache failures for long, so a transient outage recovers quickly.
const FALLBACK_CACHE = "public, s-maxage=60";

export async function GET(): Promise<NextResponse<GithubActivityResult>> {
  try {
    const { totalContributions, weeks } = await getContributionCalendar();
    return NextResponse.json(
      { available: true, totalContributions, weeks },
      { headers: { "Cache-Control": SUCCESS_CACHE } },
    );
  } catch (error) {
    // Degrade to the static fallback, but log so the failure is observable.
    logWidgetFailure("github-activity", error);
    return NextResponse.json(
      { available: false },
      { headers: { "Cache-Control": FALLBACK_CACHE } },
    );
  }
}
