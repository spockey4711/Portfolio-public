import Link from "next/link";

import { PostCard } from "@/components/sections/blog/PostCard";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import { getPostsForLocale } from "@/lib/content/blog";
import type { Locale } from "@/lib/i18n/locale";

/**
 * The blog index body (IA level 2, ADR-0005), shared by both locales: the full
 * list of posts reached from the footer, or the empty state when none are
 * published. German is canonical; the English twin (S5-1f) lists only posts that
 * carry an English translation (S5-1g), rendering the empty state until at least one
 * ships. See getPostsForLocale for the listing policy; the PostCards follow the
 * index's own locale, so the English list links into /en/blog rather than framing
 * German prose in English chrome.
 */
export function BlogIndex({ locale }: { locale: Locale }) {
  const { index } = getCopy(locale).blog;
  const posts = getPostsForLocale(locale);

  return (
    <main className="mx-auto w-full max-w-(--container-max) px-6 pt-32 pb-28 sm:px-10 lg:pr-14 lg:pl-26">
      <Link
        href={index.backToOnepager.href}
        className="font-mono text-xs tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
      >
        {index.backToOnepager.label}
      </Link>

      <header className="mt-10 flex flex-col gap-4">
        <MonoLabel tone="pine" className="tracking-[2px]">
          {index.eyebrow}
        </MonoLabel>
        <h1 className="font-display text-[clamp(2rem,5vw,2.875rem)] leading-[1.08] tracking-[-0.01em] text-ink">
          {index.title}
        </h1>
        <p className="max-w-[60ch] font-sans text-lg leading-relaxed text-ink-soft">
          {index.intro}
        </p>
        {/* Cookieless notify path (S5-4): a plain anchor to the static RSS route
            handler, not a next/link (feed.xml returns XML, not a page). */}
        <a
          href={index.subscribe.href}
          className="inline-flex w-fit items-center gap-2 font-mono text-xs tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
        >
          {index.subscribe.label}
        </a>
      </header>

      {posts.length > 0 ? (
        <ul className="mt-14 grid list-none gap-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} locale={locale} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-14 max-w-[60ch] font-sans leading-relaxed text-ink-soft">{index.empty}</p>
      )}
    </main>
  );
}
