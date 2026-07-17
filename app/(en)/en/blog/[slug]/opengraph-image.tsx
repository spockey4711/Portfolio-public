/**
 * The branded per-post Open Graph card for the English blog posts (S5-1g), twin of
 * app/(de)/blog/[slug]/opengraph-image.tsx: one statically generated PNG per
 * translated post, in English. It mirrors the page's generateStaticParams /
 * dynamicParams so the image set matches the translated-post set exactly. The shared
 * template lives in @/lib/og/card; this file only maps a post to its English props.
 * The twitter card re-exports this module (./twitter-image).
 */

import { getPost, getPostsForLocale } from "@/lib/content/blog";
import { CARD_CONTENT_TYPE, CARD_SIZE, renderCard } from "@/lib/og/card";

const locale = "en";

export const dynamicParams = false;
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;
export const alt = "Article - Yannik Wünker";

export function generateStaticParams() {
  return getPostsForLocale(locale).map((post) => ({ slug: post.slug }));
}

// English long date. The frontmatter date is a UTC-midnight ISO string, so format
// in UTC to avoid a local-timezone off-by-one at the day boundary.
const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function PostOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug, locale);

  // Unreachable while dynamicParams=false, but keeps the render total and falls
  // back to the site identity rather than throwing if that ever changes.
  if (!post) {
    return renderCard({
      kicker: "Blog",
      title: "Yannik Wünker",
      subtitle: "Notes on development, data and digital products.",
      footerRight: "Cologne",
    });
  }

  const date = dateFormatter.format(new Date(post.date));

  return renderCard({
    kicker: "Article",
    title: post.title,
    subtitle: post.summary,
    footerRight: `${date} · ${post.readingTimeMinutes} min read`,
    badge: post.tags[0],
  });
}
