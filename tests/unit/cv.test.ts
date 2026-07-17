import { statSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { isCvAvailable } from "@/lib/content/cv";

// One shared mock for statSync, hoisted so the same instance backs both the named
// and default exports of node:fs (cv.ts imports the named binding).
const { mockStatSync } = vi.hoisted(() => ({ mockStatSync: vi.fn() }));

vi.mock("node:fs", () => ({ default: { statSync: mockStatSync }, statSync: mockStatSync }));

// Minimal fs.Stats stand-in: isCvAvailable only reads `size`.
function statWithSize(size: number) {
  return { size } as unknown as ReturnType<typeof statSync>;
}

describe("isCvAvailable", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is true when the CV file exists and is non-empty", () => {
    mockStatSync.mockReturnValue(statWithSize(120_000));

    expect(isCvAvailable()).toBe(true);
  });

  it("is false for an empty placeholder file", () => {
    mockStatSync.mockReturnValue(statWithSize(0));

    expect(isCvAvailable()).toBe(false);
  });

  it("is false when the file is missing", () => {
    mockStatSync.mockImplementation(() => {
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    });

    expect(isCvAvailable()).toBe(false);
  });
});
