import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JetztPage from "@/app/(de)/jetzt/page";
import EnNowPage from "@/app/(en)/en/now/page";
import { NowSnapshot } from "@/components/sections/now/NowSnapshot";
import { getNow, getNowChrome } from "@/content/now";
import { type Locale } from "@/lib/i18n/locale";

// The Now page (S3-3, IA level 2): a dated snapshot of the current focus. The
// markup lives in the shared NowSnapshot component so both locale routes (de at
// /jetzt, en at /en/now per S5-1d) render the same structure from their own
// resolved content; the tests exercise that component per locale plus smoke tests
// that each route wires it up.
describe("NowSnapshot", () => {
  const locales: readonly Locale[] = ["de", "en"];

  for (const locale of locales) {
    describe(`in ${locale}`, () => {
      const now = getNow(locale);
      const chrome = getNowChrome(locale);

      it("renders the title as the h1 with its intro", () => {
        render(<NowSnapshot locale={locale} />);

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(now.title);
        expect(screen.getByText(now.intro)).toBeInTheDocument();
      });

      it("renders every section heading and its entry labels", () => {
        render(<NowSnapshot locale={locale} />);

        for (const section of now.sections) {
          expect(
            screen.getByRole("heading", { level: 2, name: section.heading }),
          ).toBeInTheDocument();
          for (const entry of section.entries) {
            expect(screen.getByText(entry.label)).toBeInTheDocument();
          }
        }
      });

      it("links entries that carry an href", () => {
        render(<NowSnapshot locale={locale} />);

        for (const section of now.sections) {
          for (const entry of section.entries) {
            if (!entry.href) continue;
            expect(screen.getByRole("link", { name: entry.label })).toHaveAttribute(
              "href",
              entry.href,
            );
          }
        }
      });

      it("shows the last-updated marker and links back to the locale's onepager", () => {
        render(<NowSnapshot locale={locale} />);

        expect(screen.getByText(new RegExp(now.lastUpdated))).toBeInTheDocument();
        expect(screen.getByRole("link", { name: chrome.backToHome.label })).toHaveAttribute(
          "href",
          chrome.backToHome.href,
        );
      });

      it("exposes a single main landmark", () => {
        render(<NowSnapshot locale={locale} />);

        expect(
          within(screen.getByRole("main")).getByRole("heading", { level: 1 }),
        ).toBeInTheDocument();
      });
    });
  }
});

describe("Now page routes", () => {
  it("renders the German snapshot through the /jetzt route wrapper", () => {
    render(<JetztPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(getNow("de").title);
  });

  it("renders the English snapshot through the /en/now route wrapper", () => {
    render(<EnNowPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(getNow("en").title);
  });
});
