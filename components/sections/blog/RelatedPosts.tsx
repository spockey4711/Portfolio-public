import { PostCard } from "@/components/sections/blog/PostCard";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import type { BlogPostMeta } from "@/lib/content/blog";
import type { Locale } from "@/lib/i18n/locale";

/**
 * The "read next" footer of a blog post (S5-2): the other published posts, reusing
 * the same PostCard as the index so the two surfaces stay consistent. Renders
 * nothing when this is the only post, so a single-post blog degrades gracefully.
 * Locale-aware so the heading and the cards follow the page's language (S5-1g).
 */
export function RelatedPosts({
  posts,
  locale,
}: {
  posts: readonly BlogPostMeta[];
  locale: Locale;
}) {
  if (posts.length === 0) {
    return null;
  }

  const { related } = getCopy(locale).blog.detail;

  return (
    <nav aria-label={related} className="mt-20 border-t border-line pt-10">
      <MonoLabel tone="pine" className="tracking-[2px]">
        {related}
      </MonoLabel>
      <ul className="mt-6 grid list-none gap-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} locale={locale} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
