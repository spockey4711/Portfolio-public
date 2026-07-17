import { detailProjects } from "@/content/projects";
import { getAllPosts } from "@/lib/content/blog";
import { alternatesFor, isBlogPostTranslated, type StaticRouteKey } from "@/lib/i18n/routes";
import { absoluteUrl, siteUrl } from "@/lib/seo/site";

import type { MetadataRoute } from "next";

/** Absolutize a route map's relative hreflang paths, so a full `languages` set can be reused. */
function absolutize(languages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(languages).map(([hreflang, path]) => [hreflang, absoluteUrl(path)]),
  );
}

/**
 * The absolute hreflang alternates for a static route, so each sitemap entry can
 * advertise its cross-locale variants. Reuses the route map's `alternatesFor` (the
 * same source the page metadata uses) and only widens as `translatedRoutes` does,
 * so a locale variant appears here exactly when its route actually exists.
 */
function absoluteAlternates(key: StaticRouteKey): Record<string, string> {
  return absolutize(alternatesFor(key, "de").languages);
}

/** The sitemap `id`s, one file per content type; the union `generateSitemaps` emits. */
const SEGMENTS = ["pages", "projects", "blog"] as const;
type Segment = (typeof SEGMENTS)[number];

/**
 * Split the sitemap by content type (S5-2): Next serves one file per `id` at
 * `/sitemap/<id>.xml`, and `app/sitemap-index.xml/route.ts` stitches them into a
 * `<sitemapindex>` that `robots.txt` points at. Splitting keeps each file
 * single-purpose and lets the per-type crawl frequencies (below) travel with it.
 */
export function generateSitemaps() {
  return SEGMENTS.map((id) => ({ id }));
}

/**
 * The stable, hand-curated routes: the two onepager locales plus the level-2
 * index/utility pages. The legal pages (/impressum, /datenschutz) are deliberately
 * noindex (see their per-page metadata), so they stay out to avoid mixed signals.
 * English routes are added one at a time as each phasing PR translates them
 * (the onepager, the projects index, the /uses inventory, the /now snapshot and the
 * blog index so far), via the shared hreflang alternates.
 */
function pageEntries(lastModified: Date): MetadataRoute.Sitemap {
  const homeAlternates = absoluteAlternates("home");
  const projectsIndexAlternates = absoluteAlternates("projectsIndex");
  const usesAlternates = absoluteAlternates("uses");
  const nowAlternates = absoluteAlternates("now");
  const blogIndexAlternates = absoluteAlternates("blogIndex");

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: homeAlternates },
    },
    {
      url: absoluteUrl("/en"),
      lastModified,
      changeFrequency: "monthly",
      // The English onepager mirrors the German canonical but is not the
      // x-default, so it ranks a notch below its German counterpart.
      priority: 0.9,
      alternates: { languages: homeAlternates },
    },
    {
      url: absoluteUrl("/projekte"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: projectsIndexAlternates },
    },
    {
      url: `${siteUrl}/en/projects`,
      lastModified,
      changeFrequency: "monthly",
      // Mirrors the German projects index but is not the x-default, so it ranks a
      // notch below its German counterpart (same policy as the onepager pair).
      priority: 0.8,
      alternates: { languages: projectsIndexAlternates },
    },
    {
      url: absoluteUrl("/jetzt"),
      lastModified,
      // A "now page" is meant to change often; a monthly hint invites re-crawls
      // without overpromising. It ranks below the index pages by design.
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: nowAlternates },
    },
    {
      url: absoluteUrl("/en/now"),
      lastModified,
      changeFrequency: "monthly",
      // Mirrors the German /jetzt snapshot but is not the x-default, so it ranks a
      // notch below its German counterpart (same policy as the onepager pair).
      priority: 0.5,
      alternates: { languages: nowAlternates },
    },
    {
      url: absoluteUrl("/blog"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: blogIndexAlternates },
    },
    {
      url: absoluteUrl("/en/blog"),
      lastModified,
      changeFrequency: "weekly",
      // Mirrors the German blog index but is not the x-default, so it ranks a notch
      // below its German counterpart (same policy as the onepager pair). The EN
      // index lists only translated posts (none yet, S5-1g); the shell still ranks.
      priority: 0.6,
      alternates: { languages: blogIndexAlternates },
    },
    {
      url: absoluteUrl("/uses"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: { languages: usesAlternates },
    },
    {
      url: absoluteUrl("/en/uses"),
      lastModified,
      changeFrequency: "monthly",
      // Mirrors the German /uses inventory but is not the x-default, so it ranks a
      // notch below its German counterpart (same policy as the onepager pair).
      priority: 0.4,
      alternates: { languages: usesAlternates },
    },
  ];
}

/**
 * One entry per project that has its own detail page (P3-3). Each project ships in
 * both locales (S5-1b): the German canonical and its English twin, both carrying the
 * same reciprocal hreflang set so a crawler reaching either learns of the other. The
 * English variant ranks a notch below its German counterpart (same policy as the
 * onepager/index pairs).
 */
function projectEntries(lastModified: Date): MetadataRoute.Sitemap {
  return detailProjects.flatMap((project) => {
    const languages = absolutize(alternatesFor("projectDetail", "de", project.slug).languages);
    return [
      {
        url: absoluteUrl(`/projekte/${project.slug}`),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages },
      },
      {
        url: absoluteUrl(`/en/projects/${project.slug}`),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      },
    ];
  });
}

/**
 * One entry per published German post (P3-7); a post's own date is its truest lastmod.
 * A post that carries an English translation (S5-1g) also lists its English twin, and
 * both then advertise the same reciprocal hreflang set (German is x-default). Because
 * translations are opt-in per post, an untranslated post stays a lone German entry with
 * no alternates, so the sitemap never points at an /en/blog/<slug> that does not exist.
 */
function postEntries(): MetadataRoute.Sitemap {
  return getAllPosts().flatMap((post) => {
    const lastModified = new Date(`${post.date}T00:00:00Z`);
    const de = {
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    };

    if (!isBlogPostTranslated(post.slug)) {
      return [de];
    }

    const languages = absolutize(alternatesFor("blogPost", "de", post.slug).languages);
    return [
      { ...de, alternates: { languages } },
      {
        url: absoluteUrl(`/en/blog/${post.slug}`),
        lastModified,
        changeFrequency: "yearly" as const,
        // Mirrors the German post but is not the x-default, so it ranks a notch below
        // its German counterpart (same policy as the onepager/index/project pairs).
        priority: 0.5,
        alternates: { languages },
      },
    ];
  });
}

/** All entries for one segment. Exported so the sitemap-index route can size each file. */
export function entriesFor(segment: Segment, now: Date = new Date()): MetadataRoute.Sitemap {
  switch (segment) {
    case "projects":
      return projectEntries(now);
    case "blog":
      return postEntries();
    case "pages":
      return pageEntries(now);
  }
}

/** The absolute URL of a segment's sitemap file, for the sitemap index. */
export function segmentSitemapUrl(segment: Segment): string {
  return `${siteUrl}/sitemap/${segment}.xml`;
}

export { SEGMENTS };
export type { Segment };

// Next passes `id` as a promise resolving to one of the SEGMENTS values (the
// string form since Next 16). Each id becomes a file at /sitemap/<id>.xml.
export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const segment = (await id) as Segment;
  return entriesFor(segment);
}
