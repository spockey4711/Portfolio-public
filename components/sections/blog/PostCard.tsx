import Link from "next/link";

import { PostMeta } from "@/components/sections/blog/PostMeta";
import type { BlogPostMeta } from "@/lib/content/blog";
import type { Locale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/routes";

/**
 * One entry in the blog index list. The whole card is a single link to the post,
 * showing the title, meta line and summary. Tags render as plain mono labels (no
 * filtering in this pass - they are orientation, not navigation). Locale-aware so
 * the German and English indexes link into their own locale's post route (S5-1g).
 */
export function PostCard({ post, locale }: { post: BlogPostMeta; locale: Locale }) {
  return (
    <Link
      href={localizedPath("blogPost", locale, post.slug)}
      className="group flex flex-col gap-3 rounded-card border border-line bg-surface p-6 transition-colors duration-200 hover:border-line-strong"
    >
      <PostMeta post={post} locale={locale} />

      <h2 className="font-display text-2xl leading-snug text-ink transition-colors duration-200 group-hover:text-pine">
        {post.title}
      </h2>

      <p className="max-w-[60ch] font-sans leading-relaxed text-ink-soft">{post.summary}</p>

      {post.tags.length > 0 ? (
        <ul className="mt-1 flex list-none flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-pill border border-line px-2.5 py-1 font-mono text-[0.7rem] tracking-[0.5px] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
