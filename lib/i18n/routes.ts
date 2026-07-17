/**
 * The per-locale route map: the single source of truth for every internal path,
 * so the nav/footer links, the language toggle, the `hreflang` alternates and the
 * sitemap can never drift apart. German paths are canonical and unprefixed;
 * English paths live under `/en` with English segments (a product decision, see
 * docs/architecture/decisions/0006-i18n-and-localization.md).
 *
 * Dependency-free (imports only ./locale) so content modules and both server and
 * client components can build hrefs from it without pulling in React or content.
 */

import { type Locale, defaultLocale, localeTag } from "./locale";

/** Routes with a fixed path (no dynamic segment). */
const staticPaths = {
  home: { de: "/", en: "/en" },
  projectsIndex: { de: "/projekte", en: "/en/projects" },
  blogIndex: { de: "/blog", en: "/en/blog" },
  now: { de: "/jetzt", en: "/en/now" },
  uses: { de: "/uses", en: "/en/uses" },
  imprint: { de: "/impressum", en: "/en/imprint" },
  privacy: { de: "/datenschutz", en: "/en/privacy" },
} as const satisfies Record<string, Record<Locale, string>>;

/** Routes with a single `slug` segment. */
const dynamicPaths = {
  projectDetail: { de: "/projekte", en: "/en/projects" },
  blogPost: { de: "/blog", en: "/en/blog" },
} as const satisfies Record<string, Record<Locale, string>>;

export type StaticRouteKey = keyof typeof staticPaths;
export type DynamicRouteKey = keyof typeof dynamicPaths;
export type RouteKey = StaticRouteKey | DynamicRouteKey;

/** The opposite locale, used by the language toggle. */
export const otherLocale: Record<Locale, Locale> = { de: "en", en: "de" };

/**
 * Route keys whose English variant is actually published. The language toggle
 * and the sitemap read this so they never point at an EN route that does not
 * exist yet; it is widened one entry at a time as each phasing PR lands a
 * translated route (the onepager `home` shipped first, then the projects index,
 * the per-project detail pages, the /uses inventory, the /now snapshot, the legal
 * pages, then the blog index). The legal routes stay noindex, so they gain
 * reciprocal hreflang here but are still kept out of the sitemap (see
 * app/sitemap.ts). `blogIndex` is translated, but `blogPost` deliberately stays out:
 * blog posts are translated opt-in per post (S5-1g), so a coarse per-key gate is the
 * wrong tool - the per-post gate below (`translatedBlogPostSlugs`) decides each post.
 */
export const translatedRoutes: ReadonlySet<RouteKey> = new Set<RouteKey>([
  "home",
  "projectsIndex",
  "projectDetail",
  "uses",
  "now",
  "imprint",
  "privacy",
  "blogIndex",
]);

/**
 * The blog posts whose English translation is published (S5-1g). Blog posts are
 * translated one at a time - a real, ongoing content effort - so unlike the other EN
 * routes they cannot share the coarse per-key `translatedRoutes` gate; this set is the
 * per-post switch instead. It is the single, client-safe source of truth for "is this
 * post advertised in English": the language toggle, the DE/EN post metadata and the
 * sitemap all read it, so they can never advertise an /en/blog/<slug> that 404s. Adding
 * a translation means adding the slug here and the file at content/blog/en/<slug>.mdx;
 * the blog registry cross-checks the two at build time and fails loudly if they drift
 * (see lib/content/blog.ts).
 */
export const translatedBlogPostSlugs: ReadonlySet<string> = new Set<string>([
  "warum-dieses-portfolio",
]);

/** Whether a blog post's English translation is published (see translatedBlogPostSlugs). */
export function isBlogPostTranslated(slug: string): boolean {
  return translatedBlogPostSlugs.has(slug);
}

/**
 * Whether a route's variant is live for the given locale. German is always live;
 * an English route is live only once its phasing PR has widened `translatedRoutes`.
 * Cross-page link lists filter on this so the English chrome never shows a link to
 * a route that does not exist yet. Accepts a plain string (copy carries route keys
 * as strings) and narrows internally.
 */
export function isRouteTranslated(route: string, locale: Locale): boolean {
  return locale === "de" || (translatedRoutes as ReadonlySet<string>).has(route);
}

/** The localized path for a static route (e.g. `localizedPath("blogIndex", "en")`). */
export function localizedPath(key: StaticRouteKey, locale: Locale): string;
/** The localized path for a dynamic route (e.g. `localizedPath("blogPost", "en", slug)`). */
export function localizedPath(key: DynamicRouteKey, locale: Locale, slug: string): string;
export function localizedPath(key: RouteKey, locale: Locale, slug?: string): string {
  if (key in staticPaths) {
    return staticPaths[key as StaticRouteKey][locale];
  }
  return `${dynamicPaths[key as DynamicRouteKey][locale]}/${slug}`;
}

/**
 * A localized home-anchor href (e.g. the nav's `/#projekte`). German resolves to
 * `/#hash`, English to `/en#hash`, so the same onepager anchors work from both
 * trees. The Nav splits this into `{ pathname, hash }` for `next/link`.
 */
export function localizedAnchor(hash: string, locale: Locale): string {
  const home = staticPaths.home[locale];
  return home === "/" ? `/#${hash}` : `${home}#${hash}`;
}

export interface RouteAlternates {
  /** The canonical URL for the current locale's page. */
  canonical: string;
  /** hreflang -> path map for `<link rel="alternate">`; German is `x-default`. */
  languages: Record<string, string>;
}

/** Build the canonical + hreflang alternates for a page, for `generateMetadata`. */
export function alternatesFor(key: StaticRouteKey, locale: Locale): RouteAlternates;
export function alternatesFor(key: DynamicRouteKey, locale: Locale, slug: string): RouteAlternates;
export function alternatesFor(key: RouteKey, locale: Locale, slug?: string): RouteAlternates {
  // The overloads above guarantee `slug` is present exactly for dynamic routes;
  // the `as never` bridges the union so this single body serves both signatures.
  const de = localizedPath(key as never, "de", slug as never);
  const en = localizedPath(key as never, "en", slug as never);
  return {
    canonical: locale === "de" ? de : en,
    languages: {
      [localeTag.de]: de,
      [localeTag.en]: en,
      "x-default": localizedPath(key as never, defaultLocale, slug as never),
    },
  };
}

/** A pathname-swap rule pairing a route's German and English paths. */
interface SwapRule {
  key: RouteKey;
  de: string;
  en: string;
  /** Match by prefix and carry the remainder (the `slug`) across. */
  dynamic?: boolean;
}

// Longest / most specific first: dynamic prefixes before their index exact match,
// and the home root last so it never shadows a deeper route.
const swapRules: readonly SwapRule[] = [
  { key: "projectDetail", de: "/projekte/", en: "/en/projects/", dynamic: true },
  { key: "blogPost", de: "/blog/", en: "/en/blog/", dynamic: true },
  { key: "projectsIndex", de: "/projekte", en: "/en/projects" },
  { key: "blogIndex", de: "/blog", en: "/en/blog" },
  { key: "now", de: "/jetzt", en: "/en/now" },
  { key: "uses", de: "/uses", en: "/en/uses" },
  { key: "imprint", de: "/impressum", en: "/en/imprint" },
  { key: "privacy", de: "/datenschutz", en: "/en/privacy" },
  { key: "home", de: "/", en: "/en" },
];

/**
 * The counterpart URL of `pathname` in the other locale, for the language toggle.
 * When switching to English, an untranslated route falls back to the English home
 * so the toggle never yields a 404 or a German page under `/en`. Blog posts are the
 * one per-post case: switching to English from a German post deep-links its English
 * twin only when that post is translated, and otherwise lands on the English blog
 * index (never a 404 and never German under `/en`). An unrecognised path falls back
 * to the target locale's home.
 */
export function counterpartPath(pathname: string, from: Locale): string {
  const to = otherLocale[from];
  for (const rule of swapRules) {
    const fromPath = rule[from];
    const matches = rule.dynamic ? pathname.startsWith(fromPath) : pathname === fromPath;
    if (!matches) continue;
    if (to === "en") {
      // Per-post gate: only translated posts have an English twin to deep-link to.
      if (rule.key === "blogPost") {
        const slug = pathname.slice(fromPath.length);
        return isBlogPostTranslated(slug) ? `${rule.en}${slug}` : localizedPath("blogIndex", "en");
      }
      if (!translatedRoutes.has(rule.key)) {
        return localizedPath("home", "en");
      }
    }
    return rule.dynamic ? `${rule[to]}${pathname.slice(fromPath.length)}` : rule[to];
  }
  return localizedPath("home", to);
}
