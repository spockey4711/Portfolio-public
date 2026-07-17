import { siteUrl } from "@/lib/seo/site";

import type { MetadataRoute } from "next";

// Allow all crawlers on every public route and point them at the segmented
// sitemap index (S5-2), which in turn lists the per-content-type sitemap files.
// Pages that must not rank set their own `noindex` via per-page metadata.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap-index.xml`,
    host: siteUrl,
  };
}
