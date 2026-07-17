import Link from "next/link";
import { notFound } from "next/navigation";

import { PostMeta } from "@/components/sections/blog/PostMeta";
import { RelatedPosts } from "@/components/sections/blog/RelatedPosts";
import { SharePost } from "@/components/sections/blog/SharePost";
import { JsonLd } from "@/components/seo/JsonLd";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import { getPost, getPostsForLocale } from "@/lib/content/blog";
import { alternatesFor, localizedPath } from "@/lib/i18n/routes";
import { siteConfig, siteUrl } from "@/lib/seo/site";
import { articleBreadcrumbJsonLd, articleJsonLd } from "@/lib/seo/structured-data";

import type { Metadata } from "next";

// The English blog post page (S5-1g), twin of app/(de)/blog/[slug]/page.tsx: the same
// article shell rendered in English, sourcing the post from its English translation
// (getPost(slug, "en")) and importing the parallel content/blog/en/<slug>.mdx body.
const locale = "en";

// Blog posts are translated opt-in per post, so - unlike the German route, which lists
// every post - only the translated slugs get an English page. dynamicParams=false makes
// every other /en/blog/* slug a static 404 rather than a runtime render, so untranslated
// posts are never reachable (and never advertised) under /en.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPostsForLocale(locale).map((post) => ({ slug: post.slug }));
}

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug, locale);

  if (!post) {
    return {};
  }

  // The EN page exists only for translated posts, so it always pairs reciprocally with
  // the German original (which stays x-default) via the shared route map.
  const alternates = alternatesFor("blogPost", locale, post.slug);

  return {
    // The layout title template appends the site name.
    title: post.title,
    description: post.summary,
    // The post's own tags as page keywords, so each post's metadata is specific.
    ...(post.tags.length > 0 ? { keywords: [...post.tags] } : {}),
    authors: [{ name: siteConfig.name, url: siteUrl }],
    alternates: { canonical: alternates.canonical, languages: alternates.languages },
    openGraph: {
      type: "article",
      url: alternates.canonical,
      title: `${post.title} - ${siteConfig.name}`,
      description: post.summary,
      publishedTime: post.date,
      // No post is edited after publishing, so modified mirrors published.
      modifiedTime: post.date,
      authors: [siteUrl],
      tags: [...post.tags],
      // og:image comes from the branded card in ./opengraph-image; leaving
      // openGraph.images unset lets that file convention drive it.
    },
  };
}

export default async function EnBlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug, locale);

  // Unreachable while dynamicParams=false, but keeps the type honest and guards
  // the page if that ever changes.
  if (!post) {
    notFound();
  }

  // The English MDX body is imported by slug from the parallel translation folder; the
  // slug comes from generateStaticParams (the same registry), so it always resolves.
  const { default: PostBody } = await import(`../../../../../content/blog/en/${slug}.mdx`);
  const { detail } = getCopy(locale).blog;

  // Other translated posts, newest first, for the "read next" footer.
  const morePosts = getPostsForLocale(locale).filter((entry) => entry.slug !== post.slug);

  return (
    <>
      {/* Article + breadcrumb structured data for this post. In the body, not
          generateMetadata, because JSON-LD ships as a script, not head meta. */}
      <JsonLd data={articleJsonLd(post, locale)} />
      <JsonLd data={articleBreadcrumbJsonLd(post, locale)} />
      <main className="mx-auto w-full max-w-[760px] px-6 pt-32 pb-28 sm:px-10">
        <Link
          href={detail.backToBlog.href}
          className="font-mono text-xs tracking-[1px] text-ink-soft uppercase transition-colors duration-200 hover:text-signal"
        >
          {detail.backToBlog.label}
        </Link>

        <header className="mt-10 flex flex-col gap-4">
          <MonoLabel tone="pine" className="tracking-[2px]">
            {detail.eyebrow}
          </MonoLabel>
          <h1 className="font-display text-[clamp(2rem,5vw,2.875rem)] leading-[1.08] tracking-[-0.01em] text-ink">
            {post.title}
          </h1>
          <PostMeta post={post} locale={locale} />
        </header>

        <article className="mt-10">
          <PostBody />
        </article>

        <footer className="mt-14 border-t border-line pt-8">
          <SharePost
            url={`${siteUrl}${localizedPath("blogPost", locale, post.slug)}`}
            title={`${post.title} - ${siteConfig.name}`}
            labels={detail.share}
          />
        </footer>

        <RelatedPosts posts={morePosts} locale={locale} />
      </main>
    </>
  );
}
