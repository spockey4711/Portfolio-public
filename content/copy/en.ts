/**
 * English site copy (`en`). Typed as `Copy` (the shape derived from the German
 * source in ./de), so a missing, renamed or extra key fails `pnpm typecheck` -
 * the primary guard against untranslated leakage on the English path. Keep the
 * same plain, first-person, concrete voice as the German source; strings that are
 * already language-neutral (the name, the now-playing labels, terminal command
 * names, contact handles) stay identical on purpose. See docs/content/i18n.md.
 *
 * Internal hrefs are built from lib/i18n/routes.ts for the `en` locale so the two
 * trees never drift; external links and same-page anchors stay literal.
 */

import { localizedAnchor, localizedPath } from "@/lib/i18n/routes";

import { type Copy } from "./de";

const locale = "en";

export const enCopy: Copy = {
  nav: {
    logo: "yannik.wuenker",
    label: "Main navigation",
    skipToContent: "Skip to content",
    links: [
      { href: localizedAnchor("projekte", locale), label: "Projects" },
      { href: localizedAnchor("ueber", locale), label: "About" },
      { href: localizedAnchor("kontakt", locale), label: "Contact" },
    ],
    pageLinks: [
      { href: localizedPath("now", locale), label: "Now", route: "now" },
      { href: localizedPath("blogIndex", locale), label: "Blog", route: "blogIndex" },
      { href: localizedPath("uses", locale), label: "Uses", route: "uses" },
    ],
    more: {
      label: "More",
    },
    menu: {
      open: "Open menu",
      close: "Close menu",
    },
    language: {
      label: "DE",
      switchTo: "Switch to German",
    },
    theme: {
      label: "Dark mode",
      on: "on",
      off: "off",
    },
  },

  breadcrumb: {
    home: "Home",
  },

  cv: { label: "CV (PDF)", href: "/cv/yannik-wuenker.pdf" },

  hero: {
    name: "Yannik Wünker",
    positioning:
      "Information Systems in Cologne, working student at the Institut der deutschen Wirtschaft, building fuelivo.",
    ctas: {
      primary: { label: "Projects", href: "#projekte" },
    },
    status: {
      availability: "Available as a working student",
      location: "Cologne",
      meta: {
        location: "GER",
        time: "14:32 CET",
        temperature: "18°C",
      },
    },
    visual: {
      nowPlaying: {
        label: "// now playing",
        lastPlayedLabel: "// last played",
        track: "Lofi & Commits",
      },
    },
  },

  terminal: {
    title: "~/portfolio - zsh",
    regionLabel: "Interactive terminal",
    inputLabel: "Terminal input",
    prompt: "▸",
    intro: "type 'help' - try: whoami, projects, contact, sudo hire-me",
    notFound: "command not found",
    hint: "type 'help'",
    help: {
      heading: "Available commands:",
      entries: {
        help: "this overview",
        whoami: "who I am",
        projects: "what I've built",
        skills: "what I work with",
        experience: "where I've been",
        contact: "how to reach me",
        "sudo hire-me": "why it's worth it",
        clear: "clear the terminal",
      },
      eggHint: "A few commands aren't listed. Have fun exploring.",
    },
    whoami: [
      "yannik.wuenker",
      "Information Systems student from Cologne - software & apps.",
      "student · builder · athlete",
    ],
    projects: {
      heading: "Projects:",
      footer: "more on these further down under 'Projects'.",
    },
    skills: {
      heading: "Skills:",
      footer: "more on these further down under 'Skills'.",
    },
    experience: {
      heading: "Experience:",
      footer: "more on these further down under 'Experience'.",
      current: "current",
    },
    contact: {
      heading: "How to reach me:",
      lines: [
        "mail     mail@yannikwuenker.de",
        "github   github.com/spockey4711",
        "linkedin linkedin.com/in/yannik-wuenker",
      ],
    },
    hireMe: [
      "[sudo] password for recruiter: ********",
      "Checking references ... all clear.",
      "Access granted.",
      "Feel free to drop me an email: mail@yannikwuenker.de",
    ],
    sudo: "Nice try - you've been admin all along.",
    rmrf: ["Nice try. Nothing gets deleted here -", "it's all under version control."],
    ls: "about/  projects/  skills/  experience/  contact/",
    coffee: "brewing... ∞ cups and counting.",
  },

  // Command palette (S2-6). The palette island reads getCopy(locale) (S5-1h), so
  // this English block is what renders in the ⌘K palette under /en.
  commandPalette: {
    // Accessible name for the dialog and the palette region.
    label: "Command palette",
    // Placeholder in the search input.
    placeholder: "Search a command or page ...",
    // Group headings in the result list.
    groups: {
      navigate: "Navigation",
      run: "Commands",
      action: "Actions",
    },
    // Right-aligned tag per entry: section anchors vs. page routes vs. terminal commands vs. actions.
    hints: {
      section: "Section",
      page: "Page",
      command: "Command",
      action: "Action",
    },
    // Navigate targets not already covered by nav.links (sections) / nav.pageLinks (blog):
    // the home route and the full projects index.
    navigate: {
      home: { href: localizedPath("home", locale), label: "Home" },
      projects: { href: localizedPath("projectsIndex", locale), label: "All projects" },
    },
    // Standalone actions (side effects rather than navigation or terminal commands).
    actions: {
      // The dark-mode toggle (S4-2); switches between the light and dark theme.
      theme: "Toggle theme (light/dark)",
    },
    // Shown when the query matches no entry.
    empty: "No matches.",
    // Accessible name for the Nav trigger (an icon-only ⌘K chip).
    trigger: "Open command palette",
    // Accessible name for the in-palette close affordance (labelled "esc").
    close: "Close command palette",
  },

  githubActivity: {
    regionLabel: "GitHub activity",
    label: "GitHub",
    summary: "contributions in the last year",
    fallback: "Activity currently unavailable",
    day: { one: "contribution", other: "contributions", on: "on" },
    legend: { less: "less", more: "more" },
    link: { label: "View on GitHub", href: "https://github.com/spockey4711" },
  },

  signals: {
    regionLabel: "Signs of life",
    label: "// signals",
    title: "Signs of life",
    intro: "What's alive here right now - the latest commit, the latest post, what's playing.",
    kickers: {
      commit: "commit",
      post: "post",
      nowPlaying: "playing",
      lastPlayed: "last played",
      github: "github",
    },
    commit: {
      inRepo: "in",
      fallback: "Last push - currently unavailable",
    },
    post: {
      fallback: "No post published yet",
    },
    nowPlaying: {
      fallback: "Silence right now",
    },
    github: {
      summary: "contributions in the last year",
      fallback: "Activity currently unavailable",
      link: { label: "View on GitHub", href: "https://github.com/spockey4711" },
    },
  },

  wakatime: {
    regionLabel: "Coding activity",
    label: "WakaTime",
    summary: "coded in the last 7 days",
    fallback: "Coding activity currently unavailable",
    emptyProjects: "No project data yet",
    link: { label: "View on WakaTime", href: "https://wakatime.com/@spockey4711" },
  },

  landing: {
    projects: {
      eyebrow: "Selected work",
      lead: "A few things I have built - from the first problem to a running app.",
    },
    github: {
      eyebrow: "The work, in numbers",
      lead: "A year of commits, straight from GitHub - not guessed, not curated.",
    },
  },

  projects: {
    title: "Projects",
    labels: {
      problem: "Problem",
      role: "Role",
      learnings: "What I learned",
      stack: "Stack",
      solution: "The solution",
      features: "Features",
      screenshots: "Screenshots",
      techStack: "Tech stack",
      architecture: "Architecture",
      challenges: "Challenges",
      metrics: "Numbers & scope",
      timeline: "Timeline",
      challenge: { problem: "Problem", solution: "Solution" },
      coverAlt: "Preview of",
    },
    detailsLink: "View details",
    viewAll: "View all projects",
    index: {
      eyebrow: "Projects",
      title: "All projects",
      intro:
        "From finished products to experiments - every project lives here, not just the highlights from the onepager.",
      backToOnepager: { label: "Back to home", href: localizedAnchor("projekte", locale) },
    },
    detail: {
      eyebrow: "Project",
      backToProjects: {
        label: "Back to projects",
        href: localizedPath("projectsIndex", locale),
      },
      links: {
        live: "View live",
        repo: "View code",
        demo: "View demo",
      },
      related: "More projects",
    },
    proof: {
      eyebrow: "Interactive proof",
      title: "Deterministic, not a black box",
      intro:
        "Set a session and watch the fueling targets recompute instantly - every number carries its reasoning. The same inputs always produce the same output.",
      controls: {
        duration: "Duration",
        durationUnit: "h",
        intensity: "Intensity",
        intensityOptions: { easy: "Easy", moderate: "Moderate", hard: "Hard" },
        sport: "Sport",
        sportOptions: { run: "Running", bike: "Cycling", swim: "Swimming" },
        heat: "Heat",
        heatOptions: { cool: "Cool", warm: "Warm", hot: "Hot" },
      },
      outputs: {
        perHour: "per hour",
        carbs: { label: "Carbohydrates", unit: "g/h" },
        fluid: { label: "Fluid", unit: "ml/h" },
        sodium: { label: "Sodium", unit: "mg/h" },
      },
      trace: {
        base: "Base",
        intensity: "Intensity",
        sport: "Sport",
        heat: "Heat",
        capped: "capped at",
      },
      disclaimer:
        "A simplified model of the real engine - it shows the shape of the reasoning, not the exact grammage.",
      viewLive: "Open the real calculator",
    },
  },

  about: {
    title: "About me",
    headline: {
      lead: "Code,",
      accent: "Sport,",
      tail: "Sleep, Repeat.",
    },
    body: [
      "I study Information Systems in Cologne and build the things I wish I'd had on the side. My biggest project so far is fuelivo, an app that turns a few inputs into a concrete fueling recommendation for endurance sport. I'm driven by planning ideas and carrying them all the way to a finished application.",
      "Alongside my studies I do a lot of sport - hockey, running, the gym and whatever else I feel like. It helps me focus and pushes me to finish things properly.",
    ],
  },

  skills: {
    title: "Skills",
  },

  experience: {
    title: "Experience",
    current: "current",
  },

  wayOfWorking: {
    title: "How I work",
    principles: [
      "Problem first, then the code.",
      "Deterministic logic where it counts.",
      "Build and iterate instead of planning forever.",
      "Document while I build.",
      "AI as a tool, not a crutch.",
    ],
  },

  contact: {
    title: "Contact",
    lead: "The fastest way to reach me is by email - whether it's a working-student role, a project or just a question.",
    cta: { label: "Get in touch", href: "mailto:mail@yannikwuenker.de" },
    channels: {
      email: { label: "mail@yannikwuenker.de", href: "mailto:mail@yannikwuenker.de" },
      linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/yannik-wuenker" },
      github: { label: "GitHub", href: "https://github.com/spockey4711" },
    },
  },

  blog: {
    index: {
      eyebrow: "Blog",
      title: "Notes",
      intro: "No editorial calendar - just notes on things I've built that are worth explaining.",
      backToOnepager: { label: "Back to home", href: localizedPath("home", locale) },
      empty: "No posts yet - the first one arrives once I've built something worth explaining.",
      subscribe: { label: "Subscribe via RSS", href: "/blog/feed.xml" },
    },
    detail: {
      eyebrow: "Post",
      backToBlog: { label: "Back to the blog", href: localizedPath("blogIndex", locale) },
      share: {
        heading: "Share this post",
        native: "Share",
        copy: "Copy link",
        copied: "Link copied",
      },
      related: "More notes",
    },
    readingTimeSuffix: "min read",
  },

  uses: {
    eyebrow: "Uses",
    title: "What I use",
    intro:
      "The hardware, editor, stack and tools I work with day to day - kept honest and current, no aspirational kit.",
    backToOnepager: { label: "Back to home", href: localizedPath("home", locale) },
  },

  footer: {
    owner: "Yannik Wünker",
    label: "Legal",
    legal: [
      { href: localizedPath("imprint", locale), label: "Imprint", route: "imprint" },
      { href: localizedPath("privacy", locale), label: "Privacy", route: "privacy" },
    ],
    explore: {
      label: "More",
      links: [
        { href: localizedPath("now", locale), label: "Now", route: "now" },
        { href: localizedPath("blogIndex", locale), label: "Blog", route: "blogIndex" },
        { href: localizedPath("uses", locale), label: "Uses", route: "uses" },
      ],
    },
  },
  notFound: {
    title: "~/portfolio - zsh",
    regionLabel: "404 error page",
    prompt: "▸",
    command: "cd",
    error: "cd: no such file or directory:",
    code: "404",
    heading: "This page doesn't exist.",
    body: "The path doesn't exist or has moved.",
    linksCommand: "ls ~",
    links: [
      { href: localizedPath("home", locale), label: "home", route: "home" },
      { href: localizedAnchor("projekte", locale), label: "projects", route: "home" },
      { href: localizedPath("blogIndex", locale), label: "blog", route: "blogIndex" },
    ],
    home: { href: localizedPath("home", locale), label: "To the homepage" },
  },
  error: {
    title: "~/portfolio - zsh",
    regionLabel: "Error page",
    prompt: "▸",
    command: "./portfolio --render",
    errorLine: "error: unexpected runtime error",
    code: "500",
    heading: "Something went wrong.",
    body: "An unexpected error occurred and has been logged. Please try again in a moment.",
    retry: "Try again",
    home: { href: localizedPath("home", locale), label: "To the homepage" },
  },
};
