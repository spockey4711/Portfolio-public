import { describe, expect, it, vi } from "vitest";

import { getDetailProject } from "@/content/projects";

// The English overlay for a case study's screenshots (ADR-0011): `alt` and
// `caption` are prose and get translated, `src` points at one image file that
// serves both languages and is inherited from the German base.
//
// This runs against a mocked project rather than the real content because no
// project carries screenshots yet - the images and their captions arrive later.
// Pinning the mechanic now means the content commit that adds them cannot get
// the resolution wrong unnoticed. Both module mocks are hoisted above the import
// above, so the barrel aggregates the fixture instead of the real fuelivo entry.
vi.mock("@/content/projects/fuelivo", () => ({
  fuelivo: {
    slug: "fuelivo",
    name: "fuelivo",
    tagline: "Deutsche Zeile.",
    status: "live",
    featured: true,
    order: 1,
    detailPage: true,
    links: { live: "https://fuelivo.de" },
    caseStudy: {
      screenshots: [
        { src: "/images/shot-a.png", alt: "Deutscher Alt-Text A", caption: "Deutsche Zeile A" },
        { src: "/images/shot-b.png", alt: "Deutscher Alt-Text B", caption: "Deutsche Zeile B" },
      ],
    },
  },
}));

// A second fixture whose English override translates other prose but no
// screenshots - the "translation not written yet" case.
vi.mock("@/content/projects/aurelian", () => ({
  aurelian: {
    slug: "aurelian",
    name: "Aurelian",
    tagline: "Deutsche Zeile.",
    status: "mvp",
    order: 2,
    detailPage: true,
    links: { live: "https://aurelian.yannikwuenker.de" },
    caseStudy: {
      summary: "Deutsche Zusammenfassung.",
      screenshots: [
        { src: "/images/shot-c.png", alt: "Deutscher Alt-Text C", caption: "Deutsche Zeile C" },
      ],
    },
  },
}));

vi.mock("@/content/projects/en", () => ({
  enProjectContent: {
    fuelivo: {
      caseStudy: {
        screenshots: [
          { alt: "English alt text A", caption: "English caption A" },
          { alt: "English alt text B", caption: "English caption B" },
        ],
      },
    },
    aurelian: {
      caseStudy: { summary: "English summary." },
    },
  },
}));

describe("English screenshot overlay (ADR-0011)", () => {
  it("translates alt and caption", () => {
    const en = getDetailProject("fuelivo", "en");

    expect(en?.caseStudy?.screenshots?.map((shot) => shot.alt)).toEqual([
      "English alt text A",
      "English alt text B",
    ]);
    expect(en?.caseStudy?.screenshots?.map((shot) => shot.caption)).toEqual([
      "English caption A",
      "English caption B",
    ]);
  });

  it("inherits the locale-invariant src from the German base", () => {
    const de = getDetailProject("fuelivo", "de");
    const en = getDetailProject("fuelivo", "en");

    expect(en?.caseStudy?.screenshots?.map((shot) => shot.src)).toEqual(
      de?.caseStudy?.screenshots?.map((shot) => shot.src),
    );
    // The German base itself is never mutated by resolving the English view.
    expect(de?.caseStudy?.screenshots?.map((shot) => shot.alt)).toEqual([
      "Deutscher Alt-Text A",
      "Deutscher Alt-Text B",
    ]);
  });

  it("leaves the German shots in place when the override omits them", () => {
    // Same contract as every other overlaid list: an absent override is a
    // missing translation, not an instruction to drop the section.
    const de = getDetailProject("aurelian", "de");
    const en = getDetailProject("aurelian", "en");

    expect(en?.caseStudy?.summary).toBe("English summary.");
    expect(en?.caseStudy?.screenshots).toHaveLength(1);
    expect(en?.caseStudy?.screenshots).toEqual(de?.caseStudy?.screenshots);
  });
});
