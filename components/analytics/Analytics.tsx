import { analyticsConfig } from "@/lib/config/analytics";

/**
 * Injects the self-hosted, cookieless Umami tracking tag when analytics is
 * configured (S2-5); renders nothing otherwise, so an unconfigured build makes
 * no analytics requests at all. Mounted once in SiteChrome, so it covers every
 * route and both locales.
 *
 * A plain deferred external <script> - matching the site's other injected
 * scripts (JsonLd, the pre-paint boot/theme guards) - rather than next/script,
 * so the tag stays a pure server render with no client runtime. The Umami tag
 * sets no cookies and stores no personal data; see docs/operations/analytics.md
 * and the Datenschutz page (content/legal.ts).
 */
export function Analytics() {
  const config = analyticsConfig();

  if (!config) {
    return null;
  }

  return <script defer src={config.src} data-website-id={config.websiteId} />;
}
