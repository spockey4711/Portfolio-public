import { describe, expect, it } from "vitest";

import {
  DEFAULT_PROOF_INPUT,
  PROOF_TARGET_MAX,
  computeFuelivoProof,
  type ProofInput,
  type ProofTarget,
} from "@/lib/fuelivo/proof";

// The engine is the substance of the interactive proof (S4-5): it must be
// deterministic and every number must be fully explained by its trace. These
// tests pin both properties.

const BASE: ProofInput = {
  durationHours: 2,
  intensity: "moderate",
  sport: "run",
  heat: "cool",
};

/** The trace's step deltas must add up to the returned value - the invariant the
 * whole "here is exactly why" claim rests on. */
function traceSum(target: ProofTarget): number {
  return target.steps.reduce((sum, step) => sum + step.delta, 0);
}

describe("computeFuelivoProof", () => {
  it("is deterministic: equal input yields deeply-equal output every call", () => {
    const input: ProofInput = { durationHours: 3, intensity: "hard", sport: "bike", heat: "hot" };
    expect(computeFuelivoProof(input)).toEqual(computeFuelivoProof(input));
    // A separate object with the same values is still the same output.
    expect(computeFuelivoProof({ ...input })).toEqual(computeFuelivoProof(input));
  });

  it("does not mutate its input", () => {
    const input: ProofInput = { ...BASE };
    computeFuelivoProof(input);
    expect(input).toEqual(BASE);
  });

  it("keeps each target's trace deltas summing to its value", () => {
    for (const intensity of ["easy", "moderate", "hard"] as const) {
      for (const sport of ["run", "bike", "swim"] as const) {
        for (const heat of ["cool", "warm", "hot"] as const) {
          for (const durationHours of [1, 2.5, 4, 6]) {
            const result = computeFuelivoProof({ durationHours, intensity, sport, heat });
            expect(traceSum(result.carbs)).toBe(result.carbs.value);
            expect(traceSum(result.fluid)).toBe(result.fluid.value);
            expect(traceSum(result.sodium)).toBe(result.sodium.value);
          }
        }
      }
    }
  });

  it("moves the targets in the expected direction", () => {
    const easy = computeFuelivoProof({ ...BASE, intensity: "easy" });
    const hard = computeFuelivoProof({ ...BASE, intensity: "hard" });
    // Harder efforts need more carbs and more sodium.
    expect(hard.carbs.value).toBeGreaterThan(easy.carbs.value);
    expect(hard.sodium.value).toBeGreaterThan(easy.sodium.value);

    const cool = computeFuelivoProof({ ...BASE, heat: "cool" });
    const hot = computeFuelivoProof({ ...BASE, heat: "hot" });
    // Heat drives fluid and sodium up, and leaves carbs untouched.
    expect(hot.fluid.value).toBeGreaterThan(cool.fluid.value);
    expect(hot.sodium.value).toBeGreaterThan(cool.sodium.value);
    expect(hot.carbs.value).toBe(cool.carbs.value);
  });

  it("caps carbs at the tolerance ceiling and records it in the trace", () => {
    // Long, hard, cycling: base 90 + 15 + 10 overshoots and is pulled to the cap.
    const result = computeFuelivoProof({
      durationHours: 6,
      intensity: "hard",
      sport: "bike",
      heat: "warm",
    });
    expect(result.carbs.value).toBe(PROOF_TARGET_MAX.carbs);
    expect(result.carbs.cappedAt).toBe(PROOF_TARGET_MAX.carbs);
    expect(result.carbs.steps.some((step) => step.kind === "cap")).toBe(true);
  });

  it("omits zero modifiers but always keeps a base step", () => {
    // Cycling in the cool: fluid's heat (+0) and sport (+0) modifiers both vanish,
    // so only the base step survives.
    const result = computeFuelivoProof({ ...BASE, intensity: "easy", sport: "bike", heat: "cool" });
    expect(result.fluid.steps).toHaveLength(1);
    expect(result.fluid.steps[0]?.kind).toBe("base");
    expect(result.fluid.cappedAt).toBeUndefined();
  });

  it("never exceeds the advertised per-target maxima across the input space", () => {
    for (const intensity of ["easy", "moderate", "hard"] as const) {
      for (const sport of ["run", "bike", "swim"] as const) {
        for (const heat of ["cool", "warm", "hot"] as const) {
          for (const durationHours of [1, 1.5, 2, 2.5, 3, 4, 5, 6]) {
            const result = computeFuelivoProof({ durationHours, intensity, sport, heat });
            expect(result.carbs.value).toBeLessThanOrEqual(PROOF_TARGET_MAX.carbs);
            expect(result.fluid.value).toBeLessThanOrEqual(PROOF_TARGET_MAX.fluid);
            expect(result.sodium.value).toBeLessThanOrEqual(PROOF_TARGET_MAX.sodium);
          }
        }
      }
    }
  });

  it("produces sane, positive defaults", () => {
    const result = computeFuelivoProof(DEFAULT_PROOF_INPUT);
    expect(result.carbs.value).toBeGreaterThan(0);
    expect(result.fluid.value).toBeGreaterThan(0);
    expect(result.sodium.value).toBeGreaterThan(0);
    expect(result.carbs.unit).toBe("g");
    expect(result.fluid.unit).toBe("ml");
    expect(result.sodium.unit).toBe("mg");
  });
});
