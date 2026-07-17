import { afterEach, describe, expect, it } from "vitest";

import { errorTrackingConfig } from "@/lib/config/error-tracking";

// Error tracking is off unless a DSN is present; guard that gate so an
// unconfigured build (CI, previews, local) never initialises the SDK or emits a
// request. See lib/config/error-tracking.ts and docs/operations/error-monitoring.md.

const DSN = "NEXT_PUBLIC_SENTRY_DSN";

afterEach(() => {
  delete process.env[DSN];
});

describe("errorTrackingConfig", () => {
  it("is null when no DSN is set (tracking off by default)", () => {
    expect(errorTrackingConfig()).toBeNull();
  });

  it("treats a blank-but-present DSN as unset", () => {
    process.env[DSN] = "   ";
    expect(errorTrackingConfig()).toBeNull();
  });

  it("returns the trimmed DSN when set", () => {
    process.env[DSN] = "  https://public-key@errors.example.com/1  ";
    expect(errorTrackingConfig()).toEqual({
      dsn: "https://public-key@errors.example.com/1",
    });
  });
});
