import type { UrlObject } from "url";

/**
 * Pure helpers behind the route view transitions (S2-7). Kept framework-free and
 * side-effect-light so they can be unit-tested and reused by both the navigation
 * hook and the link wrapper. The React wiring lives in
 * components/chrome/view-transitions.
 *
 * The transitions are strictly progressive enhancement: we only ever take over a
 * navigation when the browser supports the View Transitions API and the visitor
 * has not asked for reduced motion. Everywhere else the plain client navigation
 * runs unchanged (see docs/design/animation-and-motion.md).
 */

/** True when the browser exposes the same-document View Transitions API. */
export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

/** True when the visitor has requested reduced motion at the OS/browser level. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The single gate every entry point checks: animate a route change only when the
 * API is available and motion is welcome. A `false` result means "navigate the
 * ordinary way", which is the correct fallback for old browsers and reduced
 * motion alike.
 */
export function shouldAnimateViewTransition(): boolean {
  return supportsViewTransitions() && !prefersReducedMotion();
}

/**
 * Collapse a `next/link` href into the plain string the App Router's
 * `router.push`/`replace` accept (they take a string, unlike `<Link href>` which
 * also accepts a `UrlObject`). Handles the `{ pathname, hash }` object form used
 * for the home-anchor back links (see components/chrome/Nav.tsx) as well as
 * `search`/`query`.
 */
export function hrefToString(href: string | UrlObject): string {
  if (typeof href === "string") return href;

  const pathname = href.pathname ?? "";

  let search = "";
  if (typeof href.search === "string" && href.search) {
    search = href.search.startsWith("?") ? href.search : `?${href.search}`;
  } else if (href.query && typeof href.query === "object") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(href.query)) {
      if (value == null) continue;
      if (Array.isArray(value)) {
        for (const item of value) params.append(key, String(item));
      } else {
        params.append(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) search = `?${qs}`;
  }

  const hash = href.hash ? (href.hash.startsWith("#") ? href.hash : `#${href.hash}`) : "";

  return `${pathname}${search}${hash}`;
}
