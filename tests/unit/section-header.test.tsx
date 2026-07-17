import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionHeader } from "@/components/ui/SectionHeader";

describe("SectionHeader", () => {
  it("renders the title as a plain kicker label", () => {
    render(<SectionHeader title="Über mich" />);

    expect(screen.getByText("Über mich")).toBeInTheDocument();
  });

  it("marks the ornament as decorative so only the title is announced", () => {
    render(<SectionHeader title="Kontakt" />);

    expect(screen.getByText("◆")).toHaveAttribute("aria-hidden");
    expect(screen.getByText("Kontakt")).toBeInTheDocument();
  });
});
