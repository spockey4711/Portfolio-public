import { formatPostDate } from "@/components/sections/blog/formatPostDate";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import type { BlogPostMeta } from "@/lib/content/blog";
import type { Locale } from "@/lib/i18n/locale";

/**
 * The mono meta line shared by the blog index cards and a post's header: the
 * publication date and the estimated reading time, with a machine-readable
 * <time dateTime>. Kept as one component so both surfaces stay consistent, and
 * locale-parameterized so the date and the reading-time suffix follow the page's
 * language (S5-1g).
 */
export function PostMeta({ post, locale }: { post: BlogPostMeta; locale: Locale }) {
  return (
    <MonoLabel tone="muted" className="flex flex-wrap items-center gap-x-3 gap-y-1 normal-case">
      <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
      <span aria-hidden>·</span>
      <span>
        {post.readingTimeMinutes} {getCopy(locale).blog.readingTimeSuffix}
      </span>
    </MonoLabel>
  );
}
