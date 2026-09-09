import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Hero } from "@/components/sections/hero/Hero";
import { copy } from "@/content/copy";
import { isCvAvailable } from "@/lib/content/cv";

// The CV CTA depends on a filesystem check; mock it so the hero renders the same
// regardless of whether a real CV exists in public/ (as experience.test.tsx does).
vi.mock("@/lib/content/cv", () => ({ isCvAvailable: vi.fn() }));

const mockIsCvAvailable = vi.mocked(isCvAvailable);
const { hero, cv } = copy;

describe("Hero", () => {
  beforeEach(() => {
    mockIsCvAvailable.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("sets the name as the page's h1 with the positioning sentence under it", () => {
    render(<Hero locale="de" />);

    // PORT-48 (design audit 2026-09): who, what, where and the current role are the
    // first things on the page - the name is the headline, not a tagline.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(hero.name);
    expect(screen.getByText(hero.positioning)).toBeInTheDocument();
  });

  it("offers the projects jump and the CV download as the two CTAs", () => {
    render(<Hero locale="de" />);

    const projects = screen.getByRole("link", { name: hero.ctas.primary.label });
    expect(projects).toHaveAttribute("href", hero.ctas.primary.href);

    const download = screen.getByRole("link", { name: cv.label });
    expect(download).toHaveAttribute("href", cv.href);
    expect(download).toHaveAttribute("download");

    // GitHub left the hero for the contact band, which already lists it.
    expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
  });

  it("hides the CV download when the file is absent", () => {
    mockIsCvAvailable.mockReturnValue(false);
    render(<Hero locale="de" />);

    expect(screen.queryByRole("link", { name: cv.label })).not.toBeInTheDocument();
  });

  it("hides the availability line unless SHOW_AVAILABILITY is set", () => {
    render(<Hero locale="de" />);

    expect(screen.queryByText(hero.status.availability)).not.toBeInTheDocument();
    expect(screen.queryByText(hero.status.location)).not.toBeInTheDocument();
  });

  it("shows the availability and location when SHOW_AVAILABILITY is enabled", () => {
    vi.stubEnv("SHOW_AVAILABILITY", "true");
    render(<Hero locale="de" />);

    expect(screen.getByText(hero.status.availability)).toBeInTheDocument();
    expect(screen.getByText(hero.status.location)).toBeInTheDocument();
  });

  it("does not render the live-status module (it lives in the depth layer)", () => {
    render(<Hero locale="de" />);

    expect(screen.queryByTestId("hero-live-status")).not.toBeInTheDocument();
  });

  it("holds nothing but the words: no image, picture or video in the hero", () => {
    const { container } = render(<Hero locale="de" />);

    // PORT-47 (design audit 2026-09): the generated pixel-art character is gone, and
    // no figure may return to the first screen - the copy and CTAs are the whole hero.
    expect(container.querySelector("img, picture, video")).toBeNull();
  });

  it("exposes the #top anchor the nav wordmark links to", () => {
    const { container } = render(<Hero locale="de" />);

    expect(container.querySelector("section#top")).not.toBeNull();
  });
});
