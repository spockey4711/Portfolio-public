/**
 * The live translated routes, as the browser sees them: each key's German canonical
 * path and its English twin. Shared by the i18n suite (which round-trips every pair
 * through the language toggle) and the global warm-up (which requests every path once
 * before the workers start), so the two lists can never drift apart.
 */
export const ROUTES = [
  { name: "home", de: "/", en: "/en" },
  { name: "projects index", de: "/projekte", en: "/en/projects" },
  { name: "project detail", de: "/projekte/fuelivo", en: "/en/projects/fuelivo" },
  { name: "uses", de: "/uses", en: "/en/uses" },
  { name: "now", de: "/jetzt", en: "/en/now" },
  { name: "imprint", de: "/impressum", en: "/en/imprint" },
  { name: "privacy", de: "/datenschutz", en: "/en/privacy" },
  { name: "blog index", de: "/blog", en: "/en/blog" },
  {
    name: "translated blog post",
    de: "/blog/warum-dieses-portfolio",
    en: "/en/blog/warum-dieses-portfolio",
  },
] as const;

/**
 * Everything the smoke suite requests that is not a translated route pair: the
 * German-only primitives page and the same-origin API the home page's heatmap
 * fetches on mount. Listed here so the warm-up covers them too.
 */
export const EXTRA_PATHS = ["/primitives", "/api/github-activity"] as const;
