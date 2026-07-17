import { NextResponse } from "next/server";

import { fetchCurrentTemperature, type WeatherResult } from "@/lib/data/weather";
import { logWidgetFailure } from "@/lib/observability/widget-failure";

/**
 * GET /api/weather - same-origin weather for the hero meta widget (P2-2).
 *
 * Shapes the server-only Open-Meteo call (lib/data/weather.ts) into a tiny typed
 * response and, on any upstream failure, returns a 200 "unavailable" state so the
 * widget degrades to its static fallback without surfacing an error or shifting
 * layout - logging the failure server-side so it stays observable (S2-9). Keeping
 * the key-less upstream on the server still honours the secrets-server-only rule.
 * See docs/architecture/rendering-and-data.md.
 */

// Cache a successful body for ~30 min at the CDN, matching the upstream
// revalidation, with a short stale-while-revalidate window.
const SUCCESS_CACHE = "public, s-maxage=1800, stale-while-revalidate=3600";
// Do not cache failures for long, so a transient upstream outage recovers quickly.
const FALLBACK_CACHE = "public, s-maxage=60";

export async function GET(): Promise<NextResponse<WeatherResult>> {
  try {
    const temperatureC = await fetchCurrentTemperature();
    return NextResponse.json(
      { available: true, temperatureC },
      { headers: { "Cache-Control": SUCCESS_CACHE } },
    );
  } catch (error) {
    // Degrade to the static fallback, but log so the failure is observable.
    logWidgetFailure("weather", error);
    return NextResponse.json(
      { available: false },
      { headers: { "Cache-Control": FALLBACK_CACHE } },
    );
  }
}
