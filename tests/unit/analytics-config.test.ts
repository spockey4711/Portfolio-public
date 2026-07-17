import { afterEach, describe, expect, it } from "vitest";

import { analyticsConfig } from "@/lib/config/analytics";

// The analytics tag is off unless both env values are present; guard that gate
// so a half-configured build can never emit a broken or unexpected tracking
// tag. See lib/config/analytics.ts and docs/operations/analytics.md.

const SRC = "NEXT_PUBLIC_ANALYTICS_SRC";
const ID = "NEXT_PUBLIC_ANALYTICS_WEBSITE_ID";

afterEach(() => {
  delete process.env[SRC];
  delete process.env[ID];
});

describe("analyticsConfig", () => {
  it("is null when neither value is set (analytics off by default)", () => {
    expect(analyticsConfig()).toBeNull();
  });

  it("is null when only one of the two values is set", () => {
    process.env[SRC] = "https://analytics.example.com/script.js";
    expect(analyticsConfig()).toBeNull();

    delete process.env[SRC];
    process.env[ID] = "0e0d1c2b-3a4f-5e6d-7c8b-9a0b1c2d3e4f";
    expect(analyticsConfig()).toBeNull();
  });

  it("treats a blank-but-present value as unset", () => {
    process.env[SRC] = "   ";
    process.env[ID] = "0e0d1c2b-3a4f-5e6d-7c8b-9a0b1c2d3e4f";
    expect(analyticsConfig()).toBeNull();
  });

  it("returns the trimmed src and website id when both are set", () => {
    process.env[SRC] = "  https://analytics.example.com/script.js  ";
    process.env[ID] = "  0e0d1c2b-3a4f-5e6d-7c8b-9a0b1c2d3e4f  ";

    expect(analyticsConfig()).toEqual({
      src: "https://analytics.example.com/script.js",
      websiteId: "0e0d1c2b-3a4f-5e6d-7c8b-9a0b1c2d3e4f",
    });
  });
});
