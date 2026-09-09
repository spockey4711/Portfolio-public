/**
 * German site copy (`de-DE`): the canonical source of truth for the user-facing
 * strings in the page sections and chrome, and the shape every other locale must
 * satisfy (see ./index.ts and content/copy/en.ts). Components must not hold
 * language literals - they read from here via getCopy(locale), so the copy stays
 * reviewable in one place and the voice stays consistent (see
 * docs/content/content-and-voice.md and docs/content/i18n.md).
 *
 * Voice: plain, direct, first person, concrete. Evidence over claims. No hype
 * words, no emojis, regular hyphen only. Site metadata (title/description) lives
 * in lib/seo/site.ts, not here.
 *
 * Internal hrefs are built from lib/i18n/routes.ts so the German and English
 * paths never drift; external links (mailto, GitHub, LinkedIn) and same-page
 * anchors stay literal. Some strings are starting material and will be refined as
 * the open questions in docs/content/* resolve; those are flagged inline.
 */

import { localizedAnchor, localizedPath } from "@/lib/i18n/routes";

const locale = "de";

export const deCopy = {
  nav: {
    logo: "yannik.wuenker",
    // Accessible name for the primary navigation landmark. Distinguishes it from
    // the footer's legal navigation for assistive tech (two nav landmarks exist).
    label: "Hauptnavigation",
    // Keyboard skip link: the first focusable element, jumps past the fixed nav
    // straight to the main content (docs/design/accessibility.md).
    skipToContent: "Zum Inhalt springen",
    // Scroll anchors for the one-pager sections. The hrefs are root-relative
    // (`/#...`, localized to `/en#...`) so the nav also works from sub-routes like
    // the project detail pages, where these sections do not exist: the link then
    // navigates home and jumps to the anchor (same pattern as backToProjects).
    links: [
      { href: localizedAnchor("projekte", locale), label: "Projekte" },
      { href: localizedAnchor("ueber", locale), label: "Über" },
      { href: localizedAnchor("kontakt", locale), label: "Kontakt" },
    ],
    // Page-level destinations, kept separate from `links` because they *navigate
    // away* from the one-pager rather than scrolling within it. On desktop the Nav
    // collapses them (plus the language toggle and command palette) behind the
    // "Mehr" menu so "leaves the page" can never be mistaken for a section anchor
    // (ADR-0005); the footer's `explore` nav mirrors this set. Labels stay
    // arrow-free - the arrow is a decorative, aria-hidden flourish in the component.
    pageLinks: [
      { href: localizedPath("now", locale), label: "Jetzt", route: "now" },
      { href: localizedPath("blogIndex", locale), label: "Blog", route: "blogIndex" },
      { href: localizedPath("uses", locale), label: "Uses", route: "uses" },
    ],
    // The desktop "Mehr" menu: a disclosure button that groups the off-one-pager
    // destinations above (plus the language toggle and command palette). The
    // visible label is its accessible name (WCAG 2.5.3); `aria-expanded` announces
    // the collapsed/expanded state, so no separate open/close strings are needed.
    more: {
      label: "Mehr",
    },
    // Accessible names for the phone-only menu toggle, which shows an icon only.
    // The name flips with the disclosure state so assistive tech announces what
    // activating it will do (open vs. close the collapsed link list).
    menu: {
      open: "Menü öffnen",
      close: "Menü schließen",
    },
    // Language toggle: switches to the counterpart page in the other locale. The
    // label names the *target* language in that language (the common convention),
    // the aria-label spells out the action for assistive tech.
    language: {
      label: "EN",
      switchTo: "Zu Englisch wechseln",
    },
    // Dark-mode toggle in the "Mehr" and phone menus. Dark mode is off by
    // default (ADR-0007); the button flips and persists the choice. `label` is the
    // button's accessible name and `aria-pressed` announces on/off, so the `on`/`off`
    // words are a decorative, aria-hidden state hint next to the label.
    theme: {
      label: "Dunkelmodus",
      on: "an",
      off: "aus",
    },
  },

  // Labels for the root node of the JSON-LD BreadcrumbList on sub-routes
  // (lib/seo/structured-data.ts). The deeper nodes reuse the section titles
  // (projects/blog index) and the page's own name, so only the home label is new.
  breadcrumb: {
    home: "Startseite",
  },

  // The CV (Lebenslauf) download. One block shared by every surface that links the
  // CV, so the label and path live once. `href` is the canonical public path and the
  // single source of truth for the server-side existence check (lib/content/cv.ts):
  // each surface renders its link only when the file is really there, so an absent
  // CV degrades to nothing instead of a dead link. The path is locale-invariant;
  // only the label is translated.
  cv: { label: "Lebenslauf (PDF)", href: "/cv/yannik-wuenker.pdf" },

  hero: {
    // Rendered mono + pine, preceded by a pulsing signal dot. The middle dot is
    // the intended separator from the design handoff, not a dash.
    kicker: "STUDENT · DEVELOPER · ATHLETE",
    // The H1 renders in two parts: `lead` upright, `accent` italic + pine accent.
    headline: {
      lead: "Ich entwickle Software, die meine eigenen",
      accent: "Probleme löst.",
    },
    sub: "Wirtschaftsinformatik-Student aus Köln. Ich baue Webseiten, Apps und Automatisierungen, die konkrete Probleme lösen - von Produktivitätsoptimierung bis zu Fueling für Ausdauerathleten.",
    ctas: {
      primary: { label: "Projekte ansehen", href: "#projekte" },
      github: { label: "GitHub", href: "https://github.com/spockey4711" },
    },
    status: {
      // Rendered only when SHOW_AVAILABILITY is enabled (see lib/config/features).
      availability: "Verfügbar als Werkstudent",
      // The mono meta line. `location` is fixed; `time` and `temperature` are the
      // static fallbacks the live widget (P2-2) renders on the server and until -
      // or if - the live values arrive, so the line never shifts layout.
      meta: {
        location: "GER",
        time: "14:32 CET",
        temperature: "18°C",
      },
    },
    // Hero visual copy. The hero itself carries no imagery (PORT-47); what lives
    // here is the now-playing widget's live Spotify data (P3-1, P3-8). Kept here so
    // the section holds no language literals.
    visual: {
      nowPlaying: {
        // Shown while a track is playing, and over the static placeholder.
        label: "// now playing",
        // Shown when nothing is playing and we fall back to the last played
        // track (P3-8).
        lastPlayedLabel: "// last played",
        track: "Lofi & Commits",
      },
    },
  },

  // Interactive terminal widget below the hero (P2-1). A dark strip with a real
  // command line: whoami/projects/contact/sudo hire-me plus a few hidden eggs.
  // The pure command core lives in lib/terminal; every user-facing string is here
  // so the voice stays in one place (components and lib hold no language literals).
  terminal: {
    // Chrome bar caption. Regular hyphen, no em dash (house rule).
    title: "~/portfolio - zsh",
    // Accessible names for the widget region and the command input.
    regionLabel: "Interaktives Terminal",
    inputLabel: "Terminal-Eingabe",
    // Green prompt glyph, shown before every echoed command and the live input.
    prompt: "▸",
    // First line in the log on load - a nudge toward the available commands.
    intro: "tippe 'help' - probier: whoami, projects, contact, sudo hire-me",
    // Unknown-command response, composed as `${notFound}: ${name} - ${hint}`.
    notFound: "command not found",
    hint: "tippe 'help'",
    help: {
      heading: "Verfügbare Befehle:",
      // Listed in this order; the name is padded and the description follows.
      entries: {
        help: "diese Übersicht",
        whoami: "wer ich bin",
        projects: "woran ich gebaut habe",
        skills: "womit ich arbeite",
        experience: "mein Werdegang",
        contact: "so erreichst du mich",
        "sudo hire-me": "warum sich das lohnt",
        clear: "Terminal leeren",
      },
      // Hints that more commands exist, without spoiling them.
      eggHint: "Ein paar Befehle sind nicht gelistet. Viel Spaß beim Stöbern.",
    },
    whoami: [
      "yannik.wuenker",
      "Wirtschaftsinformatik-Student aus Köln - Software & Apps.",
      "student · builder · sportler",
    ],
    projects: {
      heading: "Projekte:",
      // Appended after the list; points at the full section further down.
      footer: "mehr dazu weiter unten unter 'Projekte'.",
    },
    // `skills`: the grouped tech stack, sourced from content/skills.ts so the
    // terminal and the Skills section never drift. Each group's title is padded
    // and its items joined with the mid-dot separator.
    skills: {
      heading: "Skills:",
      footer: "mehr dazu weiter unten unter 'Skills'.",
    },
    // `experience`: study and work, sourced from content/experience.ts. Each entry
    // renders as a `role - org` line and an indented period, with `current`
    // appended where the entry is ongoing.
    experience: {
      heading: "Werdegang:",
      footer: "mehr dazu weiter unten unter 'Werdegang'.",
      current: "aktuell",
    },
    contact: {
      heading: "So erreichst du mich:",
      lines: [
        "mail     mail@yannikwuenker.de",
        "github   github.com/spockey4711",
        "linkedin linkedin.com/in/yannik-wuenker",
      ],
    },
    // `sudo hire-me`: the payoff command. The typed command is echoed above it.
    // No availability claim here - job-search status stays gated to the hero pill
    // (SHOW_AVAILABILITY); the payoff is simply an invitation to get in touch.
    // Four beats, tone-mapped in lib/terminal/commands.ts: the password prompt
    // (faint), a verifying step (muted), the grant (green) and the invitation
    // (text).
    hireMe: [
      "[sudo] Passwort für recruiter: ********",
      "Prüfe Referenzen ... alles sauber.",
      "Zugriff gewährt.",
      "Schreib mir gerne eine Mail: mail@yannikwuenker.de",
    ],
    // Hidden commands (deliberately absent from help).
    sudo: "Netter Versuch - hier bist du längst Admin.",
    // `sudo rm -rf /` and any other `sudo rm ...`: a safe, on-tone refusal.
    // Nothing is ever deleted; the joke is the reassurance.
    rmrf: [
      "Schöner Versuch. Hier wird nichts gelöscht -",
      "das läuft alles unter Versionskontrolle.",
    ],
    ls: "about/  projects/  skills/  experience/  contact/",
    coffee: "brewing... ∞ Tassen und es werden mehr.",
  },

  // Command palette (S2-6): a ⌘K/Ctrl-K launcher that unifies section/route navigation
  // and the terminal command parser (lib/terminal). Every user-facing string lives here so
  // the pure core (lib/command-palette) and the island hold no German literals.
  commandPalette: {
    // Accessible name for the dialog and the palette region.
    label: "Befehlspalette",
    // Placeholder in the search input.
    placeholder: "Befehl oder Seite suchen ...",
    // Group headings in the result list.
    groups: {
      navigate: "Navigation",
      run: "Befehle",
      action: "Aktionen",
    },
    // Right-aligned tag per entry: section anchors vs. page routes vs. terminal commands vs. actions.
    hints: {
      section: "Sektion",
      page: "Seite",
      command: "Befehl",
      action: "Aktion",
    },
    // Navigate targets not already covered by nav.links (sections) / nav.pageLinks (blog):
    // the home route and the full projects index.
    navigate: {
      home: { href: "/", label: "Startseite" },
      projects: { href: "/projekte", label: "Alle Projekte" },
    },
    // Standalone actions (side effects rather than navigation or terminal commands).
    actions: {
      // The dark-mode toggle (S4-2); switches between the light and dark theme.
      theme: "Design umschalten (hell/dunkel)",
    },
    // Shown when the query matches no entry.
    empty: "Keine Treffer.",
    // Accessible name for the Nav trigger (an icon-only ⌘K chip).
    trigger: "Befehlspalette öffnen",
    // Accessible name for the in-palette close affordance (labelled "esc").
    close: "Befehlspalette schließen",
  },

  // Standalone GitHub activity strip after the About section (P2-3). A contribution
  // heatmap for the last year, fetched from the same-origin /api/github-activity
  // route; every user-facing string lives here so the component holds no literals.
  githubActivity: {
    // Accessible name for the widget region landmark.
    regionLabel: "GitHub-Aktivität",
    // Mono eyebrow above the heatmap.
    label: "GitHub",
    // Composed with the live total as `${total} ${summary}` once data arrives.
    summary: "Beiträge im letzten Jahr",
    // Shown in place of the count until - or if - live data arrives.
    fallback: "Aktivität derzeit nicht verfügbar",
    // Per-cell hover title, composed as `${count} ${one|other} ${on} ${date}`.
    day: { one: "Beitrag", other: "Beiträge", on: "am" },
    // Heatmap intensity legend (GitHub's "Less ... More").
    legend: { less: "weniger", more: "mehr" },
    link: { label: "Auf GitHub ansehen", href: "https://github.com/spockey4711" },
  },

  // Signals-of-life feed (S3-5): one "die Seite lebt" surface that gathers the
  // scattered live signals into a single strip - the latest commit
  // (/api/latest-commit), the latest blog post (build-time content), the
  // now-playing track (/api/now-playing, mirrored from the hero) and the GitHub
  // contribution total (/api/github-activity). Each row degrades to its own quiet
  // fallback, so a missing source never blanks the surface. The coding-stats row
  // (WakaTime) slots in here once S3-2 lands. Every string lives here so the island
  // holds no literals.
  signals: {
    // Accessible name for the surface region landmark.
    regionLabel: "Zeichen von Leben",
    // Mono eyebrow above the feed.
    label: "// signale",
    // Serif heading for the surface.
    title: "Zeichen von Leben",
    // One-line intro under the heading.
    intro: "Was hier gerade lebt - der letzte Commit, der letzte Beitrag, was läuft.",
    // Per-row mono kickers.
    kickers: {
      commit: "commit",
      post: "beitrag",
      nowPlaying: "läuft",
      // Kicker when nothing is playing and we mirror the last played track.
      lastPlayed: "zuletzt",
      github: "github",
    },
    commit: {
      // Composed as `${prefix} ${repo}` next to the relative time.
      inRepo: "in",
      // Shown until - or if - live data arrives.
      fallback: "Zuletzt gepusht - gerade nicht verfügbar",
    },
    post: {
      // Composed with the count and date, e.g. "6. Juli 2026".
      fallback: "Noch kein Beitrag veröffentlicht",
    },
    nowPlaying: {
      // Shown when nothing is playing and the last-played read is unavailable.
      fallback: "Gerade Stille",
    },
    github: {
      // Composed with the live total as `${total} ${summary}`.
      summary: "Beiträge im letzten Jahr",
      // Shown in place of the count until - or if - live data arrives.
      fallback: "Aktivität derzeit nicht verfügbar",
      link: { label: "Auf GitHub ansehen", href: "https://github.com/spockey4711" },
    },
  },

  wakatime: {
    // Accessible name for the widget region landmark.
    regionLabel: "Coding-Aktivität",
    // Mono eyebrow above the project breakdown.
    label: "WakaTime",
    // Composed with the live total as `${total} ${summary}` once data arrives.
    summary: "programmiert in den letzten 7 Tagen",
    // Shown in place of the total until - or if - live data arrives.
    fallback: "Coding-Aktivität derzeit nicht verfügbar",
    // Shown when stats arrive but hold no projects (a quiet week).
    emptyProjects: "Noch keine Projektdaten",
    link: { label: "Auf WakaTime ansehen", href: "https://wakatime.com/@spockey4711" },
  },

  // Editorial lead-ins that introduce the framed instrument clusters on the
  // landing page. They sit as plain text on the paper background (BandIntro in
  // components/sections/bento), so the onepager alternates open passages with
  // boxed widgets instead of reading as wall-to-wall boxes.
  landing: {
    projects: {
      eyebrow: "Ausgewählte Arbeiten",
      lead: "Ein paar Dinge, die ich gebaut habe - vom ersten Problem bis zur laufenden App.",
    },
    github: {
      eyebrow: "Die Arbeit, in Zahlen",
      lead: "Ein Jahr Commits, direkt aus GitHub - nicht geschätzt, nicht kuratiert.",
    },
  },

  projects: {
    title: "Projekte",
    // Section labels for the project card and the detail page. The first four
    // are the onepager card's problem/role/learnings block; the rest are the
    // extra case-study sections a full detail page (fuelivo) adds.
    labels: {
      problem: "Problem",
      role: "Rolle",
      learnings: "Was ich gelernt habe",
      stack: "Stack",
      solution: "Die Lösung",
      features: "Features",
      // Heading for the real-screenshot section on a detail page (ADR-0011).
      screenshots: "Screenshots",
      techStack: "Tech-Stack",
      architecture: "Architektur",
      challenges: "Herausforderungen",
      metrics: "Zahlen & Umfang",
      timeline: "Verlauf",
      // Inline sub-labels inside each challenge card.
      challenge: { problem: "Problem", solution: "Lösung" },
      // Prefix for a project cover's alt text: "<coverAlt> <project name>".
      coverAlt: "Vorschau von",
    },
    // Link on the onepager into a project's own /projekte/<slug> page (P3-3).
    // Only shown for projects flagged detailPage.
    detailsLink: "Details ansehen",
    // CTA under the onepager section teaser, linking to the full index (P3-9).
    // The onepager shows only a curated top-N; the rest live on /projekte.
    viewAll: "Alle Projekte ansehen",
    // Chrome for the dedicated /projekte index page (IA level 2, ADR-0005). Its
    // back link points up to the onepager section (/#projekte), the index's parent.
    index: {
      eyebrow: "Projekte",
      title: "Alle Projekte",
      intro:
        "Von fertigen Produkten bis zu Experimenten - hier stehen alle Projekte, nicht nur die Highlights vom Onepager.",
      backToOnepager: { label: "Zurück zur Startseite", href: localizedAnchor("projekte", locale) },
    },
    // Chrome and outbound-link labels for the dedicated project detail page. The
    // back link points at the projects index (/projekte), each detail's parent.
    detail: {
      eyebrow: "Projekt",
      backToProjects: {
        label: "Zurück zu den Projekten",
        href: localizedPath("projectsIndex", locale),
      },
      links: {
        live: "Live ansehen",
        repo: "Code ansehen",
        demo: "Demo ansehen",
      },
      // Heading for the internal-linking block at the foot of a detail page,
      // pointing at the other projects that have their own page (S5-2).
      related: "Weitere Projekte",
    },
    // The interactive fuelivo proof (S4-5): a live calculator on the fuelivo detail
    // page that shows fuelivo's deterministic, explainable output - change the
    // session, watch the targets and their reasoning update. Rendered by
    // components/widgets/fuelivo-proof/FuelivoProof.tsx.
    proof: {
      eyebrow: "Interaktiver Beweis",
      title: "Deterministisch, keine Blackbox",
      intro:
        "Stell eine Session ein und sieh die Fueling-Ziele sofort neu berechnet - jede Zahl trägt ihre Begründung. Gleiche Eingaben ergeben immer dieselbe Ausgabe.",
      // Labels and options for the input controls.
      controls: {
        duration: "Dauer",
        // Value readout suffix, e.g. "2,5 h"; the number is filled in by the widget.
        durationUnit: "h",
        intensity: "Intensität",
        intensityOptions: { easy: "Locker", moderate: "Moderat", hard: "Hart" },
        sport: "Sportart",
        sportOptions: { run: "Laufen", bike: "Rad", swim: "Schwimmen" },
        heat: "Hitze",
        heatOptions: { cool: "Kühl", warm: "Warm", hot: "Heiß" },
      },
      // The three computed targets, shown per hour.
      outputs: {
        perHour: "pro Stunde",
        carbs: { label: "Kohlenhydrate", unit: "g/h" },
        fluid: { label: "Flüssigkeit", unit: "ml/h" },
        sodium: { label: "Natrium", unit: "mg/h" },
      },
      // Reasoning-trace step labels, keyed by the engine's TraceKind. `capped` takes
      // the ceiling value, e.g. "gedeckelt bei 90".
      trace: {
        base: "Basis",
        intensity: "Intensität",
        sport: "Sportart",
        heat: "Hitze",
        capped: "gedeckelt bei",
      },
      // Honest note: this is a simplified in-page model, not the production engine.
      disclaimer:
        "Vereinfachtes Modell der echten Engine - zeigt die Art der Begründung, nicht die exakten Gramm-Werte.",
      viewLive: "Echten Rechner öffnen",
    },
  },

  about: {
    title: "Über mich",
    // Serif H2 in the section's left column, rendered in three parts: `lead` and
    // `tail` upright, `accent` italic + pine (the middle word). A play on the
    // "eat sleep code repeat" trope that folds in the sport that sets him apart.
    headline: {
      lead: "Code,",
      accent: "Sport,",
      tail: "Sleep, Repeat.",
    },
    // First person, from the writing sample in content-and-voice.md. Kept short
    // and plain - no manufactured origin story.
    body: [
      "Ich studiere Wirtschaftsinformatik in Köln und baue nebenbei die Dinge, die ich selbst gebraucht hätte. Mein bisher größtes Projekt ist fuelivo, eine App, die aus wenigen Eingaben eine konkrete Fueling-Empfehlung für Ausdauersport macht. Mich motiviert es, Ideen zu planen und bis zur fertigen Anwendung umzusetzen.",
      "Neben dem Studieren mache ich viel Sport - Hockey, Laufen, Gym und worauf ich noch so Lust habe. Das hilft mir, mich zu fokussieren und motiviert mich, Dinge sauber zu Ende zu bringen.",
    ],
  },

  skills: {
    title: "Skills",
    // The grouped tech stack lives in content/skills.ts.
  },

  experience: {
    title: "Werdegang",
    // Marks an ongoing study/work entry (rendered mono + pine next to the period).
    current: "aktuell",
    // The study/work entries live in content/experience.ts. The CV download below
    // the timeline reads the shared top-level `cv` block.
  },

  wayOfWorking: {
    title: "Wie ich arbeite",
    principles: [
      "Erst das Problem, dann der Code.",
      "Deterministische Logik, wo sie zählt.",
      "Bauen und iterieren statt endlos planen.",
      "Dokumentieren, während ich baue.",
      "KI als Werkzeug, nicht als Krücke.",
    ],
  },

  contact: {
    title: "Kontakt",
    lead: "Am schnellsten erreichst du mich per Mail - ob Werkstudentenstelle, Projekt oder einfach eine Frage.",
    cta: { label: "Kontakt aufnehmen", href: "mailto:mail@yannikwuenker.de" },
    channels: {
      email: { label: "mail@yannikwuenker.de", href: "mailto:mail@yannikwuenker.de" },
      // TODO(open): confirm the final LinkedIn profile URL before publishing.
      linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/yannik-wuenker" },
      github: { label: "GitHub", href: "https://github.com/spockey4711" },
    },
  },

  // Chrome for the blog (P3-7, IA level 2/3 per ADR-0005). Posts are authored in
  // content/blog/*.mdx; these are the surrounding strings the routes render. The
  // index's back link points home (the blog has no onepager section), each post's
  // back link points at the index.
  blog: {
    index: {
      eyebrow: "Blog",
      title: "Notizen",
      intro:
        "Kein Redaktionsplan - hier stehen Notizen zu Dingen, die ich gebaut habe und die eine Erklärung wert sind.",
      backToOnepager: { label: "Zurück zur Startseite", href: localizedPath("home", locale) },
      // Shown in place of the list when no post is published yet.
      empty:
        "Noch kein Beitrag - der erste entsteht, sobald ich etwas gebaut habe, das eine Erklärung wert ist.",
      // The cookieless notify path (S5-4): a link to the static RSS feed, so
      // readers can subscribe without any account or platform lock-in. The href is
      // a literal route-handler path (not a page), so the index renders it as a
      // plain anchor rather than a next/link.
      subscribe: { label: "RSS abonnieren", href: "/blog/feed.xml" },
    },
    detail: {
      eyebrow: "Beitrag",
      backToBlog: { label: "Zurück zum Blog", href: localizedPath("blogIndex", locale) },
      // Share affordances at the foot of a post (S5-4). "native" labels the Web
      // Share button (shown only where the browser supports it); "copy"/"copied"
      // drive the copy-link button and its confirmation.
      share: {
        heading: "Diesen Beitrag teilen",
        native: "Teilen",
        copy: "Link kopieren",
        copied: "Link kopiert",
      },
      // Heading for the "read next" block at the foot of a post (S5-2).
      related: "Weitere Notizen",
    },
    // Suffix after the reading-time number, e.g. "4 Min. Lesezeit". The component
    // formats the count and the date (de-DE) around it.
    readingTimeSuffix: "Min. Lesezeit",
  },

  // The /uses page (S3-4, IA level 2 per ADR-0005): hardware, editor, stack and
  // tools, reached from the footer. The inventory itself lives in content/uses.ts;
  // these are the surrounding strings. The back link points home (no onepager
  // section for it).
  uses: {
    eyebrow: "Uses",
    title: "Was ich benutze",
    intro:
      "Hardware, Editor, Stack und Werkzeuge, mit denen ich täglich arbeite - ehrlich und aktuell gehalten, ohne Wunschausstattung.",
    backToOnepager: { label: "Zurück zur Startseite", href: localizedPath("home", locale) },
  },

  footer: {
    // The year is rendered dynamically by the footer component.
    owner: "Yannik Wünker",
    // Accessible name for the footer's legal navigation landmark.
    label: "Rechtliches",
    legal: [
      { href: localizedPath("imprint", locale), label: "Impressum", route: "imprint" },
      { href: localizedPath("privacy", locale), label: "Datenschutz", route: "privacy" },
    ],
    // Page-level destinations reached from the footer, kept separate from the
    // scroll-only primary nav (ADR-0005: a page link must not look like a section
    // anchor). The footer is the site's precedent for such links.
    explore: {
      label: "Mehr",
      links: [
        { href: localizedPath("now", locale), label: "Jetzt", route: "now" },
        { href: localizedPath("blogIndex", locale), label: "Blog", route: "blogIndex" },
        { href: localizedPath("uses", locale), label: "Uses", route: "uses" },
      ],
    },
  },
  notFound: {
    // Terminal-style 404 (app/not-found.tsx), reusing the widget's motif.
    // Chrome-bar caption and accessible region name.
    title: "~/portfolio - zsh",
    regionLabel: "Fehlerseite 404",
    // Green prompt glyph ahead of each echoed line (same as the terminal widget).
    prompt: "▸",
    // The failed command echo; the requested path is appended at runtime.
    command: "cd",
    // Shell-style error line, path appended at runtime. English by convention,
    // like the widget's "command not found".
    error: "cd: no such file or directory:",
    // Human, German message: the actual heading and explanation.
    code: "404",
    heading: "Diese Seite gibt es nicht.",
    body: "Der Pfad existiert nicht oder ist umgezogen.",
    // In-terminal navigation: a `ls`-style listing rendered as green links.
    linksCommand: "ls ~",
    links: [
      { href: localizedPath("home", locale), label: "startseite", route: "home" },
      { href: localizedAnchor("projekte", locale), label: "projekte", route: "home" },
      { href: localizedPath("blogIndex", locale), label: "blog", route: "blogIndex" },
    ],
    // Primary CTA below the terminal.
    home: { href: localizedPath("home", locale), label: "Zur Startseite" },
  },
  error: {
    // Terminal-style runtime-error boundary (app/(de)/error.tsx, global-error.tsx),
    // reusing the 404's terminal motif so a crash stays in the site's voice.
    // Chrome-bar caption and accessible region name.
    title: "~/portfolio - zsh",
    regionLabel: "Fehlerseite",
    // Green prompt glyph ahead of each echoed line (same as the 404 and widget).
    prompt: "▸",
    // The echoed command and its shell-style failure line. English by convention,
    // like the 404's "cd: no such file or directory".
    command: "./portfolio --render",
    errorLine: "error: unexpected runtime error",
    // Human, German message: the heading and explanation.
    code: "500",
    heading: "Etwas ist schiefgelaufen.",
    body: "Ein unerwarteter Fehler ist aufgetreten und wurde protokolliert. Versuch es gleich noch einmal.",
    // The reset button re-renders the crashed segment; the CTA links home.
    retry: "Erneut versuchen",
    home: { href: localizedPath("home", locale), label: "Zur Startseite" },
  },
};

/**
 * The canonical copy shape. Derived from the German source (widened to `string`),
 * so every other locale is type-checked against it: a missing, renamed or extra
 * key is a compile error, which is the primary guard against untranslated leakage.
 */
export type Copy = typeof deCopy;
