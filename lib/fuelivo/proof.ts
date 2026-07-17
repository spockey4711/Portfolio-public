/**
 * A deterministic, dependency-free reimplementation of fuelivo's fueling logic,
 * powering the interactive proof on the fuelivo detail page (S4-5). fuelivo's
 * strongest claim is that its output is deterministic and explainable - "keine
 * Blackbox, jede Ausgabe trägt eine Begründung" (content/projects/fuelivo.ts).
 * This module turns that claim into something a visitor can touch: the same
 * inputs always yield the same targets, and every number carries a plain-text
 * reasoning trace.
 *
 * It mirrors the case study's additive-matrix model - a base value plus additive
 * modifiers for intensity, sport and heat, capped by a tolerance ceiling - but is
 * a deliberately SIMPLIFIED illustration, not the production formula (which is not
 * public). The point it proves is the shape of the reasoning, not exact grammage.
 *
 * Pure functions only: no React, no I/O, no globals, no randomness - so the engine
 * is unit-testable in isolation and safe to run identically on the server (initial
 * render) and the client (on every input change). See the widget in
 * components/widgets/fuelivo-proof/FuelivoProof.tsx.
 */

export type Intensity = "easy" | "moderate" | "hard";
export type Sport = "run" | "bike" | "swim";
export type Heat = "cool" | "warm" | "hot";

/** The visitor-controlled session parameters. */
export interface ProofInput {
  /** Session length in hours; the widget's slider clamps this to the range below. */
  durationHours: number;
  intensity: Intensity;
  sport: Sport;
  heat: Heat;
}

/** Duration slider bounds, shared with the widget so the two never drift. */
export const DURATION_MIN_HOURS = 1;
export const DURATION_MAX_HOURS = 6;
export const DURATION_STEP_HOURS = 0.5;

/** The default session, computed on the server and shown before any interaction. */
export const DEFAULT_PROOF_INPUT: ProofInput = {
  durationHours: 2,
  intensity: "hard",
  sport: "bike",
  heat: "warm",
};

/**
 * One line of a target's reasoning. `kind` lets the UI label the step from copy
 * (locale-free engine); `delta` is the signed contribution. For `base` the delta
 * is the starting value; for `cap` it is the (negative) adjustment that pulled the
 * raw sum onto the ceiling/floor. The deltas of a target's steps always sum to its
 * final `value` - the invariant the tests assert.
 */
export type TraceKind = "base" | "intensity" | "sport" | "heat" | "cap";

export interface TraceStep {
  kind: TraceKind;
  delta: number;
}

/** One computed target: its value, unit, the ceiling/floor it hit (if any), and why. */
export interface ProofTarget {
  value: number;
  unit: "g" | "ml" | "mg";
  /** Set to the ceiling/floor value when the raw sum was clamped, else undefined. */
  cappedAt?: number;
  steps: TraceStep[];
}

export interface ProofResult {
  carbs: ProofTarget;
  fluid: ProofTarget;
  sodium: ProofTarget;
}

// Carbohydrate ceiling (g/h): the gut-tolerance limit published fueling guidance
// puts around 90 g/h for a trained athlete; the additive sum is capped here.
const CARB_CAP_G = 90;
// Fluid and sodium safety clamps: wide bounds that the input range never actually
// reaches, kept so the model degrades sanely if the tables ever change.
const FLUID_MIN_ML = 300;
const FLUID_MAX_ML = 1200;
const SODIUM_MIN_MG = 200;
const SODIUM_MAX_MG = 1500;

// Carbs: base rises with session length (longer efforts justify more carbs/h, up to
// the tolerance ceiling), then additive modifiers for how hard and how fuelable the
// sport is. Heat is left to fluid/sodium, where it dominates.
function carbBase(durationHours: number): number {
  if (durationHours <= 1.5) return 30;
  if (durationHours <= 2.5) return 60;
  if (durationHours <= 4) return 75;
  return 90;
}
const carbIntensityDelta: Record<Intensity, number> = { easy: 0, moderate: 10, hard: 15 };
// Cycling is the easiest to fuel (steady, hands free), running is the baseline,
// swimming is the hardest, so their solid-food tolerance differs.
const carbSportDelta: Record<Sport, number> = { bike: 10, run: 0, swim: -10 };

// Fluid: base by how hard you sweat (intensity), then heat (the dominant driver) and
// a sport adjustment (running sloshes more, swimming needs little on-board fluid).
const fluidIntensityBase: Record<Intensity, number> = { easy: 400, moderate: 550, hard: 700 };
const fluidHeatDelta: Record<Heat, number> = { cool: 0, warm: 100, hot: 250 };
const fluidSportDelta: Record<Sport, number> = { run: 50, bike: 0, swim: -100 };

// Sodium: base by intensity (sweat rate), then heat (more sweat, more salt lost).
const sodiumIntensityBase: Record<Intensity, number> = { easy: 300, moderate: 500, hard: 600 };
const sodiumHeatDelta: Record<Heat, number> = { cool: 0, warm: 100, hot: 300 };

/**
 * Assemble a target from its non-zero steps and clamp the raw sum to [min, max].
 * A zero modifier is omitted so the trace shows only what actually moved the number;
 * `base` is always kept. When clamping bites, a `cap` step records the adjustment so
 * the steps still sum to the returned value.
 */
function buildTarget(
  unit: ProofTarget["unit"],
  base: number,
  modifiers: ReadonlyArray<{ kind: TraceKind; delta: number }>,
  bounds: { min: number; max: number },
): ProofTarget {
  const steps: TraceStep[] = [{ kind: "base", delta: base }];
  let raw = base;
  for (const modifier of modifiers) {
    raw += modifier.delta;
    if (modifier.delta !== 0) {
      steps.push({ kind: modifier.kind, delta: modifier.delta });
    }
  }

  const value = Math.min(bounds.max, Math.max(bounds.min, raw));
  if (value !== raw) {
    steps.push({ kind: "cap", delta: value - raw });
    return { value, unit, cappedAt: value, steps };
  }
  return { value, unit, steps };
}

/**
 * Compute the per-hour fueling targets for a session, each with its reasoning
 * trace. Deterministic: equal input yields deeply-equal output on every call.
 */
export function computeFuelivoProof(input: ProofInput): ProofResult {
  const carbs = buildTarget(
    "g",
    carbBase(input.durationHours),
    [
      { kind: "intensity", delta: carbIntensityDelta[input.intensity] },
      { kind: "sport", delta: carbSportDelta[input.sport] },
    ],
    { min: 0, max: CARB_CAP_G },
  );

  const fluid = buildTarget(
    "ml",
    fluidIntensityBase[input.intensity],
    [
      { kind: "heat", delta: fluidHeatDelta[input.heat] },
      { kind: "sport", delta: fluidSportDelta[input.sport] },
    ],
    { min: FLUID_MIN_ML, max: FLUID_MAX_ML },
  );

  const sodium = buildTarget(
    "mg",
    sodiumIntensityBase[input.intensity],
    [{ kind: "heat", delta: sodiumHeatDelta[input.heat] }],
    { min: SODIUM_MIN_MG, max: SODIUM_MAX_MG },
  );

  return { carbs, fluid, sodium };
}

/**
 * The largest value each target actually reaches across the whole input space
 * (carbs at the cap; fluid = hard + hot + run; sodium = hard + hot). The widget
 * scales its bars against these, so a bar's length is comparable run-to-run rather
 * than relative to the current (shifting) maximum, and a maxed-out input fills the
 * bar. Kept in sync with the tables above by the `reachable maxima` engine test.
 */
export const PROOF_TARGET_MAX = {
  carbs: CARB_CAP_G,
  fluid: fluidIntensityBase.hard + fluidHeatDelta.hot + fluidSportDelta.run,
  sodium: sodiumIntensityBase.hard + sodiumHeatDelta.hot,
} as const;
