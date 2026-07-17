import { type Locale, localeTag } from "@/lib/i18n/locale";

/**
 * Formats an ISO timestamp as a short, locale-aware relative time - "vor 2 Stunden"
 * / "2 hours ago", "gestern" / "yesterday" - for the signals-of-life feed (S3-5).
 *
 * Pure: `now` is injected (defaulting to the current time) so the mapping from an
 * elapsed duration to a phrase is deterministic and unit-testable. The result is
 * always in the past or "now"; a timestamp in the future (clock skew) clamps to the
 * present. Uses `Intl.RelativeTimeFormat`, so German plural and article rules come
 * from the platform rather than hand-rolled copy.
 */

// Unit thresholds in seconds, largest first: the first unit the elapsed time meets
// or exceeds is the one shown (e.g. 90 min -> "1 hour", not "90 minutes").
const UNITS: readonly { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 31_536_000 },
  { unit: "month", seconds: 2_592_000 },
  { unit: "week", seconds: 604_800 },
  { unit: "day", seconds: 86_400 },
  { unit: "hour", seconds: 3_600 },
  { unit: "minute", seconds: 60 },
];

export function formatRelativeTime(iso: string, locale: Locale, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const format = new Intl.RelativeTimeFormat(localeTag[locale], { numeric: "auto" });

  // Elapsed seconds, clamped at zero so a future timestamp never reads "in 3 minutes".
  const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - then) / 1000));

  for (const { unit, seconds } of UNITS) {
    if (elapsedSeconds >= seconds) {
      return format.format(-Math.floor(elapsedSeconds / seconds), unit);
    }
  }

  // Under a minute: "gerade eben" / "now" (numeric "auto" renders 0 seconds as that).
  return format.format(0, "second");
}
