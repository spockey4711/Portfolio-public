import { describe, expect, it } from "vitest";

import { formatPostDate } from "@/components/sections/blog/formatPostDate";
import {
  getEnglishPosts,
  getAllPosts,
  getPost,
  getPostsForLocale,
  parsePostSource,
} from "@/lib/content/blog";
import { translatedBlogPostSlugs } from "@/lib/i18n/routes";

// The blog registry is the single source of truth for post metadata (P3-7). The
// parser is validated with inline fixtures; getAllPosts/getPost run against the
// real content/blog files so the shipped posts are exercised too.
describe("parsePostSource", () => {
  const valid = `---
title: "Ein Titel"
date: 2026-07-06
summary: "Eine Zusammenfassung."
tags: ["Meta"]
---

Ein Satz mit fünf Wörtern hier.
`;

  it("derives the slug from the filename, not the frontmatter", () => {
    const { meta } = parsePostSource("mein-post.mdx", valid);
    expect(meta.slug).toBe("mein-post");
  });

  it("accepts an unquoted YAML date and normalises it to ISO", () => {
    const { meta } = parsePostSource("p.mdx", valid);
    expect(meta.date).toBe("2026-07-06");
  });

  it("accepts a quoted date string as well", () => {
    const { meta } = parsePostSource(
      "p.mdx",
      valid.replace("date: 2026-07-06", 'date: "2026-07-06"'),
    );
    expect(meta.date).toBe("2026-07-06");
  });

  it("defaults tags to an empty array when absent", () => {
    const withoutTags = `---
title: "T"
date: 2026-07-06
summary: "S"
---

Text.
`;
    expect(parsePostSource("p.mdx", withoutTags).meta.tags).toEqual([]);
  });

  it("estimates at least one minute of reading time", () => {
    expect(parsePostSource("p.mdx", valid).meta.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it("marks a post as draft only when draft is exactly true", () => {
    const draft = `---
title: "T"
date: 2026-07-06
summary: "S"
draft: true
---

Text.
`;
    expect(parsePostSource("p.mdx", valid).draft).toBe(false);
    expect(parsePostSource("p.mdx", draft).draft).toBe(true);
  });

  it("throws on a missing required field", () => {
    const noSummary = `---
title: "T"
date: 2026-07-06
---

Text.
`;
    expect(() => parsePostSource("bad.mdx", noSummary)).toThrow(/summary/);
  });

  it("throws on a malformed date", () => {
    const badDate = valid.replace("2026-07-06", "Juli 2026");
    expect(() => parsePostSource("bad.mdx", badDate)).toThrow(/date/);
  });
});

describe("getAllPosts / getPost", () => {
  it("returns at least the first shipped post with a valid shape", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("sorts posts newest first", () => {
    const dates = getAllPosts().map((post) => post.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it("resolves a known slug and rejects an unknown one", () => {
    const [first] = getAllPosts();
    expect(getPost(first.slug)?.slug).toBe(first.slug);
    expect(getPost("does-not-exist")).toBeUndefined();
  });
});

// The English posts are opt-in per post (S5-1g): only the slugs advertised in
// translatedBlogPostSlugs get an English page, and the registry guarantees the
// advertised set and the content/blog/en/*.mdx files stay in lockstep.
describe("getEnglishPosts / getPostsForLocale", () => {
  it("lists exactly the advertised English translations", () => {
    const slugs = getEnglishPosts().map((post) => post.slug);
    expect(new Set(slugs)).toEqual(translatedBlogPostSlugs);
  });

  it("lists every post in German and only translations in English", () => {
    expect(getPostsForLocale("de")).toEqual(getAllPosts());
    expect(getPostsForLocale("en")).toEqual(getEnglishPosts());
  });

  it("resolves a post per locale and only the translated slug in English", () => {
    const [translated] = getEnglishPosts();
    expect(getPost(translated.slug, "en")?.slug).toBe(translated.slug);
    expect(getPost("does-not-exist", "en")).toBeUndefined();
  });

  it("serves distinct English metadata, not the German text", () => {
    const [translated] = getEnglishPosts();
    const german = getPost(translated.slug, "de");
    expect(german).toBeDefined();
    expect(translated.title).not.toBe(german?.title);
  });
});

describe("formatPostDate", () => {
  it("formats an ISO date as a German long date, stable across timezones", () => {
    expect(formatPostDate("2026-07-06", "de")).toBe("6. Juli 2026");
  });

  it("formats an ISO date as an English long date", () => {
    expect(formatPostDate("2026-07-06", "en")).toBe("July 6, 2026");
  });
});
