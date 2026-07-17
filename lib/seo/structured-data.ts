/**
 * schema.org JSON-LD builders. The site owner's `Person` is injected once per
 * locale in the root chrome; the per-project `CreativeWork`, per-post `Article`
 * and the `BreadcrumbList` for each are injected by their detail routes (S5-2).
 * All builders are pure and build-time constant, so a validator (Rich Results)
 * always gets a valid, absolute entity. Facts stay truthful and minimal - only
 * what is already visible on the page - and URLs are resolved through the same
 * `absoluteUrl`/route map the metadata and sitemap use, so nothing drifts. See
 * docs/content/seo.md.
 */

import { getCopy } from "@/content/copy";
import { type Project } from "@/content/projects";
import { type BlogPostMeta } from "@/lib/content/blog";
import { type Locale, localeTag } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/routes";
import { absoluteUrl, getSiteMeta, siteConfig, siteUrl } from "@/lib/seo/site";

/**
 * A lightweight `Person` reference reused as the `author`/`publisher` of the
 * project and article entities, so every piece of content points back at the same
 * identity as the standalone Person entity (localized job title, same URL).
 */
function authorRef(locale: Locale) {
  return {
    "@type": "Person",
    name: siteConfig.name,
    url: siteUrl,
    jobTitle: getSiteMeta(locale).jobTitle,
  } as const;
}

/** The Person JSON-LD for a locale (localized job title, same identity/URLs). */
export function personJsonLd(locale: Locale) {
  const { channels } = getCopy(locale).contact;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteUrl,
    jobTitle: getSiteMeta(locale).jobTitle,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: siteConfig.person.alumniOf,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.person.address.locality,
      addressCountry: siteConfig.person.address.country,
    },
    sameAs: [channels.linkedin.href, channels.github.href],
  } as const;
}

/**
 * The project's technologies as flat, de-duplicated keywords: the grouped
 * case-study tech layers when present, else the flat stack pills - the same facts
 * the detail page's rail shows. Order-preserving so the primary stack leads.
 */
export function projectKeywords(project: Project): string[] {
  const layered = project.caseStudy?.techStack?.flatMap((layer) => layer.items) ?? [];
  const flat = project.stack ?? [];
  return [...new Set([...layered, ...flat])];
}

/**
 * `CreativeWork` JSON-LD for a project detail page. A project is authored work,
 * not an Organization or a plain WebPage, so `CreativeWork` is the honest type;
 * its live URL (when any) becomes a `sameAs` so the entity links to the running
 * product. Optional facts (cover image, keywords, live link) are emitted only
 * when the project actually has them, so a leaner entry stays valid.
 */
export function projectJsonLd(project: Project, locale: Locale) {
  const url = absoluteUrl(localizedPath("projectDetail", locale, project.slug));
  const keywords = projectKeywords(project);

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    headline: project.name,
    description: project.tagline,
    url,
    mainEntityOfPage: url,
    inLanguage: localeTag[locale],
    author: authorRef(locale),
    creator: authorRef(locale),
    ...(project.media?.cover ? { image: absoluteUrl(project.media.cover) } : {}),
    ...(keywords.length > 0 ? { keywords } : {}),
    ...(project.links?.live ? { sameAs: [project.links.live] } : {}),
  };
}

/**
 * `Article` JSON-LD for a blog post. `datePublished`/`dateModified` both use the
 * post's own date (the most honest last-modified signal we have; a post is not
 * edited after publishing), and `image` falls back to the site's default share
 * card since posts carry no per-post cover yet. Tags become `keywords`.
 */
export function articleJsonLd(post: BlogPostMeta, locale: Locale) {
  const url = absoluteUrl(localizedPath("blogPost", locale, post.slug));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    url,
    mainEntityOfPage: url,
    inLanguage: localeTag[locale],
    datePublished: post.date,
    dateModified: post.date,
    author: authorRef(locale),
    publisher: authorRef(locale),
    image: [absoluteUrl(siteConfig.ogImage)],
    ...(post.tags.length > 0 ? { keywords: [...post.tags] } : {}),
  };
}

/** One node in a breadcrumb trail: a human label and the absolute URL it links to. */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * `BreadcrumbList` JSON-LD from an ordered trail (root first). Positions are
 * 1-based per schema.org; each item carries its absolute URL so a crawler can
 * reconstruct the site hierarchy that the visible back-links only imply.
 */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Home -> projects index -> this project, as a `BreadcrumbList`. */
export function projectBreadcrumbJsonLd(project: Project, locale: Locale) {
  const copy = getCopy(locale);
  return breadcrumbJsonLd([
    { name: copy.breadcrumb.home, url: absoluteUrl(localizedPath("home", locale)) },
    {
      name: copy.projects.index.title,
      url: absoluteUrl(localizedPath("projectsIndex", locale)),
    },
    {
      name: project.name,
      url: absoluteUrl(localizedPath("projectDetail", locale, project.slug)),
    },
  ]);
}

/** Home -> blog index -> this post, as a `BreadcrumbList`. */
export function articleBreadcrumbJsonLd(post: BlogPostMeta, locale: Locale) {
  const copy = getCopy(locale);
  return breadcrumbJsonLd([
    { name: copy.breadcrumb.home, url: absoluteUrl(localizedPath("home", locale)) },
    { name: copy.blog.index.title, url: absoluteUrl(localizedPath("blogIndex", locale)) },
    { name: post.title, url: absoluteUrl(localizedPath("blogPost", locale, post.slug)) },
  ]);
}
