/**
 * Next.js browser instrumentation (S6-2). Initialises the self-hosted GlitchTip
 * error tracking in the client runtime so client-side runtime errors (hydration,
 * widget JS, event handlers) are captured alongside the server ones.
 *
 * Gated on a configured DSN through the shared options (lib/observability/sentry.ts):
 * with no DSN the SDK never initialises, so an unconfigured build ships the SDK inert
 * and makes zero requests. Events are tunnelled through the app's own origin
 * (next.config.ts `tunnelRoute`), so the GlitchTip host never appears in the browser
 * and ad-blockers do not drop reports. The SDK is errors-only and cookieless
 * (see lib/observability/sentry.ts); the processing is disclosed on the Datenschutz
 * page (content/legal.ts).
 */
import * as Sentry from "@sentry/nextjs";

import { sentryInitOptions } from "@/lib/observability/sentry";

const options = sentryInitOptions();

if (options) {
  Sentry.init(options);
}

// Lets Sentry tie navigation-related errors to the route transition that caused
// them. A no-op until the SDK is initialised, so it is safe to export always.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
