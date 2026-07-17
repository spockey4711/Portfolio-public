/**
 * The Now-page content (S3-3): what I am currently focused on - building,
 * learning, reading. A "now page" in the spirit of nownownow.com: a dated
 * snapshot of the present, meant to be edited often rather than archived.
 *
 * The copy is kept as two parallel locale lists (like content/uses.ts and
 * content/skills.ts) rather than a base plus overrides, so the page
 * (app/(de)/jetzt, app/(en)/en/now) carries no language literals. Read via
 * getNow(locale) and getNowChrome(locale). Keeping it current is the whole
 * point: to update the page, edit the section list for the affected locale and
 * bump `lastUpdated` - nothing else. Voice: plain, first person, concrete (see
 * docs/content/content-and-voice.md).
 *
 * Internal hrefs are built from lib/i18n/routes.ts so the German and English
 * paths never drift; external links (projects, GitHub, ...) stay literal.
 */

import { type Locale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/routes";

/** A single line item within a Now section (e.g. a project, a book, a topic). */
export interface NowEntry {
  /** The thing itself - a project, book or topic name. Rendered as the lead. */
  label: string;
  /** Optional one-line detail: the current state or why it matters. */
  detail?: string;
  /** Optional link (internal route or external URL); makes the label a link. */
  href?: string;
}

/** A themed group of entries (e.g. "what I am building"). */
export interface NowSection {
  /** Section heading, rendered as an <h2>. */
  heading: string;
  /** The entries under this heading; at least one. */
  entries: NowEntry[];
}

/** The full Now page: a titled, dated list of themed sections. */
export interface NowPage {
  /** Mono eyebrow above the title. */
  eyebrow: string;
  /** Page heading, rendered as the <h1>. */
  title: string;
  /** Lead paragraph below the title, framing the snapshot. */
  intro: string;
  /** Meta description for the page. */
  description: string;
  /** The themed sections that make up the page body. */
  sections: NowSection[];
  /** Human-readable "last updated" marker in the page's language (e.g. "Juli 2026"). */
  lastUpdated: string;
}

/** Chrome shared with the page shell: the eyebrow-styled back link and labels. */
export interface NowChrome {
  /** Back to the onepager, since the nav's section anchors do not resolve here. */
  backToHome: { href: string; label: string };
  /** Prefix for the "last updated" marker at the foot of the page. */
  lastUpdatedLabel: string;
}

const de: NowPage = {
  eyebrow: "JETZT",
  title: "Woran ich gerade arbeite",
  intro:
    "Eine kurze Momentaufnahme: woran ich gerade baue, was ich lerne und was ich lese. " +
    "Diese Seite halte ich absichtlich aktuell - sie zeigt das Jetzt, nicht das Archiv.",
  description: "Momentaufnahme: woran ich gerade baue, was ich lerne und was ich gerade lese.",
  sections: [
    {
      heading: "Woran ich gerade baue",
      entries: [
        {
          label: "fuelivo",
          detail:
            "Meine iOS-App für Fueling-Empfehlungen im Ausdauersport - laufend im Feintuning.",
          href: localizedPath("projectDetail", "de", "fuelivo"),
        },
        {
          label: "Dieses Portfolio",
          detail:
            "Von Hand gebaut und Schritt für Schritt erweitert - zuletzt Command-Palette und diese Seite.",
        },
      ],
    },
    {
      heading: "Was ich gerade lerne",
      entries: [
        {
          label: "Sauberes Frontend mit Next.js und TypeScript",
          detail: "App Router, Server Components und ein Testaufbau, der Fehler früh fängt.",
        },
        {
          label: "KI als Werkzeug im Alltag",
          detail: "Wie ich Modelle und lokale Tools sinnvoll in echte Arbeit einbaue.",
        },
      ],
    },
    {
      heading: "Was ich gerade lese",
      entries: [
        {
          label: "Refactoring - Martin Fowler",
          detail: "Code-Smells erkennen und in kleinen, sicheren Schritten aufräumen.",
          href: "https://refactoring.com/",
        },
      ],
    },
  ],
  lastUpdated: "Juli 2026",
};

const en: NowPage = {
  eyebrow: "NOW",
  title: "What I am working on",
  intro:
    "A short snapshot: what I am building right now, what I am learning and what I am reading. " +
    "I keep this page deliberately current - it shows the now, not the archive.",
  description:
    "A snapshot: what I am building right now, what I am learning and what I am reading.",
  sections: [
    {
      heading: "What I am building",
      entries: [
        {
          label: "fuelivo",
          detail:
            "My iOS app for fueling recommendations in endurance sport - continually fine-tuned.",
          href: localizedPath("projectDetail", "en", "fuelivo"),
        },
        {
          label: "This portfolio",
          detail:
            "Built by hand and extended step by step - most recently the command palette and this page.",
        },
      ],
    },
    {
      heading: "What I am learning",
      entries: [
        {
          label: "Clean frontend with Next.js and TypeScript",
          detail: "App Router, Server Components and a test setup that catches bugs early.",
        },
        {
          label: "AI as an everyday tool",
          detail: "How I fit models and local tools sensibly into real work.",
        },
      ],
    },
    {
      heading: "What I am reading",
      entries: [
        {
          label: "Refactoring - Martin Fowler",
          detail: "Spotting code smells and cleaning up in small, safe steps.",
          href: "https://refactoring.com/",
        },
      ],
    },
  ],
  lastUpdated: "July 2026",
};

const nowByLocale: Record<Locale, NowPage> = { de, en };

const chromeByLocale: Record<Locale, NowChrome> = {
  de: {
    backToHome: { href: localizedPath("home", "de"), label: "Zurück zur Startseite" },
    lastUpdatedLabel: "Stand",
  },
  en: {
    backToHome: { href: localizedPath("home", "en"), label: "Back to home" },
    lastUpdatedLabel: "Last updated",
  },
};

/** The Now-page content for a locale. */
export function getNow(locale: Locale): NowPage {
  return nowByLocale[locale];
}

/** The Now-page chrome (back link and labels) for a locale. */
export function getNowChrome(locale: Locale): NowChrome {
  return chromeByLocale[locale];
}
