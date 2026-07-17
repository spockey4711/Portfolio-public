# SEO and metadata

**Purpose:** the SEO/metadata contract - what tags ship, what signals matter, and how
they map to Next's metadata API. Consolidates the earlier SEO and deployment discovery
notes (deployment detail now lives in
[operations/deployment.md](../operations/deployment.md)).

Related: [content & voice](content-and-voice.md) ·
[rendering & data](../architecture/rendering-and-data.md) ·
[deployment](../operations/deployment.md)

## Goals

The site must work for personal search, applications and project context. It should be
found and understood for: the name, Wirtschaftsinformatik, IT/data/digital products,
backend/web development, his own projects, and fuelivo.

MVP language: **German**. The structure should allow English content later, but
multi-language is out of MVP scope.

## Required metadata (MVP)

Implemented via Next's `metadata` in `app/layout.tsx` (and per-page where needed):

- `title`
- `meta description`
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type=website`,
  `og:locale=de_DE`
- Twitter card (`summary_large_image`) mirroring OG
- `canonical` URL
- `robots` (index, follow for public pages; `noindex` for anything not meant to rank)
- `theme-color` (use `--bg` / `--pine` sensibly)
- `lang="de"` on `<html>`

Example direction (refine toward the voice, plain, no hype):

- **Title:** `Yannik Wünker - Wirtschaftsinformatik, digitale Produkte & Webentwicklung`
- **Description:** `Portfolio mit Projekten rund um IT, Daten, Backend/Webentwicklung und
  digitale Produktentwicklung.`

## Open Graph image

- **Default card.** One default OG image at `public/og/default.png`, 1200×630. On-brand: Sand
  & Pine palette, the name in the display serif, the one-line positioning and mono accents. It
  is a real generated asset, not a placeholder: `scripts/generate-assets.mjs`
  (`pnpm assets:generate`) renders it from a committed HTML template through Playwright's
  Chromium, using the site's own tokens and fonts, so regenerating is reproducible. Referenced
  everywhere via `siteConfig.ogImage`, and it stays the fallback for every route without a
  card of its own (home, legal, the index pages).

- **Dynamic per-project and per-post cards (S5-3).** Each project detail (`/projekte/<slug>`)
  and blog post (`/blog/<slug>`) renders its own branded 1200×630 card server-side with
  `next/og` (Satori), via the metadata file convention (`opengraph-image.tsx` +
  `twitter-image.tsx` in each dynamic segment; the twitter card re-exports the OG one, same
  size). The shared template lives in `lib/og/card.tsx` and deliberately mirrors the default
  image (spine, palette, serif title, mono kicker/footer) so a generated card and the default
  read as one family; the pure sizing/truncation helpers sit in `lib/og/layout.ts` and are
  unit tested. Satori is not a browser (flexbox-only, no masked texture) and needs raw font
  buffers, so the three typefaces are committed as TTFs under `lib/og/fonts/` and read once at
  build time. Both routes are statically generated (`generateStaticParams` +
  `dynamicParams = false`), so the cards render at build and Next serves them with immutable
  cache headers - the reads never run on a request. The detail routes leave `openGraph.images`
  unset so the file convention drives `og:image` (a value in `generateMetadata` would take
  precedence over the generated card). Regenerate the palette/type reference from
  `app/globals.css` if the tokens change (kept in sync with `scripts/generate-assets.mjs`).
  S5-3 shipped these German-only; the English blog posts got theirs with S5-1g, and the English
  project detail route (`/en/projects/<slug>`) reached parity in **S5-5** - the same template,
  keyed off the English project content and an `en/projects/<slug>` footer.

## Structured data (JSON-LD)

Implemented (P1-14): a `Person` schema built in `lib/seo/structured-data.ts` and
injected once by the root layout via `components/seo/JsonLd.tsx` (a single
`application/ld+json` script, `<` escaped so no value can break out of the tag):

- `name`, `url` (https://yannikwuenker.de), `jobTitle`
  (Wirtschaftsinformatik-Student), `alumniOf` (Universität zu Köln), `sameAs`
  (LinkedIn, GitHub), `address` (Köln, DE).

The static facts live with the rest of the metadata contract in
`lib/seo/site.ts` (`siteConfig.person`); the `sameAs` profile URLs are reused
from the contact copy (`content/copy.ts`) so they never drift from the visible
links. Kept truthful and minimal - only facts already shown on the page. A
`WebSite` schema stays optional and unshipped until it earns its place.

Deepened (S5-2): the same `lib/seo/structured-data.ts` also builds per-route
entities, injected by the detail routes via the same `JsonLd` component:

- **`CreativeWork`** per project (`projectJsonLd`) - name, tagline, the tech stack
  as `keywords`, the site owner as `author`/`creator`, the live URL as `sameAs`.
- **`Article`** per blog post (`articleJsonLd`) - headline, summary, `datePublished`
  /`dateModified` (a post is not edited after publishing), tags as `keywords`,
  the owner as `author`/`publisher`.
- **`BreadcrumbList`** on both (`projectBreadcrumbJsonLd` / `articleBreadcrumbJsonLd`)
  - Home -> section index -> the page. The root label is the only new copy
  (`breadcrumb.home`); the deeper nodes reuse the section titles and the page name.

Every URL resolves through `absoluteUrl` (`lib/seo/site.ts`), the one place
`siteUrl` is joined with a path, so the JSON-LD, the metadata and the sitemap can
never disagree on the base. Detail-route metadata is sharpened to match: per-route
`keywords` from the stack/tags, an `author`, and OG `article` `modifiedTime`
/`authors` on posts.

All of the above is locale-parametrized, so the English detail routes emit the same
entities as their German twins. **S5-5** closed the last gap: the English project detail
page (`/en/projects/<slug>`) now injects `projectJsonLd` + `projectBreadcrumbJsonLd` (in
English) and carries the per-route `keywords`/`author`, at parity with the German page.

## Technical SEO

- `app/sitemap.ts` and `app/robots.ts` generated at build. The sitemap is
  **segmented by content type** (S5-2): `generateSitemaps` emits one file per
  `SEGMENT` at `/sitemap/pages.xml`, `/sitemap/projects.xml` and
  `/sitemap/blog.xml`, each carrying its own crawl frequency and priorities. Next
  emits the segments but no index, so `app/sitemap-index.xml/route.ts` renders a
  `<sitemapindex>` over the same `SEGMENTS`, and `robots.txt` points crawlers at
  that index (not a single `/sitemap.xml`). Adding a segment is a one-line change
  to `SEGMENTS`; the index and the split stay in sync because both read it.
- **Deliberate internal linking** (S5-2): each project detail page links to its
  sibling detail pages (`RelatedProjects`) and each post links to the other posts
  (`RelatedPosts`), so no detail page is a crawl dead end. Both footers render
  nothing when there is nothing to point at.
- Semantic headings (one `<h1>`, `<h2>` per section) - see
  [accessibility](../design/accessibility.md).
- Fast, static delivery (see [rendering & data](../architecture/rendering-and-data.md))
  - Core Web Vitals feed SEO; hit the performance budget in
  [quality & testing](../engineering/quality-and-testing.md).
- Canonical host decision: pick `https://yannikwuenker.de` (with or without `www`) and
  301 the other at the Nginx layer (see [deployment](../operations/deployment.md)).

## What recruiters / technical viewers must find

For recruiters (reflected in content + metadata):
- Role and current context immediately visible.
- Studies and experience easy to find.
- Projects with concrete results and tech stack.
- Contact without searching.
- Optional CV download.

For technical viewers:
- GitHub link.
- Project decisions.
- Tech stack.
- Explainable logic in fuelivo.
- No overblown self-promotion without evidence.
