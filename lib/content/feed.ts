import { copy } from "@/content/copy";
import type { BlogPostMeta } from "@/lib/content/blog";
import { siteConfig, siteUrl } from "@/lib/seo/site";

/**
 * Build the blog's RSS 2.0 feed as an XML string from the published post list
 * (S5-4). Pure and filesystem-free: the caller passes the posts - always
 * getAllPosts(), which already drops drafts - so the builder stays unit testable
 * and the route stays a thin Response wrapper.
 *
 * The feed reads from the same registry as the /blog index and the sitemap, so
 * the three never drift. It validates as RSS 2.0 (W3C Feed Validator): every item
 * carries a title, link, permalink guid, pubDate and description; tags map to
 * <category> elements; author attribution uses Dublin Core <dc:creator> so no
 * email address is exposed. lastBuildDate is derived from the newest post rather
 * than the wall clock, so an unchanged rebuild emits a byte-identical feed.
 */

const RSS_DOCS = "https://www.rssboard.org/rss-specification";
// Advisory cache window for aggregators, in minutes.
const FEED_TTL_MINUTES = 60;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Post dates are ISO YYYY-MM-DD; anchor at UTC midnight for a stable RFC 822 pubDate. */
function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

function renderItem(post: BlogPostMeta): string {
  const url = `${siteUrl}/blog/${post.slug}`;
  const categories = post.tags
    .map((tag) => `      <category>${escapeXml(tag)}</category>`)
    .join("\n");

  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <dc:creator>${escapeXml(siteConfig.name)}</dc:creator>
      <description>${escapeXml(post.summary)}</description>${categories ? `\n${categories}` : ""}
    </item>`;
}

export function buildBlogFeedXml(posts: readonly BlogPostMeta[]): string {
  const feedUrl = `${siteUrl}/blog/feed.xml`;
  const blogUrl = `${siteUrl}/blog`;

  // Newest post date drives lastBuildDate; computed independently of input order.
  // Falls back to the current time only in the (transient) zero-post state, which
  // never ships.
  const newestDate = posts.reduce<string | null>(
    (max, post) => (max === null || post.date > max ? post.date : max),
    null,
  );
  const lastBuildDate = newestDate ? toRfc822(newestDate) : new Date().toUTCString();

  const items = posts.map(renderItem).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${copy.blog.index.title} - ${siteConfig.name}`)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(copy.blog.index.intro)}</description>
    <language>de-DE</language>
    <generator>Next.js</generator>
    <docs>${RSS_DOCS}</docs>
    <ttl>${FEED_TTL_MINUTES}</ttl>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
