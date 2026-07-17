# Blog

**Purpose:** how to write a blog post and how the `/blog` pipeline turns it into
pages. Posts are MDX files under `content/blog/` - one post per file (e.g.
`content/blog/warum-dieses-portfolio.mdx`). The blog is IA level 2/3 per
[ADR-0005](../../private-docs/docs/architecture/decisions/0005-information-architecture.md): reached
from the footer (a page-level link), never the scroll-only primary nav.

Related: [content & voice](content-and-voice.md) · [seo](seo.md)

## Authoring a post

Create a file `content/blog/<slug>.mdx`. The filename is the slug and the URL
(`/blog/<slug>`), so keep it url-safe: lowercase, no umlaut, hyphens. Start with a
YAML frontmatter block, then write the body in Markdown/MDX:

```mdx
---
title: "Warum dieses Portfolio kein Baukasten ist"
date: 2026-07-06
summary: "Ein Satz oder zwei als Teaser - erscheint in der Übersicht, im <meta description> und im RSS-Feed."
tags: ["Meta", "Engineering"]
---

Der Fließtext beginnt hier. `##` wird zu einer Zwischenüberschrift, Listen,
`code`, Zitate und Links funktionieren wie in Markdown.
```

### Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Display title and `<title>`; also the RSS item title. |
| `date` | yes | ISO `YYYY-MM-DD`. Quoted or unquoted both work (unquoted YAML dates are normalised). Drives sort order (newest first) and the sitemap `lastModified`. |
| `summary` | yes | One to two sentences, German. The teaser, meta description and RSS description. |
| `tags` | no | Array of plain labels shown on the card. Orientation only - no filtering yet. |
| `draft` | no | `draft: true` hides the post from the index, sitemap, feed and its own route (a static 404). Omit or `false` to publish. |

A missing or malformed required field **fails the build** loudly rather than
shipping a broken post. Reading time is derived from the body (~200 words/minute),
not authored.

Voice and language follow [content & voice](content-and-voice.md): German
(`de-DE`), first person, plain, concrete. No emojis, regular hyphen only.

## Pipeline

`lib/content/blog.ts` is the single source of truth. It reads and validates every
`content/blog/*.mdx` at build time (`getAllPosts`, `getPost`) and returns typed
`BlogPostMeta`. Because every consumer is statically generated, those filesystem
reads run only at build, never on a request.

- `app/blog/page.tsx` - the index (level 2): the full list of published posts.
- `app/blog/[slug]/page.tsx` - a post (level 3): `dynamicParams = false`, so only
  published slugs are pre-rendered and any other `/blog/*` is a static 404. It
  reads the metadata from the registry and imports the MDX file for the body.
- `app/blog/feed.xml/route.ts` - a static RSS 2.0 feed, advertised via
  `<link rel="alternate">` on the index and a visible "RSS abonnieren" link in the
  index header (the cookieless notify path, S5-4). The XML is built by the pure
  `buildBlogFeedXml` (`lib/content/feed.ts`): every item carries a permalink guid,
  RFC 822 `pubDate`, `<dc:creator>` (name only, no email) and a `<category>` per
  tag; `lastBuildDate` is derived from the newest post, so an unchanged rebuild
  emits a byte-identical feed. It validates as RSS 2.0.
- `components/sections/blog/SharePost.tsx` - the share affordances at the foot of a
  post (S5-4): a progressively enhanced Web Share button (shown only where the
  browser supports `navigator.share`) plus a copy-link fallback. Both are
  cookieless and free of third-party scripts.
- `app/sitemap.ts` - adds `/blog` and one entry per published post.

MDX prose is styled globally by `mdx-components.tsx` (the root mapping required by
`@next/mdx`), so a post's headings, lists and links match the legal and
project-detail pages without the author touching a class. The frontmatter YAML is
stripped from the render by `remark-frontmatter` (configured in `next.config.ts`)
and read separately by the registry, so it never appears in the body.

## Adding a post: checklist

1. Add `content/blog/<slug>.mdx` with the frontmatter above and the body.
2. `pnpm dev` and open `/blog` and `/blog/<slug>` to proofread.
3. Run the quality gate (`pnpm lint && pnpm typecheck && pnpm test && pnpm build`).
4. The index, feed and sitemap pick it up automatically - nothing else to wire.
