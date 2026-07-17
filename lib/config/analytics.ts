/**
 * Cookieless web-analytics configuration (S2-5). The site loads a self-hosted
 * Umami tracking tag only when both the script URL and the website id are set;
 * with either unset the tag is omitted and the site makes zero analytics
 * requests. So analytics is off by default and lights up only once a build is
 * given the two values. See docs/operations/analytics.md and
 * docs/architecture/decisions/0008-analytics.md.
 *
 * Both values are public by nature - they appear verbatim in the page's
 * <script> tag - so they ride NEXT_PUBLIC_* and are inlined at build time, the
 * same pattern as NEXT_PUBLIC_SITE_URL (a Dockerfile build arg the deploy
 * workflow passes). There is no secret here: the Umami dashboard credentials
 * live on the analytics server and never touch this app.
 */

export interface AnalyticsConfig {
  /** Absolute URL of the Umami tracking script (e.g. ".../script.js"). */
  src: string;
  /** The Umami website id (UUID) the pageviews are attributed to. */
  websiteId: string;
}

/**
 * The analytics config when both values are present, else `null` (analytics
 * disabled). Values are trimmed, so an accidentally blank-but-present env var
 * still reads as "off" rather than emitting a broken tag. Reads the env on each
 * call so the value is never captured stale at import time.
 */
export function analyticsConfig(): AnalyticsConfig | null {
  const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC?.trim();
  const websiteId = process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID?.trim();

  if (!src || !websiteId) {
    return null;
  }

  return { src, websiteId };
}
