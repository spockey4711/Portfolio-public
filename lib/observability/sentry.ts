/**
 * Shared, privacy-first Sentry init options for the self-hosted GlitchTip error
 * tracking (S6-2). One source of truth for the server, edge and browser runtimes
 * (instrumentation.ts and instrumentation-client.ts) so the DSN gate and the PII
 * scrubbing can never drift between them.
 *
 * Deliberately minimal, to honour the project's privacy stance and the Lighthouse
 * budget:
 *   - errors only: `tracesSampleRate: 0`, no performance/session/replay
 *     integrations, so the client SDK stays small and sends nothing but errors.
 *   - `sendDefaultPii: false`, so the SDK does not attach IPs, cookies or request
 *     bodies in the first place.
 *   - a `beforeSend` that additionally strips any residual IP and cookie header,
 *     keeping the payload matched to exactly what the Datenschutz page discloses
 *     (technical error data plus browser/OS type from the user agent - no cookies,
 *     no persisted IP). Keep this and content/legal.ts in lockstep.
 *
 * Returns `null` when no DSN is configured (`errorTrackingConfig()` is off), so
 * every caller skips `Sentry.init` entirely and the SDK makes zero requests -
 * safe for CI, previews and local dev with no secrets set.
 */
import { errorTrackingConfig } from "@/lib/config/error-tracking";

import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Drops the last traces of personal data Sentry might still attach even with
 * `sendDefaultPii: false`: the reporter's IP and any cookie header. Runs on every
 * runtime. Never throws - a scrub failure must not lose the error event.
 */
function scrubPii(event: ErrorEvent): ErrorEvent {
  if (event.user) {
    delete event.user.ip_address;
  }
  if (event.request?.headers) {
    delete event.request.headers.cookie;
    delete event.request.headers.Cookie;
  }
  if (event.request) {
    delete event.request.cookies;
  }
  return event;
}

/**
 * The common `Sentry.init` options when a DSN is configured, else `null`
 * (tracking off). Callers do `const options = sentryInitOptions(); if (options)
 * Sentry.init(options);`.
 */
export function sentryInitOptions() {
  const config = errorTrackingConfig();

  if (!config) {
    return null;
  }

  return {
    dsn: config.dsn,
    // Errors only - no performance tracing (protects the Lighthouse budget).
    tracesSampleRate: 0,
    // Never attach IPs, cookies or request bodies by default.
    sendDefaultPii: false,
    beforeSend: scrubPii,
  };
}
