import { SEGMENTS, segmentSitemapUrl } from "@/app/sitemap";

/**
 * The sitemap index (S5-2). Next's `generateSitemaps` splits the sitemap into one
 * file per content type at `/sitemap/<id>.xml` but does not emit an index that
 * ties them together, so this route does: a `<sitemapindex>` listing every
 * segment, which `robots.txt` points crawlers at. Built statically from the same
 * `SEGMENTS` the split uses, so the index can never list a file that does not
 * exist or miss one that does.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const lastmod = new Date().toISOString();

  const entries = SEGMENTS.map(
    (segment) =>
      `  <sitemap>\n    <loc>${segmentSitemapUrl(segment)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
  ).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
}
