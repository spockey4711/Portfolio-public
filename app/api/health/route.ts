import { NextResponse } from "next/server";

/**
 * GET /api/health - a cheap, dependency-free liveness probe (S6-2).
 *
 * The uptime monitor (Uptime Kuma) polls this to tell "the app is up and serving"
 * apart from "the box answers on :80". It touches no upstream, no database and no
 * secret, so it stays fast and cannot itself fail a healthy server; it returns only
 * a fixed status plus a timestamp, never any request or visitor data. See
 * docs/operations/error-monitoring.md.
 */

// Never prerender or cache: a cached 200 would keep reporting "up" after the server
// had actually fallen over, defeating the point of the check.
export const dynamic = "force-dynamic";

export interface HealthResult {
  status: "ok";
  /** Server time in ISO 8601, so a poller can also spot a frozen/clock-skewed box. */
  time: string;
}

export function GET(): NextResponse<HealthResult> {
  return NextResponse.json(
    { status: "ok", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
