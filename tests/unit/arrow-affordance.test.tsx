import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArrowAffordance } from "@/components/ui/ArrowAffordance";

describe("ArrowAffordance", () => {
  it("renders the forward glyph and is decorative by default", () => {
    const { container } = render(<ArrowAffordance />);

    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe("→");
    expect(span).toHaveAttribute("aria-hidden");
  });

  it("renders the external glyph for the up-right direction", () => {
    const { container } = render(<ArrowAffordance direction="up-right" />);

    expect(container.querySelector("span")?.textContent).toBe("↗");
  });

  it("nudges on hover and keyboard focus only under motion-safe", () => {
    const { container } = render(<ArrowAffordance />);

    const span = container.querySelector("span");
    // Both the pointer and the keyboard path move the glyph, and both are gated
    // behind motion-safe so reduced-motion users get a static arrow.
    expect(span).toHaveClass(
      "motion-safe:group-hover:translate-x-0.5",
      "motion-safe:group-focus-visible:translate-x-0.5",
    );
  });

  it("merges a caller-supplied className", () => {
    const { container } = render(<ArrowAffordance className="text-signal" />);

    expect(container.querySelector("span")).toHaveClass("text-signal");
  });
});
