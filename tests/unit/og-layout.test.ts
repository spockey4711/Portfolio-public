import { describe, expect, it } from "vitest";

import { clampText, titleFontSize } from "@/lib/og/layout";

describe("titleFontSize", () => {
  it("uses the largest size for short project names", () => {
    expect(titleFontSize("fuelivo")).toBe(118);
  });

  it("steps down as the title grows across each threshold", () => {
    expect(titleFontSize("a".repeat(18))).toBe(118);
    expect(titleFontSize("a".repeat(19))).toBe(92);
    expect(titleFontSize("a".repeat(30))).toBe(92);
    expect(titleFontSize("a".repeat(31))).toBe(72);
    expect(titleFontSize("a".repeat(46))).toBe(72);
    expect(titleFontSize("a".repeat(47))).toBe(58);
  });

  it("ignores surrounding whitespace when measuring", () => {
    expect(titleFontSize("  fuelivo  ")).toBe(118);
  });
});

describe("clampText", () => {
  it("returns short text untouched (trimmed)", () => {
    expect(clampText("  hello  ", 20)).toBe("hello");
  });

  it("keeps text exactly at the limit whole", () => {
    expect(clampText("abcde", 5)).toBe("abcde");
  });

  it("truncates and appends an ellipsis when over the limit", () => {
    expect(clampText("abcdef", 5)).toBe("abcd…");
  });

  it("trims trailing space left by the cut so the ellipsis sits flush", () => {
    // The cut lands right after the space (slice(0, 3) -> "ab "), which trimEnd drops.
    expect(clampText("ab cdef", 4)).toBe("ab…");
  });
});
