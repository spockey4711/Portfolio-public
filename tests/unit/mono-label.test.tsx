import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MonoLabel } from "@/components/ui/MonoLabel";

// MonoLabel's register is uppercase mono, but some labels carry their own casing
// ("seit Oktober 2024", "iOS-App") and must keep it. That opt-out used to be a
// `className="normal-case"`, which silently did nothing: `cn` is a plain join, so
// both `uppercase` and `normal-case` landed on the element and Tailwind's emitted
// order decided the winner - `uppercase`. These assert the prop actually opts out.
describe("MonoLabel", () => {
  it("uppercases by default", () => {
    render(<MonoLabel>iOS-App</MonoLabel>);

    const label = screen.getByText("iOS-App");
    expect(label).toHaveClass("uppercase");
    expect(label).not.toHaveClass("normal-case");
  });

  it("drops the uppercase class entirely when the case is normal", () => {
    render(<MonoLabel textCase="normal">iOS-App</MonoLabel>);

    const label = screen.getByText("iOS-App");
    expect(label).toHaveClass("normal-case");
    expect(label).not.toHaveClass("uppercase");
  });

  it("keeps tone and caller classes alongside the case", () => {
    render(
      <MonoLabel tone="muted" textCase="normal" className="w-64">
        seit Oktober 2024
      </MonoLabel>,
    );

    const label = screen.getByText("seit Oktober 2024");
    expect(label).toHaveClass("text-muted", "normal-case", "w-64", "font-mono");
  });
});
