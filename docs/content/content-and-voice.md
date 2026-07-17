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
- **Kicker (mono, pine):** pulsing signal dot + `WIRTSCHAFTSINFORMATIK · SOFTWARE · APPS`.
- **H1 (Instrument Serif):** a short line where the last words are italic + pine.
  Handoff example: "Ich baue Software, die sich *gut anfühlt.*" Keep it honest and
  specific to what he builds; iterate.
- **Sub (Hanken):** one intro sentence. Starting direction (from the derived positioning):
  "Wirtschaftsinformatik-Student aus Köln. Ich baue Apps, Webprodukte und kleine Systeme,
  die konkrete Probleme lösen - von Fueling für Ausdauerathleten bis zu
  Prozessoptimierung mit Python und KI."
- **CTAs:** primary "Projekte ansehen →", secondary "CV laden" (only once the file
  exists), ghost "GitHub ↗".
- **Status row:** pill "Verfügbar für Werkstudent" (pulsing dot) + mono meta
  `GER · 14:32 CET · 18°C` (static placeholder in MVP; live in Phase 2).

### Projects
Featured: **fuelivo** first, large. Then the others as cards with a status label. Full
data model and per-project copy in [projects.md](projects.md). Order: fuelivo #1, the rest
by maturity and how interesting they are.

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
- **CV:** subtle "Lebenslauf (PDF)" download below the timeline once the file is available -
  the full CV sits next to the condensed career history it complements.

### Way of working (principles)
A few short principles that show how he approaches building: problems first, deterministic
logic where it matters, ship and iterate, document as you go, AI as a tool not a crutch.
Keep to 3-5 lines, evidence-flavored.

### Contact
Primary: **email** (mail@yannikwuenker.de), prominent. Plus LinkedIn and GitHub. CTA:
"Projekte ansehen" or "Kontakt aufnehmen". (The CV download lives with the Werdegang
timeline, not here.)

## AI transparency

State AI-as-a-tool openly and honestly, as a working method - not as an excuse or a
headline. Suggested framing: "mit KI als Entwicklungswerkzeug". Do not hide it, do not
lead with it.

## Naming

Display name `Yannik Wünker`; slugs/URLs `yannik-wuenker` (no umlaut). Featured project
name is an open question: `fuelivo`, `Fueling Optimizer`, or `fuelivo - Fueling
Optimizer` - pick one and use it consistently once decided.
