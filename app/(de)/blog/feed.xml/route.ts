import { getAllPosts } from "@/lib/content/blog";
import { buildBlogFeedXml } from "@/lib/content/feed";

// The blog RSS feed (P3-7, hardened in S5-4). Statically generated at build from
// the same post registry that backs the index and sitemap, so the three never
// drift. Served at /blog/feed.xml; discoverable via the <link rel="alternate"> on
// the blog index and the "RSS abonnieren" affordance there. force-static: the feed
// only depends on build-time content, so it is emitted as a static file rather
// than server-rendered per request. The XML is built by the pure buildBlogFeedXml
// (lib/content/feed.ts), keeping this route a thin Response wrapper.
export const dynamic = "force-static";

export function GET(): Response {
  const xml = buildBlogFeedXml(getAllPosts());

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
