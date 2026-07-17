/**
 * Server-only observability for the live-data widgets (S2-9).
 *
 * Each widget route handler degrades to a static fallback on any upstream failure,
 * which keeps the page intact but must not make a genuine failure invisible: a
 * silently broken widget could stay broken for months over the site's multi-year
 * lifetime. `logWidgetFailure` records each real upstream failure as a single
 * structured line on the server's stderr, prefixed with a stable `[widget:<name>]`
 * tag so it is greppable and can back a lightweight uptime/error signal. It is the
 * minimal observability hook for S2-9; full error tracking (a dashboard, alerting)
 * is deliberately deferred to S6-2.
 *
 * A widget whose optional secret is simply unset is an *expected* degradation, not a
 * failure: every CI build and secret-less preview would otherwise spam the signal
 * and drown real outages. Such cases throw `WidgetNotConfiguredError`, which
 * `logWidgetFailure` skips. Weather needs no secret, so it never hits this path.
 *
 * Server-only: imported solely by the `app/api/<widget>/route.ts` handlers and the
 * `lib/data/<widget>.ts` sources they call, so it never ships in the client bundle.
 * It logs only the widget name and the error message - never a token or any other
 * secret.
 */

/** The live widgets whose upstream failures are worth observing. */
export type WidgetName =
  | "github-activity"
  | "latest-commit"
  | "now-playing"
  | "weather"
  | "wakatime";

/** Stable prefix so a log drain or `grep` can select every widget failure. */
const LOG_TAG = "widget";

/**
 * Thrown by a widget's data source when a required optional secret is unset. It
 * marks an expected, quiet degradation (the feature is simply off in this
 * environment) so `logWidgetFailure` can tell it apart from a real upstream outage
 * and keep it out of the error signal.
 */
export class WidgetNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WidgetNotConfiguredError";
  }
}

/**
 * Records that a widget's upstream was unavailable and the widget is serving its
 * static fallback. An intentionally unconfigured feature
 * (`WidgetNotConfiguredError`) is skipped so it never pollutes the signal. Extracts
 * a human-readable message from any other thrown value without logging the error
 * object itself (which could carry request details); a non-Error value is
 * stringified. Never throws, so observability can never break the fallback path.
 */
export function logWidgetFailure(widget: WidgetName, error: unknown): void {
  if (error instanceof WidgetNotConfiguredError) {
    return;
  }
  const reason = error instanceof Error ? error.message : String(error);
  console.error(`[${LOG_TAG}:${widget}] upstream unavailable, serving fallback: ${reason}`);
}
