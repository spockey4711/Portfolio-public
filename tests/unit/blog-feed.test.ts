import { describe, expect, it } from "vitest";

import { GET } from "@/app/(de)/blog/feed.xml/route";
import { getAllPosts } from "@/lib/content/blog";
import type { BlogPostMeta } from "@/lib/content/blog";
import { buildBlogFeedXml } from "@/lib/content/feed";

// The RSS feed is hardened in S5-4: the pure builder is exercised with fixtures so
// the XML shape and escaping are locked, and the route is exercised against the
// real registry so the feed and the published post list can never drift.
const fixtures: BlogPostMeta[] = [
  {
    slug: "newer",
    title: 'Newer & <bolder> "quoted"',
    date: "2026-07-06",
    summary: "A teaser with <markup> & an ampersand.",
    tags: ["Meta", "TypeScript"],
    readingTimeMinutes: 3,
  },
  {
    slug: "older",
    title: "Older",
    date: "2026-01-01",
    summary: "Older teaser.",
    tags: [],
    readingTimeMinutes: 1,
  },
];

describe("buildBlogFeedXml", () => {
  it("declares an RSS 2.0 document with the atom and Dublin Core namespaces", () => {
    const xml = buildBlogFeedXml(fixtures);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
  });

  it("advertises itself with a self-referential atom:link", () => {
    expect(buildBlogFeedXml(fixtures)).toContain(
      '<atom:link href="https://yannikwuenker.de/blog/feed.xml" rel="self" type="application/rss+xml" />',
    );
  });

  it("renders one item per post with a permalink guid and an RFC 822 pubDate", () => {
    const xml = buildBlogFeedXml(fixtures);
    expect(xml.match(/<item>/g)).toHaveLength(fixtures.length);
    expect(xml).toContain('<guid isPermaLink="true">https://yannikwuenker.de/blog/newer</guid>');
    expect(xml).toContain("<pubDate>Mon, 06 Jul 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<dc:creator>Yannik Wünker</dc:creator>");
  });

  it("maps tags to category elements and omits them when a post has none", () => {
    const xml = buildBlogFeedXml(fixtures);
    expect(xml).toContain("<category>Meta</category>");
    expect(xml).toContain("<category>TypeScript</category>");
    // The tagless "older" item must not carry an empty category element.
    const olderItem = xml.slice(xml.indexOf("<link>https://yannikwuenker.de/blog/older</link>"));
    expect(olderItem).not.toContain("<category>");
  });

  it("escapes XML metacharacters in titles and summaries", () => {
    const xml = buildBlogFeedXml(fixtures);
    expect(xml).toContain("Newer &amp; &lt;bolder&gt; &quot;quoted&quot;");
    expect(xml).toContain("A teaser with &lt;markup&gt; &amp; an ampersand.");
    // No raw metacharacter leaks into a text node.
    expect(xml).not.toContain("<bolder>");
  });

  it("derives lastBuildDate from the newest post regardless of input order", () => {
    const forward = buildBlogFeedXml(fixtures);
    const reversed = buildBlogFeedXml([fixtures[1], fixtures[0]]);
    const newest = "<lastBuildDate>Mon, 06 Jul 2026 00:00:00 GMT</lastBuildDate>";
    expect(forward).toContain(newest);
    expect(reversed).toContain(newest);
  });

  it("is deterministic: identical input yields byte-identical output (no wall clock)", () => {
    expect(buildBlogFeedXml(fixtures)).toBe(buildBlogFeedXml(fixtures));
  });
});

describe("GET /blog/feed.xml", () => {
  it("serves RSS with the correct content type", async () => {
    const response = GET();
    expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");
    const body = await response.text();
    expect(body).toContain('<rss version="2.0"');
  });

  it("includes exactly the published posts (drafts are already filtered out)", async () => {
    const posts = getAllPosts();
    const body = await GET().text();

    expect(body.match(/<item>/g) ?? []).toHaveLength(posts.length);
    for (const post of posts) {
      expect(body).toContain(`https://yannikwuenker.de/blog/${post.slug}`);
    }
  });
});
