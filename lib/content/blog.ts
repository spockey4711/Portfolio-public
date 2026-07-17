import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import matter from "gray-matter";

import type { Locale } from "@/lib/i18n/locale";
import { translatedBlogPostSlugs } from "@/lib/i18n/routes";

/**
 * The blog content registry (P3-7). Posts are authored as `content/blog/*.mdx`
 * with a YAML frontmatter block; this module is the single, typed source of
 * truth that the /blog index, the /blog/[slug] pages, the RSS feed and the
 * sitemap all read from, so metadata never drifts between them (mirrors the
 * content/projects barrel).
 *
 * It runs at build time only: every consumer is statically generated, so the
 * filesystem reads below never execute on a request. Frontmatter is validated
 * eagerly and a bad post fails the build loudly rather than shipping broken -
 * the slug is derived from the filename, so it can never disagree with the URL.
 */

const BLOG_DIR = join(process.cwd(), "content", "blog");
// English translations live as parallel files under content/blog/en/<slug>.mdx (S5-1g).
// The German posts sit in BLOG_DIR itself; this subfolder holds only their opt-in EN
// twins, so getAllPosts() ignores it (readdirSync yields the "en" directory name, which
// does not end in .mdx and is filtered out).
const EN_BLOG_DIR = join(BLOG_DIR, "en");
const WORDS_PER_MINUTE = 200;

export interface BlogPostMeta {
  /** URL-safe id, taken from the filename (e.g. "warum-dieses-portfolio"). */
  slug: string;
  /** Display title (frontmatter `title`). */
  title: string;
  /** Publication date, ISO `YYYY-MM-DD` (frontmatter `date`). */
  date: string;
  /** One- to two-sentence teaser, German (frontmatter `summary`). */
  summary: string;
  /** Optional topic tags (frontmatter `tags`), rendered as plain labels. */
  tags: readonly string[];
  /** Estimated reading time in whole minutes, derived from the body. */
  readingTimeMinutes: number;
}

interface Frontmatter {
  title: unknown;
  date: unknown;
  summary: unknown;
  tags?: unknown;
  /** When true, the post is excluded from every published list and its route. */
  draft?: unknown;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function requireString(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Blog post ${file}: frontmatter field "${field}" must be a non-empty string.`);
  }
  return value;
}

/**
 * Normalise the frontmatter `date` to an ISO `YYYY-MM-DD` string. YAML parses an
 * unquoted `2026-07-06` into a Date (UTC midnight), so accept both that and a
 * quoted string, then validate the shape - authors should not have to remember to
 * quote the date.
 */
function requireDate(value: unknown, file: string): string {
  const iso = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) {
    throw new Error(
      `Blog post ${file}: frontmatter "date" must be ISO YYYY-MM-DD, got ${JSON.stringify(value)}.`,
    );
  }
  return iso;
}

function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * Parse and validate one post from its raw file source. Pure (no filesystem), so
 * the validation and derived fields (slug, reading time, draft flag) are unit
 * testable with inline fixtures. Throws on malformed frontmatter so a bad post
 * fails the build rather than shipping broken.
 */
export function parsePostSource(file: string, raw: string): { meta: BlogPostMeta; draft: boolean } {
  const { data, content } = matter(raw);
  const front = data as Frontmatter;

  const slug = file.replace(/\.mdx$/, "");
  const date = requireDate(front.date, file);

  const tags = Array.isArray(front.tags)
    ? front.tags.map((tag) => requireString(tag, "tags[]", file))
    : [];

  return {
    meta: {
      slug,
      title: requireString(front.title, "title", file),
      date,
      summary: requireString(front.summary, "summary", file),
      tags,
      readingTimeMinutes: readingTimeMinutes(content),
    },
    draft: front.draft === true,
  };
}

/**
 * Parse every published `.mdx` post in a directory, newest first. Drafts
 * (`draft: true`) are omitted; ties on date fall back to the slug for a stable,
 * deterministic order. Shared by the German registry and its English twin so both
 * locales apply the exact same parsing and ordering rules.
 */
function postsInDir(dir: string): BlogPostMeta[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => parsePostSource(file, readFileSync(join(dir, file), "utf8")))
    .filter((post) => !post.draft)
    .map((post) => post.meta)
    .sort((a, b) =>
      a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date),
    );
}

/**
 * All published German posts, newest first, so the same list backs the index, the
 * sitemap and the feed. German is the canonical authoring language (P3-7).
 */
export function getAllPosts(): BlogPostMeta[] {
  return postsInDir(BLOG_DIR);
}

/**
 * The published English posts, newest first (S5-1g). Blog posts are translated
 * opt-in per post, so this reads only the parallel content/blog/en/<slug>.mdx
 * files. It cross-checks that set against `translatedBlogPostSlugs` (the client-safe
 * gate the toggle, metadata and sitemap read) and fails the build loudly on any
 * drift, so an advertised translation can never lack its file and a stray file can
 * never ship unadvertised. Its own frontmatter (title, summary, tags, reading time)
 * carries the English metadata, independent of the German original.
 */
export function getEnglishPosts(): BlogPostMeta[] {
  const posts = postsInDir(EN_BLOG_DIR);
  const files = new Set(posts.map((post) => post.slug));

  const missingFile = [...translatedBlogPostSlugs].filter((slug) => !files.has(slug));
  const unadvertised = [...files].filter((slug) => !translatedBlogPostSlugs.has(slug));
  if (missingFile.length > 0 || unadvertised.length > 0) {
    throw new Error(
      "English blog translations are out of sync with translatedBlogPostSlugs. " +
        `Advertised without a content/blog/en/*.mdx file: [${missingFile.join(", ")}]. ` +
        `Files present but not advertised in translatedBlogPostSlugs: [${unadvertised.join(", ")}].`,
    );
  }

  return posts;
}

/**
 * A single published post's metadata for a locale, or undefined if unknown, a draft
 * or (for English) not translated. German is the canonical set; English resolves
 * against the opt-in EN translations only.
 */
export function getPost(slug: string, locale: Locale = "de"): BlogPostMeta | undefined {
  return getPostsForLocale(locale).find((post) => post.slug === slug);
}

/**
 * The posts to list for a locale (S5-1f/S5-1g). German lists every post; English
 * lists only the posts that carry an English translation, so /en/blog never frames
 * German prose in English chrome and renders its graceful empty state until at least
 * one translation ships. Kept as the single seam so the listing policy lives in one
 * documented place instead of being inferred at each call site.
 */
export function getPostsForLocale(locale: Locale): BlogPostMeta[] {
  return locale === "de" ? getAllPosts() : getEnglishPosts();
}
