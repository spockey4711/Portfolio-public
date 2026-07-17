import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders a real button element by default", () => {
    render(<Button>Klick</Button>);

    const button = screen.getByRole("button", { name: "Klick" });
    expect(button.tagName).toBe("BUTTON");
  });

  it("renders an anchor when given an href", () => {
    render(<Button href="https://example.com">Öffnen</Button>);

    const link = screen.getByRole("link", { name: "Öffnen" });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("applies the amber slab classes for the primary variant", () => {
    render(<Button variant="primary">Primär</Button>);

    const button = screen.getByRole("button", { name: "Primär" });
    expect(button).toHaveClass("bg-accent", "border-ink", "shadow-widget");
  });

  it("applies the paper slab classes for the secondary variant", () => {
    render(<Button variant="secondary">Sekundär</Button>);

    const button = screen.getByRole("button", { name: "Sekundär" });
    expect(button).toHaveClass("bg-surface", "border-ink", "shadow-widget");
  });
});
