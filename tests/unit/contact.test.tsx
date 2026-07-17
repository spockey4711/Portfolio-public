import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Contact } from "@/components/sections/contact/Contact";
import { copy } from "@/content/copy";

const { contact } = copy;

describe("Contact", () => {
  it("shows the section kicker and the lead", () => {
    render(<Contact locale="de" />);

    expect(screen.getAllByText(contact.title).length).toBeGreaterThan(0);
    expect(screen.getByText(contact.lead)).toBeInTheDocument();
  });

  it("makes the email the prominent call to action", () => {
    render(<Contact locale="de" />);

    const cta = screen.getByRole("link", { name: contact.cta.label });
    expect(cta).toHaveAttribute("href", contact.cta.href);
    expect(contact.cta.href).toMatch(/^mailto:/);
  });

  it("links every direct channel correctly", () => {
    render(<Contact locale="de" />);

    expect(screen.getByRole("link", { name: contact.channels.email.label })).toHaveAttribute(
      "href",
      contact.channels.email.href,
    );
    // The ↗ glyph is aria-hidden, so each link's accessible name is just its label.
    expect(screen.getByRole("link", { name: contact.channels.linkedin.label })).toHaveAttribute(
      "href",
      contact.channels.linkedin.href,
    );
    expect(screen.getByRole("link", { name: contact.channels.github.label })).toHaveAttribute(
      "href",
      contact.channels.github.href,
    );
  });

  it("exposes the #kontakt anchor, labelled by its heading", () => {
    const { container } = render(<Contact locale="de" />);

    const section = container.querySelector("section#kontakt");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("aria-labelledby", "kontakt-title");
  });
});
