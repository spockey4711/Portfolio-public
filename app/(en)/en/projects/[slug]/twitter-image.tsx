/**
 * The per-project Twitter card for the English detail pages. Twitter uses
 * summary_large_image at the same 1200x630 size as Open Graph, so it re-exports the
 * OG image module rather than duplicating the template - only the alt text is
 * card-specific. See ./opengraph-image and @/lib/og/card.
 */

export { default, size, contentType, generateStaticParams } from "./opengraph-image";

export const alt = "Project - Yannik Wünker";
