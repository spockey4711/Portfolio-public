/**
 * The branded per-post Open Graph card (S5-3). One statically generated PNG per
 * published post, mirroring the page's generateStaticParams / dynamicParams so the
 * image set matches the post set exactly. The shared template lives in
 * @/lib/og/card; this file only maps a post to its props. The twitter card
 * re-exports this module (./twitter-image). See docs/content/seo.md.
 */

import { getAllPosts, getPost } from "@/lib/content/blog";
import { CARD_CONTENT_TYPE, CARD_SIZE, renderCard } from "@/lib/og/card";

export const dynamicParams = false;
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;
export const alt = "Artikel - Yannik Wünker";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

// German long date. The frontmatter date is a UTC-midnight ISO string, so format
// in UTC to avoid a local-timezone off-by-one at the day boundary.
const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function PostOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  // Unreachable while dynamicParams=false, but keeps the render total and falls
  // back to the site identity rather than throwing if that ever changes.
  if (!post) {
    return renderCard({
      kicker: "Blog",
      title: "Yannik Wünker",
      subtitle: "Notizen zu Entwicklung, Daten und digitalen Produkten.",
      footerRight: "Köln",
    });
  }

  const date = dateFormatter.format(new Date(post.date));

  return renderCard({
    kicker: "Artikel",
    title: post.title,
    subtitle: post.summary,
    footerRight: `${date} · ${post.readingTimeMinutes} Min. Lesezeit`,
    badge: post.tags[0],
  });
}
