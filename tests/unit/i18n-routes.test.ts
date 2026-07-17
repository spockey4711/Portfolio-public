import { describe, expect, it } from "vitest";

import { counterpartPath, isBlogPostTranslated, translatedBlogPostSlugs } from "@/lib/i18n/routes";

// The language toggle resolves a page's counterpart in the other locale. Blog posts
// are the one per-post case (S5-1g): the toggle must never advertise an /en/blog/<slug>
// that 404s, and must never leave a reader on German content under /en.
describe("counterpartPath - blog posts", () => {
  const [translatedSlug] = [...translatedBlogPostSlugs];
  const untranslatedSlug = "definitely-not-translated";

  it("has at least one translated post and none named like the fixture", () => {
    expect(translatedSlug).toBeDefined();
    expect(isBlogPostTranslated(untranslatedSlug)).toBe(false);
  });

  it("deep-links a translated German post to its English twin", () => {
    expect(counterpartPath(`/blog/${translatedSlug}`, "de")).toBe(`/en/blog/${translatedSlug}`);
  });

  it("sends an untranslated German post to the English blog index, not a 404", () => {
    expect(counterpartPath(`/blog/${untranslatedSlug}`, "de")).toBe("/en/blog");
  });

  it("maps an English post back to its German original", () => {
    expect(counterpartPath(`/en/blog/${translatedSlug}`, "en")).toBe(`/blog/${translatedSlug}`);
    // Even a slug with no English page maps back to the German route, which always exists.
    expect(counterpartPath(`/en/blog/${untranslatedSlug}`, "en")).toBe(`/blog/${untranslatedSlug}`);
  });
});
