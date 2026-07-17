import { type Locale, localeTag } from "@/lib/i18n/locale";

/**
 * Format a post's ISO `YYYY-MM-DD` date as a long date for the given locale, e.g.
 * "6. Juli 2026" (de) or "July 6, 2026" (en). The date is parsed and formatted in
 * UTC so a build or request in any timezone renders the same day (a bare
 * `new Date("2026-07-06")` is UTC midnight, which can slip to the previous day when
 * formatted in a negative offset).
 */
export function formatPostDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
