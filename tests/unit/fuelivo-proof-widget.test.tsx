import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FuelivoProof } from "@/components/widgets/fuelivo-proof/FuelivoProof";
import { copy, getCopy } from "@/content/copy";

const proof = copy.projects.proof;

describe("FuelivoProof", () => {
  it("renders the default session's targets and their reasoning on first paint", () => {
    render(<FuelivoProof locale="de" />);

    // The three per-hour targets are all present with their labels.
    expect(screen.getByText(proof.outputs.carbs.label)).toBeInTheDocument();
    expect(screen.getByText(proof.outputs.fluid.label)).toBeInTheDocument();
    expect(screen.getByText(proof.outputs.sodium.label)).toBeInTheDocument();

    // Default input (2 h, hard, cycling, warm) -> carbs 60 + 15 + 10 = 85 g/h.
    expect(screen.getByText("85")).toBeInTheDocument();

    // Every number is explained: at least one trace line shows the base label.
    expect(screen.getAllByText(new RegExp(proof.trace.base)).length).toBeGreaterThan(0);
  });

  it("marks the default choices as the checked radios", () => {
    render(<FuelivoProof locale="de" />);

    const hard = screen.getByRole("radio", { name: proof.controls.intensityOptions.hard });
    const easy = screen.getByRole("radio", { name: proof.controls.intensityOptions.easy });
    expect(hard).toHaveAttribute("aria-checked", "true");
    expect(easy).toHaveAttribute("aria-checked", "false");
  });

  it("recomputes deterministically when an input changes", async () => {
    const user = userEvent.setup();
    render(<FuelivoProof locale="de" />);

    // Switching from hard to easy drops the carb base modifier: 85 -> 70 g/h.
    await user.click(screen.getByRole("radio", { name: proof.controls.intensityOptions.easy }));

    expect(screen.getByText("70")).toBeInTheDocument();
    expect(screen.queryByText("85")).not.toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: proof.controls.intensityOptions.easy }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("links out to the live calculator, opening it safely in a new tab", () => {
    render(<FuelivoProof locale="de" />);

    const link = screen.getByRole("link", { name: new RegExp(proof.viewLive) });
    expect(link).toHaveAttribute("href", "https://fuelivo.de");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("shows the honest simplified-model disclaimer", () => {
    render(<FuelivoProof locale="de" />);
    expect(screen.getByText(proof.disclaimer)).toBeInTheDocument();
  });

  it("renders in English too", () => {
    render(<FuelivoProof locale="en" />);
    const en = getCopy("en").projects.proof;
    // Sanity: the three English radiogroups render and the choices are present.
    expect(screen.getAllByRole("radiogroup")).toHaveLength(3);
    expect(
      screen.getByRole("radio", { name: en.controls.intensityOptions.hard }),
    ).toBeInTheDocument();
  });
});
