/**
 * Self-hosted error-tracking configuration (S6-2). The app initialises the
 * Sentry SDK - pointed at a self-hosted GlitchTip instance - only when a DSN is
 * set; with it unset the SDK never initialises and the site makes zero
 * error-tracking requests. So error tracking is off by default and lights up
 * only once a build is given the DSN. See docs/operations/error-monitoring.md
 * and docs/architecture/decisions/0009-error-and-uptime-monitoring.md.
 *
 * The DSN is public by nature - the browser SDK needs it to report client-side
 * errors, so it appears in the client bundle - so it rides `NEXT_PUBLIC_*` and
 * is inlined at build time, the same pattern as the Umami analytics config
 * (lib/config/analytics.ts) and NEXT_PUBLIC_SITE_URL. A Sentry/GlitchTip DSN
 * carries only a public ingest key, never a secret: the dashboard credentials
 * live on the error-tracking server and never touch this app.
 */

/** The single value that switches error tracking on. */
export interface ErrorTrackingConfig {
  /** The GlitchTip/Sentry DSN the SDK reports to (e.g. "https://<key>@errors.example/1"). */
  dsn: string;
}

/**
 * The error-tracking config when a DSN is present, else `null` (tracking
 * disabled). The value is trimmed, so an accidentally blank-but-present env var
 * still reads as "off" rather than initialising a broken client. Reads the env
 * on each call so the value is never captured stale at import time - the same
 * contract as `analyticsConfig`.
 */
export function errorTrackingConfig(): ErrorTrackingConfig | null {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

  if (!dsn) {
    return null;
  }

  return { dsn };
}
