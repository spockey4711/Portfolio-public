import { describe, expect, it } from "vitest";

import { getNow, getNowChrome } from "@/content/now";
import { type Locale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/routes";

// Guards the shape of the Now-page content (S3-3) at the data level for both
// locales, so a well-formed but empty snapshot cannot ship silently and every
// entry stays renderable. Wording stays loose; only structure and the
// internal-link contract are asserted.

const locales: readonly Locale[] = ["de", "en"];

for (const locale of locales) {
  describe(`now page content (${locale})`, () => {
    const now = getNow(locale);

    it("has an eyebrow, title, intro, description and a last-updated marker", () => {
      for (const field of [now.eyebrow, now.title, now.intro, now.description, now.lastUpdated]) {
        expect(field).not.toHaveLength(0);
      }
    });

    it("carries at least one section, each with a heading and entries", () => {
      expect(now.sections.length).toBeGreaterThan(0);

      for (const section of now.sections) {
        expect(section.heading).not.toHaveLength(0);
        expect(section.entries.length).toBeGreaterThan(0);
      }
    });

    it("gives every entry a non-empty label", () => {
      for (const section of now.sections) {
        for (const entry of section.entries) {
          expect(entry.label).not.toHaveLength(0);
        }
      }
    });
  });

  describe(`now page chrome (${locale})`, () => {
    it("links back to the locale's onepager", () => {
      const chrome = getNowChrome(locale);
      expect(chrome.backToHome.href).toBe(localizedPath("home", locale));
      expect(chrome.backToHome.label).not.toHaveLength(0);
      expect(chrome.lastUpdatedLabel).not.toHaveLength(0);
    });
  });
}
