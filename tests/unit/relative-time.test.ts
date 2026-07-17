import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/lib/utils/relative-time";

const NOW = new Date("2026-07-08T12:00:00Z");

function ago(ms: number): string {
  return new Date(NOW.getTime() - ms).toISOString();
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
  it("picks the largest fitting unit, in the past", () => {
    expect(formatRelativeTime(ago(2 * HOUR), "en", NOW)).toBe("2 hours ago");
    expect(formatRelativeTime(ago(3 * DAY), "en", NOW)).toBe("3 days ago");
    // 90 minutes rounds down to the hour bucket, not "90 minutes".
    expect(formatRelativeTime(ago(90 * MINUTE), "en", NOW)).toBe("1 hour ago");
  });

  it("renders yesterday with the locale's own phrasing (numeric auto)", () => {
    expect(formatRelativeTime(ago(DAY), "en", NOW)).toBe("yesterday");
    expect(formatRelativeTime(ago(DAY), "de", NOW)).toBe("gestern");
  });

  it("localises the unit words for German", () => {
    expect(formatRelativeTime(ago(2 * HOUR), "de", NOW)).toBe("vor 2 Stunden");
  });

  it("reads under a minute as the present, not a negative duration", () => {
    expect(formatRelativeTime(ago(30_000), "en", NOW)).toBe("now");
  });

  it("clamps a future timestamp to the present rather than 'in x'", () => {
    const future = new Date(NOW.getTime() + HOUR).toISOString();
    expect(formatRelativeTime(future, "en", NOW)).toBe("now");
  });
});
