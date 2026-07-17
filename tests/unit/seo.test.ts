import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap, { entriesFor, generateSitemaps, SEGMENTS, segmentSitemapUrl } from "@/app/sitemap";
import { copy, getCopy } from "@/content/copy";
import { detailProjects } from "@/content/projects";
import { getAllPosts } from "@/lib/content/blog";
import { isBlogPostTranslated, localizedPath, translatedBlogPostSlugs } from "@/lib/i18n/routes";
import { getSiteMeta, siteConfig, siteUrl } from "@/lib/seo/site";
import {
  articleBreadcrumbJsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
  personJsonLd,
  projectBreadcrumbJsonLd,
  projectJsonLd,
  projectKeywords,
} from "@/lib/seo/structured-data";

// The SEO route handlers are the machine-readable half of the metadata contract
// (docs/content/seo.md); guard their shape so a crawler always gets a valid,
// absolute sitemap and an allow-all robots pointing back at it.
describe("siteUrl", () => {
  it("is an absolute URL with no trailing slash", () => {
    expect(() => new URL(siteUrl)).not.toThrow();
    expect(siteUrl).not.toMatch(/\/$/);
  });
});

// The sitemap is split by content type (S5-2): one file per SEGMENT, tied
// together by app/sitemap-index.xml. Guard each segment's contents and the split
// API so the machine-readable set stays complete and correctly attributed.
describe("sitemap segments", () => {
  const pages = entriesFor("pages");
  const projectsSegment = entriesFor("projects");
  const blogSegment = entriesFor("blog");

  it("emits one sitemap id per content type", () => {
    expect(generateSitemaps()).toEqual(SEGMENTS.map((id) => ({ id })));
  });

  it("dispatches a resolved id to that segment's entries", async () => {
    // Compare by URL: the entries are rebuilt with a fresh `lastModified` on each
    // call, so a deep equal would race on the timestamp.
    const dispatched = await sitemap({ id: Promise.resolve("projects") });
    expect(dispatched.map((entry) => entry.url)).toEqual(projectsSegment.map((entry) => entry.url));
  });

  it("lists the homepage as an absolute, indexable entry in the pages segment", () => {
    expect(pages[0]).toMatchObject({
      url: `${siteUrl}/`,
      priority: 1,
      changeFrequency: "monthly",
    });
    expect(pages[0].lastModified).toBeInstanceOf(Date);
  });

  it("lists the English onepager with absolute hreflang alternates", () => {
    const de = pages.find((e) => e.url === `${siteUrl}/`);
    const en = pages.find((e) => e.url === `${siteUrl}/en`);
    expect(en).toMatchObject({ priority: 0.9, changeFrequency: "monthly" });

    // Both onepager entries advertise the same absolute hreflang set, so a crawler
    // reaching either locale learns of the other; German is the x-default.
    const expectedAlternates = {
      "de-DE": `${siteUrl}/`,
      en: `${siteUrl}/en`,
      "x-default": `${siteUrl}/`,
    };
    expect(de?.alternates?.languages).toEqual(expectedAlternates);
    expect(en?.alternates?.languages).toEqual(expectedAlternates);
  });

  it("lists the index and utility pages, and nothing else, in the pages segment", () => {
    expect(pages.find((e) => e.url === `${siteUrl}/projekte`)).toMatchObject({
      priority: 0.9,
      changeFrequency: "monthly",
    });
    expect(pages.find((e) => e.url === `${siteUrl}/jetzt`)).toMatchObject({
      priority: 0.6,
      changeFrequency: "monthly",
    });
    expect(pages.find((e) => e.url === `${siteUrl}/blog`)).toMatchObject({
      priority: 0.7,
      changeFrequency: "weekly",
    });
    expect(pages.find((e) => e.url === `${siteUrl}/uses`)).toMatchObject({
      priority: 0.5,
      changeFrequency: "monthly",
    });
    // Home + /en + projects index + /en/projects + /jetzt + /en/now + blog index
    // + /en/blog + /uses + /en/uses. English so far is the onepager, the projects
    // index, /uses, /now and the blog index (translatedRoutes).
    expect(pages).toHaveLength(10);
  });

  it("lists the English projects index with absolute hreflang alternates (S5-1a)", () => {
    const de = pages.find((e) => e.url === `${siteUrl}/projekte`);
    const en = pages.find((e) => e.url === `${siteUrl}/en/projects`);
    expect(en).toMatchObject({ priority: 0.8, changeFrequency: "monthly" });

    // Both index entries advertise the same absolute hreflang set, mirroring the
    // onepager pair; German stays the x-default.
    const expectedAlternates = {
      "de-DE": `${siteUrl}/projekte`,
      en: `${siteUrl}/en/projects`,
      "x-default": `${siteUrl}/projekte`,
    };
    expect(de?.alternates?.languages).toEqual(expectedAlternates);
    expect(en?.alternates?.languages).toEqual(expectedAlternates);
  });

  it("lists the English /uses inventory with absolute hreflang alternates (S5-1c)", () => {
    const de = pages.find((e) => e.url === `${siteUrl}/uses`);
    const en = pages.find((e) => e.url === `${siteUrl}/en/uses`);
    expect(en).toMatchObject({ priority: 0.4, changeFrequency: "monthly" });

    // Both /uses entries advertise the same absolute hreflang set, mirroring the
    // onepager pair; German stays the x-default.
    const expectedAlternates = {
      "de-DE": `${siteUrl}/uses`,
      en: `${siteUrl}/en/uses`,
      "x-default": `${siteUrl}/uses`,
    };
    expect(de?.alternates?.languages).toEqual(expectedAlternates);
    expect(en?.alternates?.languages).toEqual(expectedAlternates);
  });

  it("lists the English /now snapshot with absolute hreflang alternates (S5-1d)", () => {
    const de = pages.find((e) => e.url === `${siteUrl}/jetzt`);
    const en = pages.find((e) => e.url === `${siteUrl}/en/now`);
    expect(en).toMatchObject({ priority: 0.5, changeFrequency: "monthly" });

    // Both /now entries advertise the same absolute hreflang set, mirroring the
    // onepager pair; German stays the x-default.
    const expectedAlternates = {
      "de-DE": `${siteUrl}/jetzt`,
      en: `${siteUrl}/en/now`,
      "x-default": `${siteUrl}/jetzt`,
    };
    expect(de?.alternates?.languages).toEqual(expectedAlternates);
    expect(en?.alternates?.languages).toEqual(expectedAlternates);
  });

  it("lists the English blog index with absolute hreflang alternates (S5-1f)", () => {
    const de = pages.find((e) => e.url === `${siteUrl}/blog`);
    const en = pages.find((e) => e.url === `${siteUrl}/en/blog`);
    expect(en).toMatchObject({ priority: 0.6, changeFrequency: "weekly" });

    // Both blog-index entries advertise the same absolute hreflang set, mirroring
    // the onepager pair; German stays the x-default.
    const expectedAlternates = {
      "de-DE": `${siteUrl}/blog`,
      en: `${siteUrl}/en/blog`,
      "x-default": `${siteUrl}/blog`,
    };
    expect(de?.alternates?.languages).toEqual(expectedAlternates);
    expect(en?.alternates?.languages).toEqual(expectedAlternates);
  });

  it("lists a detail entry for each warranted project in the projects segment (P3-3)", () => {
    for (const project of detailProjects) {
      const entry = projectsSegment.find((e) => e.url === `${siteUrl}/projekte/${project.slug}`);
      expect(entry).toMatchObject({ priority: 0.8, changeFrequency: "monthly" });
      expect(entry?.lastModified).toBeInstanceOf(Date);
    }
    // Each project ships a German canonical plus its English twin (S5-1b).
    expect(projectsSegment).toHaveLength(detailProjects.length * 2);
  });

  it("lists an English twin for each detail-page project with hreflang (S5-1b)", () => {
    for (const project of detailProjects) {
      const de = projectsSegment.find((e) => e.url === `${siteUrl}/projekte/${project.slug}`);
      const en = projectsSegment.find((e) => e.url === `${siteUrl}/en/projects/${project.slug}`);
      expect(en).toMatchObject({ priority: 0.7, changeFrequency: "monthly" });
      expect(en?.lastModified).toBeInstanceOf(Date);

      // Both twins advertise the same absolute hreflang set; German is x-default.
      const expectedAlternates = {
        "de-DE": `${siteUrl}/projekte/${project.slug}`,
        en: `${siteUrl}/en/projects/${project.slug}`,
        "x-default": `${siteUrl}/projekte/${project.slug}`,
      };
      expect(de?.alternates?.languages).toEqual(expectedAlternates);
      expect(en?.alternates?.languages).toEqual(expectedAlternates);
    }
  });

  it("lists one German entry per published post in the blog segment (P3-7)", () => {
    for (const post of getAllPosts()) {
      const entry = blogSegment.find((e) => e.url === `${siteUrl}/blog/${post.slug}`);
      expect(entry).toMatchObject({ priority: 0.6, changeFrequency: "yearly" });
      expect(entry?.lastModified).toBeInstanceOf(Date);
    }
    // Every German post, plus an English twin for each translated one (S5-1g).
    expect(blogSegment).toHaveLength(getAllPosts().length + translatedBlogPostSlugs.size);
  });

  it("pairs a translated post with its English twin and reciprocal hreflang (S5-1g)", () => {
    const translated = getAllPosts().filter((post) => isBlogPostTranslated(post.slug));
    expect(translated.length).toBeGreaterThan(0);

    for (const post of translated) {
      const de = blogSegment.find((e) => e.url === `${siteUrl}/blog/${post.slug}`);
      const en = blogSegment.find((e) => e.url === `${siteUrl}/en/blog/${post.slug}`);
      expect(en).toMatchObject({ priority: 0.5, changeFrequency: "yearly" });
      expect(en?.lastModified).toBeInstanceOf(Date);

      // Both twins advertise the same absolute hreflang set; German is x-default.
      const expectedAlternates = {
        "de-DE": `${siteUrl}/blog/${post.slug}`,
        en: `${siteUrl}/en/blog/${post.slug}`,
        "x-default": `${siteUrl}/blog/${post.slug}`,
      };
      expect(de?.alternates?.languages).toEqual(expectedAlternates);
      expect(en?.alternates?.languages).toEqual(expectedAlternates);
    }
  });

  it("keeps an untranslated post a lone German entry with no alternates (S5-1g)", () => {
    for (const post of getAllPosts()) {
      if (isBlogPostTranslated(post.slug)) continue;
      const de = blogSegment.find((e) => e.url === `${siteUrl}/blog/${post.slug}`);
      expect(de?.alternates).toBeUndefined();
      expect(blogSegment.some((e) => e.url === `${siteUrl}/en/blog/${post.slug}`)).toBe(false);
    }
  });

  it("keeps the noindex legal pages out of every segment", () => {
    const all = [...pages, ...projectsSegment, ...blogSegment];
    expect(all.some((e) => e.url.includes("/impressum"))).toBe(false);
    expect(all.some((e) => e.url.includes("/datenschutz"))).toBe(false);
  });

  it("exposes an absolute per-segment sitemap URL for the index", () => {
    for (const segment of SEGMENTS) {
      expect(segmentSitemapUrl(segment)).toBe(`${siteUrl}/sitemap/${segment}.xml`);
    }
  });
});

describe("robots", () => {
  it("allows all crawlers and points at the absolute sitemap", () => {
    const result = robots();

    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe(`${siteUrl}/sitemap-index.xml`);
    expect(result.host).toBe(siteUrl);
  });
});

// The Person JSON-LD is the structured-data half of the SEO contract; guard the
// schema.org-required shape and that its facts stay in sync with the visible
// copy, so a validator always gets a valid entity.
describe("personJsonLd", () => {
  // The schema is now built per locale; the German entity is the canonical base.
  const person = personJsonLd("de");

  it("is a valid schema.org Person entity", () => {
    expect(person["@context"]).toBe("https://schema.org");
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe(siteConfig.name);
    expect(person.jobTitle).toBe(getSiteMeta("de").jobTitle);
  });

  it("uses the absolute canonical URL and a serialisable payload", () => {
    expect(person.url).toBe(siteUrl);
    expect(() => new URL(person.url)).not.toThrow();
    expect(() => JSON.stringify(person)).not.toThrow();
  });

  it("nests alumniOf and address as typed schema.org objects", () => {
    expect(person.alumniOf).toEqual({
      "@type": "CollegeOrUniversity",
      name: siteConfig.person.alumniOf,
    });
    expect(person.address).toEqual({
      "@type": "PostalAddress",
      addressLocality: siteConfig.person.address.locality,
      addressCountry: siteConfig.person.address.country,
    });
  });

  it("reuses the visible contact links as sameAs profiles", () => {
    expect(person.sameAs).toEqual([
      copy.contact.channels.linkedin.href,
      copy.contact.channels.github.href,
    ]);
    for (const profile of person.sameAs) {
      expect(() => new URL(profile)).not.toThrow();
    }
  });
});

// The per-project CreativeWork and per-post Article are the S5-2 structured data.
// Drive them off the real content (fuelivo, the newest post) so the tests fail if
// the builders drift from the data model, and guard the schema.org-required shape.
describe("projectJsonLd", () => {
  const project = detailProjects[0];
  const data = projectJsonLd(project, "de");

  it("is a CreativeWork carrying the project's visible facts", () => {
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("CreativeWork");
    expect(data.name).toBe(project.name);
    expect(data.description).toBe(project.tagline);
  });

  it("uses the absolute canonical project URL and stays serialisable", () => {
    expect(data.url).toBe(`${siteUrl}${localizedPath("projectDetail", "de", project.slug)}`);
    expect(data.mainEntityOfPage).toBe(data.url);
    expect(() => JSON.stringify(data)).not.toThrow();
  });

  it("attributes authorship to the site owner", () => {
    expect(data.author).toMatchObject({ "@type": "Person", name: siteConfig.name, url: siteUrl });
  });

  it("carries the tech stack as keywords and links the live product via sameAs", () => {
    expect(data.keywords).toEqual(projectKeywords(project));
    if (project.links?.live) {
      expect(data.sameAs).toEqual([project.links.live]);
    }
  });

  it("emits an absolute image only when the project has a cover", () => {
    if (project.media?.cover) {
      expect(data.image).toBe(`${siteUrl}${project.media.cover}`);
    } else {
      expect(data.image).toBeUndefined();
    }
  });
});

describe("projectKeywords", () => {
  it("flattens the case-study tech layers into unique keywords", () => {
    const fuelivo = detailProjects.find((p) => p.slug === "fuelivo");
    const keywords = projectKeywords(fuelivo!);
    expect(keywords).toContain("FastAPI");
    // De-duplicated: no keyword appears twice even if two layers share it.
    expect(new Set(keywords).size).toBe(keywords.length);
  });
});

describe("articleJsonLd", () => {
  const post = getAllPosts()[0];
  const data = articleJsonLd(post, "de");

  it("is an Article carrying the post's title, summary and dates", () => {
    expect(data["@type"]).toBe("Article");
    expect(data.headline).toBe(post.title);
    expect(data.description).toBe(post.summary);
    expect(data.datePublished).toBe(post.date);
    expect(data.dateModified).toBe(post.date);
  });

  it("uses the absolute canonical post URL and the default share image", () => {
    expect(data.url).toBe(`${siteUrl}${localizedPath("blogPost", "de", post.slug)}`);
    expect(data.image).toEqual([`${siteUrl}${siteConfig.ogImage}`]);
    expect(() => JSON.stringify(data)).not.toThrow();
  });

  it("attributes author and publisher to the site owner and carries tags as keywords", () => {
    expect(data.author).toMatchObject({ "@type": "Person", name: siteConfig.name });
    expect(data.publisher).toMatchObject({ "@type": "Person", name: siteConfig.name });
    if (post.tags.length > 0) {
      expect(data.keywords).toEqual([...post.tags]);
    }
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers the trail 1-based and keeps every item URL absolute", () => {
    const data = breadcrumbJsonLd([
      { name: "A", url: "https://example.com/a" },
      { name: "B", url: "https://example.com/a/b" },
    ]);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0]).toMatchObject({ position: 1, name: "A" });
    expect(data.itemListElement[1]).toMatchObject({ position: 2, name: "B" });
  });

  it("builds Home -> projects index -> project for a project page", () => {
    const project = detailProjects[0];
    const trail = projectBreadcrumbJsonLd(project, "de").itemListElement;
    expect(trail.map((entry) => entry.name)).toEqual([
      getCopy("de").breadcrumb.home,
      getCopy("de").projects.index.title,
      project.name,
    ]);
    expect(trail.at(-1)?.item).toBe(
      `${siteUrl}${localizedPath("projectDetail", "de", project.slug)}`,
    );
  });

  it("builds Home -> blog index -> post for a post page", () => {
    const post = getAllPosts()[0];
    const trail = articleBreadcrumbJsonLd(post, "de").itemListElement;
    expect(trail.map((entry) => entry.name)).toEqual([
      getCopy("de").breadcrumb.home,
      getCopy("de").blog.index.title,
      post.title,
    ]);
  });
});
