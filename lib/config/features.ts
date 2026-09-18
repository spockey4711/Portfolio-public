/**
 * Runtime feature flags read from server-only environment variables. Kept out of
 * NEXT_PUBLIC_* so they never reach the client bundle (least privilege); only
 * server components read them. Every flag is catalogued in
 * docs/operations/environment-variables.md.
 */

/** Truthy env flag: only an explicit "true" or "1" enables it; anything else is off. */
function envFlag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

/**
 * Whether the hero's availability line ("Verfügbar als Werkstudent · Köln") is rendered.
 * Off by default so the site never advertises a job search unless deliberately
 * switched on via SHOW_AVAILABILITY at build time. Read on the server only, so the
 * line is simply absent from the prerendered HTML when the flag is unset. Reads the
 * env on each call so the value is never captured stale at import time.
 */
export function showAvailability(): boolean {
  return envFlag(process.env.SHOW_AVAILABILITY);
}
