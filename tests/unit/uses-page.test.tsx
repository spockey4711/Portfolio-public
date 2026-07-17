import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import UsesPage from "@/app/(de)/uses/page";
import { UsesInventory } from "@/components/sections/uses/UsesInventory";
import { getCopy } from "@/content/copy";
import { getUsesGroups } from "@/content/uses";
import { type Locale } from "@/lib/i18n/locale";

// The /uses inventory (S3-4, IA level 2): a content-driven list of hardware,
// editor, stack and tools. The markup lives in the shared UsesInventory component
// so both locale routes (de at /uses, en at /en/uses per S5-1c) render the same
// structure from their own resolved copy; the tests exercise that component per
// locale plus a smoke test that the German route wires it up.
describe("UsesInventory", () => {
  const locales: readonly Locale[] = ["de", "en"];

  for (const locale of locales) {
    describe(`in ${locale}`, () => {
      const { uses } = getCopy(locale);

      it("renders the title as the h1 with its intro", () => {
        render(<UsesInventory locale={locale} />);

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(uses.title);
        expect(screen.getByText(uses.intro)).toBeInTheDocument();
      });

      it("renders every group and its items from the typed content", () => {
        render(<UsesInventory locale={locale} />);

        const groups = getUsesGroups(locale);
        expect(groups.length).toBeGreaterThan(0);
        for (const group of groups) {
          expect(screen.getByRole("heading", { level: 2, name: group.title })).toBeInTheDocument();
          for (const item of group.items) {
            expect(screen.getByText(item.name)).toBeInTheDocument();
          }
        }
      });

      it("links back to the locale's onepager", () => {
        render(<UsesInventory locale={locale} />);

        expect(screen.getByRole("link", { name: uses.backToOnepager.label })).toHaveAttribute(
          "href",
          uses.backToOnepager.href,
        );
      });
    });
  }
});

describe("Uses page (de route)", () => {
  it("renders the German inventory through the route wrapper", () => {
    render(<UsesPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(getCopy("de").uses.title);
  });
});
