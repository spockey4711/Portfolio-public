import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Terminal } from "@/components/widgets/terminal/Terminal";
import { copy } from "@/content/copy";

const term = copy.terminal;

describe("Terminal", () => {
  it("renders the chrome caption and the intro hint, input not autofocused", () => {
    render(<Terminal locale="de" />);

    expect(screen.getByText(term.title)).toBeInTheDocument();
    expect(screen.getByRole("log")).toHaveTextContent(term.intro);
    // Focus-safe: the strip sits below the fold, so it must not grab focus on load.
    expect(screen.getByLabelText(term.inputLabel)).not.toHaveFocus();
  });

  it("echoes a typed command and appends its output", async () => {
    const user = userEvent.setup();
    render(<Terminal locale="de" />);

    await user.type(screen.getByLabelText(term.inputLabel), "whoami{Enter}");

    const log = screen.getByRole("log");
    expect(log).toHaveTextContent("whoami");
    expect(log).toHaveTextContent(term.whoami[0]);
    // Input is cleared after running.
    expect(screen.getByLabelText(term.inputLabel)).toHaveValue("");
  });

  it("reports an unknown command with the not-found hint", async () => {
    const user = userEvent.setup();
    render(<Terminal locale="de" />);

    await user.type(screen.getByLabelText(term.inputLabel), "nope{Enter}");

    expect(screen.getByRole("log")).toHaveTextContent(`${term.notFound}: nope`);
  });

  it("clear empties the log, including the intro", async () => {
    const user = userEvent.setup();
    render(<Terminal locale="de" />);

    const input = screen.getByLabelText(term.inputLabel);
    await user.type(input, "whoami{Enter}");
    await user.type(input, "clear{Enter}");

    const log = screen.getByRole("log");
    expect(log).not.toHaveTextContent(term.whoami[0]);
    expect(log).not.toHaveTextContent(term.intro);
  });

  it("recalls the previous command with ArrowUp", async () => {
    const user = userEvent.setup();
    render(<Terminal locale="de" />);

    const input = screen.getByLabelText(term.inputLabel);
    await user.type(input, "contact{Enter}");
    await user.type(input, "{ArrowUp}");

    expect(input).toHaveValue("contact");
  });

  it("walks the history with ArrowUp/ArrowDown and returns to a fresh line past the newest", async () => {
    const user = userEvent.setup();
    render(<Terminal locale="de" />);

    const input = screen.getByLabelText(term.inputLabel);
    await user.type(input, "whoami{Enter}");
    await user.type(input, "contact{Enter}");

    // ArrowUp walks back from newest to oldest.
    await user.type(input, "{ArrowUp}");
    expect(input).toHaveValue("contact");
    await user.type(input, "{ArrowUp}");
    expect(input).toHaveValue("whoami");

    // ArrowDown walks forward again...
    await user.type(input, "{ArrowDown}");
    expect(input).toHaveValue("contact");
    // ...and stepping past the newest clears back to a fresh, empty line.
    await user.type(input, "{ArrowDown}");
    expect(input).toHaveValue("");
  });

  it("ignores ArrowUp when there is no history yet", async () => {
    const user = userEvent.setup();
    render(<Terminal locale="de" />);

    const input = screen.getByLabelText(term.inputLabel);
    await user.type(input, "abc");
    await user.type(input, "{ArrowUp}");

    // With an empty history, recall is a no-op: the in-progress input is untouched.
    expect(input).toHaveValue("abc");
  });

  it("blurs the input on Escape (no focus trap)", async () => {
    const user = userEvent.setup();
    render(<Terminal locale="de" />);

    const input = screen.getByLabelText(term.inputLabel);
    await user.click(input);
    expect(input).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(input).not.toHaveFocus();
  });

  it("gives the block cursor a motion-safe blink so it is static under reduced motion", () => {
    render(<Terminal locale="de" />);

    expect(screen.getByText("▮")).toHaveClass("motion-safe:animate-blink");
  });
});
