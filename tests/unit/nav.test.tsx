import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Nav } from "@/components/chrome/Nav";
import { copy } from "@/content/copy";
import { COMMAND_PALETTE_OPEN_EVENT } from "@/lib/command-palette/commands";

// SiteChrome tells the nav whether the CV file exists; most tests do not care, so
// default to "available" and opt out only where the gate itself is under test.
function renderNav({ cvAvailable = true }: { cvAvailable?: boolean } = {}) {
  return render(<Nav locale="de" cvAvailable={cvAvailable} />);
}

describe("Nav", () => {
  it("renders the terminal-style logo linking to the top of the page", () => {
    renderNav();

    const logo = screen.getByRole("link", { name: /yannik\.wuenker/i });
    expect(logo).toHaveAttribute("href", "/#top");
  });

  // Root-relative hrefs (`/#...`) so the nav also works from sub-routes such as
  // the project detail pages, where the sections do not exist.
  it("links each P1 section as a root-relative anchor", () => {
    renderNav();

    expect(screen.getByRole("link", { name: "Projekte" })).toHaveAttribute("href", "/#projekte");
    expect(screen.getByRole("link", { name: "Über" })).toHaveAttribute("href", "/#ueber");
    expect(screen.getByRole("link", { name: "Kontakt" })).toHaveAttribute("href", "/#kontakt");
  });

  it("seeds the live scroll percentage at 0%", () => {
    renderNav();

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  // The "Mehr" menu (desktop) groups every off-one-pager destination behind one
  // disclosure so a page link can never look like a section anchor (ADR-0005).
  describe("the desktop Mehr menu", () => {
    it("hides the page links until the Mehr menu is opened", () => {
      renderNav();

      expect(screen.getByRole("button", { name: "Mehr" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      // Closed: the page links, language toggle and palette trigger are absent.
      expect(screen.queryByRole("link", { name: "Blog" })).not.toBeInTheDocument();
    });

    it("reveals the page links, language toggle and palette trigger when opened", async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole("button", { name: "Mehr" }));

      // The page links leave the one-pager, so they point straight at the route
      // (not a root-relative anchor); the trailing arrow is decorative.
      expect(screen.getByRole("link", { name: "Jetzt" })).toHaveAttribute("href", "/jetzt");
      expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
      expect(screen.getByRole("link", { name: "Uses" })).toHaveAttribute("href", "/uses");
      expect(screen.getByRole("link", { name: copy.nav.language.switchTo })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: copy.commandPalette.trigger })).toBeInTheDocument();
    });

    // The CV download leaves the one-pager too (a static PDF, not a route), so it
    // sits with the page links (ADR-0005) - but only while the file really exists.
    it("offers the CV download among the page links when the file exists", async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole("button", { name: "Mehr" }));

      const download = screen.getByRole("link", { name: copy.cv.label });
      expect(download).toHaveAttribute("href", copy.cv.href);
      expect(download).toHaveAttribute("download");
    });

    it("hides the CV download when the file is absent", async () => {
      const user = userEvent.setup();
      renderNav({ cvAvailable: false });

      await user.click(screen.getByRole("button", { name: "Mehr" }));

      expect(screen.queryByRole("link", { name: copy.cv.label })).not.toBeInTheDocument();
    });

    // The ⌘K trigger stays decoupled from the palette island: clicking it only
    // dispatches the shared open event, which the palette listens for.
    it("dispatches the command-palette open event from the Mehr menu trigger", async () => {
      const user = userEvent.setup();
      const onOpen = vi.fn();
      window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, onOpen);
      renderNav();

      await user.click(screen.getByRole("button", { name: "Mehr" }));
      await user.click(screen.getByRole("button", { name: copy.commandPalette.trigger }));

      expect(onOpen).toHaveBeenCalledTimes(1);
      window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, onOpen);
    });

    it("closes the Mehr menu on Escape and returns focus to its button", async () => {
      const user = userEvent.setup();
      renderNav();

      const button = screen.getByRole("button", { name: "Mehr" });
      await user.click(button);
      await user.keyboard("{Escape}");

      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveFocus();
    });

    it("closes the Mehr menu when a page link is followed", async () => {
      const user = userEvent.setup();
      renderNav();

      const button = screen.getByRole("button", { name: "Mehr" });
      await user.click(button);
      await user.click(screen.getByRole("link", { name: "Blog" }));

      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  // The phone menu affordance: below md every destination collapses behind a
  // single toggle, which must expose its state and toggle the collapsed panel.
  describe("the phone menu", () => {
    it("collapses the section links behind a menu toggle, closed by default", () => {
      renderNav();

      const toggle = screen.getByRole("button", { name: "Menü öffnen" });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      // Closed: only the desktop row carries each section link (no panel duplicate).
      expect(screen.getAllByRole("link", { name: "Projekte" })).toHaveLength(1);
    });

    it("opens to reveal every destination and flips the toggle state", async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole("button", { name: "Menü öffnen" }));

      const toggle = screen.getByRole("button", { name: "Menü schließen" });
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      // The panel renders its own copy of each section link alongside the desktop
      // row, plus the page links, the CV download, palette trigger and language toggle.
      expect(screen.getAllByRole("link", { name: "Projekte" })).toHaveLength(2);
      expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
      expect(screen.getByRole("link", { name: "Uses" })).toHaveAttribute("href", "/uses");
      expect(screen.getByRole("link", { name: copy.cv.label })).toHaveAttribute(
        "href",
        copy.cv.href,
      );
      expect(screen.getByRole("button", { name: copy.commandPalette.trigger })).toBeInTheDocument();
    });

    it("closes the menu on Escape and returns focus to the toggle", async () => {
      const user = userEvent.setup();
      renderNav();

      const toggle = screen.getByRole("button", { name: "Menü öffnen" });
      await user.click(toggle);
      await user.keyboard("{Escape}");

      expect(screen.getByRole("button", { name: "Menü öffnen" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(toggle).toHaveFocus();
    });

    it("closes the menu when a collapsed link is followed", async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole("button", { name: "Menü öffnen" }));
      // The second match is the menu-panel link (the first is the desktop row).
      const [, menuLink] = screen.getAllByRole("link", { name: "Kontakt" });
      await user.click(menuLink);

      expect(screen.getByRole("button", { name: "Menü öffnen" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  // The dark-mode toggle sits in both the phone menu and the desktop Mehr menu. It
  // is off by default (ADR-0007) and flips + persists the theme without closing the
  // menu, so the user can watch the swap and flip back.
  describe("the dark-mode toggle", () => {
    afterEach(() => {
      document.documentElement.removeAttribute("data-theme");
      window.localStorage.clear();
    });

    it("is off by default and toggles + persists the theme", async () => {
      const user = userEvent.setup();
      renderNav();

      await user.click(screen.getByRole("button", { name: "Menü öffnen" }));

      const toggle = screen.getByRole("button", { name: copy.nav.theme.label });
      // No stored choice resolves to light; the OS preference is ignored.
      expect(toggle).toHaveAttribute("aria-pressed", "false");
      expect(toggle).toHaveTextContent(copy.nav.theme.off);

      await user.click(toggle);
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(window.localStorage.getItem("pf_theme")).toBe("dark");
      expect(toggle).toHaveAttribute("aria-pressed", "true");
      expect(toggle).toHaveTextContent(copy.nav.theme.on);

      // The menu stays open so a second press flips straight back to light.
      await user.click(toggle);
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(window.localStorage.getItem("pf_theme")).toBe("light");
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    });
  });
});
