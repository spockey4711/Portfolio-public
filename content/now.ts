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
    "Diese Seite halte ich stets aktuell. In welche Richtung gehen meine aktuellen Interessen?",
  description: "Momentaufnahme: woran ich gerade baue, was ich lerne und was ich gerade lese.",
  sections: [
    {
      heading: "Woran ich gerade baue",
      entries: [
        {
          label: "fuelivo",
          detail: "Meine iOS-App für Fueling-Empfehlungen im Ausdauersport.",
          href: "https://fuelivo.de",
        },
        {
          label: "Dieses Portfolio",
          detail: "Hoffentlich eine Webseite, die widerspiegelt, wer ich bin und wie ich arbeite.",
        },
      ],
    },
    {
      heading: "Was ich gerade lerne",
      entries: [
        {
          label: "Weiterführende Java-Konzepte",
          detail: "Alles von Vererbung und Interfaces bis zu Generics und Threads.",
        },
      ],
    },
    {
      heading: "Was ich gerade lese",
      entries: [
        {
          label: "Mr. Parnassus' Heim für magisch Begabte - T. J. Klune",
          detail: "Fantasy-Roman über magisch begabte Kinder und die Suche nach einem Zuhause.",
          href: "https://en.wikipedia.org/wiki/The_House_in_the_Cerulean_Sea",
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
    "I keep this page always current. Which direction are my current interests heading?",
  description:
    "A snapshot: what I am building right now, what I am learning and what I am reading.",
  sections: [
    {
      heading: "What I am building",
      entries: [
        {
          label: "fuelivo",
          detail: "My iOS app for fueling recommendations in endurance sport.",
          href: "https://fuelivo.de",
        },
        {
          label: "This portfolio",
          detail: "Hopefully a website that reflects who I am and how I work.",
        },
      ],
    },
    {
      heading: "What I am learning",
      entries: [
        {
          label: "Advanced Java concepts",
          detail: "Everything from inheritance and interfaces to generics and threads.",
        },
      ],
    },
    {
      heading: "What I am reading",
      entries: [
        {
          label: "The House in the Cerulean Sea - T. J. Klune",
          detail: "A fantasy novel about magically gifted children and the search for a home.",
          href: "https://en.wikipedia.org/wiki/The_House_in_the_Cerulean_Sea",
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
