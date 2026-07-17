/**
 * Next.js server + edge instrumentation (S6-2). Initialises the self-hosted
 * GlitchTip error tracking for the Node and Edge runtimes, and forwards
 * server-side request errors to it via the `onRequestError` hook.
 *
 * Gated on a configured DSN through the shared options (lib/observability/sentry.ts):
 * with no DSN the SDK never initialises and `captureRequestError` is a no-op, so an
 * unconfigured build (CI, previews, local dev) reports nothing. The browser runtime
 * is initialised separately in instrumentation-client.ts.
 */
import * as Sentry from "@sentry/nextjs";

import { sentryInitOptions } from "@/lib/observability/sentry";

export function register(): void {
  const options = sentryInitOptions();

  if (!options) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(options);
  }
}

// Captures errors thrown while rendering/handling a request (nested React Server
// Components, route handlers, middleware). A no-op until `register` has initialised
// the SDK, so it is safe to export unconditionally.
export const onRequestError = Sentry.captureRequestError;
