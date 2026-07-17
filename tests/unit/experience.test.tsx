import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Experience } from "@/components/sections/experience/Experience";
import { copy } from "@/content/copy";
import { getExperience } from "@/content/experience";
import { isCvAvailable } from "@/lib/content/cv";

// The CV download depends on a filesystem check; mock it so the section's
// rendering is deterministic regardless of whether a real CV exists in public/.
vi.mock("@/lib/content/cv", () => ({ isCvAvailable: vi.fn() }));

const mockIsCvAvailable = vi.mocked(isCvAvailable);
const { experience: experienceCopy } = copy;
const experience = getExperience("de");

describe("Experience", () => {
  beforeEach(() => {
    mockIsCvAvailable.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the section kicker", () => {
    render(<Experience locale="de" />);

    expect(screen.getAllByText(experienceCopy.title).length).toBeGreaterThan(0);
  });

  it("renders every entry with its role, org, period and description", () => {
    render(<Experience locale="de" />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(experience.length);

    for (const entry of experience) {
      expect(screen.getByRole("heading", { level: 3, name: entry.role })).toBeInTheDocument();
      expect(screen.getByText(entry.org)).toBeInTheDocument();
      expect(screen.getByText(entry.period)).toBeInTheDocument();
      if (entry.description) {
        expect(screen.getByText(entry.description)).toBeInTheDocument();
      }
    }
  });

  it("marks ongoing entries as current", () => {
    render(<Experience locale="de" />);

    const currentEntries = experience.filter((entry) => entry.current);
    expect(screen.getAllByText(experienceCopy.current)).toHaveLength(currentEntries.length);
  });

  it("does not mark entries that are not ongoing", () => {
    render(<Experience locale="de" />);

    const items = screen.getAllByRole("listitem");
    for (const [index, entry] of experience.entries()) {
      if (!entry.current) {
        expect(within(items[index]).queryByText(experienceCopy.current)).not.toBeInTheDocument();
      }
    }
  });

  it("exposes the #werdegang anchor labelled by its heading", () => {
    const { container } = render(<Experience locale="de" />);

    const section = container.querySelector("section#werdegang");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("aria-labelledby", "werdegang-title");
  });

  it("hides the CV download when the file is absent", () => {
    mockIsCvAvailable.mockReturnValue(false);
    render(<Experience locale="de" />);

    expect(screen.queryByRole("link", { name: experienceCopy.cv.label })).not.toBeInTheDocument();
  });

  it("offers the CV download when the file exists", () => {
    mockIsCvAvailable.mockReturnValue(true);
    render(<Experience locale="de" />);

    expect(screen.getByRole("link", { name: experienceCopy.cv.label })).toHaveAttribute(
      "href",
      experienceCopy.cv.href,
    );
  });
});
