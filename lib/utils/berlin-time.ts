/**
 * Formats a moment as the hero meta's live clock - "HH:MM ZONE" for Cologne, e.g.
 * "14:32 CEST" in summer or "08:05 CET" in winter (P2-2).
 *
 * The time is always shown in Europe/Berlin regardless of the visitor's own
 * timezone: the hero meta reports the author's location, not the reader's. The
 * zone label switches between CET and CEST with daylight saving. Pure and
 * deterministic given the input Date, so it is unit-testable and cheap to call on
 * every clock tick.
 */

const TIME_ZONE = "Europe/Berlin";

const timeFormat = new Intl.DateTimeFormat("de-DE", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const offsetFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  timeZoneName: "shortOffset",
});

/** "CEST" at UTC+2 (daylight saving), "CET" otherwise (standard time). */
function berlinZoneAbbreviation(date: Date): "CET" | "CEST" {
  const offset = offsetFormat
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  // e.g. "GMT+2" in summer; anything else is treated as standard time.
  return offset === "GMT+2" ? "CEST" : "CET";
}

export function formatBerlinTime(date: Date): string {
  return `${timeFormat.format(date)} ${berlinZoneAbbreviation(date)}`;
}
