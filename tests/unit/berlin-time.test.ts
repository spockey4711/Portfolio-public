import { describe, expect, it } from "vitest";

import { formatBerlinTime } from "@/lib/utils/berlin-time";

describe("formatBerlinTime", () => {
  it("formats a summer instant in Europe/Berlin as CEST (UTC+2)", () => {
    // 2026-07-04T12:00:00Z -> 14:00 during Berlin daylight saving time.
    expect(formatBerlinTime(new Date("2026-07-04T12:00:00Z"))).toBe("14:00 CEST");
  });

  it("formats a winter instant in Europe/Berlin as CET (UTC+1)", () => {
    // 2026-01-04T12:00:00Z -> 13:00 during Berlin standard time.
    expect(formatBerlinTime(new Date("2026-01-04T12:00:00Z"))).toBe("13:00 CET");
  });

  it("zero-pads hours and minutes", () => {
    // 2026-01-04T07:05:00Z -> 08:05 CET.
    expect(formatBerlinTime(new Date("2026-01-04T07:05:00Z"))).toBe("08:05 CET");
  });
});
