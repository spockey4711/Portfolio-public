# Projects

**Purpose:** the project data model and the per-project details. Projects are typed data
under `content/projects/` - one project per file (e.g. `content/projects/fuelivo.ts`),
with the type in `content/projects/types.ts` and `content/projects/index.ts` aggregating
them into the ordered list the Projects section renders. fuelivo is the featured entry and
always first.

Related: [content & voice](content-and-voice.md)

## Data model

```ts
type ProjectStatus = 'live' | 'mvp' | 'concept' | 'experiment';

interface Project {
  slug: string;              // e.g. 'fuelivo' (no umlaut, url-safe)
  name: string;              // display name
  tagline: string;          // one line, German, plain
  status: ProjectStatus;    // shown as a labelled badge (text + color)
  featured?: boolean;       // fuelivo = true
  order: number;            // fuelivo = 1; rest by maturity/interest
  problem?: string;         // what real problem it solves
  role?: string;            // what Yannik did
  stack?: string[];         // technologies (confirm before publishing)
  learnings?: string[];     // honest takeaways
  links?: {
    live?: string;
    repo?: string;
    demo?: string;
  };
  media?: {
    cover?: string;         // path in public/images (placeholder allowed)
    orientation?: 'landscape' | 'portrait';  // which frame the cover gets
  };
  detailPage?: boolean;     // renders its own /projekte/<slug> page (P3-3)
  caseStudy?: CaseStudy;    // long-form story for the detail page (see below)
}
```

### The case study (detail-page long form)

The flat fields above feed all three levels (card, index, detail). A project that
warrants a deeper page can also set `caseStudy`, an optional object the detail page
(`ProjectDetail`) renders section by section. Every field is optional, so the page shows
only what a project fills - fuelivo fills the whole thing, a leaner project shows just its
flat fields.

```ts
interface CaseStudy {
  summary?: string;            // lead paragraph under the cover
  solution?: {                 // the core idea and how it works
    intro: string;
    highlights?: string[];
  };
  features?: ProjectFeature[]; // { label, status, tag? } - status shows as text + dot
  screenshots?: readonly ProjectScreenshot[]; // { src, alt, caption } - real product shots
  techStack?: TechLayer[];     // { name, items[] }; replaces the flat `stack` pills
  architecture?: {
    intro: string;
    points?: string[];
  };
  challenges?: ProjectChallenge[]; // { title, problem, solution }
  metrics?: ProjectMetric[];       // { value, label } - headline numbers
  timeline?: TimelinePhase[];      // { period, title, description }
  interactiveProof?: boolean;      // mounts the project's proof widget (S4-5)
}
```

Feature `status` (`'done' | 'in-progress' | 'planned'`) maps to a German label via
`featureStatusLabels`, shown next to the color dot so the state never relies on color
alone. Section headings and the inline challenge labels live in `content/copy.ts`
(`projects.labels`).

### Screenshots (ADR-0011)

`screenshots` is the real-product evidence [ADR-0011](../../private-docs/docs/architecture/decisions/0011-lean-onepager-and-substance-gate.md)
requires of a *carried* project. `ProjectDetail` renders it between the features and the
architecture - the features claim what the product does, the shots show it, the
architecture explains how - as a one-column grid that becomes two columns from `sm` up.
An omitted or empty list renders no section at all, so a project without shots simply
skips it.

Every shot gets the same landscape frame, and the image is *contained* in it rather than
cropped, so a portrait native-app screenshot shows whole (matted by the frame) instead of
being cut off at the top. That is the difference from `media.cover`, which picks a frame
per project via `media.orientation`: a gallery mixes shapes, so it takes the treatment
that is right for either.

```ts
interface ProjectScreenshot {
  src: string;      // path in public/images, e.g. '/images/fuelivo_calculator.png'
  alt: string;      // required: describes the image for assistive tech
  caption: string;  // required: says what the shot proves
}
```

Both `alt` and `caption` are **required**, and they carry different text. The alt text is
what a screen reader gets *instead of* the image; the caption is what every reader gets
*next to* it. An optional field here would make an undescribed screenshot the path of
least resistance, which the a11y suite (`tests/e2e/a11y.spec.ts`, `tests/e2e/axe.spec.ts`)
exists to prevent.

Only **real** shots of the running product belong here - no placeholders and no generated
art. That is the point of the field: the generated on-brand covers under
[Assets](#assets) are fine as a card cover, but they prove nothing about a product, and
ADR-0011 gates further playground work on exactly that proof.

English follows the same overlay rule as the feature list (`mergeCaseStudy` in
`content/projects/index.ts`): `content/projects/en.ts` supplies only the translated `alt`
and `caption` per shot, in the same order as the German list, and `src` is inherited from
the German base - one image file serves both languages, so repeating the path would only
let the two locales drift. A shot with no English entry keeps its German text rather than
disappearing from `/en/projects/<slug>`. See [i18n](i18n.md).

### Interactive proof (S4-5)

`interactiveProof: true` mounts a project's bespoke live demo on its detail page, rendered
by `ProjectDetail` right after the solution section (claim then proof). Only fuelivo has one
today: `components/widgets/fuelivo-proof/FuelivoProof.tsx`, a self-contained calculator that
lets a visitor drive a session (duration, intensity, sport, heat) and watch the per-hour
carb, fluid and sodium targets recompute, each with the reasoning trace behind its number -
turning fuelivo's "deterministic, not a black box" claim into something you can touch. Its
math is the pure, unit-tested `lib/fuelivo/proof.ts` (a deliberately simplified illustration
of the real engine, not the production formula). The flag is generic; a second project would
add its own widget and its own mapping. See
[rendering-and-data](../architecture/rendering-and-data.md) for how the widget renders.

## Where projects appear (three levels)

Projects follow the site's information architecture ([ADR-0005](../../private-docs/docs/architecture/decisions/0005-information-architecture.md)):
one model, surfaced at up to three levels of depth.

| Level | Where | Route | Shows |
|---|---|---|---|
| 1 - Section | Onepager teaser | `/#projekte` | Featured + `TEASER_COUNT` (2) more by `order`, plus a "view all" link. |
| 2 - Index | Dedicated page (P3-9) | `/projekte` | The **complete** ordered list. |
| 3 - Detail | Per-project page (P3-3) | `/projekte/<slug>` | One project's full story; opt-in via `detailPage`. |

The section (`components/sections/projects/Projects.tsx`) is a curated teaser, not the
full list - `TEASER_COUNT` caps how many non-featured cards it shows. The featured
project leads a full-width row as a "wide" card (cover beside the story via
`FeaturedProject`'s `layout` prop; on lg+ the media column fills the space below the
cover with the project's case-study metrics in the detail rail's tile voice, so the
column doesn't sit empty next to the taller story); the teaser projects share the row beneath it, one
per column, and render the same flat `problem`/`role`/`learnings` story the featured one
does (grid stretch keeps them equal height regardless of copy length). The `/projekte`
index (`app/projekte/page.tsx`) is the full list and the parent of every detail page: a
detail page's "Zurück zu den Projekten" link points at `/projekte`, and the index links
back up to the `/#projekte` section. Both the index and each detail page are indexable and
join `app/sitemap.ts`.

`detailPage: true` opts a project into a dedicated `/projekte/<slug>` page (P3-3),
rendered by `ProjectDetail` and statically generated from `detailProjects` (the filtered
list is the single source of truth for the route's `generateStaticParams`, the sitemap and
the onepager's "Details" link). Only flagged projects get a page - every other
`/projekte/*` slug is a static 404 (`dynamicParams = false`). fuelivo, Aurelian and
DevBlueprint are flagged today; add more by setting the flag once a project has enough real
material (tagline plus at least one outbound link). The onepager keeps its own "Live ansehen"
button and adds a "Details ansehen" link into the page.

Status label mapping (text is always shown, not just color):

| Status | Label (de) | Meaning |
|---|---|---|
| `live` | "Live" | usable / published |
| `mvp` | "MVP" | core feature built / validatable |
| `concept` | "Konzept" | a thought-through product idea |
| `experiment` | "Experiment" | learning project / prototype |

Statuses are **not final** yet - an open question (see [overview](../00-overview.md)).

## The projects

Order: fuelivo #1; the rest by maturity and interest. Not every experiment needs to be on
the onepager; deeper ones can get a detail page later.

### 1. fuelivo (Fueling Optimizer) — featured
- **Status:** running app, live at **fuelivo.de** (not yet finished / fully
  marketable, but real and important). Local project folder:
  `~/PragrammierProjekte/FuelingOptimizer`. One of three projects with a full
  `caseStudy` (see above), drawn from that repository.
- **Audience:** endurance athletes - marathon, triathlon, cycling, etc.
- **Problem:** most athletes do not know how to fuel optimally during training or
  competition - carbohydrates, fluid, sodium. General recommendations exist but are too
  vague or not tailored to the individual.
- **Inputs:** duration, intensity, body weight, temperature, sweat rate, goal,
  experience (roughly these).
- **Outputs:** carbs/hour, fluid/hour, sodium/hour, totals - and also *when* and *what*.
- **Logic:** a deterministic recommendation matrix based on the inputs (e.g. 3h at high
  intensity, 20 C, 70 kg → x g carbs/h, y ml fluid/h, z mg sodium/h). Deterministic
  output from multiple inputs - this is the product's core and worth explaining.
- **Role:** everything - idea, calculation logic, design, technical implementation - with
  AI as a development tool.
- **Learnings:** backend, frontend, iOS development, payments via Stripe, DNS, CI/CD,
  deployment, documentation. First project that scaled beyond "a single Python file plus
  a README".
- **Next:** finish the iOS app.
- **Open:** which parts of the calculation logic may be shown publicly; screenshots that
  explain the app well; final public name.

### 2. Aurelian — full case study
- **Status:** `mvp` (Client MVP Ready / App Store Release Prep). iOS-first app for daily
  stoic reflection; live marketing/privacy/support site at **aurelian.yannikwuenker.de**,
  with a hardened Groq endpoint at `aurelianapi.yannikwuenker.de`. The second project with a
  full `caseStudy` (see above), drawn from its repository and the product brief.
- **Audience:** ambitious 18-35 year olds who want stoicism as a short daily practice, not a
  heavy journal.
- **Problem:** stoicism apps ship generic quotes with no link to the real day, journal apps
  demand too much input, and AI tools hallucinate quotes - fatal for philosophical sources.
- **Solution:** a very short daily loop (morning check-in + evening reflection) that turns a
  12-week focus goal, the day's priorities and an energy level into a structured stoic output
  (quote → source → perspective → check question → rule → evening question). The AI only
  selects from vetted local quote candidates; it never invents.
- **Role:** solo, end-to-end - product/PRD, modular local-first architecture, SwiftUI client,
  domain/application logic as a Swift package, the vetted quote database, the Node/Groq
  endpoint, deployment and App Store prep.
- **Detail page:** yes (`detailPage: true`) - links to the live site.

### 3. DevBlueprint — full case study
- **Status:** `live`. A reusable, stack-agnostic engineering setup (git workflow, quality
  gate, conventions, AI-assistant guidance) scaffolded by a Bash CLI; public and
  MIT-licensed at **github.com/spockey4711/DevBlueprint**. Local project folder:
  `~/PragrammierProjekte/DevBlueprint`. The third project with a full `caseStudy` (see
  above), drawn from that repository.
- **Audience:** developers (and their AI assistants) starting a new project who want a
  professional process from commit one without adopting a framework.
- **Problem:** every new project reinvents or skips the git workflow, quality gate,
  conventions and AI guardrails; parallel AI sessions collide on branches; ready-made
  frameworks and template repos only solve it via permanent lock-in.
- **Solution:** a stack-agnostic `core/` plus thin per-stack `variants/`, scaffolded by a
  Bash CLI (`list`/`init`/`plan`/`update`/`doctor`/`detect`/`version`). Documentation-first:
  the output is plain files you own - no runtime, no lock-in. A two-branch, worktree-per-task
  workflow keeps parallel AI sessions from colliding, and `--json` + `plan` make it
  agent-operable.
- **Role:** solo, end-to-end - the idea, extracting the process from a real production
  codebase, the agnostic core docs, the Bash CLI, nine stack variants, the bats test suite
  and the agent integration.
- **Detail page:** yes (`detailPage: true`) - links to the public repo. As a CLI kit it has
  no product screenshot, so the card and detail page show a generated on-brand cover
  (`devblueprint_cover.png`) rather than faking a UI.

### 4. Rezepte App
- Status: **done.** Recipes app. Needs tagline + optional media/repo.

### 5. Daily Dashboard
- Status: **in planning / concept.** Personal dashboard (coding activity, etc.). Ties into
  the "dashboard" idea from the original brief.

### 6. Mail Classifier
- Small app that classifies mail. Good, concrete "small tool" evidence. Needs tagline +
  status.

> More experiments exist and can be added later. Names above are provisional and may be
> adjusted.

## Assets

Cover images live in `public/images/` and are set per project via `media.cover`.
`media.orientation` picks the frame: `landscape` (default) renders the cover in a lightweight
browser-window frame (traffic-light dots plus the live domain), so a landscape web-app
screenshot reads as a real product shot; `portrait` renders it in a phone frame instead, so a
native iOS screenshot (e.g. Aurelian, `aurelian_screen.png`) keeps its real proportions rather
than being cropped to the landscape box.

Aurelian and fuelivo lead with real screenshots - fuelivo's is a 2400x1520 shot of the
fuelivo.de landing page (its earlier generated headline cover only duplicated the card's
own title and tagline sitting right next to it). Every other project - DevBlueprint (a
CLI) and the projects not yet publicly deployed - uses a deliberate, on-brand
generated cover (`<slug>_cover.png`) with the project name, tagline, status and slug tag on the
Pressroom palette, rather than faking a UI. These covers and the default OG image are generated
from committed HTML templates by `scripts/generate-assets.mjs` (`pnpm assets:generate`), which
renders them through Playwright's Chromium using the site's own tokens and fonts, so
regenerating is reproducible. The component-level diagonal striped placeholder in
`ProjectMedia` remains the fallback for any future project that has no `media.cover` set.
Detail-page screenshots (`caseStudy.screenshots`) live in the same `public/images/`
directory and are referenced by path; unlike the covers they are never generated. The
script can also re-shoot the live screenshots at a consistent viewport
(`node scripts/generate-assets.mjs reshoot`); those land in a git-ignored `.asset-preview/`
for review before replacing the curated originals.

## Open items (per project)

- Assign final statuses to every project.
- Write a short German tagline for each of Daily Dashboard, Rezepte App, Mail Classifier.
- Decide which further projects earn a detail page (`detailPage: true`). fuelivo, Aurelian
  and DevBlueprint have one; the rest need more real material (a live/repo link, screenshots)
  before a page is worthwhile.
