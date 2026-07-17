import Link from "next/link";
import { notFound } from "next/navigation";

import { PostMeta } from "@/components/sections/blog/PostMeta";
import { RelatedPosts } from "@/components/sections/blog/RelatedPosts";
import { SharePost } from "@/components/sections/blog/SharePost";
import { JsonLd } from "@/components/seo/JsonLd";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { copy } from "@/content/copy";
import { getAllPosts, getPost } from "@/lib/content/blog";
import { alternatesFor, isBlogPostTranslated } from "@/lib/i18n/routes";
import { siteConfig, siteUrl } from "@/lib/seo/site";
import { articleBreadcrumbJsonLd, articleJsonLd } from "@/lib/seo/structured-data";

import type { Metadata } from "next";

// The German (de) blog post route; its English twin lives at app/(en)/en/blog/[slug]
// and exists only for posts that carry a translation (S5-1g).
const locale = "de";

// Only published posts get a page, and only those are pre-rendered; the whole set
// is known at build time, so dynamicParams=false makes every other /blog/* slug a
// static 404 instead of a runtime render (mirrors the project detail route).
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {};
  }

  const canonical = `/blog/${post.slug}`;
  // Per-post hreflang (S5-1g): only advertise the English twin for posts that carry a
  // translation, so an untranslated post stays German-only (canonical, x-default -> DE)
  // and never points at an /en/blog/<slug> that 404s. Translated posts pair the two
  // language versions reciprocally via the shared route map.
  const alternates = isBlogPostTranslated(post.slug)
    ? {
        canonical,
        languages: alternatesFor("blogPost", locale, post.slug).languages,
      }
    : { canonical };

  return {
    // The layout title template appends the site name.
    title: post.title,
    description: post.summary,
    // The post's own tags as page keywords, so each post's metadata is specific.
    ...(post.tags.length > 0 ? { keywords: [...post.tags] } : {}),
    authors: [{ name: siteConfig.name, url: siteUrl }],
    alternates,
    openGraph: {
      type: "article",
      url: canonical,
      title: `${post.title} - ${siteConfig.name}`,
      description: post.summary,
      publishedTime: post.date,
      // No post is edited after publishing, so modified mirrors published.
      modifiedTime: post.date,
      authors: [siteUrl],
      tags: [...post.tags],
      // og:image comes from the branded card in ./opengraph-image (S5-3); leaving
      // openGraph.images unset lets that file convention drive it (a value here
      // would take precedence over the generated card).
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  // Unreachable while dynamicParams=false, but keeps the type honest and guards
  // the page if that ever changes.
  if (!post) {
    notFound();
  }

  // The MDX body is imported by slug; the enclosing context module is limited to
  // content/blog/*.mdx. The slug comes from generateStaticParams (the same
  // registry), so it always resolves to a real file.
  const { default: PostBody } = await import(`../../../../content/blog/${slug}.mdx`);
  const { detail } = copy.blog;

  // Other published posts, newest first, for the "read next" footer (S5-2).
  const morePosts = getAllPosts().filter((entry) => entry.slug !== post.slug);

  return (
    <>
      {/* Article + breadcrumb structured data for this post (S5-2). In the body,
          not generateMetadata, because JSON-LD ships as a script, not head meta. */}
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
            url={`${siteUrl}/blog/${post.slug}`}
            title={`${post.title} - ${siteConfig.name}`}
            labels={detail.share}
          />
        </footer>

        <RelatedPosts posts={morePosts} locale={locale} />
      </main>
    </>
  );
}
