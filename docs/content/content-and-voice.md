# Content and voice

**Purpose:** how the site sounds and what each section says. Copy is German; this doc is
in English but quotes German strings verbatim. All final German strings live in
`content/copy.ts`.

Related: [overview](../00-overview.md) · [projects](projects.md) · [seo](seo.md)

## Voice

Plain, direct, minimal, a little loose. Technical, short, concrete. Confident without
overselling. **Evidence over claims.**

- Instead of "leidenschaftlicher Entwickler" → show concrete projects and decisions.
- Instead of "modernste Technologien" → name the stack and the tradeoffs.
- Instead of "innovativ" → explain the problem, the solution and what was learned.

Hard rules (repo-wide):

- **No AI slop.** No filler, no generic hype, no "in today's fast-paced world".
- **No emojis. Anywhere.**
- **Only the regular hyphen `-`.** No em/en dashes or other special characters as a
  stylistic device.
- Avoid: leidenschaftlich, innovativ, visionär, Rockstar, Ninja, and similar.

### Finding the authentic voice
Use the owner's own writing sample as the reference tone (paraphrased): his biggest
project so far was building fuelivo, a pre/intra/post-workout fueling app that turns
several inputs into a deterministic output; building it was fun because he constantly
learned new things and it was the first time a project of his scaled beyond "a single
Python file plus a README". In his free time he does a lot of sport - hockey, running,
swimming and a lot in between - which shapes the rest of his life and shows up in his
technical, hands-on way of working.

Match that register: first person, concrete, unpolished-but-precise. When drafting copy,
read it back against this sample; if it sounds like a brochure, rewrite it.

## Section-by-section content

Copy below is **starting material**, not final strings. Refine toward the voice above,
keep it short.

### Hero
A compact masthead (PORT-48, design audit 2026-09). A recruiter must be able to place the
person inside the first viewport - who, what, where, looking for what, and where the CV
is - and the first proof (the fuelivo card) must start inside the first viewport at
1440x900. No kicker: the generic three-word formula (`STUDENT · DEVELOPER · ATHLETE`) said
nothing the positioning sentence does not say better, and it cost a line above the fold.
- **H1 (display, uppercase):** the name, `Yannik Wünker`. One line at every width.
- **Positioning (sans, one sentence):** what, where, current role, current build. Current
  string: "Wirtschaftsinformatik in Köln, Werkstudent beim Institut der deutschen
  Wirtschaft, baut fuelivo." Plain and factual; the owner refines the wording.
- **Availability line (mono, pulsing dot):** "Verfügbar als Werkstudent · Köln". Gated
  behind `SHOW_AVAILABILITY` (off by default), so the site advertises a job search only
  once that switch is deliberately flipped; add the start ("ab <Monat Jahr>") to the string
  when the date is settled.
- **CTAs:** primary "Projekte" (jumps to the fuelivo card), secondary "Lebenslauf (PDF)"
  (a download, shown only once the file exists). GitHub lives in the contact band, not here.

### Projects
Featured: **fuelivo** first as a compact proof - screenshot, one problem sentence, three
numbers, then Case Study and Live. Aurelian and DevBlueprint follow as shorter, differently
shaped teasers with one hard decision each. The onepager does not repeat role and learnings;
those stay on the detail pages. Full data model and per-project copy in
[projects.md](projects.md). Order: fuelivo #1, the rest by maturity and interest.

### About
Short. Who he is, how he thinks, the sport connection - stated plainly, not as a
manufactured origin story. Pull from the writing sample. Two-column pattern: H2 left,
body right.

### Skills / tech stack
Grouped, honest, no logo soup. Candidate groups:
- **Sprachen/Daten:** Python, Java, SQL, D3.
- **Praxis:** App-Entwicklung, Web-Entwicklung, API-Arbeit, Prozessoptimierung.
- **Werkzeuge/Themen:** Git, Excel, KI-Tools, local AI.
- **Produkt/Prozess:** Prozessanalyse, Produktdenken, Datenmodellierung, Requirements,
  Dokumentation.
Present as tech stack / "uses"-style, not a rating bar chart.

### Experience / studies
- **Studium:** Wirtschaftsinformatik, Universität zu Köln, seit Oktober 2024. Themes:
  data analysis, process optimization, software development, product management, AI
  applications - emphasis on working with AI to increase efficiency.
- **Werkstudent:** Institut der deutschen Wirtschaft, seit März 2025 - patent-database
  project, data analysis and process optimization. (Exact wording of tasks is an open
  question; keep it accurate and non-confidential.)
- **CV:** the "Lebenslauf (PDF)" download - offered in the hero, in the nav's "Mehr" menu
  and, subtly, below the timeline once the file is available, so the full CV also sits next
  to the condensed career history it complements. One shared `cv` copy block, one
  existence check (`lib/content/cv.ts`).

### Way of working (principles)
A few short principles that show how he approaches building: problems first, deterministic
logic where it matters, ship and iterate, document as you go, AI as a tool not a crutch.
Keep to 3-5 lines, evidence-flavored.

### Contact
Primary: **email** (mail@yannikwuenker.de), prominent. Plus LinkedIn and GitHub. CTA:
"Projekte ansehen" or "Kontakt aufnehmen". (The CV download lives in the hero, the nav and
the Werdegang timeline, not here.)

## AI transparency

State AI-as-a-tool openly and honestly, as a working method - not as an excuse or a
headline. Suggested framing: "mit KI als Entwicklungswerkzeug". Do not hide it, do not
lead with it.

## Naming

Display name `Yannik Wünker`; slugs/URLs `yannik-wuenker` (no umlaut). Featured project
name is an open question: `fuelivo`, `Fueling Optimizer`, or `fuelivo - Fueling
Optimizer` - pick one and use it consistently once decided.
