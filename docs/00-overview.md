# Overview

**Purpose:** the shared mental model for the project — what we are building, for whom,
and how we know it is good. Read this before anything else.

Related: [content and voice](content/content-and-voice.md) ·
[design system](design/design-system.md) · [repository README](../README.md).
A phase roadmap is not published in this checkout.

## What it is

A personal portfolio website for **Yannik Wünker** — a business informatics
(Wirtschaftsinformatik) student in Cologne with a focus on IT, data, digital products,
backend/web development, process optimization and his own projects.

It is deliberately not a static CV and not a pure project gallery. It is a quiet,
technical, high-quality developer/product portfolio that feels like a small digital
experience while scrolling, but stays serious and minimal. Animations support
orientation and storytelling; they never demand attention for their own sake.

It is planned as a **product maintained for years**, not a one-off landing page.

## Who it is for

**Primary**
- Recruiters and hiring managers (DACH region).
- Technical viewers assessing projects, code quality and how he thinks.
- Potential project partners in product, IT and data.

**Secondary**
- Network contacts from LinkedIn/GitHub, fellow students.
- Future employers for working-student roles, internships, entry-level positions.

Optimization target: **general portfolio, weighted toward working-student roles and
internships.**

## The person (facts to encode)

- Name: **Yannik Wünker** (display); slug `yannik-wuenker` (no umlaut) for URLs.
- Age is not stated in the site copy and is not recorded here.
- Studies **Wirtschaftsinformatik at the University of Cologne since October 2024**.
  Relevant themes: data analysis, process optimization, software development, product
  management, AI applications, IT strategy, digital business models — above all working
  with AI to increase efficiency.
- **Working student at the Institut der deutschen Wirtschaft since March 2025**, on a
  patent-database project: data analysis and process optimization.
- Current focus: app development, Python process optimization, data, AI-assisted
  workflows.
- Personal: does a lot of sport (hockey, running, swimming, and much in between). It is
  a real part of who he is and shows up in his technical, hands-on way of working — but
  it must not read as a manufactured story.
- Looking for: **projects and network** (plus working-student roles / internships).
- Location: **Cologne**.

## Narrative (the scroll arc)

The page follows a progression:

1. **Orientation** — who is this and what do they stand for? (Hero)
2. **Proof** — which project shows it best? (Featured: fuelivo)
3. **Breadth** — what other projects, concepts and skills exist?
4. **Way of working** — how does this person think and work?
5. **Context** — studies, experience, current focus.
6. **Contact** — what happens next?

## Success criteria

Within the first ~30 seconds a visitor should understand:

- the person studies Wirtschaftsinformatik;
- the focus is IT, data, digital products, backend/web dev, processes;
- there are **real, self-built projects**, not just interests;
- **fuelivo (Fueling Optimizer)** is the most important project and has genuine product
  and software depth;
- contact paths are trivial to find.

Quality bars (see [quality-and-testing](engineering/quality-and-testing.md)):

- Lighthouse ≥ 95 across Performance / Accessibility / Best Practices / SEO on the
  production build. The enforced run is desktop home only; see
  [quality and testing](engineering/quality-and-testing.md).
- No layout shift from live widgets (they reserve space and degrade gracefully).
- Fully usable with `prefers-reduced-motion` and by keyboard.

## Scope

**Shipped in this checkout**
- Hero masthead, featured fuelivo card, other projects with status labels.
- Skills, experience, contact.
- GitHub heatmap on the home page, with a static fallback.
- Project detail pages for the case-study entries. No project sets
  `caseStudy.screenshots` yet (`tests/unit/project-screenshots.test.ts`).
- Now, Uses, one blog post, legal pages.
- German and English routes (`lib/i18n/routes.ts`).
- SEO/OG metadata; CV link when `public/cv/yannik-wuenker.pdf` exists.
- Dark mode and a command palette.

**Written as requirements, not rendered**
- Way of working / principles: copy exists (`content/copy` `wayOfWorking`) and
  [content and voice](content/content-and-voice.md) still asks for the section. No
  component renders it. Whether to mount or delete it is an open product decision.
- Scroll spine: specified in [animation and motion](design/animation-and-motion.md).
  The current UI shows scroll progress as nav text only
  (`lib/hooks/use-scroll-progress.ts`, `components/chrome/Nav.tsx`). Building the
  spine or striking the spec is an open product decision. This overview does not
  decide it.

**Not a claim about production**
- Whether https://yannikwuenker.de serves this commit is not verified here.

## Constraints and preferences

- **Voice:** plain, direct, minimal, a little loose. Evidence over claims. No AI slop,
  no emojis, only the regular hyphen `-`. Details in
  [content & voice](content/content-and-voice.md).
- **Site language:** German and English are both published. German paths are
  canonical; English paths live under `/en`.
- **Assets:** placeholders are allowed in the first version. Profile photo may be used
  but not as a dominant hero element. A monogram is wanted but not required for the
  first build. Screenshots come later.
- **Legal:** Impressum and Datenschutz are required.
- **Analytics:** minimal and privacy-friendly, only if it produces insights that
  actually change decisions.
- **Launch date:** none fixed.
- **Curation, as the code comments describe it:** the one-pager keeps a single
  signature widget (GitHub heatmap). Terminal, now-playing, signals-of-life and
  WakaTime are not imported by a page. The ADR that named this rule is not in this
  checkout. New feature work is not authorized by this overview.

## Open questions (do not block the build)

Surfaced during discovery. The ones most likely to affect the build:

- Age is omitted until it is confirmed. Do not put a number back from this file.
- Final public name for the featured project: `fuelivo`, `Fueling Optimizer`, or
  `fuelivo - Fueling Optimizer`?
- Exact fuelivo tech stack (confirm from the project folder) and which parts of the
  calculation logic may be shown.
- Final project statuses (`live` / `mvp` / `concept` / `experiment`).
- Whether to state AI-as-a-tool openly (recommendation: yes, honestly, as a working
  method — not as an excuse or headline).
