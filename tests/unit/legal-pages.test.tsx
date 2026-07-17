import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DatenschutzPage from "@/app/(de)/datenschutz/page";
import ImpressumPage from "@/app/(de)/impressum/page";
import EnImprintPage from "@/app/(en)/en/imprint/page";
import EnPrivacyPage from "@/app/(en)/en/privacy/page";
import { getImprint, getLegalChrome, getPrivacy, legalEntity } from "@/content/legal";
import { type Locale } from "@/lib/i18n/locale";

import type { ReactNode } from "react";

// The legal pages (P1-13) render the shared LegalArticle body from their resolved
// content, so both locale routes (de at /impressum + /datenschutz, en at
// /en/imprint + /en/privacy per S5-1e) render the same structure from their own
// copy and chrome. The tests exercise each route per locale.
const cases: { locale: Locale; ImprintPage: () => ReactNode; PrivacyPage: () => ReactNode }[] = [
  { locale: "de", ImprintPage: ImpressumPage, PrivacyPage: DatenschutzPage },
  { locale: "en", ImprintPage: EnImprintPage, PrivacyPage: EnPrivacyPage },
];

for (const { locale, ImprintPage, PrivacyPage } of cases) {
  const imprint = getImprint(locale);
  const privacy = getPrivacy(locale);
  const chrome = getLegalChrome(locale);

  describe(`Imprint page (${locale})`, () => {
    it("renders the title as the h1", () => {
      render(<ImprintPage />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(imprint.title);
    });

    it("renders every section heading as an h2", () => {
      render(<ImprintPage />);
      for (const section of imprint.sections) {
        expect(
          screen.getByRole("heading", { level: 2, name: section.heading }),
        ).toBeInTheDocument();
      }
    });

    it("shows the responsible person's address and the contact email link", () => {
      render(<ImprintPage />);
      expect(screen.getAllByText(legalEntity.name).length).toBeGreaterThan(0);
      expect(screen.getByRole("link", { name: legalEntity.email })).toHaveAttribute(
        "href",
        `mailto:${legalEntity.email}`,
      );
    });

    it("links back to the locale's home route", () => {
      render(<ImprintPage />);
      expect(screen.getByRole("link", { name: chrome.backToHome.label })).toHaveAttribute(
        "href",
        chrome.backToHome.href,
      );
    });
  });

  describe(`Privacy page (${locale})`, () => {
    it("renders the title as the h1 and the lead intro", () => {
      render(<PrivacyPage />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(privacy.title);
      if (privacy.intro) {
        expect(screen.getByText(privacy.intro)).toBeInTheDocument();
      }
    });

    it("renders the data-subject rights as a list", () => {
      render(<PrivacyPage />);
      const rights = privacy.sections.find((section) => section.items)?.items ?? [];
      expect(rights.length).toBeGreaterThan(0);

      const list = screen.getByRole("list");
      for (const right of rights) {
        expect(within(list).getByText(right)).toBeInTheDocument();
      }
    });

    it("shows the last-updated marker with its value", () => {
      render(<PrivacyPage />);
      expect(
        screen.getByText(`${chrome.lastUpdatedLabel}: ${privacy.lastUpdated}`),
      ).toBeInTheDocument();
    });
  });
}
