/**
 * The locale model: the single source of truth for which languages the site
 * ships and which one is canonical. German is the default and stays unprefixed
 * at the root (`/`); English is served under an `/en` prefix with English path
 * segments. See docs/architecture/decisions/0006-i18n-and-localization.md and
 * docs/content/i18n.md.
 *
 * Keeping this tiny and dependency-free lets both server components and client
 * islands import it without pulling in any content or React.
 */

/** BCP 47-ish short codes used across routing, copy and metadata. */
export type Locale = "de" | "en";

/**
 * The canonical default. German content lives at the root and is the `x-default`
 * for hreflang; changing this would move the canonical URLs, so it is deliberate.
 */
export const defaultLocale: Locale = "de";

/** Every locale the site serves, default first. */
export const locales: readonly Locale[] = ["de", "en"] as const;

/** Narrows an arbitrary string to a Locale (e.g. a route param or header value). */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * The full BCP 47 language tag per locale, used for `<html lang>`, the Open
 * Graph `og:locale` and the `hreflang` attributes so the short internal code and
 * the emitted tag never drift.
 */
export const localeTag: Record<Locale, string> = {
  de: "de-DE",
  en: "en",
};

/** The Open Graph locale form (underscore), which differs from the hreflang tag. */
export const openGraphLocale: Record<Locale, string> = {
  de: "de_DE",
  en: "en_US",
};
