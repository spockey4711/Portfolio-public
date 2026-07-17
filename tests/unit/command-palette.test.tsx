import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommandPalette } from "@/components/widgets/command-palette/CommandPalette";
import { copy, getCopy } from "@/content/copy";

// The palette routes via the app router; mock it so we can assert navigation and
// so useRouter() works without an AppRouterProvider in the test.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const palette = copy.commandPalette;

beforeEach(() => {
  pushMock.mockClear();
});

describe("CommandPalette", () => {
  it("is closed until ⌘K opens it, and Ctrl-K works too", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("dialog", { name: palette.label })).toBeInTheDocument();

    // ⌘K toggles: pressing it again closes.
    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("focuses the input on open and filters the list as you type", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    await user.keyboard("{Meta>}k{/Meta}");
    const input = screen.getByRole("combobox");
    expect(input).toHaveFocus();

    await user.type(input, "blog");
    expect(screen.getByRole("option", { name: /blog/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /whoami/i })).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(screen.getByRole("combobox"), "zzz-nope");

    expect(screen.getByText(palette.empty)).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("runs a terminal command with the keyboard and paints its output inline", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(screen.getByRole("combobox"), "whoami");
    await user.keyboard("{Enter}");

    const log = screen.getByRole("log");
    expect(log).toHaveTextContent("whoami");
    expect(log).toHaveTextContent(copy.terminal.whoami[0]);
    // Running a command keeps the palette open so the output stays readable.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("navigates and closes when a route entry is chosen", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(screen.getByRole("combobox"), "blog");
    await user.click(screen.getByRole("option", { name: /blog/i }));

    expect(pushMock).toHaveBeenCalledWith("/blog");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves the roving highlight with the arrow keys, wrapping at both ends", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    await user.keyboard("{Meta>}k{/Meta}");
    const selectedIndex = () =>
      screen
        .getAllByRole("option")
        .findIndex((option) => option.getAttribute("aria-selected") === "true");
    const count = screen.getAllByRole("option").length;
    expect(count).toBeGreaterThan(1);

    // Opens on the first entry; ArrowUp wraps to the last, ArrowDown wraps back.
    expect(selectedIndex()).toBe(0);
    await user.keyboard("{ArrowUp}");
    expect(selectedIndex()).toBe(count - 1);
    await user.keyboard("{ArrowDown}");
    expect(selectedIndex()).toBe(0);
    await user.keyboard("{ArrowDown}");
    expect(selectedIndex()).toBe(1);
  });

  it("runs the highlighted command with Enter after arrow navigation", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    // Narrow to a single run command, highlight it with ArrowDown, then Enter.
    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(screen.getByRole("combobox"), "whoami");
    await user.keyboard("{ArrowDown}{Enter}");

    const log = screen.getByRole("log");
    expect(log).toHaveTextContent(copy.terminal.whoami[0]);
  });

  it("traps Tab within the palette so focus never escapes the overlay", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    await user.keyboard("{Meta>}k{/Meta}");
    const input = screen.getByRole("combobox");
    const closeButton = screen.getByRole("button", { name: palette.close });
    expect(input).toHaveFocus();

    // Tab reaches the close button, then wraps back to the input (two stops only).
    await user.tab();
    expect(closeButton).toHaveFocus();
    await user.tab();
    expect(input).toHaveFocus();
  });

  it("dismisses when the backdrop behind the panel is clicked", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    await user.keyboard("{Meta>}k{/Meta}");
    const backdrop = screen.getByRole("dialog").parentElement;
    expect(backdrop).not.toBeNull();

    // A press on the backdrop (not the panel) closes it, like a modal scrim.
    await user.click(backdrop as HTMLElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and restores focus to the opener (no dead-end trap)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">opener</button>
        <CommandPalette locale="de" />
      </>,
    );

    const opener = screen.getByRole("button", { name: "opener" });
    opener.focus();
    expect(opener).toHaveFocus();

    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("animates the panel under motion-safe only, so reduced motion is static", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByRole("dialog")).toHaveClass("motion-safe:animate-palette-in");
  });

  it("toggles the theme from the palette, persists it, and stays open", async () => {
    document.documentElement.setAttribute("data-theme", "light");
    window.localStorage.removeItem("pf_theme");
    const user = userEvent.setup();
    render(<CommandPalette locale="de" />);

    // Match on the paren-free prefix so the option's accessible name (label + the
    // "Aktion" hint) is found without escaping the label's parentheses.
    const themeLabel = palette.actions.theme.split(" (")[0];
    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(screen.getByRole("combobox"), themeLabel);
    await user.click(screen.getByRole("option", { name: new RegExp(themeLabel, "i") }));

    // The token swap is applied to <html> and the explicit choice is persisted.
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem("pf_theme")).toBe("dark");
    // The palette stays open so its recoloured surface confirms the switch.
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    document.documentElement.removeAttribute("data-theme");
    window.localStorage.removeItem("pf_theme");
  });

  it("renders its entries in the given locale (no German leakage under /en)", async () => {
    const user = userEvent.setup();
    render(<CommandPalette locale="en" />);

    await user.keyboard("{Meta>}k{/Meta}");

    // The English palette advertises the English navigate labels and never the
    // German ones - the S5-1h guard against the palette leaking German on /en.
    const enHome = getCopy("en").commandPalette.navigate.home.label;
    const deHome = getCopy("de").commandPalette.navigate.home.label;
    expect(screen.getByRole("option", { name: new RegExp(enHome, "i") })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: new RegExp(deHome, "i") })).not.toBeInTheDocument();
  });
});
